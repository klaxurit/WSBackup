import React, { useMemo, useState } from 'react';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/pages/_positionPage.scss';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import honeyIcon from '../../assets/honey_icon.png';
import NewBanner from '../../components/Common/NewBanner';
import { FallbackImg } from '../../components/utils/FallbackImg';
import { PageContentTransition } from '../../components/Transitions';
import { Pool, Position, TickMath } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';
import { currentChain } from '../../config/wagmi';
import JSBI from 'jsbi';
import { Loader } from '../../components/Loader/Loader';
import { StickyIcon } from '../../components/Common/StickyIcon';
import type { Address } from 'viem';

// GraphQL queries for top pools and vaults
const GET_TOP_POOLS = `
  query GetTopPools {
    pools(orderBy: "totalValueLockedUSD", orderDirection: "desc", limit: 4) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      items {
        feeTier
        id
        liquidity
        poolDayData(limit: 30, orderBy: "date", orderDirection: "desc") {
          items {
            tvlUSD
            volumeUSD
            apr
            volumeUSD1D
            volumeUSD30D
          }
        }
        token0Ref {
          name
          id
          symbol
          logoUri
        }
        token1Ref {
          id
          name
          symbol
          logoUri
        }
        totalValueLockedBERA
        totalValueLockedUSD
        volumeUSD
      }
    }
  }
`;

const GET_TOP_VAULTS = `
  query GetTopVaults {
    stickyVaults(orderBy: "totalValueLockedUSD", orderDirection: "desc", limit: 4) {
      items {
        name
        txCount
        totalValueLockedUSD
        totalValueLockedToken1
        totalValueLockedToken0
        totalValueLockedBERA
        totalSupply
        tickUpper
        tickLower
        rebalanceCount
        pool
        manager
        liquidity
        id
        currentTick
        createdAtTimestamp
        createdAtBlockNumber
        collectedFeesUSD
        collectedFeesToken1
        collectedFeesToken0
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
        poolRef {
          token1Ref {
            id
            logoUri
            name
            symbol
          }
          token0Ref {
            id
            logoUri
            name
            symbol
          }
        }
      }
    }
  }
`;

const GET_USER_POSITIONS = `
query GetTransactions($owner: String) {
  positions(where: {owner: $owner}) {
    items {
      id
      pool
      poolRef {
        id
        sqrtPrice
        tick
        liquidity
        token0Ref {
          logoUri
          id
          name
          symbol
          decimals
          tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
            items {
              priceUSD
            }
          }
        }
        token1Ref {
          id
          logoUri
          name
          symbol
          decimals
          tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
            items {
              priceUSD
            }
          }
        }
        feeTier
        poolDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
          items {
            apr
          }
        }
      }
      tokenId
      tickLower
      tickUpper
      withdrawnToken1
      withdrawnToken0
      depositedToken0
      depositedToken1
      liquidity
    }
  }
}
`;

const GET_USER_VAULT_POSITIONS = `
query GetUserVaultPositions($user: String) {
  stickyVaults {
    items {
      id
      name
      totalValueLockedUSD
      vaultDayData(orderBy: "date", orderDirection: "desc", limit: 1) {
        items {
          apr
          maxPotentialAPR
        }
      }
      poolRef {
        feeTier
        token0Ref {
          id
          name
          symbol
          logoUri
          decimals
        }
        token1Ref {
          id
          name
          symbol
          logoUri
          decimals
        }
      }
      positions(where: {user: $user}) {
        items {
          id
          user
          shares
          depositedToken0
          depositedToken1
          currentValueToken0
          currentValueToken1
          currentValueUSD
          feesEarnedUSD
          realizedPnLUSD
          initialValueUSD
          totalPnLUSD
        }
      }
    }
  }
}
`;

// Interfaces for top pools and vaults
interface GraphQLPool {
  id: string;
  feeTier: number;
  liquidity: string;
  totalValueLockedUSD: number;
  totalValueLockedBERA: number;
  volumeUSD: number;
  poolDayData: {
    items: Array<{
      tvlUSD: number;
      volumeUSD: number;
      apr: number;
      volumeUSD1D: number;
      volumeUSD30D: number;
    }>;
  };
  token0Ref: {
    name: string;
    id: string;
    symbol: string;
    logoUri?: string;
  };
  token1Ref: {
    id: string;
    name: string;
    symbol: string;
    logoUri?: string;
  };
}

