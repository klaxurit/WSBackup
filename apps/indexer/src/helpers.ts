import { factory, token, transaction } from "ponder:schema"

export async function getOrCreateFactory(context: any, address: string) {
  let factoryEntity = await context.db.find(factory, { id: address })

  if (!factoryEntity) {
    factoryEntity = await context.db.insert(factory).values({
      id: address,
      poolCount: 0,
      txCount: 0,
      totalVolumeUSD: "0",
      totalVolumeETH: "0",
      untrackedVolumeUSD: "0",
      totalFeesUSD: "0",
      totalFeesETH: "0",
      totalValueLockedUSD: "0",
      totalValueLockedETH: "0",
      totalValueLockedUSDUntracked: "0",
      totalValueLockedETHUntracked: "0",
      owner: address,
    })
  }
  return factoryEntity
}

export async function getOrCreateToken(context: any, tokenAddress: string) {
  let tokenEntity = await context.db.find(token, { id: tokenAddress });

  if (!tokenEntity) {
    try {
      const [symbol, name, decimals, totalSupply, logoUri] = await Promise.all([
        context.client.readContract({
          address: tokenAddress,
          abi: [{ name: "symbol", type: "function", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" }],
          functionName: "symbol",
        }),
        context.client.readContract({
          address: tokenAddress,
          abi: [{ name: "name", type: "function", inputs: [], outputs: [{ type: "string" }], stateMutability: "view" }],
          functionName: "name",
        }),
        context.client.readContract({
          address: tokenAddress,
          abi: [{ name: "decimals", type: "function", inputs: [], outputs: [{ type: "uint8" }], stateMutability: "view" }],
          functionName: "decimals",
        }),
        context.client.readContract({
          address: tokenAddress,
          abi: [{ name: "totalSupply", type: "function", inputs: [], outputs: [{ type: "uint256" }], stateMutability: "view" }],
          functionName: "totalSupply",
        }),
        (async () => {
          const response = await fetch(`http://localhost:3000/token/${tokenAddress}`)
          if (!response.ok) return null

          const data: any = await response.json()

          return data?.logoUri || null
        })()
      ]);


      tokenEntity = await context.db.insert(token).values({
        id: tokenAddress,
        symbol: symbol || "Unknown",
        name: name || "Unknown Token",
        decimals: Number(decimals) || 18,
        totalSupply: totalSupply || 0n,
        volume: "0",
        volumeUSD: "0",
        untrackedVolumeUSD: "0",
        feesUSD: "0",
        txCount: 0,
        poolCount: 0,
        totalValueLocked: "0",
        totalValueLockedUSD: "0",
        totalValueLockedUSDUntracked: "0",
        derivedETH: "0",
        whitelistPools: [],
        ...(!!logoUri && { logoUri })
      });
    } catch (error) {
      console.error(`Error fetching token info for ${tokenAddress}:`, error);
      tokenEntity = await context.db.insert(token).values({
        id: tokenAddress,
        symbol: "Unknown",
        name: "Unknown Token",
        decimals: 18,
        totalSupply: 0n,
        volume: "0",
        volumeUSD: "0",
        untrackedVolumeUSD: "0",
        feesUSD: "0",
        txCount: 0,
        poolCount: 0,
        totalValueLocked: "0",
        totalValueLockedUSD: "0",
        totalValueLockedUSDUntracked: "0",
        derivedETH: "0",
        whitelistPools: [],
      });
    }
  }

  return tokenEntity;
}

export async function getOrCreateTransaction(context: any, event: any) {
  let txEntity = await context.db.find(transaction, { id: event.transaction.hash });

  if (!txEntity) {
    txEntity = await context.db.insert(transaction).values({
      id: event.transaction.hash,
      blockNumber: BigInt(event.block.number),
      timestamp: BigInt(event.block.timestamp),
      gasUsed: event.transaction.gasUsed || 0n,
      gasPrice: event.transaction.gasPrice || 0n,
      from: event.transaction.from,
      mints: [],
      swaps: [],
      burns: [],
      collects: [],
      flashes: [],
    });
  }

  return txEntity;
}

export function getTickId(poolAddress: string, tickIdx: number): string {
  return `${poolAddress}#${tickIdx}`;
}
