import React, { useMemo, useState } from 'react';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { Link } from 'react-router-dom';
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
      poolRef {
        token0Ref {
          logoUri
          id
          name
          symbol
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
  // Les montants sont déjà des chaînes décimales depuis Ponder
  const amount0 = (parseFloat(row.depositedToken0) - parseFloat(row.withdrawnToken0)).toFixed(2)
  const amount1 = (parseFloat(row.depositedToken1) - parseFloat(row.withdrawnToken1)).toFixed(2)

  // Vérifier si les prix sont disponibles
  const token0Price = row.poolRef.token0Ref.tokenDayData.items?.[0]?.priceUSD;
  const token1Price = row.poolRef.token1Ref.tokenDayData.items?.[0]?.priceUSD;

  const value0 = token0Price ? (Number(amount0) * token0Price) : 0;
  const value1 = token1Price ? (Number(amount1) * token1Price) : 0;
  const totalValue = (value0 + value1).toFixed(2);

  return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amount0}
          {row.poolRef.token0Ref.logoUri ? (
            <img src={row.poolRef.token0Ref.logoUri} alt={row.poolRef.token0Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.poolRef.token0Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amount1}
          {row.poolRef.token1Ref.logoUri ? (
            <img src={row.poolRef.token1Ref.logoUri} alt={row.poolRef.token1Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.poolRef.token1Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
        {token0Price && token1Price ? `$${totalValue}` : ''}
      </div>
    </div>
  );
};

const PoolPage: React.FC = () => {
  const { address, isConnected } = useAccount()
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed'>('open')
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
        <Link to={`/pools/${row.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
        <Link to={`/pools/${row.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <button className="PoolPage__ManageBtn">Manage</button>
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
              <HoverScale scale={1.05}>
                <button
                  className={`PoolPage__FilterBtn ${statusFilter === 'open' ? 'is-active' : ''}`}
                  onClick={() => setStatusFilter('open')}
                >Open</button>
              </HoverScale>
              <HoverScale scale={1.05}>
                <button
                  className={`PoolPage__FilterBtn ${statusFilter === 'closed' ? 'is-active' : ''}`}
                  onClick={() => setStatusFilter('closed')}
                >Closed</button>
              </HoverScale>
              {isConnected && (
                <HoverScale scale={1.05}>
                  <Link className="PoolPage__NewBtn" to="/pools/create">New</Link>
                </HoverScale>
              )}
            </div>
          </div>
          {isConnected
            ? isLoading
              ? (
                <div className="PoolPage__TableWrapper">
                  <p>Loading</p>
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
              <p>Loading top pools...</p>
            ) : topPoolsError ? (
              <p>Error loading pools: {topPoolsError.message}</p>
            ) : topPools.length === 0 ? (
              <p>No pools available</p>
            ) : (
              <StaggerTransition staggerDelay={0.1}>
                {topPools.map((pool: FormattedPool) => (
                  <HoverScale key={pool.address} scale={1.02}>
                    <div className="PoolPage__TopCard">
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
