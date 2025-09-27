import React, { useMemo, useState } from 'react';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/pages/_positionPage.scss';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import honeyIcon from '../../assets/honey_icon.png';
import NewBanner from '../../components/Common/NewBanner';
import { getPoolDisplayToken } from '../../utils/tokenMapping';
import { FallbackImg } from '../../components/utils/FallbackImg';
import { PageContentTransition, StaggerTransition, HoverScale } from '../../components/Transitions';
import type { Address } from 'viem';
import { Pool, Position, TickMath } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { currentChain } from '../../config/wagmi';
import JSBI from 'jsbi';
import { Loader } from '../../components/Loader/Loader';

const GET_TOP_POOLS = `
  query GetTopPools {
    pools(orderBy: "totalValueLockedUSD", orderDirection: "desc", limit: 4) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      items {
        feeTier
        id
        liquidity
        poolDayData(limit: 30, orderBy: "date", orderDirection: "desc") {
          items {
            tvlUSD
            volumeUSD
            apr
            volumeUSD1D
            volumeUSD30D
          }
        }
        token0Ref {
          name
          id
          symbol
          logoUri
        }
        token1Ref {
          id
          name
          symbol
          logoUri
        }
        totalValueLockedBERA
        totalValueLockedUSD
        volumeUSD
      }
    }
  }
`;
const GET_USER_POSITIONS = `
query GetTransactions($owner: String) {
  positions(where: {owner: $owner}) {
    items {
      id
      pool
      poolRef {
        id
        sqrtPrice
        tick
        liquidity
        token0Ref {
          logoUri
          id
          name
          symbol
          decimals
          tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
            items {
              priceUSD
            }
          }
        }
        token1Ref {
          id
          logoUri
          name
          symbol
          decimals
          tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
            items {
              priceUSD
            }
          }
        }
        feeTier
        poolDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
          items {
            apr
          }
        }
      }
      tokenId
      tickLower
      tickUpper
      withdrawnToken1
      withdrawnToken0
      depositedToken0
      depositedToken1
      liquidity
    }
  }
}
`

interface GraphQLPool {
  id: string;
  feeTier: number;
  liquidity: string;
  totalValueLockedUSD: number;
  totalValueLockedBERA: number;
  volumeUSD: number;
  poolDayData: {
    items: Array<{
      tvlUSD: number;
      volumeUSD: number;
      apr: number;
      volumeUSD1D: number;
      volumeUSD30D: number;
    }>;
  };
  token0Ref: {
    id: string;
    name: string;
    symbol: string;
    logoUri?: string;
  };
  token1Ref: {
    id: string;
    name: string;
    symbol: string;
    logoUri?: string;
  };
}

interface GraphQLResponse {
  pools: {
    totalCount: number;
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
    };
    items: GraphQLPool[];
  };
}

interface FormattedPool {
  id: Address
  address: string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  token0LogoUri?: string;
  token1LogoUri?: string;
  fee: number;
  apr: number;
  tvlUSD: number;
}

const transformGraphQLPoolToFormattedPool = (graphqlPool: GraphQLPool): FormattedPool => {
  const latestDayData = graphqlPool.poolDayData.items[0];
  const aprValue = latestDayData?.apr;
  const transformed = {
    id: graphqlPool.id as Address,
    address: graphqlPool.id,
    token0Address: graphqlPool.token0Ref.id,
    token1Address: graphqlPool.token1Ref.id,
    token0Symbol: graphqlPool.token0Ref.symbol,
    token1Symbol: graphqlPool.token1Ref.symbol,
    token0LogoUri: graphqlPool.token0Ref.logoUri,
    token1LogoUri: graphqlPool.token1Ref.logoUri,
    fee: graphqlPool.feeTier / 10000, // Convertir en pourcentage
    apr: typeof aprValue === 'number' ? aprValue : (typeof aprValue === 'string' ? parseFloat(aprValue) : 0),
    tvlUSD: graphqlPool.totalValueLockedUSD,
  };

  return transformed;
};

