/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from "hono";
import { cache } from "hono/cache";
import { cors } from "hono/cors";
import _ from "lodash"

type Bindings = {
	DB: D1Database,
	CACHE: KVNamespace,
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS
app.use("*", cors({
	origin: '*',
	allowHeaders: ['Content-Type'],
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE']
}))

// Static CACHE
// app.use('/tokens/*', cache({
// 	cacheName: 'winnieswap',
// 	cacheControl: 'max-age-300' // 5 Minutes
// }))

// Main route
app.use('/tokens/:network?', async (c) => {
	const chainId = c.req.param('network') === "bepolia" ? "80069" : "80094"

	try {
		const cachedTokens = await c.env.CACHE.get(`tokens:${chainId}`)
		if (cachedTokens) {
			return c.json(JSON.parse(cachedTokens))
		}

		const { results } = await c.env.DB.prepare(
			'SELECT * FROM tokens WHERE chain_id = ? ORDER BY created_at DESC'
		).bind(chainId).all()

		const converted = convertKeys(results)

		await c.env.CACHE.put(
			`tokens:${chainId}`, JSON.stringify(converted), { expirationTtl: 300 }
		)



		return c.json(converted)
	} catch (error) {
		return c.json({ error: "Failed to fetch tokens" }, 500)
	}
})

app.use('/sync', async (c) => {
	await fetchGithub(c)

	return c.json({ success: true })
})

// Sync tokens with berachain metadatas
const fetchGithub = async (c) => {
	const networks = ['bepolia', 'mainnet']

	for (const network of networks) {
		try {
			const response = await fetch(
				`https://raw.githubusercontent.com/berachain/metadata/main/src/tokens/${network}.json`,
			)

			if (!response.ok) continue

			const githubTokens = await response.json()

			for (const token of githubTokens.tokens) {
				await c.env.DB.prepare(`
          INSERT INTO tokens
          (symbol, name, address, decimals, chain_id, logo_uri, is_verified, coingecko_id, source, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'github', CURRENT_TIMESTAMP)
					ON CONFLICT(address, chain_id) DO UPDATE SET
					symbol = exclued.symbol,
					name = excluded.name,
        	decimals = excluded.decimals,
        	logo_uri = excluded.logo_uri,
        	updated_at = CURRENT_TIMESTAMP
      		RETURNING *
        `).bind(
					token.symbol,
					token.name || "",
					token.address,
					token.decimals || 18,
					token.chainId,
					token.logoURI || null,
					true,
					token?.extensions?.coingeckoId || null
				).run()
			}

			await c.env.CACHE.delete(`tokens:80094`)
			await c.env.CACHE.delete('tokens:80069')

		} catch (error) {
			console.error(`Sync failed for ${network}:`, error)
		}
	}
}

const convertKeys = (obj) => {
	if (Array.isArray(obj)) {
		return obj.map(convertKeys);
	}
	if (_.isObject(obj)) {
		return _.mapKeys(_.mapValues(obj, convertKeys), (v, k) => _.camelCase(k));
	}
	return obj;
};

export default {
	fetch: app.fetch,
} satisfies ExportedHandler<Env>;
