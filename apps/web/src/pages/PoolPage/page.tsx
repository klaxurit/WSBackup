import { useQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import LineChart from '../../components/Charts/LineChart';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import { ExplorerChevronIcon, ExplorerIcon } from '../../components/SVGs';
import { CopyIcon } from '../../components/SVGs/ProductSVGs';
import SwapForm from '../../components/SwapForm/SwapForm';
import { PoolTransactionsTable } from '../../components/Table/PoolTransactionsTable';
import { formatNumber } from '../../utils/formatNumber';
import { FallbackImg } from '../../components/utils/FallbackImg';
import { formatUnits } from 'viem';
import type { GraphQLPool, Pool } from '../../types/api';
import { transformGraphQLPoolToPool } from '../../types/api';

const GET_TOP_POOLS = `
  query GetTopPools {
    pools(orderBy: "totalValueLockedUSD", orderDirection: "desc", limit: 10) {
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

const PoolDetailPage: React.FC = () => {
  const { poolAddress } = useParams<{ poolAddress: string }>();

  const { data: poolsData, isLoading: poolsLoading } = useQuery({
    queryKey: ['topPools'],
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

  const pools: Pool[] = useMemo(() => {
    if (!poolsData?.pools?.items) return [];
    return poolsData.pools.items.map(transformGraphQLPoolToPool);
  }, [poolsData]);

  const pool: Pool | null = useMemo(() => {
    if (!pools || !poolAddress) return null;

    try {
      return pools.find((p: Pool) =>
        p.address && p.address.toLowerCase() === poolAddress.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error finding pool:', error);
      return null;
    }
  }, [pools, poolAddress]);

  const { data: chartData = [], isLoading: chartLoading } = useQuery({
    queryKey: ['pool-chart', poolAddress],
    enabled: false,
    queryFn: async () => {
      // TODO: Réactiver quand l'endpoint backend sera disponible
      // const res = await fetch(`${import.meta.env.VITE_API_URL}/stats/pool/${poolAddress}`);
      // if (!res.ok) throw new Error('API error');
      // const data = await res.json();
      // return data.map((d: any) => ({
      //   time: Math.floor(d.timestamp / 1000),
      //   value: d.price,
      // }));

      return [
        { time: (Math.floor(Date.now() / 1000) - 7 * 24 * 3600) as import('lightweight-charts').UTCTimestamp, value: 0.001 },
        { time: (Math.floor(Date.now() / 1000) - 6 * 24 * 3600) as import('lightweight-charts').UTCTimestamp, value: 0.0012 },
        { time: (Math.floor(Date.now() / 1000) - 5 * 24 * 3600) as import('lightweight-charts').UTCTimestamp, value: 0.0009 },
        { time: (Math.floor(Date.now() / 1000) - 4 * 24 * 3600) as import('lightweight-charts').UTCTimestamp, value: 0.0011 },
        { time: (Math.floor(Date.now() / 1000) - 3 * 24 * 3600) as import('lightweight-charts').UTCTimestamp, value: 0.0013 },
        { time: (Math.floor(Date.now() / 1000) - 2 * 24 * 3600) as import('lightweight-charts').UTCTimestamp, value: 0.001 },
        { time: (Math.floor(Date.now() / 1000) - 1 * 24 * 3600) as import('lightweight-charts').UTCTimestamp, value: 0.0014 },
        { time: (Math.floor(Date.now() / 1000)) as import('lightweight-charts').UTCTimestamp, value: 0.0012 }
      ];
    },
    staleTime: 60 * 1000,
  });

  if (poolsLoading) {
    return <div style={{ padding: 32 }}>Loading pool data...</div>;
  }

  if (!pool) {
    return <div style={{ padding: 32 }}>Pool not found.</div>;
  }

  const stat = pool.PoolStatistic?.[0];
  const tvl = pool.tvlUSD || stat?.tvlUSD || null;
  const volume1d = pool.dayVolumeUSD ? Number(pool.dayVolumeUSD) : (stat?.volOneDay ? Number(stat.volOneDay) : null);
  const volume30d = pool.monthVolumeUSD ? Number(pool.monthVolumeUSD) : (stat?.volOneMonth ? Number(stat.volOneMonth) : null);
  const apr = pool.apr || stat?.apr || null;

  const liquidity = pool.token0 && pool.token1
    ? Number(formatUnits(BigInt(pool.liquidity || "0"), (pool.token0.decimals + pool.token1.decimals) / 2))
    : Number(pool.liquidity || "0");

  return (
    <div className="Pool">
      <div className="Pool__BreadcrumbsContainer">
        <div className="Pool__Breadcrumbs">
          <Link to="/explore" className="Pool__BreadcrumbsLink">Explore</Link>
          <ExplorerChevronIcon />
          <Link to="/explore?tab=pools" className="Pool__BreadcrumbsLink">Pools</Link>
          <ExplorerChevronIcon />
          <span className="Pool__BreadcrumbsLink__3">
            {pool.token0Symbol}/{pool.token1Symbol}
          </span>
          <span className="Pool__BreadcrumbsAddress">
            {pool.address.slice(0, 6) + '...' + pool.address.slice(-4)}
          </span>
        </div>

        <Link
          to={`/pools/create?token0=${pool.token0Address}&token1=${pool.token1Address}&fee=${pool.fee}`}
          className="Pool__AddLiquidityBtn btn btn--small btn__accent"
        >
          + Add Liquidity
        </Link>
      </div>

      <div className="Pool__Content">
        <div className="Pool__Left">
          <div className="Pool__ChartHead">
            <div className="Pool__ChartHeadTop">
              <div className="Pool__SectionHead">
                <div className="Pool__SectionHeadTitle">
                  <div className="Pool__SectionHeadTitleLeft">
                    <TokenPairLogos
                      token0={{
                        id: pool.token0Address,
                        address: pool.token0Address,
                        symbol: pool.token0Symbol,
                        logoUri: pool.token0LogoUri
                      }}
                      token1={{
                        id: pool.token1Address,
                        address: pool.token1Address,
                        symbol: pool.token1Symbol,
                        logoUri: pool.token1LogoUri
                      }}
                      size={32}
                      separatorWidth={2}
                    />
                    <span className="Pool__Name" title={`${pool.token0Symbol}/${pool.token1Symbol}`}>
                      {pool.token0Symbol}/{pool.token1Symbol}
                    </span>
                    <span className="Pool__Fee">{(pool.fee / 10000)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="Pool__Chart">
            {chartLoading ? (
              <div style={{ padding: 32 }}>Loading chart...</div>
            ) : (
              <LineChart
                data={chartData}
                height={400}
                priceFormatter={(price: number) => `$${price.toFixed(6)}`}
              />
            )}
          </div>

          {/* Statistics Section */}
          <div className="Pool__Statistics">
            <h3 className="Pool__StatisticsTitle">Pool Statistics</h3>
            <div className="Pool__StatCards">
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">TVL</h4>
                <p className="Pool__StatCardLabel">
                  {tvl === null || isNaN(tvl) ? 'N/A' : formatNumber(tvl)}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">APR</h4>
                <p className="Pool__StatCardLabel">
                  {apr === null || isNaN(apr) || typeof apr !== 'number' ? 'N/A' : `${apr.toFixed(2)}%`}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">24h Volume</h4>
                <p className="Pool__StatCardLabel">
                  {volume1d === null || isNaN(volume1d) ? 'N/A' : formatNumber(volume1d)}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">30d Volume</h4>
                <p className="Pool__StatCardLabel">
                  {volume30d === null || isNaN(volume30d) ? 'N/A' : formatNumber(volume30d)}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">Liquidity</h4>
                <p className="Pool__StatCardLabel">
                  {liquidity > 0.01
                    ? formatNumber(liquidity)
                    : '<0.01'}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">Fee Tier</h4>
                <p className="Pool__StatCardLabel">
                  {(pool.fee / 10000)}%
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="Pool__Transactions">
            <PoolTransactionsTable poolAddress={pool.address} />
          </div>
        </div>

        <div className="Pool__Right">
          <div className="Pool__SwapForm">
            <SwapForm
              toggleSidebar={() => { }}
              initialFromToken={{
                address: pool.token0Address,
                symbol: pool.token0Symbol,
                name: pool.token0Symbol,
                logoUri: pool.token0LogoUri,
                decimals: 18
              } as any}
              initialToToken={{
                address: pool.token1Address,
                symbol: pool.token1Symbol,
                name: pool.token1Symbol,
                logoUri: pool.token1LogoUri,
                decimals: 18
              } as any}
            />
          </div>

          {/* Pool Information Section */}
          <div className="Pool__InfoSection">
            <h3 className="Pool__InfoSectionTitle">Pool Information</h3>
            <div className="Pool__InfoLinks">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={pool.address ? `https://berascan.com/address/${pool.address}` : '#'}
                className="Pool__InfoLink"
              >
                <ExplorerIcon />
                <span>View on Explorer</span>
              </a>
            </div>

            <div className="Pool__InfoDetails">
              <div className="Pool__InfoRow">
                <span className="Pool__InfoValue">
                  <div className="Pool__TokenInfoDetailed">
                    {pool.token0LogoUri ? (
                      <img src={pool.token0LogoUri} />
                    ) : (
                      <FallbackImg content={pool.token0Symbol} />
                    )}
                    <div className="Pool__TokenDetails">
                      <span className="Pool__TokenSymbol">{pool.token0Symbol}</span>
                      <div className="Pool__TokenAddressContainer">
                        <span className="Pool__TokenAddress">
                          {pool.token0Address.slice(0, 6) + '...' + pool.token0Address.slice(-4)}
                        </span>
                        <button
                          className="Pool__CopyButton Pool__CopyButton--small"
                          onClick={() => navigator.clipboard.writeText(pool.token0Address)}
                          title="Copy token address"
                        >
                          <CopyIcon />
                        </button>
                        <a
                          href={`https://berascan.com/address/${pool.token0Address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="Pool__ExplorerButton Pool__ExplorerButton--small"
                          title="View token on Explorer"
                        >
                          <ExplorerIcon />
                        </a>
                      </div>
                    </div>
                  </div>
                </span>
              </div>
              <div className="Pool__InfoRow">
                <span className="Pool__InfoValue">
                  <div className="Pool__TokenInfoDetailed">
                    {pool.token1LogoUri ? (
                      <img src={pool.token1LogoUri} />
                    ) : (
                      <FallbackImg content={pool.token1Symbol} />
                    )}
                    <div className="Pool__TokenDetails">
                      <span className="Pool__TokenSymbol">{pool.token1Symbol}</span>
                      <div className="Pool__TokenAddressContainer">
                        <span className="Pool__TokenAddress">
                          {pool.token1Address.slice(0, 6) + '...' + pool.token1Address.slice(-4)}
                        </span>
                        <button
                          className="Pool__CopyButton Pool__CopyButton--small"
                          onClick={() => navigator.clipboard.writeText(pool.token1Address)}
                          title="Copy token address"
                        >
                          <CopyIcon />
                        </button>
                        <a
                          href={`https://berascan.com/address/${pool.token1Address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="Pool__ExplorerButton Pool__ExplorerButton--small"
                          title="View token on Explorer"
                        >
                          <ExplorerIcon />
                        </a>
                      </div>
                    </div>
                  </div>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolDetailPage;
