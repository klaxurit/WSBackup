import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import { ExplorerIcon } from '../../components/SVGs';
import { formatNumber } from '../../utils/formatNumber';
import { ChartWidget } from '../../components/Charts/ChartWidget';
import { useQuery } from '@tanstack/react-query';
import { type Address } from 'viem';
import { useAccount } from 'wagmi';
import { PageContentTransition } from '../../components/Transitions';
import { Loader } from '../../components/Loader/Loader';
import { UserVaultDetail } from '../../components/Vault/UserVaultDetail';

const GET_STICKYVAULT = `
  query GetStickyVaults($id: String = "", $user: String = "") {
    stickyVault(id: $id) {
      name
      collectedFeesToken0
      collectedFeesToken1
      collectedFeesUSD
      createdAtBlockNumber
      createdAtTimestamp
      currentTick
      id
      liquidity
      manager
      rebalanceCount
      tickLower
      tickUpper
      totalValueLockedBERA
      totalValueLockedToken0
      totalValueLockedToken1
      totalValueLockedUSD
      txCount
      autoWinVault
      autoWinVaultRef {
        id
        totalBgtClaimed
        estimatedAPR
        positions(where: {user: $user}) {
          items {
            user
            shares
            firstDepositAt
            lastUpdateAt
          }
        }
      }
      vaultDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
        items {
          apr
          maxPotentialAPR
          collectedFeesToken0
          collectedFeesToken1
          collectedFeesUSD
          date
          id
          volumeUSD1D
          volumeUSD30D
          rebalanceCount
          totalSupply
          totalValueLockedToken0
          totalValueLockedToken1
          totalValueLockedUSD
          txCount
        }
      }
      positions(where: {user: $user}) {
        items {
          currentValueToken0
          currentValueToken1
          depositedToken0
          depositedToken1
          id
          shares
          unrealizedPnL
          user
          currentValueUSD
          feesEarnedUSD
          realizedPnLUSD
          initialValueUSD
          totalPnLUSD
        }
      }
      poolRef {
        id
        token1Ref {
          id
          name
          symbol
          logoUri
          decimals
          tokenDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
            items {
              priceUSD
            }
          }
        }
        token0Ref {
          id
          name
          symbol
          logoUri
          decimals
          tokenDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
            items {
              priceUSD
            }
          }
        }
      }
    }
  }
`

export interface VaultToken {
  address: Address
  id: Address
  symbol: string
  name: string
  decimals: number
  logoUri: string
  priceUSD: number
}

