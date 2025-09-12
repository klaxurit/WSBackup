import Table, { type TableColumn } from "../Table/Table"
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { ExplorerIcon } from "../SVGs";
import { Link } from "react-router-dom";
import { formatNumber } from "../../utils/formatNumber";
import { useMemo } from "react";

interface VaultsTableProps {
  vaults: any
  searchValue: string
}

export const VaultsTable = ({ searchValue, vaults }: VaultsTableProps) => {
  const filteredVaults = useMemo(() => {
    if (!searchValue) return vaults
    return vaults.filter((vault: any) =>
      (vault.id && vault.id.toLowerCase().includes(searchValue.toLowerCase())) ||
      (vault.poolRef.token0Ref.symbol && vault.poolRef.token0Ref.symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
      (vault.poolRef.token1Ref.symbol && vault.poolRef.token1Ref.symbol.toLowerCase().includes(searchValue.toLowerCase()))
    );
  }, [searchValue]);

  const columns: TableColumn[] = [
    {
      label: '#',
      key: 'index',
      className: 'VaultsTable__IndexTd',
      render: (row) => (
        <span className="VaultsTable__IndexCell">
          <Link
            to={`/vaults/${row.id}`}
            className="VaultsTable__IndexLink"
          >
            <span className="Table__Address">
              {row.poolRef.token0Ref.symbol}/{row.poolRef.token1Ref.symbol}
            </span>
          </Link>
          <a
            href={`https://berascan.com/address/${row.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="Table__Icon"
            title={row.id}
          >
            <ExplorerIcon />
          </a>
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
      sortValue: (row) => row.strategy || 'Auto-Compound',
      render: (row) => (
        <span className="VaultsTable__StrategyCell">
          <span className="VaultsTable__StrategyBadge">
            {row.strategy || 'Auto-Compound'}
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
        return (
          <span className="VaultsTable__AprCell">
            {row?.vaultDayData.items && row.vaultDayData.items.length > 0 && row.vaultDayData.items[0].apr !== 0
              ? `${row.vaultDayData.items[0].apr}%`
              : "-"}
          </span>
        )
      }
    },
    // {
    //   label: 'Fees APR',
    //   key: 'feesApr',
    //   className: 'VaultsTable__FeesAprTd',
    //   sortable: true,
    //   sortValue: (row) => {
    //     return row?.feesApr || 0;
    //   },
    //   render: (row) => {
    //     return (
    //       <span className="VaultsTable__FeesAprCell">
    //         {row?.feesApr && row.feesApr !== 0
    //           ? `${row.feesApr.toFixed(2)}%`
    //           : "-"}
    //       </span>
    //     )
    //   }
    // },
    // {
    //   label: 'Rewards APR',
    //   key: 'rewardsApr',
    //   className: 'VaultsTable__RewardsAprTd',
    //   sortable: true,
    //   sortValue: (row) => {
    //     return row?.rewardsApr || 0;
    //   },
    //   render: (row) => {
    //     return (
    //       <span className="VaultsTable__RewardsAprCell">
    //         {row?.rewardsApr && row.rewardsApr !== 0
    //           ? `${row.rewardsApr.toFixed(2)}%`
    //           : "-"}
    //       </span>
    //     )
    //   }
    // },
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
      isLoading={false}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      defaultSortKey="tvl"
      defaultSortDirection="desc"
    />
  )
}
