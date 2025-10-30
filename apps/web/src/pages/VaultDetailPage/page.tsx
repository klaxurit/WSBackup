import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import { ExplorerIcon, ExplorerChevronIcon } from '../../components/SVGs';
import { ChartWidget } from '../../components/Charts/ChartWidget';
import { useQuery } from '@tanstack/react-query';
import { type Address, formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { PageContentTransition } from '../../components/Transitions';
import { Loader } from '../../components/Loader/Loader';
import { UserVaultDetail } from '../../components/Vault/UserVaultDetail';
import { UserPositionsTable } from '../../components/Vault/UserPositionsTable';
import { VaultStatsGrid } from '../../components/Vault/VaultStatsGrid';
import { useStickyVaultBalance } from '../../hooks/vault/useStickyVaultBalance';
import { useAutoWinPosition } from '../../hooks/vault/useAutoWinPosition';

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

  // Get on-chain balances for accurate position tracking
  const stickyVaultBalance = useStickyVaultBalance({
    vaultAddress: vault?.id as Address | undefined,
    userAddress: address,
    vaultTVL_USD: vault?.totalValueLockedUSD
  })

  const autoWinBalance = useAutoWinPosition({
    autoWinVault: autoWinVault,
    userAddress: address,
    sharesFromIndexer: vault?.autoWinVaultRef?.positions?.items?.find((p: any) => p.user === address?.toLowerCase())?.shares,
    stickyVaultAddress: vault?.id as Address | undefined,
    vaultTVL_USD: vault?.totalValueLockedUSD
  })

  // Prepare user positions data for the table using on-chain balances
  const userPositions = useMemo(() => {
    if (!vault || !address || !token0 || !token1) return []

    const positions = []

    // 1. StickyVault position (Sticky) - from wallet balance on-chain
    // This shows only what's in the wallet, not what's staked elsewhere
    if (stickyVaultBalance.shares > 0n) {
      positions.push({
        type: 'sticky' as const,
        valueUSD: stickyVaultBalance.valueInUSD,
        tokenName: `${token0.symbol}-${token1.symbol}`,
        tokenAmount: stickyVaultBalance.shares,
        apr: vault.vaultDayData?.items?.[0]?.maxPotentialAPR || 0
      })
    }

    // 2. AutoWin position - from on-chain balance
    if (autoWinBalance.shares > 0n) {
      positions.push({
        type: 'autowin' as const,
        valueUSD: autoWinBalance.valueInUSD,
        tokenName: `AW-${token0.symbol}-${token1.symbol}`,
        tokenAmount: autoWinBalance.shares,
        apr: parseFloat(vault.autoWinVaultRef?.estimatedAPR || '0')
      })
    }

    // 3. Staked Externally (Infrared/Berahub)
    // TODO: Requires Infrared contract address to query staked balance
    // For now, we show a placeholder if indexer shows more shares than wallet
    const stickyPositionIndexed = vault.positions?.items?.find((p: any) => p.user === address.toLowerCase())

    // Only try to detect staked position if indexer data exists and is recent
    if (stickyPositionIndexed && parseFloat(stickyPositionIndexed.shares) > 0) {
      const indexedSharesDecimal = parseFloat(stickyPositionIndexed.shares)
      const walletSharesDecimal = parseFloat(formatUnits(stickyVaultBalance.shares, 18))

      // If indexer shows more shares than wallet (with 0.01 tolerance for rounding),
      // the difference might be staked elsewhere
      const difference = indexedSharesDecimal - walletSharesDecimal

      if (difference > 0.01) {
        // Calculate staked amount
        const stakedElsewhere = BigInt(Math.floor(difference * Math.pow(10, 18)))
        const stakedValueUSD = difference * stickyVaultBalance.pricePerShare

        positions.push({
          type: 'staked' as const,
          valueUSD: stakedValueUSD,
          tokenName: `Staked ${token0.symbol}-${token1.symbol}`,
          tokenAmount: stakedElsewhere,
          apr: 0 // APR from external protocol (Infrared) - to be implemented
        })
      }
    }

    return positions
  }, [vault, address, token0, token1, stickyVaultBalance, autoWinBalance])

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

  return (
    <PageContentTransition className="VaultDetailPage">
      {/* Breadcrumbs */}
      <div className="VaultDetailPage__Breadcrumbs">
        <Link to="/explore" className="VaultDetailPage__BreadcrumbsLink">Explore</Link>
        <ExplorerChevronIcon />
        <Link to="/explore?tab=vaults" className="VaultDetailPage__BreadcrumbsLink">Vaults</Link>
        <ExplorerChevronIcon />
        <span className="VaultDetailPage__BreadcrumbsLink__3">
          {vault.name || `${token0.symbol}/${token1.symbol}`}
        </span>
        <span className="VaultDetailPage__BreadcrumbsAddress">
          {vault.id.slice(0, 6) + '...' + vault.id.slice(-4)}
        </span>
      </div>

      {/* Header */}
      <div className="VaultDetailPage__Header">
        <div className="VaultDetailPage__HeaderLeft">
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
                <span className={`VaultDetailPage__Strategy VaultDetailPage__Strategy--${vault.autoWinVault ? 'autowin' : 'sticky'}`}>
                  {vault.autoWinVault ? 'Auto-Win' : 'Sticky'}
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
          {/* Stats Grid - 2x3 Layout */}
          <VaultStatsGrid
            vaultAddress={vault.id as Address}
            totalValueLockedUSD={vault.totalValueLockedUSD}
            collectedFeesUSD={vault.collectedFeesUSD}
          />

          {/* Chart Section */}
          <div className="VaultDetailPage__ChartSection">
            <ChartWidget
              vaultAddress={vault.id}
              dataType="vault"
              height={400}
              showToolbar={true}
            />
          </div>

          {/* User Positions Table */}
          {address && userPositions.length > 0 && (
            <UserPositionsTable
              vaultPositions={userPositions}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Right Column - 30% width */}
        <div className="VaultDetailPage__RightColumn">
          {/* User Action Forms */}
          <UserVaultDetail vault={vault} token0={token0} token1={token1} autoWinVault={autoWinVault} onSuccess={() => refetch()} />
        </div>
      </div>
    </PageContentTransition>
  );
};

export default VaultDetailPage;
