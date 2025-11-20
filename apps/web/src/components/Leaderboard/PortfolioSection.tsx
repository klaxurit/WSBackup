import React, { useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { formatNumber } from '../../utils/formatNumber';
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { Loader } from '../Loader/Loader';
import { Link, useNavigate } from 'react-router-dom';
import winnieIcon from '../../../public/favicon.ico';

const GET_USER_POSITIONS = `
  query GetUserPositions($owner: String!) {
    positions(where: { owner: $owner }) {
      items {
        id
        pool
        liquidity
        depositedToken0
        depositedToken1
        collectedFeesToken0
        collectedFeesToken1
        poolRef {
          id
          token0Ref {
            id
            symbol
            logoUri
            decimals
            tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
              items {
                priceUSD
              }
            }
          }
          token1Ref {
            id
            symbol
            logoUri
            decimals
            tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
              items {
                priceUSD
              }
            }
          }
          poolDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
            items {
              apr
            }
          }
        }
      }
    }
  }
`;

const GET_USER_VAULT_POSITIONS = `
  query GetUserVaultPositions($user: String!) {
    stickyVaults {
      items {
        id
        name
        totalValueLockedUSD
        totalSupply
        vaultDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
          items {
            maxPotentialAPR
          }
        }
        poolRef {
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
        positions(where: {user: $user}) {
          items {
            id
            shares
            currentValueUSD
            feesEarnedUSD
          }
        }
      }
    }
  }
`;

const GET_BOOSTED_OPPORTUNITIES = `
  query GetBoostedOpportunities {
    pools(orderBy: "totalValueLockedUSD", orderDirection: "desc", limit: 5) {
      items {
        id
        feeTier
        totalValueLockedUSD
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
          }
        }
      }
    }
    stickyVaults(orderBy: "totalValueLockedUSD", orderDirection: "desc", limit: 5) {
      items {
        id
        name
        autoWinVault
        totalValueLockedUSD
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

export const PortfolioSection: React.FC = () => {
  const { address, isConnected } = useAccount();

  const { data: poolPositions, isLoading: poolLoading } = useQuery({
    queryKey: ['portfolio-pools', address],
    queryFn: async () => {
      if (!address) return null;

      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_USER_POSITIONS,
          variables: { owner: address.toLowerCase() }
        }),
      });

      const data = await response.json();
      return data.data.positions.items;
    },
    enabled: !!address,
  });

  const { data: vaultPositions, isLoading: vaultLoading } = useQuery({
    queryKey: ['portfolio-vaults', address],
    queryFn: async () => {
      if (!address) return null;

      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_USER_VAULT_POSITIONS,
          variables: { user: address.toLowerCase() }
        }),
      });

      const data = await response.json();
      // Filter only vaults where the user has positions
      return data.data.stickyVaults.items.filter((vault: any) =>
        vault.positions.items.length > 0
      );
    },
    enabled: !!address,
  });

  const portfolioStats = useMemo(() => {
    let totalValueUSD = 0;
    let totalFeesEarned = 0;
    let activePositions = 0;
    let poolPositionsCount = 0;
    let vaultPositionsCount = 0;

    // Pool positions
    if (poolPositions) {
      poolPositions.forEach((pos: any) => {
        if (BigInt(pos.liquidity) > 0n) {
          activePositions++;
          poolPositionsCount++;

          // Calculer la valeur approximative
          const token0Price = parseFloat(pos.poolRef.token0Ref.tokenDayData?.items?.[0]?.priceUSD || '0');
          const token1Price = parseFloat(pos.poolRef.token1Ref.tokenDayData?.items?.[0]?.priceUSD || '0');

          const token0Value = parseFloat(pos.depositedToken0) * token0Price;
          const token1Value = parseFloat(pos.depositedToken1) * token1Price;

          totalValueUSD += token0Value + token1Value;

          // Fees collectés
          const fees0 = parseFloat(pos.collectedFeesToken0) * token0Price;
          const fees1 = parseFloat(pos.collectedFeesToken1) * token1Price;
          totalFeesEarned += fees0 + fees1;
        }
      });
    }

    // Vault positions
    if (vaultPositions) {
      vaultPositions.forEach((vault: any) => {
        vault.positions.items.forEach((pos: any) => {
          if (parseFloat(pos.shares) > 0) {
            activePositions++;
            vaultPositionsCount++;
            totalValueUSD += parseFloat(pos.currentValueUSD || '0');
            totalFeesEarned += parseFloat(pos.feesEarnedUSD || '0');
          }
        });
      });
    }

    return {
      totalValueUSD,
      totalFeesEarned,
      activePositions,
      poolPositionsCount,
      vaultPositionsCount
    };
  }, [poolPositions, vaultPositions]);

  if (!isConnected) {
    return (
      <div className="Leaderboard__Portfolio">
        <h2 className="Leaderboard__SectionTitle">Your Portfolio</h2>
        <div className="Leaderboard__EmptyState">
          <p>Connect your wallet to see your portfolio</p>
        </div>
      </div>
    );
  }

  if (poolLoading || vaultLoading) {
    return (
      <div className="Leaderboard__Portfolio">
        <h2 className="Leaderboard__SectionTitle">Your Portfolio</h2>
        <div className="Leaderboard__LoadingState">
          <Loader size="mobile" />
        </div>
      </div>
    );
  }

  const hasPositions = portfolioStats.activePositions > 0;

  return (
    <div className="Leaderboard__Portfolio">
      <h2 className="Leaderboard__SectionTitle">Your Portfolio</h2>

      {!hasPositions ? (
        <div className="Leaderboard__EmptyState">
          <p>You don't have any active positions yet</p>
          <Link to="/liquidity" className="btn btn--primary btn--small">
            Create a position
          </Link>
        </div>
      ) : (
        <div className="Leaderboard__PortfolioRow">
          <div className="Leaderboard__BoostedCard Leaderboard__StatCard">
            <div className="Leaderboard__StatCardContent">
              <span className="Leaderboard__StatCardTitle">Total Value</span>
              <span className="Leaderboard__StatCardValue">
                ${formatNumber(portfolioStats.totalValueUSD)}
              </span>
            </div>
          </div>
          <div className="Leaderboard__BoostedCard Leaderboard__StatCard">
            <div className="Leaderboard__StatCardContent">
              <span className="Leaderboard__StatCardTitle">Positions</span>
              <span className="Leaderboard__StatCardValue Leaderboard__StatCardValue--xlarge">
                {portfolioStats.activePositions}
              </span>
            </div>
          </div>
          <div className="Leaderboard__BoostedCard Leaderboard__StatCard">
            <div className="Leaderboard__StatCardContent">
              <span className="Leaderboard__StatCardTitle">Fees Earned</span>
              <span className="Leaderboard__StatCardValue Leaderboard__StatCardValue--highlight">
                ${formatNumber(portfolioStats.totalFeesEarned)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Nouveau composant TopBoostedSection séparé
export const TopBoostedSection: React.FC = () => {
  const navigate = useNavigate();

  const { data: boostedData } = useQuery({
    queryKey: ['boosted-opportunities'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_BOOSTED_OPPORTUNITIES }),
      });

      const result = await response.json();
      return result.data;
    },
  });

  // Combiner pools et vaults et trier par APR pour Top Boosted
  const topBoosted = useMemo(() => {
    if (!boostedData) return [];

    const opportunities: any[] = [];

    // Ajouter les pools
    if (boostedData.pools?.items) {
      boostedData.pools.items.forEach((pool: any) => {
        if (pool.poolDayData?.items?.[0]?.apr) {
          opportunities.push({
            type: 'pool',
            id: pool.id,
            apr: parseFloat(pool.poolDayData.items[0].apr),
            boost: Math.min(parseFloat(pool.poolDayData.items[0].apr) * 1.5, 100),
            tvl: parseFloat(pool.totalValueLockedUSD),
            token0: pool.token0Ref,
            token1: pool.token1Ref,
            feeTier: pool.feeTier,
          });
        }
      });
    }

    // Ajouter les vaults
    if (boostedData.stickyVaults?.items) {
      boostedData.stickyVaults.items.forEach((vault: any) => {
        if (vault.vaultDayData?.items?.[0]?.maxPotentialAPR) {
          opportunities.push({
            type: 'vault',
            id: vault.id,
            apr: parseFloat(vault.vaultDayData.items[0].maxPotentialAPR),
            boost: Math.min(parseFloat(vault.vaultDayData.items[0].maxPotentialAPR) * 1.2, 80),
            tvl: parseFloat(vault.totalValueLockedUSD),
            token0: vault.poolRef.token0Ref,
            token1: vault.poolRef.token1Ref,
            feeTier: vault.poolRef.feeTier,
            autoWin: vault.autoWinVault,
          });
        }
      });
    }

    // Trier par boost décroissant et prendre les 2 premiers
    return opportunities
      .sort((a, b) => b.boost - a.boost)
      .slice(0, 2);
  }, [boostedData]);

  return (
    <div className="Leaderboard__TopBoosted">
      <h2 className="Leaderboard__SectionTitle">Top Boosted</h2>

      <div className="Leaderboard__TopBoostedGrid">
        {topBoosted.map((item: any) => (
          <div
            key={item.id}
            className="Leaderboard__BoostedCard"
            onClick={() => navigate(item.type === 'pool' ? `/pool/${item.id}` : `/vault/${item.id}`)}
          >
            <div className="Leaderboard__BoostedCardHeader">
              <TokenPairLogos
                token0={{
                  id: item.token0.id,
                  address: item.token0.id,
                  symbol: item.token0.symbol,
                  logoUri: item.token0.logoUri
                }}
                token1={{
                  id: item.token1.id,
                  address: item.token1.id,
                  symbol: item.token1.symbol,
                  logoUri: item.token1.logoUri
                }}
                size={32}
                gap={2}
                borderWidth={2}
              />
              <div className="Leaderboard__BoostedCardInfo">
                <span className="Leaderboard__BoostedCardPair">
                  {item.token0.symbol}/{item.token1.symbol}
                </span>
                <span className="Leaderboard__BoostedCardType">
                  {item.type === 'vault'
                    ? (item.autoWin ? 'Auto-Win' : 'Sticky')
                    : `${(item.feeTier / 10000).toFixed(2)}% Pool`
                  }
                </span>
              </div>
            </div>
            <div className="Leaderboard__BoostedCardAPR">
              <div className="Leaderboard__BoostedCardStat">
                <span className="Leaderboard__PositionCardStatLabel">APR</span>
                <span className="Leaderboard__BoostedCardAPRValue">
                  {item.apr.toFixed(1)}%
                </span>
              </div>
              <div className="Leaderboard__BoostedCardStat">
                <span className="Leaderboard__PositionCardStatLabel">Boost</span>
                <div className="Leaderboard__BoostedCardBoost">
                  <span>+ {item.boost.toFixed(0)}%</span>
                  <img src={winnieIcon} alt="Winnie" className="Leaderboard__WinnieIcon" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