interface GraphQLVault {
  id: string;
  name: string;
  totalValueLockedUSD: number;
  vaultDayData: {
    items: Array<{
      apr: number;
      maxPotentialAPR: number;
    }>;
  };
  poolRef: {
    token0Ref: {
      id: string;
      symbol: string;
      logoUri?: string;
    };
    token1Ref: {
      id: string;
      symbol: string;
      logoUri?: string;
    };
  };
}


interface FormattedPool {
  id: Address
  address: string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  token0LogoUri?: string;
  token1LogoUri?: string;
  fee: number;
  apr: number;
  tvlUSD: number;
}

interface FormattedVault {
  id: string;
  name: string;
  token0Symbol: string;
  token1Symbol: string;
  token0LogoUri?: string;
  token1LogoUri?: string;
  apr: number;
  tvlUSD: number;
}

const transformGraphQLPoolToFormattedPool = (graphqlPool: GraphQLPool): FormattedPool => {
  const latestDayData = graphqlPool.poolDayData.items[0];
  const aprValue = latestDayData?.apr;
  const transformed = {
    id: graphqlPool.id as Address,
    address: graphqlPool.id,
    token0Address: graphqlPool.token0Ref.id,
    token1Address: graphqlPool.token1Ref.id,
    token0Symbol: graphqlPool.token0Ref.symbol,
    token1Symbol: graphqlPool.token1Ref.symbol,
    token0LogoUri: graphqlPool.token0Ref.logoUri,
    token1LogoUri: graphqlPool.token1Ref.logoUri,
    fee: graphqlPool.feeTier / 10000,
    apr: typeof aprValue === 'number' ? aprValue : (typeof aprValue === 'string' ? parseFloat(aprValue) : 0),
    tvlUSD: graphqlPool.totalValueLockedUSD,
  };

  return transformed;
};

const transformGraphQLVaultToFormattedVault = (graphqlVault: GraphQLVault): FormattedVault => {
  const latestDayData = graphqlVault.vaultDayData.items[0];
  const aprValue = latestDayData?.maxPotentialAPR || latestDayData?.apr;

  return {
    id: graphqlVault.id,
    name: graphqlVault.name || `${graphqlVault.poolRef.token0Ref.symbol}/${graphqlVault.poolRef.token1Ref.symbol}`,
    token0Symbol: graphqlVault.poolRef.token0Ref.symbol,
    token1Symbol: graphqlVault.poolRef.token1Ref.symbol,
    token0LogoUri: graphqlVault.poolRef.token0Ref.logoUri,
    token1LogoUri: graphqlVault.poolRef.token1Ref.logoUri,
    apr: typeof aprValue === 'number' ? aprValue : (typeof aprValue === 'string' ? parseFloat(aprValue) : 0),
    tvlUSD: graphqlVault.totalValueLockedUSD,
  };
};

interface GraphQLVaultPosition {
  id: string;
  user: string;
  shares: string;
  depositedToken0: string;
  depositedToken1: string;
  currentValueToken0: string;
  currentValueToken1: string;
  currentValueUSD: string;
  feesEarnedUSD: string;
  realizedPnLUSD: string;
  initialValueUSD: string;
  totalPnLUSD: string;
}

interface GraphQLVaultWithPositions {
  id: string;
  name: string;
  totalValueLockedUSD: string;
  vaultDayData: {
    items: Array<{
      apr: number;
      maxPotentialAPR: number;
    }>;
  };
  poolRef: {
    feeTier: number;
    token0Ref: {
      id: string;
      name: string;
      symbol: string;
      logoUri?: string;
      decimals: number;
    };
    token1Ref: {
      id: string;
      name: string;
      symbol: string;
      logoUri?: string;
      decimals: number;
    };
  };
  positions: {
    items: GraphQLVaultPosition[];
  };
}

interface FormattedVaultPosition {
  id: string;
  vaultId: string;
  vaultName: string;
  token0Symbol: string;
  token1Symbol: string;
  token0LogoUri?: string;
  token1LogoUri?: string;
  shares: string;
  currentValueUSD: string;
  feesEarnedUSD: string;
  feeTier: number;
  apr: number;
  type: 'vault';
}


