import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChartWidget } from '../../components/Charts/ChartWidget';
import type { ChartType, ChartInterval, ChartMetric } from '../../types/chart';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import { ExplorerChevronIcon, ExplorerIcon } from '../../components/SVGs';
import { CopyIcon } from '../../components/SVGs/ProductSVGs';
import SwapForm from '../../components/SwapForm/SwapForm';
import { PoolTransactionsTable } from '../../components/Table/PoolTransactionsTable';
import { formatNumber } from '../../utils/formatNumber';
import { FallbackImg } from '../../components/utils/FallbackImg';
import { type Address } from 'viem';

const GET_POOL = `
query GetTokensStats($id: String = "") {
  pool(id: $id) {
    collectedFeesUSD
    feeTier
    feesUSD
    id
    liquidity
    liquidityProviderCount
    sqrtPrice
    tick
    totalValueLockedUSD
    txCount
    volumeUSD
    poolDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
      items {
        apr
        date
        feesUSD
        tvlUSD
        txCount
        volumeUSD
        volumeUSD30D
        volumeUSD1D
      }
    }
    token0Ref {
      decimals
      id
      logoUri
      name
      symbol
    }
    token1Ref {
      id
      logoUri
      name
      symbol
      decimals
    }
  },
  stickyVaults(where: {pool: $id}) {
    items {
      collectedFeesUSD
      id
      name
      totalValueLockedUSD
      vaultDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
        items {
          apr
          maxPotentialAPR
          volumeUSD1D
        }
      }
    }
  }
}
`;

interface Pool {
  collectedFeesUSD: string
  feeTier: number
  feesUSD: string
  id: string
  liquidity: string
  liquidityProviderCount: number
  sqrtPrice: string
  tick: number
  poolDayData: {
    items: {
      apr: string
      date: number
      feesUSD: string
      tvlUSD: string
      txCount: number
      volumeUSD: string
      volumeUSD30D: string
      volumeUSD1D: string
    }[]
  }
  token0Ref: {
    decimals: number
    id: Address
    logoUri: string
    name: string
    symbol: string
  }
  token1Ref: {
    decimals: number
    id: Address
    logoUri: string
    name: string
    symbol: string
  }
  totalValueLockedUSD: string
  txCount: number
  volumeUSD: string
}

