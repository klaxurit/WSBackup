import Table, { type TableColumn } from "../Table/Table"
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { ExplorerLink } from '../Common/ExplorerLink';
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../utils/formatNumber";
import { useMemo } from "react";
import { useQuery } from '@tanstack/react-query';
import { useAccount, useReadContracts } from 'wagmi';
import { type Address, formatUnits } from 'viem';
import { StickyVaultWithRouter } from '../../config/abis/StickyVaultWithRouter';
import { AutowinABI } from '../../config/abis/Autowin';

interface VaultsTableProps {
  searchValue: string
}

const GET_STICKYVAULTS = `
  query GetStickyVaults($user: String = "") {
  stickyVaults {
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
      autoWinVault
      positions(where: {user: $user}) {
        items {
          currentValueUSD
          shares
        }
      }
      autoWinVaultRef {
        id
        positions(where: {user: $user}) {
          items {
            shares
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
`

const BL = [
  "0xfe68ef4370be9977f006d0ecf9a3676c8bdd7303" // Sticky Vault WETH-USDC.e-0.05%
]

export const VaultsTable = ({ searchValue }: VaultsTableProps) => {
  const navigate = useNavigate();
  const { address } = useAccount();

  const { data: vaults, isLoading } = useQuery({
    queryKey: ['stickyVaults', address],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_STICKYVAULTS,
          variables: { user: address?.toLowerCase() || "" }
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.stickyVaults.items
    }
  });

  // Get vaults where user has positions (for on-chain balance fetching)
  const vaultsWithPositions = useMemo(() => {
    if (!vaults || !address) return [];

    return vaults.filter((vault: any) =>
      (vault.positions?.items?.length > 0) ||
      (vault.autoWinVaultRef?.positions?.items?.length > 0)
    );
  }, [vaults, address]);

  // Create contracts array for batch balance fetching
  const balanceContracts = useMemo(() => {
    if (!address || vaultsWithPositions.length === 0) return [];

    const contracts: any[] = [];

    vaultsWithPositions.forEach((vault: any) => {
      // Sticky vault balance
      contracts.push({
        address: vault.id as Address,
        abi: StickyVaultWithRouter,
        functionName: 'balanceOf',
        args: [address]
      });

      // Sticky vault total supply
      contracts.push({
        address: vault.id as Address,
        abi: StickyVaultWithRouter,
        functionName: 'totalSupply',
      });

      // AutoWin vault balance (if exists)
      if (vault.autoWinVault && vault.autoWinVault !== '0x0000000000000000000000000000000000000000') {
        contracts.push({
          address: vault.autoWinVault as Address,
          abi: AutowinABI,
          functionName: 'balanceOf',
          args: [address]
        });

        // AutoWin convertToAssets
        contracts.push({
          address: vault.autoWinVault as Address,
          abi: AutowinABI,
          functionName: 'convertToAssets',
          args: [0n] // Placeholder, will be updated after getting balance
        });
      }
    });

    return contracts;
  }, [address, vaultsWithPositions]);

  // Fetch all balances in a single batch call
  const { data: balancesData } = useReadContracts({
    contracts: balanceContracts,
    query: {
      enabled: !!address && balanceContracts.length > 0,
      staleTime: 30000,
    }
  });

  // Parse balances data into a usable map
  const onChainBalances = useMemo(() => {
    const map = new Map<string, { stickyShares: bigint; stickyTotalSupply: bigint; autoWinShares?: bigint }>();

    if (!balancesData || !vaultsWithPositions || vaultsWithPositions.length === 0) return map;

    let dataIndex = 0;
    vaultsWithPositions.forEach((vault: any) => {
      const vaultId = vault.id.toLowerCase();

      // Get sticky balance (index 0, 1 for each vault)
      const stickyBalance = balancesData[dataIndex]?.result as bigint | undefined;
      const stickyTotalSupply = balancesData[dataIndex + 1]?.result as bigint | undefined;
      dataIndex += 2;

      // Get AutoWin balance if vault has AutoWin
      let autoWinShares: bigint | undefined;
      if (vault.autoWinVault && vault.autoWinVault !== '0x0000000000000000000000000000000000000000') {
        autoWinShares = balancesData[dataIndex]?.result as bigint | undefined;
        dataIndex += 2; // Skip convertToAssets for now (we'll approximate)
      }

      if (stickyBalance || autoWinShares) {
        map.set(vaultId, {
          stickyShares: stickyBalance || 0n,
          stickyTotalSupply: stickyTotalSupply || 0n,
          autoWinShares
        });
      }
    });

    return map;
  }, [balancesData, vaultsWithPositions]);

  // Helper function to calculate total holdings (Sticky + AutoWin)
  // Uses on-chain balances (same as VaultDetailPage) for accurate values
  const calculateVaultHoldings = (vault: any): number => {
    if (!address) return 0;

    let total = 0;
    let stickyValue = 0;
    let autoWinValue = 0;

    const vaultId = vault.id.toLowerCase();
    const stickyTVL = parseFloat(vault.totalValueLockedUSD || '0');

    // Try to get on-chain balances first (most accurate)
    const onChainData = onChainBalances.get(vaultId);

    if (onChainData) {
      // Use on-chain balances (same as VaultDetailPage)
      const stickyShares = parseFloat(formatUnits(onChainData.stickyShares, 18));
      const totalSupply = parseFloat(formatUnits(onChainData.stickyTotalSupply, 18));

      // Calculate Sticky value: (shares / totalSupply) × TVL
      if (totalSupply > 0 && stickyShares > 0) {
        const proportion = stickyShares / totalSupply;
        stickyValue = proportion * stickyTVL;
        total += stickyValue;
      }

      // Calculate AutoWin value if exists
      if (onChainData.autoWinShares && onChainData.autoWinShares > 0n) {
        const autoWinSharesDecimal = parseFloat(formatUnits(onChainData.autoWinShares, 18));

        // Approximation: autoWinShares / totalSupply × TVL
        // Note: Ideally should use convertToAssets, but this is close
        if (totalSupply > 0) {
          const proportion = autoWinSharesDecimal / totalSupply;
          autoWinValue = proportion * stickyTVL;
          total += autoWinValue;
        }
      }
    } else {
      // Fallback to indexer data if no on-chain data available
      const stickyTotalSupply = parseFloat(vault.totalSupply || '0');

      if (vault.positions?.items?.length > 0) {
        const stickyPosition = vault.positions.items[0];
        const stickyShares = parseFloat(stickyPosition.shares || '0');

        if (stickyTotalSupply > 0 && stickyShares > 0) {
          const proportion = stickyShares / stickyTotalSupply;
          stickyValue = proportion * stickyTVL;
          total += stickyValue;
        }
      }

      if (vault.autoWinVaultRef?.positions?.items?.length > 0) {
        const autoWinPosition = vault.autoWinVaultRef.positions.items[0];
        const autoWinShares = parseFloat(autoWinPosition.shares || '0');

        if (stickyTotalSupply > 0 && autoWinShares > 0) {
          const proportion = autoWinShares / stickyTotalSupply;
          autoWinValue = proportion * stickyTVL;
          total += autoWinValue;
        }
      }
    }

    return total;
  };

  const filteredVaults = useMemo(() => {
    if (!vaults) return []
    const approvedVaults = vaults.filter((v: any) => !BL.includes(v.id))

    if (!searchValue) return approvedVaults
    return approvedVaults.filter((vault: any) =>
      (vault.id && vault.id.toLowerCase().includes(searchValue.toLowerCase())) ||
      (vault.poolRef.token0Ref.symbol && vault.poolRef.token0Ref.symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
      (vault.poolRef.token1Ref.symbol && vault.poolRef.token1Ref.symbol.toLowerCase().includes(searchValue.toLowerCase()))
    );
  }, [vaults, searchValue]);

  const handleRowClick = (row: any) => {
    navigate(`/vault/${row.id}`);
  };

  const columns: TableColumn[] = [
    {
      label: 'Vault',
      key: 'vault',
      className: 'VaultsTable__VaultTd',
      sortable: true,
      sortValue: (row) => `${row.poolRef.token0Ref.symbol}/${row.poolRef.token1Ref.symbol}`,
      render: (row) => (
        <span className="VaultsTable__VaultCell">
          <span className="VaultsTable__LogoWrapper">
            <TokenPairLogos
              token0={{ id: row.poolRef.token0Ref.id, address: row.poolRef.token0Ref.id, logoUri: row.poolRef.token0Ref.logoUri, symbol: row.poolRef.token0Ref.symbol }}
              token1={{ id: row.poolRef.token1Ref.id, address: row.poolRef.token1Ref.id, logoUri: row.poolRef.token1Ref.logoUri, symbol: row.poolRef.token1Ref.symbol }}
              borderWidth={2}
              separatorWidth={1.5}
              size={28}
            />
          </span>
          <span className="VaultsTable__VaultName">
            {row?.name ? row.name : `${row.poolRef.token0Ref.symbol}/${row.poolRef.token1Ref.symbol}`}
          </span>
          <ExplorerLink address={row.id} />
        </span>
      )
    },
    {
      label: 'Strategy',
      key: 'strategy',
      className: 'VaultsTable__StrategyTd',
      sortable: true,
      sortValue: (row) => row.autoWinVault ? 'AutoWin' : 'Sticky',
      render: (row) => {
        const isAutoWin = row.autoWinVault && row.autoWinVault !== '0x0000000000000000000000000000000000000000';
        const strategy = isAutoWin ? 'AutoWin' : 'Sticky';

        return (
          <span className="VaultsTable__StrategyCell">
            <span className={`VaultsTable__StrategyBadge VaultsTable__StrategyBadge--${strategy.toLowerCase()}`}>
              {strategy}
            </span>
          </span>
        );
      }
    },
    {
      label: 'TVL',
      key: 'tvl',
      className: 'VaultsTable__TvlTd',
      sortable: true,
      sortValue: (row) => {
        return row.totalValueLockedUSD || 0
      },
      render: (row) => {
        return (
          <span className="VaultsTable__TvlCell">
            {row.totalValueLockedUSD !== 0
              ? `$${formatNumber(row.totalValueLockedUSD)}`
              : "-"}
          </span>
        )
      }
    },
    {
      label: 'APR',
      key: 'apr',
      className: 'VaultsTable__AprTd',
      sortable: true,
      sortValue: (row) => {
        return row?.apr || 0;
      },
      render: (row) => {
        const dayData = row?.vaultDayData.items && row.vaultDayData.items.length > 0 ? row.vaultDayData.items[0] : null;
        const currentAPR = dayData?.apr || 0;
        const maxPotentialAPR = dayData?.maxPotentialAPR || 0;

        return (
          <span className="VaultsTable__AprCell">
            {dayData && (maxPotentialAPR !== 0 || currentAPR !== 0)
              ? (
                <div className="VaultsTable__AprWrapper">
                  <div className="VaultsTable__CurrentApr">{maxPotentialAPR ?? currentAPR}%</div>
                </div>
              )
              : "-"}
          </span>
        )
      }
    },
    {
      label: 'Vol. 1d',
      key: 'vol1d',
      className: 'VaultsTable__Vol1dTd',
      sortable: true,
      sortValue: (row) => {
        return row.dayVolumeUSD || 0;
      },
      render: (row) => {
        return (
          <span className="VaultsTable__Vol1dCell">
            {row?.vaultDayData.items && row.vaultDayData.items.length > 0 && row.vaultDayData.items[0].volumeUSD1D !== "0"
              ? `$${formatNumber(row.vaultDayData.items[0].volumeUSD1D)}`
              : "-"}
          </span>
        )
      }
    },
    {
      label: 'Vol. 30d',
      key: 'vol30d',
      className: 'VaultsTable__Vol30dTd',
      sortable: true,
      sortValue: (row) => {
        return row.monthVolumeUSD || 0;
      },
      render: (row) => {
        return (
          <span className="VaultsTable__Vol30dCell">
            {row?.vaultDayData.items && row.vaultDayData.items.length > 0 && row.vaultDayData.items[0].volumeUSD30D !== "0"
              ? `$${formatNumber(row.vaultDayData.items[0].volumeUSD30D)}`
              : "-"}
          </span>
        )
      }
    },
    {
      label: 'Holdings',
      key: 'holdings',
      className: 'VaultsTable__HoldingsTd',
      sortable: true,
      sortValue: (row) => {
        if (!address) return 0;
        return calculateVaultHoldings(row);
      },
      render: (row) => {
        if (!address) {
          return <span className="VaultsTable__HoldingsCell">-</span>;
        }

        const holding = calculateVaultHoldings(row);
        return (
          <span className="VaultsTable__HoldingsCell">
            ${formatNumber(holding)}
          </span>
        );
      }
    },
  ];

  return (
    <Table
      columns={columns}
      data={filteredVaults}
      isLoading={isLoading}
      tableClassName="Table Table--bordered"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      defaultSortKey="tvl"
      defaultSortDirection="desc"
      onRowClick={handleRowClick}
    />
  )
}
