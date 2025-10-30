import React, { useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SwapForm from '../../components/SwapForm/SwapForm';
import { ExplorerChevronIcon, ExplorerIcon, WebsiteIcon, TwitterIcon, ShareIcon } from '../../components/SVGs';
import { useCoingeckoTokenData } from '../../hooks/useCoingeckoData';
import { formatNumber } from '../../utils/formatNumber';
import { TokenTransactionsTable } from '../../components/Table/TokenTransactionsTable';
import { ChartWidget } from '../../components/Charts/ChartWidget';
import type { ChartType, ChartInterval, ChartMetric } from '../../types/chart';
import { PageContentTransition } from '../../components/Transitions';
import { Loader } from '../../components/Loader/Loader';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';

const TokenPage: React.FC = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const navigate = useNavigate();

  const [chartType, setChartType] = React.useState<ChartType>('area');
  const [interval, setInterval] = React.useState<ChartInterval>('1D');
  const [metric, setMetric] = React.useState<ChartMetric>('price');

  // Refs pour les carousels de drag
  const poolsCarouselRef = useRef<HTMLDivElement>(null);
  const vaultsCarouselRef = useRef<HTMLDivElement>(null);

  const { data: tokens, isLoading: tokensLoading } = useQuery({
    queryKey: ['tokensStats'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/token/list`);
      if (!resp.ok) return [];
      return resp.json();
    },
  });

  const { data: pools, isLoading: poolsLoading } = useQuery({
    queryKey: ['pools-for-token', tokenAddress],
    enabled: !!tokenAddress,
    queryFn: async () => {
      if (!tokenAddress) return { data: [] };

      const tokenAddressLower = tokenAddress.toLowerCase();

      const query = `
        query GetPoolsForToken {
          pools(
            where: {
              OR: [
                { token0: "${tokenAddressLower}" }
                { token1: "${tokenAddressLower}" }
              ]
            }
            orderBy: "totalValueLockedUSD"
            orderDirection: "desc"
            limit: 5
          ) {
            items {
              id
              token0
              token1
              totalValueLockedUSD
              volumeUSD
              feeTier
              token0Ref {
                id
                symbol
                name
                decimals
                logoUri
              }
              token1Ref {
                id
                symbol
                name
                decimals
                logoUri
              }
              poolDayData(
                orderBy: "date"
                orderDirection: "desc"
                limit: 1
              ) {
                items {
                  date
                  volumeUSD
                  volumeUSD1D
                  tvlUSD
                  apr
                }
              }
            }
          }
        }
      `;

      try {
        // Utiliser VITE_GRAPHQL_URL comme les autres composants
        const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          return { data: [] };
        }

        const result = await response.json();

        if (result.errors) {
          return { data: [] };
        }

        const poolsData = result.data?.pools?.items || [];
        return { data: poolsData };
      } catch (error) {
        return { data: [] };
      }
    },
  });

  const { data: vaults } = useQuery({
    queryKey: ['vaults-for-token', tokenAddress],
    enabled: !!tokenAddress,
    queryFn: async () => {
      if (!tokenAddress) return { data: [] };

      const tokenAddressLower = tokenAddress.toLowerCase();

      const query = `
        query GetVaultsForToken {
          stickyVaults(
            where: {
              OR: [
                { poolRef: { token0: "${tokenAddressLower}" } }
                { poolRef: { token1: "${tokenAddressLower}" } }
              ]
            }
            orderBy: "totalValueLockedUSD"
            orderDirection: "desc"
            limit: 5
          ) {
            items {
              id
              name
              totalValueLockedUSD
              autoWinVault
              vaultDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
                items {
                  maxPotentialAPR
                }
              }
              poolRef {
                feeTier
                token0Ref {
                  id
                  symbol
                  logoUri
                }
                token1Ref {
                  id
                  symbol
                  logoUri
                }
              }
            }
          }
        }
      `;

      try {
        const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          return { data: [] };
        }

        const result = await response.json();

        if (result.errors) {
          return { data: [] };
        }

        const vaultsData = result.data?.stickyVaults?.items || [];
        return { data: vaultsData };
      } catch (error) {
        return { data: [] };
      }
    },
  });

  const token = useMemo(() => {
    if (!tokens || !tokenAddress) return null;
    return tokens.find((t: any) => t.address?.toLowerCase() === tokenAddress.toLowerCase());
  }, [tokens, tokenAddress]);
  const { data: coingeckoTokenData } = useCoingeckoTokenData(token?.coingeckoId);

  // Hook pour activer le drag-to-scroll sur les carousels
  useEffect(() => {
    const setupDragScroll = (element: HTMLDivElement) => {
      let isDown = false;
      let startX: number;
      let scrollLeft: number;
      let hasDragged = false;

      const handleMouseDown = (e: MouseEvent) => {
        isDown = true;
        hasDragged = false;
        element.style.cursor = 'grabbing';
        startX = e.pageX - element.offsetLeft;
        scrollLeft = element.scrollLeft;
      };

      const handleMouseLeave = () => {
        isDown = false;
        element.style.cursor = 'grab';
      };

      const handleMouseUp = () => {
        isDown = false;
        element.style.cursor = 'grab';
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - element.offsetLeft;
        const walk = (x - startX) * 2;
        if (Math.abs(walk) > 5) hasDragged = true;
        element.scrollLeft = scrollLeft - walk;
      };

      const handleClick = (e: MouseEvent) => {
        if (hasDragged) {
          e.preventDefault();
          e.stopPropagation();
        }
      };

      element.addEventListener('mousedown', handleMouseDown);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.addEventListener('mouseup', handleMouseUp);
      element.addEventListener('mousemove', handleMouseMove);
      element.addEventListener('click', handleClick, true);

      return () => {
        element.removeEventListener('mousedown', handleMouseDown);
        element.removeEventListener('mouseleave', handleMouseLeave);
        element.removeEventListener('mouseup', handleMouseUp);
        element.removeEventListener('mousemove', handleMouseMove);
        element.removeEventListener('click', handleClick, true);
      };
    };

    const cleanups: (() => void)[] = [];

    if (poolsCarouselRef.current) {
      cleanups.push(setupDragScroll(poolsCarouselRef.current));
    }

    if (vaultsCarouselRef.current) {
      cleanups.push(setupDragScroll(vaultsCarouselRef.current));
    }

    return () => {
      cleanups.forEach(cleanup => cleanup());
    };
  }, [pools?.data, vaults?.data]);


  const tvl = useMemo(() => {
    if (!pools || !token || !pools.data || !Array.isArray(pools.data)) return null;

    let total = 0;

    // Les pools sont déjà filtrées par GraphQL
    for (const pool of pools.data) {
      if (!pool || typeof pool !== 'object') continue;

      if (pool.totalValueLockedUSD) {
        const tvlValue = typeof pool.totalValueLockedUSD === 'string'
          ? parseFloat(pool.totalValueLockedUSD)
          : Number(pool.totalValueLockedUSD);

        if (!isNaN(tvlValue) && tvlValue > 0) {
          total += tvlValue;
        }
      }
    }

    if (total === 0 && coingeckoTokenData?.market_data?.total_value_locked_usd) {
      return coingeckoTokenData.market_data.total_value_locked_usd;
    }

    return total;
  }, [pools, token, coingeckoTokenData]);

  const stat = token?.TokenDailyStats?.[0];

  const marketCap = useMemo(() => {

    if (stat?.marketCap && stat.marketCap > 0) return stat.marketCap;

    if (coingeckoTokenData?.market_data?.market_cap?.usd && coingeckoTokenData.market_data.market_cap.usd > 0)
      return coingeckoTokenData.market_data.market_cap.usd;
    return null;
  }, [stat, coingeckoTokenData]);


  const volume24h = useMemo(() => {
    if (!pools || !token || !pools.data || !Array.isArray(pools.data)) {
      if (stat?.volumeUSD24h && stat.volumeUSD24h > 0) return stat.volumeUSD24h;
      if (coingeckoTokenData?.market_data?.total_volume?.usd) {
        return coingeckoTokenData.market_data.total_volume.usd;
      }
      return 0;
    }

    let total = 0;

    for (const pool of pools.data) {
      if (!pool || typeof pool !== 'object') continue;
      const dayData = pool.poolDayData?.items?.[0];

      if (dayData?.volumeUSD1D) {
        const volumeValue = typeof dayData.volumeUSD1D === 'string'
          ? parseFloat(dayData.volumeUSD1D)
          : Number(dayData.volumeUSD1D);

        if (!isNaN(volumeValue) && volumeValue > 0) {
          total += volumeValue;
        }
      }
    }

    if (total === 0 && stat?.volumeUSD24h && stat.volumeUSD24h > 0) {
      return stat.volumeUSD24h;
    }

    if (total === 0 && coingeckoTokenData?.market_data?.total_volume?.usd) {
      return coingeckoTokenData.market_data.total_volume.usd;
    }

    return total;
  }, [pools, token, stat, coingeckoTokenData]);

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

  if (tokensLoading) {
    return (
      <div className="Token__Wrapper">
        <Loader size="mobile" />
      </div>
    );
  }
  if (!token) {
    return (
      <div className="Token__Wrapper">
        <div className="Token__Error">
          <h2>Token not found</h2>
          <p>The requested token does not exist or has been removed.</p>
          <Link to="/explore?tab=tokens" className="button button--primary">
            Back to tokens
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PageContentTransition className="Token">
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

          {/* Chart natif token */}
          <div className="Token__Chart" style={{ minHeight: 340 }}>
            <ChartWidget
              tokenAddress={tokenAddress}
              chartType={chartType}
              interval={interval}
              metric={metric}
              height={340}
              showToolbar={true}
              priceFormatter={priceFormatter}
              onChartTypeChange={handleChartTypeChange}
              onIntervalChange={handleIntervalChange}
              onMetricChange={handleMetricChange}
              dataType="token"
            />
          </div>

          <div className="Token__DetailSection">
            <h2 className="Token__DetailSectionTitle">Statistics</h2>
            <div className="Token__StatsCarousel">
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">TVL</h4>
                <p className="Token__StatCardLabel">
                  {poolsLoading ? 'Loading…' : (tvl === null || tvl === 0 || isNaN(tvl)) ? 'N/A' : `$${formatNumber(tvl)}`}
                </p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">Market Cap</h4>
                <p className="Token__StatCardLabel">
                  ${marketCap === null || isNaN(marketCap) ? 'N/A' : formatNumber(marketCap)}
                </p>
              </div>
              <div className="Token__StatCard">
                <h4 className="Token__StatCardTitle">24h Volume</h4>
                <p className="Token__StatCardLabel">
                  ${poolsLoading ? 'Loading…' : (volume24h === null || isNaN(volume24h)) ? 'N/A' : formatNumber(volume24h)}
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

          {/* Quick Access Section - Pools & Vaults */}
          {((pools?.data && pools.data.length > 0) || (vaults?.data && vaults.data.length > 0)) && (
            <div className="Token__QuickAccess">
              <h3 className="Token__QuickAccessTitle">Quick Access</h3>

              {/* Pools Section */}
              {pools?.data && pools.data.length > 0 && (
                <div className="Token__QuickAccessSection">
                  {/* <h4 className="Token__QuickAccessSubtitle">Top Pools</h4> */}
                  <div className="Token__QuickAccessList" ref={poolsCarouselRef}>
                    {pools.data.slice(0, 5).map((pool: any) => (
                      <div
                        key={pool.id}
                        className="Token__QuickAccessCard Token__QuickAccessCard--pool"
                        onClick={() => navigate(`/pool/${pool.id}`)}
                      >
                        <div className="Token__QuickAccessCardHeader">
                          <TokenPairLogos
                            token0={{
                              id: pool.token0Ref.id,
                              address: pool.token0Ref.id,
                              symbol: pool.token0Ref.symbol,
                              logoUri: pool.token0Ref.logoUri
                            }}
                            token1={{
                              id: pool.token1Ref.id,
                              address: pool.token1Ref.id,
                              symbol: pool.token1Ref.symbol,
                              logoUri: pool.token1Ref.logoUri
                            }}
                            size={24}
                            gap={2}
                            borderWidth={2}
                            separatorWidth={1}
                          />
                          <div className="Token__QuickAccessCardInfo">
                            <span className="Token__QuickAccessCardPair">
                              {pool.token0Ref.symbol}/{pool.token1Ref.symbol}
                            </span>
                            <span className="Token__QuickAccessCardFee">
                              {(pool.feeTier / 10000).toFixed(2)}% fee
                            </span>
                          </div>
                        </div>
                        <div className="Token__QuickAccessCardStats">
                          <div className="Token__QuickAccessCardStat">
                            <span className="Token__QuickAccessCardStatLabel">TVL</span>
                            <span className="Token__QuickAccessCardStatValue">
                              ${formatNumber(pool.totalValueLockedUSD)}
                            </span>
                          </div>
                          {pool.poolDayData?.items?.[0]?.apr && (
                            <div className="Token__QuickAccessCardStat">
                              <span className="Token__QuickAccessCardStatLabel">APR</span>
                              <span className="Token__QuickAccessCardStatValue Token__QuickAccessCardStatValue--highlight">
                                {pool.poolDayData.items[0].apr}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vaults Section */}
              {vaults?.data && vaults.data.length > 0 && (
                <div className="Token__QuickAccessSection">
                  <h4 className="Token__QuickAccessSubtitle">Top Vaults</h4>
                  <div className="Token__QuickAccessList" ref={vaultsCarouselRef}>
                    {vaults.data.slice(0, 5).map((vault: any) => (
                      <div
                        key={vault.id}
                        className="Token__QuickAccessCard Token__QuickAccessCard--vault"
                        onClick={() => navigate(`/vault/${vault.id}`)}
                      >
                        <div className="Token__QuickAccessCardHeader">
                          <TokenPairLogos
                            token0={{
                              id: vault.poolRef.token0Ref.id,
                              address: vault.poolRef.token0Ref.id,
                              symbol: vault.poolRef.token0Ref.symbol,
                              logoUri: vault.poolRef.token0Ref.logoUri
                            }}
                            token1={{
                              id: vault.poolRef.token1Ref.id,
                              address: vault.poolRef.token1Ref.id,
                              symbol: vault.poolRef.token1Ref.symbol,
                              logoUri: vault.poolRef.token1Ref.logoUri
                            }}
                            size={24}
                            gap={2}
                            borderWidth={2}
                            separatorWidth={1}
                          />
                          <div className="Token__QuickAccessCardInfo">
                            <span className="Token__QuickAccessCardPair">
                              {vault.poolRef.token0Ref.symbol}/{vault.poolRef.token1Ref.symbol}
                            </span>
                            <span className="Token__QuickAccessCardFee">
                              {vault.autoWinVault ? 'Auto-Win' : 'Sticky'} • {(vault.poolRef.feeTier / 10000).toFixed(2)}%
                            </span>
                          </div>
                        </div>
                        <div className="Token__QuickAccessCardStats">
                          <div className="Token__QuickAccessCardStat">
                            <span className="Token__QuickAccessCardStatLabel">TVL</span>
                            <span className="Token__QuickAccessCardStatValue">
                              ${formatNumber(vault.totalValueLockedUSD)}
                            </span>
                          </div>
                          {vault.vaultDayData?.items?.[0]?.maxPotentialAPR && (
                            <div className="Token__QuickAccessCardStat">
                              <span className="Token__QuickAccessCardStatLabel">APR</span>
                              <span className="Token__QuickAccessCardStatValue Token__QuickAccessCardStatValue--highlight">
                                {vault.vaultDayData.items[0].maxPotentialAPR}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
    </PageContentTransition>
  );
};

export default TokenPage;