const transformVaultPositionToFormattedPosition = (vault: GraphQLVaultWithPositions, position: GraphQLVaultPosition): FormattedVaultPosition => {
  const latestDayData = vault.vaultDayData.items[0];
  const aprValue = latestDayData?.maxPotentialAPR || latestDayData?.apr;

  return {
    id: position.id,
    vaultId: vault.id,
    vaultName: vault.name || `${vault.poolRef.token0Ref.symbol}/${vault.poolRef.token1Ref.symbol}`,
    token0Symbol: vault.poolRef.token0Ref.symbol,
    token1Symbol: vault.poolRef.token1Ref.symbol,
    token0LogoUri: vault.poolRef.token0Ref.logoUri,
    token1LogoUri: vault.poolRef.token1Ref.logoUri,
    shares: position.shares,
    currentValueUSD: position.currentValueUSD,
    feesEarnedUSD: position.feesEarnedUSD,
    feeTier: vault.poolRef.feeTier,
    apr: typeof aprValue === 'number' ? aprValue : (typeof aprValue === 'string' ? parseFloat(aprValue) : 0),
    type: 'vault' as const,
  };
};

const VaultPositionSizeCell: React.FC<{ row: FormattedVaultPosition }> = ({ row }) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '14px', fontWeight: '500' }}>
          {parseFloat(row.shares).toFixed(4)}
        </span>
        <StickyIcon
          width={24}
          height={24}
          className="LiquidityPage__VaultStickyIcon"
        />
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
        ${parseFloat(row.currentValueUSD).toFixed(2)}
      </div>
    </div>
  );
};

