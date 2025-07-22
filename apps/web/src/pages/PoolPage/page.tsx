import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SwapForm from '../../components/SwapForm/SwapForm';
import { ExplorerChevronIcon, ExplorerIcon } from '../../components/SVGs';
import { formatNumber } from '../../utils/formatNumber';
import { PoolTransactionsTable } from '../../components/Table/PoolTransactionsTable';
import LineChart from '../../components/Charts/LineChart';
import { Banner } from '../../components/Common/Banner';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';

interface Pool {
  id: string;
  address: string;
  fee: number;
  liquidity: string;
  sqrtPriceX96: string;
  token0: {
    id: string;
    address: string;
    symbol: string;
    name: string;
    logoUri?: string;
    decimals: number;
  };
  token1: {
    id: string;
    address: string;
    symbol: string;
    name: string;
    logoUri?: string;
    decimals: number;
  };
  PoolStatistic: Array<{
    id: string;
    tvlUSD: string;
    volOneDay: string;
    volOneMonth: string;
    apr: number;
    createdAt: string;
  }>;
}

const PoolDetailPage: React.FC = () => {
  const { poolAddress } = useParams<{ poolAddress: string }>();

  const { data: pools, isLoading: poolsLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools`);
      if (!resp.ok) return [];
      return resp.json();
    },
  });

  // Find the specific pool
  const pool: Pool | null = useMemo(() => {
    if (!pools || !poolAddress) return null;
    return pools.find((p: Pool) => p.address?.toLowerCase() === poolAddress.toLowerCase()) || null;
  }, [pools, poolAddress]);

  // Pool chart data query
  const { data: chartData = [], isLoading: chartLoading } = useQuery({
    queryKey: ['pool-chart', poolAddress],
    enabled: !!poolAddress,
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/stats/pool/${poolAddress}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.map((d: any) => ({
        time: Math.floor(d.timestamp / 1000),
        value: d.price,
      }));
    },
    staleTime: 60 * 1000,
  });

  if (poolsLoading) {
    return <div style={{ padding: 32 }}>Loading pool data...</div>;
  }

  if (!pool) {
    return <div style={{ padding: 32 }}>Pool not found.</div>;
  }

  const bannerTitle = `${pool.token0.symbol}/${pool.token1.symbol}`;
  const bannerSubtitle = `${(pool.fee / 10000)}% Fee Pool`;

  // Latest statistics
  const stat = pool.PoolStatistic?.[0];
  const tvl = stat?.tvlUSD ? Number(stat.tvlUSD) : null;
  const volume1d = stat?.volOneDay ? Number(stat.volOneDay) : null;
  const volume30d = stat?.volOneMonth ? Number(stat.volOneMonth) : null;
  const apr = stat?.apr || null;

  return (
    <div className="Pool">
      <Banner
        title={bannerTitle}
        subtitle={bannerSubtitle}
        imageAlt={`${pool.token0.symbol}/${pool.token1.symbol}`}
      />

      <div className="Pool__Breadcrumbs">
        <Link to="/explore" className="Pool__BreadcrumbsLink">Explore</Link>
        <ExplorerChevronIcon />
        <Link to="/explore?tab=pools" className="Pool__BreadcrumbsLink">Pools</Link>
        <ExplorerChevronIcon />
        <span className="Pool__BreadcrumbsLink__3">
          {pool.token0.symbol}/{pool.token1.symbol}
        </span>
        <span className="Pool__BreadcrumbsAddress">
          {pool.address.slice(0, 6) + '...' + pool.address.slice(-4)}
        </span>
      </div>

      <div className="Pool__Content">
        <div className="Pool__Left">
          <div className="Pool__ChartHead">
            <div className="Pool__ChartHeadTop">
              <div className="Pool__SectionHead">
                <div className="Pool__SectionHeadTitle">
                  <div className="Pool__SectionHeadTitleLeft">
                    <TokenPairLogos
                      token0={pool.token0}
                      token1={pool.token1}
                      size={32}
                    />
                    <span className="Pool__Name" title={`${pool.token0.name}/${pool.token1.name}`}>
                      {pool.token0.symbol}/{pool.token1.symbol}
                    </span>
                    <span className="Pool__Fee">{(pool.fee / 10000)}%</span>
                  </div>

                  <div className="Pool__SectionHeadTitleRight">
                    <a
                      href={pool.address ? `https://beratrail.io/address/${pool.address}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="Pool__IconLink"
                      title="View on Explorer"
                    >
                      <ExplorerIcon />
                    </a>
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
                  {tvl === null || isNaN(tvl) ? 'N/A' : formatNumber(tvl, { currency: true })}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">APR</h4>
                <p className="Pool__StatCardLabel">
                  {apr === null || isNaN(apr) ? 'N/A' : `${apr.toFixed(2)}%`}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">24h Volume</h4>
                <p className="Pool__StatCardLabel">
                  {volume1d === null || isNaN(volume1d) ? 'N/A' : formatNumber(volume1d, { currency: true })}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">30d Volume</h4>
                <p className="Pool__StatCardLabel">
                  {volume30d === null || isNaN(volume30d) ? 'N/A' : formatNumber(volume30d, { currency: true })}
                </p>
              </div>
              <div className="Pool__StatCard">
                <h4 className="Pool__StatCardTitle">Liquidity</h4>
                <p className="Pool__StatCardLabel">
                  {pool.liquidity ? formatNumber(Number(pool.liquidity), { currency: false }) : 'N/A'}
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
              initialFromToken={pool.token0 as any}
            />
          </div>

          {/* Pool Information Section */}
          <div className="Pool__InfoSection">
            <h3 className="Pool__InfoSectionTitle">Pool Information</h3>
            <div className="Pool__InfoLinks">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={pool.address ? `https://beratrail.io/address/${pool.address}` : '#'}
                className="Pool__InfoLink"
              >
                <ExplorerIcon />
                <span>View on Explorer</span>
              </a>
            </div>

            <div className="Pool__InfoDetails">
              <div className="Pool__InfoRow">
                <span className="Pool__InfoLabel">Pool Address:</span>
                <span className="Pool__InfoValue">
                  {pool.address.slice(0, 8) + '...' + pool.address.slice(-8)}
                </span>
              </div>
              <div className="Pool__InfoRow">
                <span className="Pool__InfoLabel">Token 0:</span>
                <span className="Pool__InfoValue">
                  <div className="Pool__TokenInfo">
                    {pool.token0.logoUri && (
                      <img
                        src={pool.token0.logoUri}
                        alt={pool.token0.symbol}
                        className="Pool__TokenLogo"
                      />
                    )}
                    {pool.token0.symbol}
                  </div>
                </span>
              </div>
              <div className="Pool__InfoRow">
                <span className="Pool__InfoLabel">Token 1:</span>
                <span className="Pool__InfoValue">
                  <div className="Pool__TokenInfo">
                    {pool.token1.logoUri && (
                      <img
                        src={pool.token1.logoUri}
                        alt={pool.token1.symbol}
                        className="Pool__TokenLogo"
                      />
                    )}
                    {pool.token1.symbol}
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