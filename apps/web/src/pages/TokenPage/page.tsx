import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SwapForm from '../../components/SwapForm/SwapForm';
import { ExplorerChevronIcon, ExplorerIcon, WebsiteIcon, TwitterIcon, ShareIcon } from '../../components/SVGs';
import { useCoingeckoTokenData } from '../../hooks/useCoingeckoData';
import { formatNumber } from '../../utils/formatNumber';
import { TokenTransactionsTable } from '../../components/Table/TokenTransactionsTable';
import LineChart from '../../components/Charts/LineChart';
import Banner from '../../components/Common/Banner';

const INTERVAL_KEYS = ['hour', 'day', 'week', 'month', 'year'] as const;
type IntervalKey = typeof INTERVAL_KEYS[number];


const INTERVALS = [
  { label: '1H', key: 'hour' },
  { label: '1D', key: 'day' },
  { label: '1W', key: 'week' },
  { label: '1M', key: 'month' },
  { label: '1Y', key: 'year' },
] as const;

const TokenPage: React.FC = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [activeChartTab, setActiveChartTab] = useState<IntervalKey>('day');

  // Always call hooks at the top, never in a conditional or after a return
  const { data: tokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/tokens`);
      if (!resp.ok) return [];
      return resp.json();
    },
  });

  const { data: pools, isLoading: poolsLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools`);
      if (!resp.ok) return [];
      return resp.json();
    },
  });

  // Compute token even if tokens are not yet loaded
  const token = useMemo(() => {
    if (!tokens || !tokenAddress) return null;
    return tokens.find((t: any) => t.address?.toLowerCase() === tokenAddress.toLowerCase());
  }, [tokens, tokenAddress]);

  // Always call the hook, even if token is null
  const { data: coingeckoTokenData, isLoading: descLoading } = useCoingeckoTokenData(token?.coingeckoId);

  // Always call the hook, even if pools/token are not yet loaded
  // Fallback TVL from Coingecko if missing in backend
  const tvl = useMemo(() => {
    if (!pools || !token) return null;
    let total = 0;
    for (const pool of pools) {
      if (
        (pool.token0?.address?.toLowerCase() === token?.address?.toLowerCase() ||
          pool.token1?.address?.toLowerCase() === token?.address?.toLowerCase()) &&
        pool.PoolStatistic?.length > 0 &&
        pool.PoolStatistic[0].tvlUSD &&
        !isNaN(Number(pool.PoolStatistic[0].tvlUSD))
      ) {
        total += Number(pool.PoolStatistic[0].tvlUSD);
      }
    }
    // Fallback to Coingecko if backend TVL is missing or zero
    if (total === 0 && coingeckoTokenData?.market_data?.total_value_locked_usd) {
      return coingeckoTokenData.market_data.total_value_locked_usd;
    }
    return total;
  }, [pools, token, coingeckoTokenData]);

  // Addition: get the latest token statistic
  const stat = token?.Statistic?.[0];
  const totalSupply = token?.totalSupply ?? coingeckoTokenData?.total_supply ?? null;

  // Market Cap: backend then fallback to CoinGecko
  const marketCap = useMemo(() => {
    // If backend stat contains marketCap (adapt if backend exposes this field)
    if (stat?.marketCap && stat.marketCap > 0) return stat.marketCap;
    // Fallback CoinGecko
    if (coingeckoTokenData?.market_data?.market_cap?.usd && coingeckoTokenData.market_data.market_cap.usd > 0)
      return coingeckoTokenData.market_data.market_cap.usd;
    return null;
  }, [stat, coingeckoTokenData]);

  // FDV: calculated frontend (price * totalSupply), fallback N/A
  const fdv = useMemo(() => {
    if (!stat || !totalSupply) return null;
    return stat.price * totalSupply;
  }, [stat, totalSupply]);

  // 1D Volume: backend then fallback CoinGecko
  const volume1d = useMemo(() => {
    if (stat?.volume && stat.volume > 0) return stat.volume;
    if (coingeckoTokenData?.market_data?.total_volume?.usd && coingeckoTokenData.market_data.total_volume.usd > 0)
      return coingeckoTokenData.market_data.total_volume.usd;
    return null;
  }, [stat, coingeckoTokenData]);

  // Hook pour charger l'historique de prix d'un token (endpoint /stats/token/:address)
  function useTokenLineChart(tokenAddress?: string | null) {
    return useQuery({
      queryKey: ['token-line-chart', tokenAddress],
      enabled: !!tokenAddress,
      queryFn: async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/stats/token/${tokenAddress}`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        return data.map((d: any) => ({
          time: Math.floor(d.timestamp / 1000) as import('lightweight-charts').UTCTimestamp,
          value: d.price,
        }));
      },
      staleTime: 60 * 1000,
    });
  }

  // Fonctions utilitaires pour nettoyer et normaliser les données (identiques à SwapPageLayout)
  const cleanLineData = (data: { time: number, value: number }[]) => {
    const sorted = [...data].sort((a, b) => a.time - b.time);
    return sorted
      .filter((point, i, arr) => i === 0 || point.time !== arr[i - 1].time)
      .map(point => ({
        time: point.time as import('lightweight-charts').UTCTimestamp,
        value: point.value,
      }));
  };
  const filterOutliers = (data: { time: number, value: number }[]) => {
    if (data.length < 3) return data;
    const values = data.map(d => d.value).sort((a, b) => a - b);
    const median = values[Math.floor(values.length / 2)];
    return data
      .filter(d => d.value < median * 1e6 && d.value > median / 1e6)
      .map(point => ({
        time: point.time as import('lightweight-charts').UTCTimestamp,
        value: point.value,
      }));
  };
  const shouldNormalize = (data: { value: number }[]) => {
    if (!data.length) return false;
    const sample = data.slice(0, 10);
    const bigValues = sample.filter(d => Math.abs(d.value) > 1e6).length;
    return bigValues > sample.length / 2;
  };
  const normalizeLineData = (data: { time: number, value: number }[], decimals?: number) => {
    if (!decimals) return data;
    return data.map(point => ({
      time: point.time as import('lightweight-charts').UTCTimestamp,
      value: point.value / Math.pow(10, decimals),
    }));
  };
  const LWC_MIN = -90071992547409.91;
  const LWC_MAX = 90071992547409.91;
  const filterLWCBounds = (data: { time: number, value: number }[]) =>
    data
      .filter(d => d.value >= LWC_MIN && d.value <= LWC_MAX)
      .map(point => ({
        time: point.time as import('lightweight-charts').UTCTimestamp,
        value: point.value,
      }));
  const priceFormatter = (price: number) => price.toFixed(2);

  // --- Chart historique du token ---
  const { data: lineData = [], isLoading: lineLoading, error: lineError } = useTokenLineChart(token?.address);
  const fromTokenDecimals = token?.decimals;
  const filteredData = filterOutliers(lineData);
  const needNormalization = shouldNormalize(filteredData);
  const normalizedData = needNormalization && fromTokenDecimals
    ? normalizeLineData(filteredData, fromTokenDecimals)
    : filteredData;
  const chartData = filterLWCBounds(cleanLineData(normalizedData));

  if (tokensLoading) {
    return <div style={{ padding: 32 }}>Loading token data...</div>;
  }
  if (!token) {
    return <div style={{ padding: 32 }}>Token not found.</div>;
  }
  const bannerTitle = token.name || token.symbol;
  const bannerSubtitle = token.symbol ? `${token.symbol}` : '';

  return (
    <div className="Token">
      <Banner title={bannerTitle} subtitle={bannerSubtitle} imageAlt={token.symbol} />
      <div className="Token__Breadcrumbs">
        <span className="Token__BreadcrumbsLink">Explore</span>
        <ExplorerChevronIcon />
        <span className="Token__BreadcrumbsLink">Tokens</span>
        <ExplorerChevronIcon />
        <span className="Token__BreadcrumbsLink__3">{token.symbol}</span>
      </div>

      <div className="Token__Content">
        <div className="Token__Left">
          <div className="Token__ChartHead">
            <div className="Token__ChartHeadTop">
              <div className="Token__SectionHead">
                <div className="Token__SectionHeadTitle">
                  <div className="Token__SectionHeadTitleLeft">
                    {token.logoUri ? (
                      <img src={token.logoUri} alt={token.symbol} className="Token__Logo" />
                    ) : (
                      <div className="Token__Logo Token__Logo--placeholder">{token.symbol[0]}</div>
                    )}
                    {/* Full name */}
                    {token.name && (
                      <span className="Token__Name" title={token.name}>
                        {token.name.length > 10 ? token.name.slice(0, 14) + '…' : token.name}
                      </span>
                    )}
                    {/* Ticker */}
                    <span className="Token__Ticker">{token.symbol}</span>
                  </div>
                  {/* Right: 4 link icons */}
                  <div className="Token__SectionHeadTitleRight">
                    {/* Explorer */}
                    <a href={token.address ? `https://beratrail.io/address/${token.address}` : '#'} target="_blank" rel="noopener noreferrer" title="View on explorer" className="Token__IconLink">
                      <ExplorerIcon />
                    </a>
                    {/* Project website */}
                    <a href={token.website || '#'} target="_blank" rel="noopener noreferrer" title="Project website" className="Token__IconLink">
                      <WebsiteIcon />
                    </a>
                    {/* Project Twitter */}
                    <a href={token.twitter || '#'} target="_blank" rel="noopener noreferrer" title="Project Twitter" className="Token__IconLink">
                      <TwitterIcon />
                    </a>
                    {/* Share */}
                    <a href="#" onClick={e => { e.preventDefault(); navigator.clipboard.writeText(window.location.href); }} title="Share this page" aria-label="Share this page" className="Token__IconLink">
                      <ShareIcon />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart natif pool (future-proof, prêt à brancher backend) */}
          <div className="Token__Chart" style={{ minHeight: 340 }}>
            {lineLoading ? (
              <div style={{ padding: 32 }}>Loading chart…</div>
            ) : lineError ? (
              <div style={{ padding: 32, color: 'red' }}>Error loading chart</div>
            ) : chartData.length === 0 ? (
              <div style={{ width: '100%', height: 340, overflow: 'hidden', background: '#181A20' }}>
                <iframe
                  src="https://fr.tradingview.com/widgetembed/?symbol=BERAUSDC&interval=D&hidesidetoolbar=1&hidetoptoolbar=1&theme=dark&style=1&locale=en"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    boxShadow: 'none',
                    background: 'transparent'
                  }}
                  allowFullScreen
                  title="Default TradingView Chart"
                  scrolling="no"
                />
              </div>
            ) : (
              <LineChart data={chartData} height={340} priceFormatter={priceFormatter} />
            )}
          </div>

          {/* Interval tabs (modern switch) */}
          <div className="Token__ChartControls">
            <SwitchTabs
              intervals={INTERVALS}
              activeKey={activeChartTab}
              onChange={setActiveChartTab}
            />
          </div>

          <div className="Token__DetailSection">
            <h2 className="Token__DetailSectionTitle">Statistics</h2>
            <div className="Token__StatsCarousel">
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">TVL</h4>
                <p className="Token__StatCardLabel">
                  {poolsLoading ? 'Loading…' : (tvl === null || tvl === 0 || isNaN(tvl)) ? 'N/A' : formatNumber(tvl, { currency: true })}
                </p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">Market Cap</h4>
                <p className="Token__StatCardLabel">
                  {marketCap === null || isNaN(marketCap) ? 'N/A' : formatNumber(marketCap, { currency: true })}
                </p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">FDV</h4>
                <p className="Token__StatCardLabel">
                  {fdv === null || isNaN(fdv) ? 'N/A' : formatNumber(fdv, { currency: true })}
                </p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">1D Volume</h4>
                <p className="Token__StatCardLabel">
                  {volume1d === null || isNaN(volume1d) ? 'N/A' : formatNumber(volume1d, { currency: true })}
                </p>
              </div>
            </div>
          </div>

          {/* Transactions Table (filtrée sur le token courant) */}
          <div className="Token__Transactions">
            <TokenTransactionsTable tokenAddress={token.address} />
          </div>
        </div>

        <div className="Token__Right">
          <div className="Token__SwapForm">
            <SwapForm
              toggleSidebar={() => { }}
              initialFromToken={token}
            />
          </div>

          {/* Information Section */}
          <div data-testid="token-details-info-section" className="Token__InfoSection">
            <h3 className="Token__InfoSectionTitle">Information</h3>
            <div data-testid="token-details-info-links" className="Token__InfoLinks">
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={token.address ? `https://beratrail.io/address/${token.address}` : '#'}
                className="Token__InfoLink"
              >
                {/* Explorer Icon */}
                <ExplorerIcon />
                <span>Explorer</span>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={token.website || '#'}
                className="Token__InfoLink"
              >
                {/* Website Icon */}
                <WebsiteIcon />
                <span>Website</span>
              </a>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={token.twitter || '#'}
                className="Token__InfoLink"
              >
                {/* Twitter Icon */}
                <TwitterIcon />
              </a>
            </div>
            {/* Token description (Coingecko) */}
            <div className="Token__InfoDescription">
              {descLoading ? (
                <p>Loading description…</p>
              ) : coingeckoTokenData?.description ? (
                <p>{coingeckoTokenData.description}</p>
              ) : (
                <p>No description available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// New SwitchTabs component
function SwitchTabs({ intervals, activeKey, onChange }: { intervals: typeof INTERVALS, activeKey: IntervalKey, onChange: (k: IntervalKey) => void }) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const idx = intervals.findIndex(i => i.key === activeKey);
    const el = tabRefs.current[idx];
    if (el) {
      const parent = el.parentElement as HTMLElement;
      const parentRect = parent.getBoundingClientRect();
      const rect = el.getBoundingClientRect();
      setSliderStyle({ left: rect.left - parentRect.left, width: rect.width });
    }
  }, [activeKey, intervals]);

  // Recalculate on resize
  useEffect(() => {
    const handleResize = () => {
      const idx = intervals.findIndex(i => i.key === activeKey);
      const el = tabRefs.current[idx];
      if (el) {
        const parent = el.parentElement as HTMLElement;
        const parentRect = parent.getBoundingClientRect();
        const rect = el.getBoundingClientRect();
        setSliderStyle({ left: rect.left - parentRect.left, width: rect.width });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeKey, intervals]);

  return (
    <div className="Token__SwitchTabs">
      <div
        className="Token__SwitchSlider"
        style={{
          left: sliderStyle.left,
          width: sliderStyle.width,
        }}
      />
      {intervals.map((interval, idx) => (
        <button
          key={interval.key}
          className={`Token__SwitchTab${activeKey === interval.key ? ' active' : ''}`}
          onClick={() => onChange(interval.key as IntervalKey)}
          type="button"
          ref={el => { tabRefs.current[idx] = el; }}
          style={{ zIndex: 2 }}
        >
          {interval.label}
        </button>
      ))}
    </div>
  );
}

export default TokenPage;
