import React, { useMemo, useState } from 'react';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { Link } from 'react-router-dom';
import '../../styles/pages/_positionPage.scss';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { usePositionsGraphQL } from '../../hooks/usePositionsGraphQL';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import honeyIcon from '../../assets/honey_icon.png';
import NewBanner from '../../components/Common/NewBanner';
import { getPoolDisplayToken } from '../../utils/tokenMapping';
import { FallbackImg } from '../../components/utils/FallbackImg';

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
  const amount0 = parseFloat(row.position.amount0).toFixed(2)
  const amount1 = parseFloat(row.position.amount1).toFixed(2)

  // Vérifier si les prix sont disponibles
  const token0Price = row.pool.token0.TokenPrice?.[0]?.price;
  const token1Price = row.pool.token1.TokenPrice?.[0]?.price;

  const value0 = token0Price ? (Number(amount0) * token0Price) : 0;
  const value1 = token1Price ? (Number(amount1) * token1Price) : 0;
  const totalValue = (value0 + value1).toFixed(2);

  return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amount0}
          {row.pool.token0.logoUri ? (
            <img src={row.pool.token0.logoUri} alt={row.pool.token0.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.pool.token0.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amount1}
          {row.pool.token1.logoUri ? (
            <img src={row.pool.token1.logoUri} alt={row.pool.token1.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.pool.token1.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
        {token0Price && token1Price ? `$${totalValue}` : 'Prix non disponible'}
      </div>
    </div>
  );
};

const PoolPage: React.FC = () => {
  const { isConnected } = useAccount()
  const { positions, isLoading } = usePositionsGraphQL()
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed'>('open')

  const filteredPositions = useMemo(() => {
    return positions.filter((p: any) => {
      return statusFilter === "open"
        ? p.liquidity !== "0"
        : p.liquidity === "0"
    })
  }, [positions, statusFilter])

  const columns: TableColumn[] = [
    { label: 'TokenId', key: 'tokenid', render: (row) => ('#' + row.position.tokenId) },
    {
      label: 'Pair',
      key: 'pair',
      render: (row) => (
        <Link to={`/pools/${row.nftTokenId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
            <TokenPairLogos
              token0={row.pool.token0}
              token1={row.pool.token1}
              size={28}
              gap={3}
              borderWidth={2}
              separatorWidth={1.5}
            />
            {`${row.pool.token0.symbol} / ${row.pool.token1.symbol}`}
          </span>
        </Link>
      ),
    },
    { label: 'Fee Tier', key: 'fee', render: (row) => (`${row.pool.fee}%`) },
    {
      label: 'Position size', key: 'size', render: (row) => <PositionSizeCell row={row} />
    },
    {
      label: 'Pool APR', key: 'apr', render: (row) => {
        const apr = row.pool.apr;
        return apr && typeof apr === 'number' && apr !== 0
          ? `${apr.toFixed(2)}%`
          : "-"
      }
    },
    {
      label: '', key: 'actions', render: (row) => (
        <Link to={`/pools/${row.position.tokenId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <button className="PoolPage__ManageBtn">Manage</button>
        </Link>
      )
    },
  ];
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

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data as GraphQLResponse;
    },
  });

  // Transformer les données GraphQL en format FormattedPool
  const topPools: FormattedPool[] = useMemo(() => {
    if (!topPoolsData?.pools?.items) {
      return [];
    }

    const transformedPools = topPoolsData.pools.items.map(transformGraphQLPoolToFormattedPool);
    return transformedPools;
  }, [topPoolsData]);

  return (
    <div className="PoolPage">
      <NewBanner title="Pools" subtitle="Manage your liquidity pools and positions" image={honeyIcon} />
      <div className="PoolPage__ContentWrapper">
        {/* Left Section (70%) */}
        <div className="PoolPage__Left">
          <div className="PoolPage__Header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <h2 className="PoolPage__Title">Your positions</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className={`PoolPage__FilterBtn ${statusFilter === 'open' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('open')}
              >Open</button>
              <button
                className={`PoolPage__FilterBtn ${statusFilter === 'closed' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('closed')}
              >Closed</button>
              {isConnected && <Link className="PoolPage__NewBtn" to="/pools/create">New</Link>}
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
              topPools.map((pool: FormattedPool) => (
                <div className="PoolPage__TopCard" key={pool.address}>
                  <div className="PoolPage__TopPair" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TokenPairLogos
                      token0={{
                        address: pool.token0Address,
                        symbol: pool.token0Symbol,
                        logoUri: pool.token0LogoUri
                      }}
                      token1={{
                        address: pool.token1Address,
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolPage; 
