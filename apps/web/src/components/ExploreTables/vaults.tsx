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

const BL = [
  "0xfe68ef4370be9977f006d0ecf9a3676c8bdd7303" // Sticky Vault WETH-USDC.e-0.05%
]

export const VaultsTable = ({ searchValue, vaults }: VaultsTableProps) => {
  const filteredVaults = useMemo(() => {
    const approvedVaults = vaults.filter((v: any) => !BL.includes(v.id))

    if (!searchValue) return approvedVaults
    return approvedVaults.filter((vault: any) =>
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
      isLoading={false}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      defaultSortKey="tvl"
      defaultSortDirection="desc"
    />
  )
}
