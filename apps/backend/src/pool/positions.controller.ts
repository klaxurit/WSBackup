import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Param,
  UseInterceptors,
  Get,
} from '@nestjs/common';

@Controller('positions')
@UseInterceptors(CacheInterceptor)
export class PositionsController {
  private readonly indexerUrl = process.env.PONDER_GRAPHQL_URL || 'http://localhost:42069/graphql';

  @Get('/:address')
  @CacheKey('positions:user')
  @CacheTTL(2 * 60 * 1000) // 2 minutes
  async getUserPositions(@Param('address') address: string) {
    try {
      console.log(`Fetching positions for address: ${address}`);

      // Utiliser directement l'API GraphQL de l'indexer
      const query = `
        query GetUserPositions($owner: String!) {
          positionss(where: {owner: $owner}) {
            items {
              poolAddress
              owner
              tickLower
              tickUpper
              liquidity
              amount0
              amount1
              createdAt
              updatedAt
              pool {
                address
                token0Address
                token1Address
                fee
                tickSpacing
                createdAt
                createdAtBlock
              }
            }
          }
        }
      `;

      const response = await fetch(this.indexerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: { owner: address.toLowerCase() }
        })
      });

      if (!response.ok) {
        throw new Error(`Indexer API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        return [];
      }

      const positions = result.data?.positionss?.items || [];

      if (positions.length === 0) {
        return [];
      }

      // Transformer les données pour correspondre à l'interface frontend
      const transformedPositions = positions.map((pos: any) => {
        const pool = pos.pool;

        return {
          nftTokenId: `${pos.poolAddress}-${pos.owner}-${pos.tickLower}-${pos.tickUpper}`,
          position: {
            fee: pool?.fee || 3000,
            tickLower: pos.tickLower,
            tickUpper: pos.tickUpper,
            liquidity: pos.liquidity.toString(),
            tokenOwed0: '0',
            tokenOwed1: '0',
          },
          pool: {
            id: pool?.address || pos.poolAddress,
            address: pool?.address || pos.poolAddress,
            token0Id: pool?.token0Address || '0x0',
            token1Id: pool?.token1Address || '0x0',
            fee: pool?.fee || 3000,
            liquidity: pos.liquidity.toString(),
            tick: 0, // À calculer ou récupérer depuis la blockchain
            sqrtPriceX96: '0',
            createdAt: pool?.createdAt ? new Date(Number(pool.createdAt) * 1000).toISOString() : new Date().toISOString(),
            updatedAt: pos.updatedAt ? new Date(Number(pos.updatedAt) * 1000).toISOString() : new Date().toISOString(),
            PoolStatistic: [{
              apr: 0,
              tvlUSD: 0,
              dayVolumeUSD: 0,
              monthVolumeUSD: 0,
            }],
            token0: {
              id: pool?.token0Address || '0x0',
              address: pool?.token0Address || '0x0',
              symbol: 'UNKNOWN', // À récupérer depuis un service de tokens
              name: 'Unknown Token',
              decimals: 18,
              logoUri: null,
              coingeckoId: null,
              tags: [],
              Statistic: [],
            },
            token1: {
              id: pool?.token1Address || '0x0',
              address: pool?.token1Address || '0x0',
              symbol: 'UNKNOWN', // À récupérer depuis un service de tokens
              name: 'Unknown Token',
              decimals: 18,
              logoUri: null,
              coingeckoId: null,
              tags: [],
              Statistic: [],
            },
          },
        };
      });

      return transformedPositions;
    } catch (error) {
      console.error('Error fetching user positions:', error);
      return [];
    }
  }
}
