import Table, { type TableColumn } from "../Table/Table"
import { TokenPairLogos } from '../Common/TokenPairLogos';
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
  "0xfe68ef4370be9977f006d0ecf9a3676c8bdd7303", // Sticky Vault WETH-USDC.e-0.05%
  "0x01716554a6125db2e140e01a4dc6412813aaf048" // Sticky Vault WBTC-brBTC-0.01%
].map((address) => address.toLowerCase());

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


  const { balanceContracts, vaultIndexMap } = useMemo(() => {
    if (!address || !vaults || vaults.length === 0) {
      return { balanceContracts: [], vaultIndexMap: new Map() };
    }

    const contracts: any[] = [];
    const indexMap = new Map<string, { stickyIndex: number; totalSupplyIndex: number; autoWinIndex?: number }>();

    vaults.forEach((vault: any) => {
      const vaultId = vault.id.toLowerCase();
      const stickyIndex = contracts.length;

      contracts.push({
        address: vault.id as Address,
        abi: StickyVaultWithRouter,
        functionName: 'balanceOf',
        args: [address],
      });

      const totalSupplyIndex = contracts.length;

      contracts.push({
        address: vault.id as Address,
        abi: StickyVaultWithRouter,
        functionName: 'totalSupply',
      });

      let autoWinIndex: number | undefined;

      if (vault.autoWinVault && vault.autoWinVault !== '0x0000000000000000000000000000000000000000') {
        autoWinIndex = contracts.length;
        contracts.push({
          address: vault.autoWinVault as Address,
          abi: AutowinABI,
          functionName: 'balanceOf',
          args: [address],
        });
      }

      indexMap.set(vaultId, { stickyIndex, totalSupplyIndex, autoWinIndex });
    });

    return { balanceContracts: contracts, vaultIndexMap: indexMap };
  }, [address, vaults]);

  const { data: balancesData } = useReadContracts({
    contracts: balanceContracts,
    query: {
      enabled: !!address && balanceContracts.length > 0,
      staleTime: 30000,
    }
  });

  const { convertContracts, convertIndexMap } = useMemo(() => {
    if (!balancesData || !address || !vaults || vaults.length === 0 || vaultIndexMap.size === 0) {
      return { convertContracts: [], convertIndexMap: new Map() };
    }

    const contracts: any[] = [];
    const indexMap = new Map<string, number>();

    vaults.forEach((vault: any) => {
      const vaultId = vault.id.toLowerCase();
      const indices = vaultIndexMap.get(vaultId);

      if (!indices || indices.autoWinIndex === undefined) return;

      const autoWinBalance = balancesData[indices.autoWinIndex]?.result as bigint | undefined;

      if (autoWinBalance && autoWinBalance > 0n) {
        indexMap.set(vaultId, contracts.length);
        contracts.push({
          address: vault.autoWinVault as Address,
          abi: AutowinABI,
          functionName: 'convertToAssets' as const,
          args: [autoWinBalance],
        });
      }
    });

    return { convertContracts: contracts, convertIndexMap: indexMap };
  }, [balancesData, address, vaults, vaultIndexMap]);

  const { data: convertData } = useReadContracts({
    contracts: convertContracts,
    query: {
      enabled: convertContracts.length > 0,
      staleTime: 30000,
    },
  });

  const getVaultHolding = useMemo(() => {
    return (vaultId: string): number => {
      if (!address || !vaults || !balancesData || vaultIndexMap.size === 0) return 0;

      const vaultIdLower = vaultId.toLowerCase();

      const indices = vaultIndexMap.get(vaultIdLower);
      if (!indices) return 0;

      const vault = vaults.find((v: any) => v.id.toLowerCase() === vaultIdLower);
      if (!vault) return 0;

      const tvl = parseFloat(vault.totalValueLockedUSD || '0');


      const stickyBalance = balancesData[indices.stickyIndex]?.result as bigint | undefined;
      const stickyTotalSupply = balancesData[indices.totalSupplyIndex]?.result as bigint | undefined;
      const autoWinBalance = indices.autoWinIndex !== undefined
        ? balancesData[indices.autoWinIndex]?.result as bigint | undefined
        : undefined;

      let total = 0;

      // Sticky value (formule de useStickyVaultBalance)
      if (stickyBalance && stickyBalance > 0n && stickyTotalSupply && stickyTotalSupply > 0n) {
        const sharesDecimal = parseFloat(formatUnits(stickyBalance, 18));
        const totalSupplyDecimal = parseFloat(formatUnits(stickyTotalSupply, 18));
        const proportion = sharesDecimal / totalSupplyDecimal;
        total += proportion * tvl;
      }


      if (autoWinBalance && autoWinBalance > 0n && stickyTotalSupply && stickyTotalSupply > 0n) {
        const convertIndex = convertIndexMap.get(vaultIdLower);

        if (convertIndex !== undefined && convertData && convertData[convertIndex]) {
          const convertedAssets = convertData[convertIndex]?.result as bigint | undefined;

          if (convertedAssets) {
            const assetsDecimal = parseFloat(formatUnits(convertedAssets, 18));
            const totalSupplyDecimal = parseFloat(formatUnits(stickyTotalSupply, 18));
            const proportion = assetsDecimal / totalSupplyDecimal;
            total += proportion * tvl;
          }
        }
      }

      return total;
    };
  }, [address, vaults, balancesData, convertData, vaultIndexMap, convertIndexMap]);

  const filteredVaults = useMemo(() => {
    if (!vaults) return []
    const approvedVaults = vaults.filter((v: any) => !BL.includes((v.id as string).toLowerCase()))

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
        return getVaultHolding(row.id);
      },
      render: (row) => {
        if (!address) {
          return <span className="VaultsTable__HoldingsCell">-</span>;
        }

        const holding = getVaultHolding(row.id);
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
