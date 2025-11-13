import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { CoinGeckoService } from 'src/coingecko/coingecko.service';
import { DatabaseService } from 'src/database/database.service';
import { pool } from 'src/ponder/ponder.schema';
import { PonderService } from 'src/ponder/ponder.service';
import { BerachainMeta } from 'src/ponder/ponder.type';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TokenListService implements OnModuleInit {
  private readonly logger = new Logger(TokenListService.name);
  private network = 'mainnet';
  private BerachainMetasURL = `https://raw.githubusercontent.com/berachain/metadata/main/src/tokens/${this.network}.json`;

  constructor(
    private readonly ponder: PonderService,
    private readonly db: DatabaseService,
    private readonly bc: BlockchainService,
    private readonly cgs: CoinGeckoService,
  ) { }

  async onModuleInit() {
    await this.updateGeneralList();
    await this.updateInPoolStatus();
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async updateInPoolStatus() {
    try {
      this.logger.log('Starting IN_POOL status update...');

      const currentPools = await this.ponder.database.select().from(pool);
      const tokensInPools: string[] = currentPools.reduce((tokensAddr, pool) => {
        if (!tokensAddr.includes(pool.token0.toLowerCase())) {
          tokensAddr.push(pool.token0.toLowerCase());
        }
        if (!tokensAddr.includes(pool.token1.toLowerCase())) {
          tokensAddr.push(pool.token1.toLowerCase());
        }
        return tokensAddr;
      }, [] as string[]);

      this.logger.log(`Found ${tokensInPools.length} unique tokens in ${currentPools.length} pools`);

      let updatedCount = 0;
      let errorCount = 0;

      for (const tokenAddr of tokensInPools) {
        try {
          const onChainSupply = await this.getTotalSupply(tokenAddr);

          await this.db.client.token.upsert({
            where: { address: tokenAddr },
            update: {
              totalSupply: onChainSupply?.toString() || '0',
              status: 'IN_POOL',
              lastActivityAt: new Date(),
            },
            create: {
              address: tokenAddr,
              symbol: 'UNKNOWN',
              name: 'Unknown Token',
              decimals: 18,
              totalSupply: onChainSupply?.toString() || '0',
              status: 'IN_POOL',
              lastActivityAt: new Date(),
            },
          });

          updatedCount++;
        } catch (error) {
          errorCount++;
          this.logger.warn(`Failed to update token ${tokenAddr}: ${error.message}`);
        }
      }

      this.logger.log(`IN_POOL status update completed: ${updatedCount} updated, ${errorCount} errors`);
    } catch (error) {
      this.logger.error('Failed to update IN_POOL status', error);
    }
  }

  // Fetch all tokens from berachain metadata
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  public async updateGeneralList() {
    const resp = await fetch(this.BerachainMetasURL);
    if (!resp.ok) return;

    const tokens = (await resp.json()) as { tokens: BerachainMeta[] };

    await this.db.client.$transaction(async (tx) => {
      for (const token of tokens.tokens) {
        const details = token.extensions?.coingeckoId
          ? await this.getDetails(token.extensions.coingeckoId)
          : null;

        await tx.token.upsert({
          where: {
            address: token.address.toLowerCase(),
          },
          create: {
            address: token.address.toLowerCase(),

            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            totalSupply: '0',

            status: 'DISCOVERED',

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
