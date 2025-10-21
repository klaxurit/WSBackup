import Table, { type TableColumn } from "../Table/Table"
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { ExplorerLink } from '../Common/ExplorerLink';
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../utils/formatNumber";
import { useMemo } from "react";
import { useQuery } from '@tanstack/react-query';

interface VaultsTableProps {
  searchValue: string
}

const GET_STICKYVAULTS = `
  query GetStickyVaults {
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

  const { data: vaults, isLoading } = useQuery({
    queryKey: ['stickyVaults'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_STICKYVAULTS }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.stickyVaults.items
    }
  });

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
      label: '#',
      key: 'index',
      className: 'VaultsTable__IndexTd',
      render: (row) => (
        <span className="VaultsTable__IndexCell">
          <span className="Table__Address">
            {row.poolRef.token0Ref.symbol}/{row.poolRef.token1Ref.symbol}
          </span>
          <ExplorerLink address={row.id} />
        </span>
      )
    },
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
          <span className="VaultsTable__VaultName">{row?.name ? row.name : `${row.poolRef.token0Ref.symbol}/${row.poolRef.token1Ref.symbol}`}</span>
        </span>
      )
    },
    {
      label: 'Strategy',
      key: 'strategy',
      className: 'VaultsTable__StrategyTd',
      sortable: true,
      sortValue: (row) => row.strategy || 'Auto-Win',
      render: (row) => (
        <span className="VaultsTable__StrategyCell">
          <span className="VaultsTable__StrategyBadge">
            {row.strategy || 'Auto-Win'}
          </span>
        </span>
      )
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
  ];

  return (
    <Table
      columns={columns}
      data={filteredVaults}
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      defaultSortKey="tvl"
      defaultSortDirection="desc"
      onRowClick={handleRowClick}
    />
  )
}