const PositionSizeCell: React.FC<{ row: any }> = ({ row }) => {
  // Calculer les montants actuels basés sur la liquidité et la position dans le range
  const amounts = useMemo(() => {
    try {
      const pool = row.poolRef;
      const position = row;

      // Si pas de liquidité, la position est fermée
      if (position.liquidity === "0" || !pool.sqrtPrice) {
        return { amount0: "0.00", amount1: "0.00", totalValue: "0.00" };
      }

      // Calculer le tick actuel depuis sqrtPrice
      const currentTick = pool.tick ? Number(pool.tick) : TickMath.getTickAtSqrtRatio(JSBI.BigInt(pool.sqrtPrice));

      // Créer le SDK pool
      const sdkPool = new Pool(
        new Token(currentChain.id, pool.token0Ref.id, pool.token0Ref.decimals || 18, pool.token0Ref.symbol, pool.token0Ref.name),
        new Token(currentChain.id, pool.token1Ref.id, pool.token1Ref.decimals || 18, pool.token1Ref.symbol, pool.token1Ref.name),
        pool.feeTier,
        pool.sqrtPrice,
        pool.liquidity,
        currentTick
      );

      // Créer la SDK position
      const sdkPosition = new Position({
        pool: sdkPool,
        tickLower: position.tickLower,
        tickUpper: position.tickUpper,
        liquidity: position.liquidity
      });

      // Obtenir les montants depuis le SDK
      const amount0 = parseFloat(sdkPosition.amount0.toExact()).toFixed(2);
      const amount1 = parseFloat(sdkPosition.amount1.toExact()).toFixed(2);

      // Calculer la valeur totale
      const token0Price = pool.token0Ref.tokenDayData?.items?.[0]?.priceUSD || 0;
      const token1Price = pool.token1Ref.tokenDayData?.items?.[0]?.priceUSD || 0;
      const value0 = parseFloat(amount0) * parseFloat(token0Price);
      const value1 = parseFloat(amount1) * parseFloat(token1Price);
      const totalValue = (value0 + value1).toFixed(2);

      return { amount0, amount1, totalValue };
    } catch (error) {
      console.error('Error calculating position amounts:', error);
      // Fallback aux valeurs deposited - withdrawn
      const amount0 = (parseFloat(row.depositedToken0 || 0) - parseFloat(row.withdrawnToken0 || 0)).toFixed(2);
      const amount1 = (parseFloat(row.depositedToken1 || 0) - parseFloat(row.withdrawnToken1 || 0)).toFixed(2);
      const token0Price = row.poolRef.token0Ref.tokenDayData?.items?.[0]?.priceUSD || 0;
      const token1Price = row.poolRef.token1Ref.tokenDayData?.items?.[0]?.priceUSD || 0;
      const totalValue = (parseFloat(amount0) * parseFloat(token0Price) + parseFloat(amount1) * parseFloat(token1Price)).toFixed(2);
      return { amount0, amount1, totalValue };
    }
  }, [row]);

  return (
    <div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amounts.amount0}
          {row.poolRef.token0Ref.logoUri ? (
            <img src={row.poolRef.token0Ref.logoUri} alt={row.poolRef.token0Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.poolRef.token0Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amounts.amount1}
          {row.poolRef.token1Ref.logoUri ? (
            <img src={row.poolRef.token1Ref.logoUri} alt={row.poolRef.token1Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.poolRef.token1Ref.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
        {parseFloat(amounts.totalValue) > 0 ? `$${amounts.totalValue}` : ''}
      </div>
    </div>
  );
};

const LiquidityPage: React.FC = () => {
  const { address, isConnected } = useAccount()
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed'>('open')
  const navigate = useNavigate()

  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions', address],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_USER_POSITIONS, variables: { owner: address } }),
      });

      if (!response.ok) return null
      const data = await response.json();

      return data.data.positions.items
    },
    enabled: !!address
  })

  const { data: vaultPositionsData, isLoading: vaultPositionsLoading } = useQuery({
    queryKey: ['vaultPositions', address],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_USER_VAULT_POSITIONS, variables: { user: address?.toLowerCase() } }),
      });

      if (!response.ok) return null
      const data = await response.json();

      return data.data.stickyVaults.items
    },
    enabled: !!address
  })

  // GraphQL queries for top pools and vaults
  const { data: topPoolsData, isLoading: topPoolsLoading, error: topPoolsError } = useQuery({
    queryKey: ['topPools'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_TOP_POOLS }),
      });

      if (!response.ok) return null
      const data = await response.json();
      return data.data;
    }
  });

  const { data: topVaultsData, isLoading: topVaultsLoading, error: topVaultsError } = useQuery({
    queryKey: ['topVaults'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_TOP_VAULTS }),
      });

      if (!response.ok) return null
      const data = await response.json();
      return data.data;
    }
  });

  // Transformer les positions vault en format unifié
  const vaultPositions: FormattedVaultPosition[] = useMemo(() => {
    if (!vaultPositionsData) return []

    const allVaultPositions: FormattedVaultPosition[] = []

    vaultPositionsData.forEach((vault: GraphQLVaultWithPositions) => {
      vault.positions.items.forEach((position: GraphQLVaultPosition) => {
        allVaultPositions.push(transformVaultPositionToFormattedPosition(vault, position))
      })
    })

    return allVaultPositions
  }, [vaultPositionsData])

  // Combiner toutes les positions (pools + vaults) et les trier par valeur USD
  const allPositions = useMemo(() => {
    const poolPositions = positions || []
    const vaultPos = vaultPositions || []

    // Ajouter un type aux positions pool pour les distinguer
    const typedPoolPositions = poolPositions.map((p: any) => ({ ...p, type: 'pool' }))

    const combined = [...typedPoolPositions, ...vaultPos]

    // Trier par valeur USD décroissante (plus haute valeur en premier)
    return combined.sort((a: any, b: any) => {
      let valueA = 0
      let valueB = 0

      if (a.type === 'vault') {
        // Pour les vaults, utiliser currentValueUSD directement
        valueA = parseFloat(a.currentValueUSD || '0')
      } else {
        // Pour les pools, utiliser le même calcul que PositionSizeCell
        try {
          const pool = a.poolRef;
          const position = a;

          // Si pas de liquidité, la position est fermée
          if (position.liquidity === "0" || !pool.sqrtPrice) {
            valueA = 0;
          } else {
            // Calculer le tick actuel depuis sqrtPrice
            const currentTick = pool.tick ? Number(pool.tick) : TickMath.getTickAtSqrtRatio(JSBI.BigInt(pool.sqrtPrice));

            // Créer le SDK pool
            const sdkPool = new Pool(
              new Token(currentChain.id, pool.token0Ref.id, pool.token0Ref.decimals || 18, pool.token0Ref.symbol, pool.token0Ref.name),
              new Token(currentChain.id, pool.token1Ref.id, pool.token1Ref.decimals || 18, pool.token1Ref.symbol, pool.token1Ref.name),
              pool.feeTier,
              pool.sqrtPrice,
              pool.liquidity,
              currentTick
            );

            // Créer la SDK position
            const sdkPosition = new Position({
              pool: sdkPool,
              tickLower: position.tickLower,
              tickUpper: position.tickUpper,
              liquidity: position.liquidity
            });

            // Obtenir les montants depuis le SDK
            const amount0 = parseFloat(sdkPosition.amount0.toExact());
            const amount1 = parseFloat(sdkPosition.amount1.toExact());

            // Calculer la valeur totale avec les prix des tokens
            const token0Price = pool.token0Ref?.tokenDayData?.items?.[0]?.priceUSD || 0;
            const token1Price = pool.token1Ref?.tokenDayData?.items?.[0]?.priceUSD || 0;

            const amount0USD = amount0 * parseFloat(token0Price);
            const amount1USD = amount1 * parseFloat(token1Price);
            valueA = amount0USD + amount1USD;
          }
        } catch {
          valueA = 0;
        }
      }

      if (b.type === 'vault') {
        // Pour les vaults, utiliser currentValueUSD directement
        valueB = parseFloat(b.currentValueUSD || '0')
      } else {
        // Pour les pools, utiliser le même calcul que PositionSizeCell
        try {
          const pool = b.poolRef;
          const position = b;

          // Si pas de liquidité, la position est fermée
          if (position.liquidity === "0" || !pool.sqrtPrice) {
            valueB = 0;
          } else {
            // Calculer le tick actuel depuis sqrtPrice
            const currentTick = pool.tick ? Number(pool.tick) : TickMath.getTickAtSqrtRatio(JSBI.BigInt(pool.sqrtPrice));

            // Créer le SDK pool
            const sdkPool = new Pool(
              new Token(currentChain.id, pool.token0Ref.id, pool.token0Ref.decimals || 18, pool.token0Ref.symbol, pool.token0Ref.name),
              new Token(currentChain.id, pool.token1Ref.id, pool.token1Ref.decimals || 18, pool.token1Ref.symbol, pool.token1Ref.name),
              pool.feeTier,
              pool.sqrtPrice,
              pool.liquidity,
              currentTick
            );

            // Créer la SDK position
            const sdkPosition = new Position({
              pool: sdkPool,
              tickLower: position.tickLower,
              tickUpper: position.tickUpper,
              liquidity: position.liquidity
            });

            // Obtenir les montants depuis le SDK
            const amount0 = parseFloat(sdkPosition.amount0.toExact());
            const amount1 = parseFloat(sdkPosition.amount1.toExact());

            // Calculer la valeur totale avec les prix des tokens
            const token0Price = pool.token0Ref?.tokenDayData?.items?.[0]?.priceUSD || 0;
            const token1Price = pool.token1Ref?.tokenDayData?.items?.[0]?.priceUSD || 0;

            const amount0USD = amount0 * parseFloat(token0Price);
            const amount1USD = amount1 * parseFloat(token1Price);
            valueB = amount0USD + amount1USD;
          }
        } catch {
          valueB = 0;
        }
      }

      return valueB - valueA // Tri décroissant (plus haute valeur en premier)
    })
  }, [positions, vaultPositions])

  const filteredPositions = useMemo(() => {
    if (!allPositions) return []
    return allPositions.filter((p: any) => {
      if (p.type === 'vault') {
        // Pour les vaults, on considère qu'ils sont toujours "ouverts" s'ils ont des shares
        return statusFilter === "open"
          ? parseFloat(p.shares) > 0
          : parseFloat(p.shares) === 0
      } else {
        // Pour les pools, utiliser la logique existante
        return statusFilter === "open"
          ? p.liquidity !== "0"
          : p.liquidity === "0"
      }
    })
  }, [allPositions, statusFilter])

  // Handler pour cliquer sur une ligne
  const handleRowClick = (row: any) => {
    if (row.type === 'vault') {
      navigate(`/vault/${row.vaultId}`);
    } else {
      navigate(`/pool/${row.pool}`);
    }
  };

  const columns: TableColumn[] = [
    {
      label: 'Pair',
      key: 'pair',
      render: (row) => {
        if (row.type === 'vault') {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TokenPairLogos
                token0={{
                  id: row.vaultId,
                  address: row.vaultId,
                  symbol: row.token0Symbol,
                  logoUri: row.token0LogoUri
                }}
                token1={{
                  id: row.vaultId,
                  address: row.vaultId,
                  symbol: row.token1Symbol,
                  logoUri: row.token1LogoUri
                }}
                size={28}
                gap={3}
                borderWidth={2}
                separatorWidth={1.5}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {row.vaultName}
                </span>
              </div>
            </div>
          )
        } else {
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TokenPairLogos
                token0={row.poolRef.token0Ref}
                token1={row.poolRef.token1Ref}
                size={28}
                gap={3}
                borderWidth={2}
                separatorWidth={1.5}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                  {`${row.poolRef.token0Ref.symbol} / ${row.poolRef.token1Ref.symbol}`}
                </span>
              </div>
            </div>
          )
        }
      },
    },
    {
      label: 'Type',
      key: 'type',
      render: (row) => {
        if (row.type === 'vault') {
          return (
            <span style={{
              fontSize: '14px',
              color: '#e39229',
              fontWeight: '500',
              letterSpacing: '0.5px',
              backgroundColor: 'rgba(227, 146, 41, 0.1)',
              textShadow: '0px 1.5px 1px #100A25, -0.5px 0px 0px #180E00, 0.5px 0px 0px #180E00, 0px -0.5px 0px #180E00',
              padding: '6px 10px 6px 10px',
              borderRadius: '12px',
              display: 'inline-block',
              width: 'fit-content'
            }}>
              Vault
            </span>
          )
        } else {
          return (
            <span style={{
              fontSize: '14px',
              color: '#aaa',
              fontWeight: '500',
              letterSpacing: '0.5px',
              backgroundColor: 'rgba(170, 170, 170, 0.1)',
              textShadow: '0px 1.5px 1px #100A25, -0.5px 0px 0px #180E00, 0.5px 0px 0px #180E00, 0px -0.5px 0px #180E00',
              padding: '6px 10px 6px 10px',
              borderRadius: '12px',
              display: 'inline-block',
              width: 'fit-content'
            }}>
              Pool
            </span>
          )
        }
      }
    },
    {
      label: 'Position size',
      key: 'size',
      render: (row) => row.type === 'vault' ? <VaultPositionSizeCell row={row} /> : <PositionSizeCell row={row} />
    },
    {
      label: 'Fees',
      key: 'fees',
      render: (row) => {
        if (row.type === 'vault') {
          // Pour les vaults, afficher le fee tier de la pool associée
          const feeTier = row.feeTier / 10000; // Convertir de basis points en pourcentage
          return (
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#e39229'
            }}>
              {feeTier}%
            </span>
          )
        } else {
          // Pour les pools, afficher le fee tier
          const feeTier = row.poolRef.feeTier / 10000; // Convertir de basis points en pourcentage
          return (
            <span style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#aaa'
            }}>
              {feeTier}%
            </span>
          )
        }
      }
    },
    {
      label: 'APR',
      key: 'apr',
      render: (row) => {
        if (row.type === 'vault') {
          return row.apr ? `${row.apr.toFixed(2)}%` : "-"
        } else {
          const apr: string = row.poolRef.poolDayData.items[0].apr || "0";
          return apr !== "0" ? `${apr}%` : "-"
        }
      }
    },
  ];

  // Transform top pools and vaults data
  const topPools: FormattedPool[] = useMemo(() => {
    if (!topPoolsData?.pools?.items) return []
    const pools = topPoolsData.pools.items.map(transformGraphQLPoolToFormattedPool)
    // Trier par APR décroissant (plus haut APR en premier)
    return pools.sort((a: FormattedPool, b: FormattedPool) => b.apr - a.apr)
  }, [topPoolsData]);

  const topVaults: FormattedVault[] = useMemo(() => {
    if (!topVaultsData?.stickyVaults?.items) return []
    const vaults = topVaultsData.stickyVaults.items.map(transformGraphQLVaultToFormattedVault)
    // Trier par APR décroissant (plus haut APR en premier)
    return vaults.sort((a: FormattedVault, b: FormattedVault) => b.apr - a.apr)
  }, [topVaultsData]);

  return (
    <PageContentTransition className="LiquidityPage">
      <NewBanner title="Liquidity" subtitle="Manage your liquidity positions and discover opportunities" image={honeyIcon} />
      <div className="LiquidityPage__ContentWrapper">
        {/* Top Pools & Vaults - Ultra Compact Line */}
        <div className="LiquidityPage__TopLine">
          {/* Top Pools */}
          <div className="LiquidityPage__TopPoolsUltraCompact">
            <h4 className="LiquidityPage__TopLineTitle">Top Pools APR</h4>
            <div className="LiquidityPage__TopPoolsRow">
              {topPoolsLoading ? (
                <Loader size="mobile" />
              ) : topPoolsError ? (
                <span>Error</span>
              ) : topPools.length === 0 ? (
                <span>No pools</span>
              ) : (
                topPools.map((pool: FormattedPool) => (
                  <div
                    key={pool.address}
                    className="LiquidityPage__TopPoolUltraCompact"
                    onClick={() => navigate(`/pool/${pool.address}`)}
                  >
                    <TokenPairLogos
                      token0={{
                        id: pool.id as Address,
                        address: pool.token0Address as Address,
                        symbol: pool.token0Symbol,
                        logoUri: pool.token0LogoUri
                      }}
                      token1={{
                        id: pool.id as Address,
                        address: pool.token1Address as Address,
                        symbol: pool.token1Symbol,
                        logoUri: pool.token1LogoUri
                      }}
                      borderWidth={1}
                      separatorWidth={0.5}
                      size={16}
                    />
                    <span className="LiquidityPage__TopPoolUltraCompact__Symbol">
                      {pool.token0Symbol}/{pool.token1Symbol}
                    </span>
                    <span className="LiquidityPage__TopPoolUltraCompact__Apr">
                      {pool.apr && typeof pool.apr === 'number' ? pool.apr.toFixed(1) : '0.0'}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Vaults */}
          <div className="LiquidityPage__TopVaultsUltraCompact">
            <h4 className="LiquidityPage__TopLineTitle">Top Vaults APR</h4>
            <div className="LiquidityPage__TopVaultsRow">
              {topVaultsLoading ? (
                <Loader size="mobile" />
              ) : topVaultsError ? (
                <span>Error</span>
              ) : topVaults.length === 0 ? (
                <span>No vaults</span>
              ) : (
                topVaults.map((vault: FormattedVault) => (
                  <div
                    key={vault.id}
                    className="LiquidityPage__TopVaultUltraCompact"
                    onClick={() => navigate(`/vault/${vault.id}`)}
                  >
                    <TokenPairLogos
                      token0={{
                        id: vault.id as Address,
                        address: vault.id as Address,
                        symbol: vault.token0Symbol,
                        logoUri: vault.token0LogoUri
                      }}
                      token1={{
                        id: vault.id as Address,
                        address: vault.id as Address,
                        symbol: vault.token1Symbol,
                        logoUri: vault.token1LogoUri
                      }}
                      borderWidth={1}
                      separatorWidth={0.5}
                      size={16}
                    />
                    <span className="LiquidityPage__TopVaultUltraCompact__Symbol">
                      {vault.name.replace('Sticky Vault ', '')}
                    </span>
                    <span className="LiquidityPage__TopVaultUltraCompact__Apr">
                      {vault.apr && typeof vault.apr === 'number' ? vault.apr.toFixed(1) : '0.0'}%
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        {/* Main Content - Full Width */}
        <div className="LiquidityPage__Main">
          <div className="LiquidityPage__Header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <h2 className="LiquidityPage__Title">Your positions</h2>
            <div className="LiquidityPage__FilterButtons" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className={`btn btn--tiny ${statusFilter === 'open' ? 'btn__main' : 'btn__shade'}`}
                onClick={() => setStatusFilter('open')}
              >Open</button>
              <button
                className={`btn btn--tiny ${statusFilter === 'closed' ? 'btn__main' : 'btn__shade'}`}
                onClick={() => setStatusFilter('closed')}
              >Closed</button>
              {isConnected && (
                <Link className="btn btn--tiny btn__accent" to="/liquidity/create">New</Link>
              )}
            </div>
          </div>
          {isConnected
            ? (isLoading || vaultPositionsLoading)
              ? (
                <div className="LiquidityPage__TableWrapper">
                  <Loader size="mobile" />
                </div>
              )
              : (
                <div className="LiquidityPage__TableWrapper">
                  <Table
                    columns={columns}
                    data={filteredPositions}
                    tableClassName="Table"
                    wrapperClassName="Table__Wrapper"
                    scrollClassName="Table__Scroll"
                    emptyMessage="No positions found"
                    onRowClick={handleRowClick}
                  />
                </div>
              )
            : (
              <div className="LiquidityPage__TableWrapper">
                <p>Connect your wallet</p>
              </div>
            )}
        </div>
      </div>
    </PageContentTransition>
  );
};

export default LiquidityPage;
