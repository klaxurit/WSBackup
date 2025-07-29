import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SwapForm from '../../components/SwapForm/SwapForm';
import { ExplorerChevronIcon, ExplorerIcon, WebsiteIcon, TwitterIcon, ShareIcon } from '../../components/SVGs';
import { useCoingeckoTokenData } from '../../hooks/useCoingeckoData';
import { formatNumber } from '../../utils/formatNumber';
import { TokenTransactionsTable } from '../../components/Table/TokenTransactionsTable';
import LineChart from '../../components/Charts/LineChart';

const TokenPage: React.FC = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
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
  const { data: coingeckoTokenData } = useCoingeckoTokenData(token?.coingeckoId);

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
  const fdv = stat?.fdv || 0

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

  return (
    <div className="Token">
      <div className="Token__Breadcrumbs">
        <Link to="/explore" className="Token__BreadcrumbsLink">Explore</Link>
        <ExplorerChevronIcon />
        <Link to="/explore?tab=tokens" className="Token__BreadcrumbsLink">Tokens</Link>
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
                    <a href={token.address ? `https://berascan.com/address/${token.address}` : '#'} target="_blank" rel="noopener noreferrer" title="View on explorer" className="Token__IconLink">
                      <ExplorerIcon />
                    </a>
                    {/* Project website */}
                    {token.website && (
                      <a href={token.website} target="_blank" rel="noopener noreferrer" title="Project website" className="Token__IconLink">
                        <WebsiteIcon />
                      </a>
                    )}
                    {/* Project Twitter */}
                    {token.twitter && (
                      <a href={`https://x.com/${token.twitter}`} target="_blank" rel="noopener noreferrer" title="Project Twitter" className="Token__IconLink">
                        <TwitterIcon />
                      </a>
                    )}
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
            ) : (
              <LineChart
                data={chartData.length === 0 ? [] : chartData}
                height={340}
                priceFormatter={priceFormatter}
                showNoDataOverlay={chartData.length === 0}
                noDataMessage="These chart numbers aren't real—just a placeholder flex for now. No on‑chain juice yet… stay locked in, we're gonna pump in live data soon."
              />
            )}
          </div>

          <div className="Token__DetailSection">
            <h2 className="Token__DetailSectionTitle">Statistics</h2>
            <div className="Token__StatsCarousel">
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">TVL</h4>
                <p className="Token__StatCardLabel">
                  {poolsLoading ? 'Loading…' : (tvl === null || tvl === 0 || isNaN(tvl)) ? 'N/A' : formatNumber(tvl)}
                </p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">Market Cap</h4>
                <p className="Token__StatCardLabel">
                  {marketCap === null || isNaN(marketCap) ? 'N/A' : formatNumber(marketCap)}
                </p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">FDV</h4>
                <p className="Token__StatCardLabel">
                  {fdv === null || isNaN(fdv) ? 'N/A' : formatNumber(fdv)}
                </p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">1D Volume</h4>
                <p className="Token__StatCardLabel">
                  {volume1d === null || isNaN(volume1d) ? 'N/A' : formatNumber(volume1d)}
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
                href={token.address ? `https://berascan.com/address/${token.address}` : '#'}
                className="Token__InfoLink"
              >
                {/* Explorer Icon */}
                <ExplorerIcon />
                <span>Explorer</span>
              </a>
              {token.website && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={token.website}
                  className="Token__InfoLink"
                >
                  {/* Website Icon */}
                  <WebsiteIcon />
                  <span>Website</span>
                </a>
              )}
              {token.twitter && (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://x.com/${token.twitter}`}
                  className="Token__InfoLink"
                >
                  {/* Twitter Icon */}
                  <TwitterIcon />
                </a>
              )}
            </div>
            {/* Token description (Coingecko) */}
            {token.description && (
              <div className="Token__InfoDescription">
                <p>{token.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPage;
