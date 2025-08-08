import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';
import { DatabaseService } from 'src/database/database.service';
import { pools } from 'src/ponder/ponder.schema';
import { PonderService } from 'src/ponder/ponder.service';
import { BerachainMeta } from 'src/ponder/ponder.type';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TokenListService {
  private readonly logger = new Logger(TokenListService.name);
  private network = 'mainnet';
  private BerachainMetasURL = `https://raw.githubusercontent.com/berachain/metadata/main/src/tokens/${this.network}.json`;

  constructor(
    private readonly ponder: PonderService,
    private readonly db: DatabaseService,
    private readonly bc: BlockchainService,
    private readonly cgs: CoinGeckoService,
  ) {}

  // Fetch all tokens from berachain metadata
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async updateGeneralList() {
    const currentPools = await this.ponder.database.select().from(pools);
    const tokensInPools: string[] = currentPools.reduce((tokensAddr, pool) => {
      if (!tokensAddr.includes(pool.token0Address)) {
        tokensAddr.push(pool.token0Address);
      }
      if (!tokensAddr.includes(pool.token1Address)) {
        tokensAddr.push(pool.token1Address);
      }

      return tokensAddr;
    }, [] as string[]);

    const resp = await fetch(this.BerachainMetasURL);
    if (!resp.ok) return;

    const tokens = (await resp.json()) as { tokens: BerachainMeta[] };

    await this.db.client.$transaction(async (tx) => {
      for (const token of tokens.tokens) {
        const inPool = tokensInPools.includes(token.address);

        let totalSupply = 0n;
        if (inPool) {
          const onChainSupply = await this.getTotalSupply(token.address);
          if (onChainSupply) {
            totalSupply = onChainSupply;
          }
        }
        const details = token.extensions?.coingeckoId
          ? await this.getDetails(token.extensions.coingeckoId)
          : null;

        await tx.token.upsert({
          where: {
            address: token.address,
          },
          create: {
            address: token.address,

            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            totalSupply: totalSupply.toString(),

            status: inPool ? 'IN_POOL' : 'DISCOVERED',

            logoUri: token.logoURI,
            coingeckoId: token.extensions?.coingeckoId,
            website: details?.website || token.website,
            twitter: details?.twitter || token.twitter,
            description: details?.description || token.description,
          },
          update: {
            name: token.name,
            symbol: token.symbol,
            logoUri: token.logoURI,
            coingeckoId: token.extensions?.coingeckoId,
            website: token.website,
            twitter: token.twitter,
            description: token.description,
            status: inPool ? 'IN_POOL' : 'DISCOVERED',
            ...(totalSupply &&
              totalSupply > 0n && {
                totalSupply: totalSupply.toString(),
              }),
          },
        });
      }
    });

    this.logger.log('Tokens list updated!');
  }

  private async getDetails(coingeckoId: string) {
    try {
      return await this.cgs.getTokenDetails(coingeckoId);
    } catch (err) {
      return null;
    }
  }

  private async getTotalSupply(tokenAddr: string): Promise<bigint | null> {
    try {
      const totalSupply = await this.bc.client.readContract({
        address: tokenAddr as `0x${string}`,
        abi: [
          {
            inputs: [],
            name: 'totalSupply',
            outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'totalSupply',
      });

      return totalSupply;
    } catch (error) {
      this.logger.error('Cannot get totalSupply', error);
      return null;
    }
  }
}
