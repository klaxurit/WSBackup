import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../../utils/formatNumber';
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { Loader } from '../Loader/Loader';

const GET_TRENDING_POOLS = `
  query GetTrendingPools {
    pools(orderBy: "totalValueLockedUSD", orderDirection: "desc", limit: 10) {
      items {
        id
        token0
        token1
        feeTier
        totalValueLockedUSD
        volumeUSD
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
        poolDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
          items {
            apr
            volumeUSD1D
          }
        }
      }
    }
  }
`;

const GET_TRENDING_VAULTS = `
  query GetTrendingVaults {
    stickyVaults(orderBy: "totalValueLockedUSD", orderDirection: "desc", limit: 10) {
      items {
        id
        name
        totalValueLockedUSD
        autoWinVault
        vaultDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
          items {
            maxPotentialAPR
            volumeUSD1D
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

export const TrendingSection: React.FC = () => {
  const navigate = useNavigate();

  const { data: poolsData, isLoading: poolsLoading } = useQuery({
    queryKey: ['trending-pools'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_TRENDING_POOLS }),
      });

      const data = await response.json();
      return data.data.pools.items;
    },
  });

  const { data: vaultsData, isLoading: vaultsLoading } = useQuery({
    queryKey: ['trending-vaults'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_TRENDING_VAULTS }),
      });

      const data = await response.json();
      return data.data.stickyVaults.items;
    },
  });

  // Extract top 3 pools by APR
  const topPools = useMemo(() => {
    if (!poolsData) return [];
    return [...poolsData]
      .filter(pool => pool.poolDayData?.items?.[0]?.apr)
      .sort((a, b) => {
        const aprA = parseFloat(a.poolDayData.items[0].apr);
        const aprB = parseFloat(b.poolDayData.items[0].apr);
        return aprB - aprA;
      })
      .slice(0, 3);
  }, [poolsData]);

  // Extract top 3 vaults by APR
  const topVaults = useMemo(() => {
    if (!vaultsData) return [];
    return [...vaultsData]
      .filter(vault => vault.vaultDayData?.items?.[0]?.maxPotentialAPR)
      .sort((a, b) => {
        const aprA = parseFloat(a.vaultDayData.items[0].maxPotentialAPR);
        const aprB = parseFloat(b.vaultDayData.items[0].maxPotentialAPR);
        return aprB - aprA;
      })
      .slice(0, 3);
  }, [vaultsData]);

  if (poolsLoading || vaultsLoading) {
    return (
      <div className="Leaderboard__Trending">
        <h2 className="Leaderboard__SectionTitle">Trending</h2>
        <div className="Leaderboard__LoadingState">
          <Loader size="mobile" />
        </div>
      </div>
    );
  }

  return (
    <div className="Leaderboard__Trending">
      <h2 className="Leaderboard__SectionTitle">Top Pools/Vaults by APR</h2>

      <div className="Leaderboard__TrendingGrid">
        {/* Top Pools */}
        <div className="Leaderboard__TrendingColumn">
          {topPools.length > 0 && (
            <div className="Leaderboard__TrendingCards">
              {topPools.map((pool: any, index: number) => (
                <div
                  key={pool.id}
                  className={`Leaderboard__TrendingCard Leaderboard__TrendingCard--rank${index + 1}`}
                  onClick={() => navigate(`/pool/${pool.id}`)}
                >
                  <div className="Leaderboard__TrendingCardHeader">
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
                      size={32}
                      gap={2}
                      borderWidth={2}
                    />
                    <div className="Leaderboard__TrendingCardInfo">
                      <span className="Leaderboard__TrendingCardPair">
                        {pool.token0Ref.symbol}/{pool.token1Ref.symbol}
                      </span>
                      <span className="Leaderboard__TrendingCardFee">
                        {(pool.feeTier / 10000).toFixed(2)}% fee
                      </span>
                    </div>
                  </div>
                  <div className="Leaderboard__TrendingCardAPR">
                    <div className="Leaderboard__TrendingCardStat">
                      {index === 0 ? (
                        <span className="Leaderboard__BestAPRBadge">BEST APR</span>
                      ) : (
                        <span className="Leaderboard__TrendingCardStatLabel">APR</span>
                      )}
                      <span className="Leaderboard__TrendingCardAPRValue Leaderboard__TrendingCardAPRValue--highlight">
                        {pool.poolDayData.items[0].apr}%
                      </span>
                    </div>
                    <div className="Leaderboard__TrendingCardStat">
                      <span className="Leaderboard__TrendingCardStatLabel">TVL</span>
                      <span className="Leaderboard__TrendingCardStatValue">
                        ${formatNumber(parseFloat(pool.totalValueLockedUSD))}
                      </span>
                    </div>
                    <div className="Leaderboard__TrendingCardStat">
                      <span className="Leaderboard__TrendingCardStatLabel">24h Vol</span>
                      <span className="Leaderboard__TrendingCardStatValue">
                        ${formatNumber(parseFloat(pool.poolDayData.items[0].volumeUSD1D))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Vaults */}
        <div className="Leaderboard__TrendingColumn">
          {topVaults.length > 0 && (
            <div className="Leaderboard__TrendingCards">
              {topVaults.map((vault: any, index: number) => (
                <div
                  key={vault.id}
                  className={`Leaderboard__TrendingCard Leaderboard__TrendingCard--rank${index + 1}`}
                  onClick={() => navigate(`/vault/${vault.id}`)}
                >
                  <div className="Leaderboard__TrendingCardHeader">
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
                      size={32}
                      gap={2}
                      borderWidth={2}
                    />
                    <div className="Leaderboard__TrendingCardInfo">
                      <span className="Leaderboard__TrendingCardPair">
                        {vault.poolRef.token0Ref.symbol}/{vault.poolRef.token1Ref.symbol}
                      </span>
                      <span className="Leaderboard__TrendingCardFee">
                        {vault.autoWinVault ? 'Auto-Win' : 'Sticky'} • {(vault.poolRef.feeTier / 10000).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="Leaderboard__TrendingCardAPR">
                    <div className="Leaderboard__TrendingCardStat">
                      {index === 0 ? (
                        <span className="Leaderboard__BestAPRBadge">BEST APR</span>
                      ) : (
                        <span className="Leaderboard__TrendingCardStatLabel">Max APR</span>
                      )}
                      <span className="Leaderboard__TrendingCardAPRValue Leaderboard__TrendingCardAPRValue--highlight">
                        {vault.vaultDayData.items[0].maxPotentialAPR}%
                      </span>
                    </div>
                    <div className="Leaderboard__TrendingCardStat">
                      <span className="Leaderboard__TrendingCardStatLabel">TVL</span>
                      <span className="Leaderboard__TrendingCardStatValue">
                        ${formatNumber(parseFloat(vault.totalValueLockedUSD))}
                      </span>
                    </div>
                    <div className="Leaderboard__TrendingCardStat">
                      <span className="Leaderboard__TrendingCardStatLabel">24h Vol</span>
                      <span className="Leaderboard__TrendingCardStatValue">
                        {vault.vaultDayData.items[0].volumeUSD1D
                          ? `$${formatNumber(parseFloat(vault.vaultDayData.items[0].volumeUSD1D))}`
                          : '-'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
