import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../../utils/formatNumber';
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { Loader } from '../Loader/Loader';

const GET_TOP_VAULTS = `
  query GetTopVaults {
    stickyVaults(orderBy: "totalValueLockedUSD", orderDirection: "desc", limit: 50) {
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

interface Vault {
  id: string;
  name: string;
  totalValueLockedUSD: string;
  autoWinVault: boolean;
  vaultDayData?: {
    items?: Array<{
      maxPotentialAPR: string;
    }>;
  };
  poolRef: {
    feeTier: string;
    token0Ref: {
      id: string;
      symbol: string;
      logoUri: string;
    };
    token1Ref: {
      id: string;
      symbol: string;
      logoUri: string;
    };
  };
}

export const VaultsMarquee: React.FC = () => {
  const navigate = useNavigate();

  const { data: vaultsData, isLoading } = useQuery({
    queryKey: ['top-vaults-marquee'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: GET_TOP_VAULTS }),
      });

      const data = await response.json();
      return data.data?.stickyVaults?.items || [];
    },
  });

  // Dupliquer les vaults pour créer un défilement continu
  const duplicatedVaults = useMemo(() => {
    if (!vaultsData || vaultsData.length === 0) return [];
    // Dupliquer 3 fois pour un défilement fluide
    return [...vaultsData, ...vaultsData, ...vaultsData];
  }, [vaultsData]);

  if (isLoading) {
    return (
      <div className="Leaderboard__VaultsMarquee">
        <div className="Leaderboard__VaultsMarqueeLoading">
          <Loader size="mobile" />
        </div>
      </div>
    );
  }

  if (!vaultsData || vaultsData.length === 0) {
    return null;
  }

  return (
    <div className="Leaderboard__VaultsMarquee">
      <div className="Leaderboard__VaultsMarqueeTrack">
        {duplicatedVaults.map((vault: Vault, index: number) => {
          const tvl = parseFloat(vault.totalValueLockedUSD || '0');
          const apr = parseFloat(vault.vaultDayData?.items?.[0]?.maxPotentialAPR || '0');

          return (
            <div
              key={`${vault.id}-${index}`}
              className="Leaderboard__VaultsMarqueeItem"
              onClick={() => navigate(`/vault/${vault.id}`)}
            >
              <div className="Leaderboard__VaultsMarqueeItemHeader">
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
                <div className="Leaderboard__VaultsMarqueeItemInfo">
                  <span className="Leaderboard__VaultsMarqueeItemPair">
                    {vault.poolRef.token0Ref.symbol}/{vault.poolRef.token1Ref.symbol}
                  </span>
                  <span className="Leaderboard__VaultsMarqueeItemType">
                    {vault.autoWinVault ? 'Auto-Win' : 'Sticky'}
                  </span>
                </div>
              </div>
              <div className="Leaderboard__VaultsMarqueeItemStats">
                <div className="Leaderboard__VaultsMarqueeItemStat">
                  <span className="Leaderboard__VaultsMarqueeItemStatLabel">TVL</span>
                  <span className="Leaderboard__VaultsMarqueeItemStatValue">
                    ${formatNumber(tvl)}
                  </span>
                </div>
                {apr > 0 && (
                  <div className="Leaderboard__VaultsMarqueeItemStat">
                    <span className="Leaderboard__VaultsMarqueeItemStatLabel">APR</span>
                    <span className="Leaderboard__VaultsMarqueeItemStatValue Leaderboard__VaultsMarqueeItemStatValue--highlight">
                      {apr.toFixed(2)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