export const VaultDetailPage = () => {
  const { address } = useAccount()
  const { vaultAddress } = useParams<{ vaultAddress: Address }>();

  const { data: vault, isLoading, refetch } = useQuery({
    queryKey: ['stickyVault', vaultAddress],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_STICKYVAULT, variables: { id: vaultAddress, user: address } }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.stickyVault
    }
  });

  const { token0, token1, autoWinVault } = useMemo(() => {
    if (!vault?.poolRef) return { token0: null, token1: null, autoWinVault: undefined }
    return {
      token0: {
        id: vault.poolRef.token0Ref.id,
        address: vault.poolRef.token0Ref.id,
        symbol: vault.poolRef.token0Ref.symbol,
        name: vault.poolRef.token0Ref.name,
        decimals: vault.poolRef.token0Ref.decimals,
        logoUri: vault.poolRef.token0Ref.logoUri,
        priceUSD: vault.poolRef.token0Ref.tokenDayData?.items?.[0].priceUSD || 0
      },
      token1: {
        id: vault.poolRef.token1Ref.id,
        address: vault.poolRef.token1Ref.id,
        symbol: vault.poolRef.token1Ref.symbol,
        name: vault.poolRef.token1Ref.name,
        decimals: vault.poolRef.token1Ref.decimals,
        logoUri: vault.poolRef.token1Ref.logoUri,
        priceUSD: vault.poolRef.token1Ref.tokenDayData?.items?.[0].priceUSD || 0
      },
      // Get autoWinVault address from the indexed data
      autoWinVault: vault.autoWinVault as Address | undefined
    }

  }, [vault])


  if (isLoading) {
    return (
      <div className="VaultDetailPage__Wrapper">
        <Loader size="mobile" />
      </div>
    );
  }

  if (!vault || !token0 || !token1) {
    return (
      <div className="VaultDetailPage VaultDetailPage--error">
        <div className="VaultDetailPage__Error">
          <h2>Vault not found</h2>
          <p>The requested vault does not exist or has been removed.</p>
          <Link to="/explore?tab=vaults" className="button button--primary">
            Back to vaults
          </Link>
        </div>
      </div>
    );
  }

  console.log(token0, token1, vault)

  return (
    <PageContentTransition className="VaultDetailPage">
      {/* Header */}
      <div className="VaultDetailPage__Header">
        <div className="VaultDetailPage__HeaderLeft">
          <Link to="/explore?tab=vaults" className="VaultDetailPage__BackLink">
            ← Back to vaults
          </Link>
          <div className="VaultDetailPage__VaultInfo">
            <TokenPairLogos
              token0={token0}
              token1={token1}
              borderWidth={2}
              separatorWidth={1.5}
              size={32}
            />
            <div className="VaultDetailPage__VaultTitle">
              <h1>{vault.name || `${token0.symbol}/${token1.symbol}`}</h1>
              <div className="VaultDetailPage__VaultMeta">
                <span className="VaultDetailPage__Strategy">
                  {vault.strategy || 'Auto-Win'}
                </span>
                <a
                  href={`https://berascan.com/address/${vault.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="VaultDetailPage__ExplorerLink"
                >
                  <ExplorerIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="VaultDetailPage__HeaderRight">
          {/* Header right content can be added here if needed */}
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="VaultDetailPage__MainContent">
        {/* Left Column - 70% width */}
        <div className="VaultDetailPage__LeftColumn">
          {/* Stats Grid */}
          <div className="VaultDetailPage__StatsGrid">
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">Vault TVL</span>
              <span className="VaultDetailPage__StatValue">${formatNumber(vault.totalValueLockedUSD)}</span>
            </div>
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">Collected Fees</span>
              <span className="VaultDetailPage__StatValue">${formatNumber(vault?.collectedFeesUSD)}</span>
            </div>
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">BGT APR</span>
              {/* <span className="VaultDetailPage__StatValue">{vault?.rewardsApr || "0"}%</span> */}
              <span className="VaultDetailPage__StatValue">-</span>
            </div>
            <div className="VaultDetailPage__StatCard">
              <span className="VaultDetailPage__StatLabel">Vault APR</span>
              <span className="VaultDetailPage__StatValue">{vault?.vaultDayData.items && vault.vaultDayData.items.length > 0 ? vault.vaultDayData.items[0].maxPotentialAPR || "0" : "0"}%</span>
            </div>
            <div className="VaultDetailPage__StatCard VaultDetailPage__StatCard--highlight">
              <span className="VaultDetailPage__StatLabel">Total APR</span>
              <span className="VaultDetailPage__StatValue VaultDetailPage__StatValue--highlight">
                {vault?.vaultDayData.items && vault.vaultDayData.items.length > 0 ? vault.vaultDayData.items[0].maxPotentialAPR || "0" : "0"}%
              </span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="VaultDetailPage__ChartSection">
            <ChartWidget
              vaultAddress={vault.id}
              dataType="vault"
              height={400}
              showToolbar={true}
            />
          </div>
        </div>

        {/* Right Column - 30% width */}
        <div className="VaultDetailPage__RightColumn">
          {/* User Position Info */}
          <UserVaultDetail vault={vault} token0={token0} token1={token1} autoWinVault={autoWinVault} onSuccess={() => refetch()} />
        </div>
      </div>
    </PageContentTransition>
  );
};

export default VaultDetailPage;