const PoolDetailPage: React.FC = () => {
  const { poolAddress } = useParams<{ poolAddress: string }>();

  // États pour les contrôles du chart
  const [chartType, setChartType] = React.useState<ChartType>('area');
  const [interval, setInterval] = React.useState<ChartInterval>('1D');
  const [metric, setMetric] = React.useState<ChartMetric>('price');

  const { data, isLoading: poolsLoading } = useQuery({
    queryKey: ['pool', poolAddress],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_POOL, variables: { id: poolAddress } }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return {
        pool: data.data.pool as Pool,
        vault: data.data.stickyVaults.items[0]
      }
    },
  });

  const { pool, vault } = data ?? { pool: null, vault: null }
  console.log(pool, vault)

  // Handlers pour les contrôles du chart
  const handleChartTypeChange = (newType: ChartType) => {
    setChartType(newType);
  };

  const handleIntervalChange = (newInterval: ChartInterval) => {
    setInterval(newInterval);
  };

  const handleMetricChange = (newMetric: ChartMetric) => {
    setMetric(newMetric);
  };

  const priceFormatter = (price: number) => `$${price.toFixed(6)}`;

  if (poolsLoading) {
    return (<div className="VaultDetailPage VaultDetailPage--error">
      <h2>Loading...</h2>
    </div>)
  }

  if (!pool) {
    return (
      <div className="VaultDetailPage VaultDetailPage--error">
        <div className="VaultDetailPage__Error">
          <h2>Pool not found</h2>
          <p>The requested pool does not exist or has been removed.</p>
          <Link to="/explore?tab=pools" className="button button--primary">
            Back to pools
          </Link>
        </div>
      </div>
    );
  }

  const stat = pool.poolDayData.items?.[0];
  const tvl = Number(pool.totalValueLockedUSD) || null;
  const volume1d = stat.volumeUSD1D ? Number(stat.volumeUSD1D) : null;
  const volume30d = stat.volumeUSD30D ? Number(stat.volumeUSD30D) : null;
  const apr = stat.apr ? Number(stat.apr) : null;
  const t0 = pool.token0Ref
  const t1 = pool.token1Ref

  return (
    <div className="Pool">
      <div className="Pool__BreadcrumbsContainer">
        <div className="Pool__Breadcrumbs">
          <Link to="/explore" className="Pool__BreadcrumbsLink">Explore</Link>
          <ExplorerChevronIcon />
          <Link to="/explore?tab=pools" className="Pool__BreadcrumbsLink">Pools</Link>
          <ExplorerChevronIcon />
          <span className="Pool__BreadcrumbsLink__3">
            {t0.symbol}/{t1.symbol}
          </span>
          <span className="Pool__BreadcrumbsAddress">
            {pool.id.slice(0, 6) + '...' + pool.id.slice(-4)}
          </span>
        </div>

        <div className='Pool__BreadcrumbsButtons'>
          {vault?.id && (
            <Link
              to={`/vaults/${vault.id}`}
              className="Pool__AddLiquidityBtn btn btn--small btn__accent"
            >
              Add Vault Liquidity
            </Link>
          )}
          <Link
            to={`/pools/create?token0=${t0.id}&token1=${t1.id}&fee=${pool.feeTier}`}
            className="Pool__AddLiquidityBtn btn btn--small btn__accent"
          >
            Add Pool Liquidity
          </Link>
        </div>
      </div>

      <div className="Pool__Content">
        <div className="Pool__Left">
          <div className="Pool__ChartHead">
            <div className="Pool__ChartHeadTop">
              <div className="Pool__SectionHead">
                <div className="Pool__SectionHeadTitle">
                  <div className="Pool__SectionHeadTitleLeft">
                    <TokenPairLogos
                      token0={{ ...t0, address: t0.id }}
                      token1={{ ...t1, address: t1.id }}
                      size={32}
                      separatorWidth={2}
                    />
                    <span className="Pool__Name" title={`${t0.symbol}/${t1.symbol}`}>
                      {t0.symbol}/{t1.symbol}
                    </span>
                    <span className="Pool__Fee">{(pool.feeTier / 10000)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="Pool__Chart">
            <ChartWidget
              poolAddress={poolAddress}
              chartType={chartType}
              interval={interval}
              metric={metric}
              height={400}
              showToolbar={true}
              priceFormatter={priceFormatter}
              onChartTypeChange={handleChartTypeChange}
              onIntervalChange={handleIntervalChange}
              onMetricChange={handleMetricChange}
              dataType="pool"
            />
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
                <h4 className="Pool__StatCardTitle">Fee Tier</h4>
                <p className="Pool__StatCardLabel">
                  {(pool.feeTier / 10000)}%
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          {!!vault && (
            <div className="Pool__Statistics">
              <h3 className="Pool__StatisticsTitle">Vault Statistics</h3>
              <div className="Pool__StatCards">
                <div className="Pool__StatCard">
                  <h4 className="Pool__StatCardTitle">TVL</h4>
                  <p className="Pool__StatCardLabel">
                    {vault === null ? 'N/A' : formatNumber(vault.totalValueLockedUSD)}
                  </p>
                </div>
                <div className="Pool__StatCard">
                  <h4 className="Pool__StatCardTitle">APR</h4>
                  <p className="Pool__StatCardLabel">
                    {vault === null || !vault.vaultDayData.items || vault.vaultDayData.items.length === 0 ? 'N/A' : `${vault.vaultDayData.items[0].maxPotentialAPR}%`}
                  </p>
                </div>
                <div className="Pool__StatCard">
                  <h4 className="Pool__StatCardTitle">24h Volume</h4>
                  <p className="Pool__StatCardLabel">
                    {vault === null || !vault.vaultDayData.items || vault.vaultDayData.items.length === 0 ? 'N/A' : `$${formatNumber(vault.vaultDayData.items[0].volumeUSD1D)}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transactions Table */}
          <div className="Pool__Transactions">
            <PoolTransactionsTable poolAddress={pool.id} />
          </div>
        </div>

        <div className="Pool__Right">
          <div className="Pool__SwapForm">
            <SwapForm
              toggleSidebar={() => { }}
              initialFromToken={{
                address: t0.id,
                symbol: t0.symbol,
                name: t0.symbol,
                logoUri: t0.logoUri,
                decimals: 18
              } as any}
              initialToToken={{
                address: t1.id,
                symbol: t1.symbol,
                name: t1.symbol,
                logoUri: t1.logoUri,
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
                href={pool.id ? `https://berascan.com/address/${pool.id}` : '#'}
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
                    {t0.logoUri ? (
                      <img src={t0.logoUri} />
                    ) : (
                      <FallbackImg content={t0.symbol} />
                    )}
                    <div className="Pool__TokenDetails">
                      <span className="Pool__TokenSymbol">{t0.symbol}</span>
                      <div className="Pool__TokenAddressContainer">
                        <span className="Pool__TokenAddress">
                          {t0.id.slice(0, 6) + '...' + t0.id.slice(-4)}
                        </span>
                        <button
                          className="Pool__CopyButton Pool__CopyButton--small"
                          onClick={() => navigator.clipboard.writeText(t0.id)}
                          title="Copy token address"
                        >
                          <CopyIcon />
                        </button>
                        <a
                          href={`https://berascan.com/address/${t0.id}`}
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
                    {t1.logoUri ? (
                      <img src={t1.logoUri} />
                    ) : (
                      <FallbackImg content={t1.symbol} />
                    )}
                    <div className="Pool__TokenDetails">
                      <span className="Pool__TokenSymbol">{t1.symbol}</span>
                      <div className="Pool__TokenAddressContainer">
                        <span className="Pool__TokenAddress">
                          {t1.id.slice(0, 6) + '...' + t1.id.slice(-4)}
                        </span>
                        <button
                          className="Pool__CopyButton Pool__CopyButton--small"
                          onClick={() => navigator.clipboard.writeText(t1.id)}
                          title="Copy token address"
                        >
                          <CopyIcon />
                        </button>
                        <a
                          href={`https://berascan.com/address/${t1.id}`}
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