const PositionSizeCell: React.FC<{ row: any }> = ({ row }) => {
  // Calculer les montants actuels basés sur la liquidité et la position dans le range
  const amounts = useMemo(() => {
    try {
      const pool = row.poolRef;
      const position = row;

      // Si pas de liquidité, la position est fermée
      if (position.liquidity === "0" || !pool.sqrtPrice) {
        return { amount0: "0.00", amount1: "0.00", totalValue: "0.00" };
      }

      // Calculer le tick actuel depuis sqrtPrice
      const currentTick = pool.tick ? Number(pool.tick) : TickMath.getTickAtSqrtRatio(JSBI.BigInt(pool.sqrtPrice));

      // Créer le SDK pool
      const sdkPool = new Pool(
        new Token(currentChain.id, pool.token0Ref.id, pool.token0Ref.decimals || 18, pool.token0Ref.symbol, pool.token0Ref.name),
        new Token(currentChain.id, pool.token1Ref.id, pool.token1Ref.decimals || 18, pool.token1Ref.symbol, pool.token1Ref.name),
        pool.feeTier,
        pool.sqrtPrice,
        pool.liquidity,
        currentTick
      );

      // Créer la SDK position
      const sdkPosition = new Position({
        pool: sdkPool,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        liquidity: position.liquidity
      });

      // Obtenir les montants depuis le SDK
      const amount0 = parseFloat(sdkPosition.amount0.toExact()).toFixed(2);
      const amount1 = parseFloat(sdkPosition.amount1.toExact()).toFixed(2);

      // Calculer la valeur totale
      const token0Price = pool.token0Ref.tokenDayData?.items?.[0]?.priceUSD || 0;
      const token1Price = pool.token1Ref.tokenDayData?.items?.[0]?.priceUSD || 0;
      const value0 = parseFloat(amount0) * parseFloat(token0Price);
      const value1 = parseFloat(amount1) * parseFloat(token1Price);
      const totalValue = (value0 + value1).toFixed(2);

      return { amount0, amount1, totalValue };
    } catch (error) {
      console.error('Error calculating position amounts:', error);
      // Fallback aux valeurs deposited - withdrawn
      const amount0 = (parseFloat(row.depositedToken0 || 0) - parseFloat(row.withdrawnToken0 || 0)).toFixed(2);
      const amount1 = (parseFloat(row.depositedToken1 || 0) - parseFloat(row.withdrawnToken1 || 0)).toFixed(2);
      const token0Price = row.poolRef.token0Ref.tokenDayData?.items?.[0]?.priceUSD || 0;
      const token1Price = row.poolRef.token1Ref.tokenDayData?.items?.[0]?.priceUSD || 0;
      const totalValue = (parseFloat(amount0) * parseFloat(token0Price) + parseFloat(amount1) * parseFloat(token1Price)).toFixed(2);
      return { amount0, amount1, totalValue };
    }
  }, [row]);

  return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amounts.amount0}
          {row.poolRef.token0Ref.logoUri ? (
            <img src={row.poolRef.token0Ref.logoUri} alt={row.poolRef.token0Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.poolRef.token0Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amounts.amount1}
          {row.poolRef.token1Ref.logoUri ? (
            <img src={row.poolRef.token1Ref.logoUri} alt={row.poolRef.token1Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.poolRef.token1Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
        {parseFloat(amounts.totalValue) > 0 ? `$${amounts.totalValue}` : ''}
      </div>
    </div>
  );
};

const PoolPage: React.FC = () => {
  const { address, isConnected } = useAccount()
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed'>('open')
  const navigate = useNavigate()
  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions', address],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_USER_POSITIONS, variables: { owner: address } }),
      });

      if (!response.ok) return null
      const data = await response.json();

      return data.data.positions.items
    },
    enabled: !!address
  })
  const { data: topPoolsData, isLoading: topPoolsLoading, error: topPoolsError } = useQuery({
    queryKey: ['topPoolsGraphQL'],
    queryFn: async () => {

      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_TOP_POOLS }),
      });
      if (!response.ok) return null
      const data = await response.json();

      return data.data as GraphQLResponse;
    },
  });

  const filteredPositions = useMemo(() => {
    if (!positions) return []
    return positions.filter((p: any) => {
      return statusFilter === "open"
        ? p.liquidity !== "0"
        : p.liquidity === "0"
    })
  }, [positions, statusFilter])

  const columns: TableColumn[] = [
    { label: 'TokenId', key: 'tokenid', render: (row) => ('#' + row.tokenId) },
    {
      label: 'Pair',
      key: 'pair',
      render: (row) => (
        <Link to={`/pool/${row.pool}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
            <TokenPairLogos
              token0={row.poolRef.token0Ref}
              token1={row.poolRef.token1Ref}
              size={28}
              gap={3}
              borderWidth={2}
              separatorWidth={1.5}
            />
            {`${row.poolRef.token0Ref.symbol} / ${row.poolRef.token1Ref.symbol}`}
          </span>
        </Link>
      ),
    },
    { label: 'Fee Tier', key: 'fee', render: (row) => (`${row.poolRef.feeTier / 10000}%`) },
    {
      label: 'Position size', key: 'size', render: (row) => <PositionSizeCell row={row} />
    },
    {
      label: 'Pool APR', key: 'apr', render: (row) => {
        const apr: string = row.poolRef.poolDayData.items[0].apr || "0";
        return apr !== "0"
          ? `${apr}%`
          : "-"
      }
    },
    {
      label: '', key: 'actions', render: (row) => (
        <Link to={`/pool/${row.pool}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <button className="btn btn--tiny btn__accent">Manage</button>
        </Link>
      )
    },
  ];

  // Transformer les données GraphQL en format FormattedPool
  const topPools: FormattedPool[] = useMemo(() => {
    if (!topPoolsData?.pools?.items) {
      return [];
    }

    const transformedPools = topPoolsData.pools.items.map(transformGraphQLPoolToFormattedPool);
    return transformedPools;
  }, [topPoolsData]);

  return (
    <PageContentTransition className="PoolPage">
      <NewBanner title="Pools" subtitle="Manage your liquidity pools and positions" image={honeyIcon} />
      <div className="PoolPage__ContentWrapper">
        {/* Left Section (70%) */}
        <div className="PoolPage__Left">
          <div className="PoolPage__Header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <h2 className="PoolPage__Title">Your positions</h2>
            <div className="PoolPage__FilterButtons" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className={`btn btn--tiny ${statusFilter === 'open' ? 'btn__main' : 'btn__shade'}`}
                onClick={() => setStatusFilter('open')}
              >Open</button>
              <button
                className={`btn btn--tiny ${statusFilter === 'closed' ? 'btn__main' : 'btn__shade'}`}
                onClick={() => setStatusFilter('closed')}
              >Closed</button>
              {isConnected && (
                <Link className="btn btn--tiny btn__accent" to="/pools/create">New</Link>
              )}
            </div>
          </div>
          {isConnected
            ? isLoading
              ? (
                <div className="PoolPage__TableWrapper">
                  <Loader size="mobile" />
                </div>
              )
              : (
                <div className="PoolPage__TableWrapper">
                  <Table
                    columns={columns}
                    data={filteredPositions}
                    tableClassName="Table"
                    wrapperClassName="Table__Wrapper"
                    scrollClassName="Table__Scroll"
                    emptyMessage="No positions found"
                  />
                </div>
              )
            : (
              <div className="PoolPage__TableWrapper">
                <p>Connect your wallet</p>
              </div>
            )}
        </div>
        {/* Right Section (30%) */}
        <div className="PoolPage__Right">
          <h3 className="PoolPage__TopTitle">Top pools by TVL</h3>
          <div className="PoolPage__TopList">
            {topPoolsLoading ? (
              <Loader size="mobile" />
            ) : topPoolsError ? (
              <p>Error loading pools: {topPoolsError.message}</p>
            ) : topPools.length === 0 ? (
              <p>No pools available</p>
            ) : (
              <StaggerTransition staggerDelay={0.1}>
                {topPools.map((pool: FormattedPool) => (
                  <HoverScale key={pool.address} scale={1.02}>
                    <div
                      className="PoolPage__TopCard"
                      onClick={() => navigate(`/pool/${pool.address}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="PoolPage__TopPair" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TokenPairLogos
                          token0={{
                            id: pool.id as Address,
                            address: pool.token0Address as Address,
                            symbol: pool.token0Symbol,
                            logoUri: pool.token0LogoUri
                          }}
                          token1={{
                            id: pool.id as Address,
                            address: pool.token1Address as Address,
                            symbol: pool.token1Symbol,
                            logoUri: pool.token1LogoUri
                          }}
                          borderWidth={2}
                          separatorWidth={1.5}
                          size={28}
                        />
                        {(() => {
                          const displayToken0 = getPoolDisplayToken(pool.token0Address as `0x${string}`);
                          const displayToken1 = getPoolDisplayToken(pool.token1Address as `0x${string}`);
                          const symbol0 = displayToken0.symbol || pool.token0Symbol;
                          const symbol1 = displayToken1.symbol || pool.token1Symbol;
                          return `${symbol0} / ${symbol1}`;
                        })()} <span className="PoolPage__TopVersion">v3</span>
                      </div>
                      <div className="PoolPage__TopFee">{pool.fee}% fee</div>
                      <div className="PoolPage__TopApr">
                        {pool.apr && typeof pool.apr === 'number' ? pool.apr.toFixed(2) : '0.00'}% APR
                      </div>
                    </div>
                  </HoverScale>
                ))}
              </StaggerTransition>
            )}
          </div>
        </div>
      </div>
    </PageContentTransition>
  );
};

export default PoolPage; 
