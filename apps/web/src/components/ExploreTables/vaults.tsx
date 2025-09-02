import Table, { type TableColumn } from "../Table/Table"
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { ExplorerIcon } from "../SVGs";
import { Link } from "react-router-dom";
import { formatNumber } from "../../utils/formatNumber";
import { useMemo } from "react";

interface VaultsTableProps {
  searchValue: string
}

// Mock data for vaults
const MOCK_VAULTS = [
  {
    address: '0x2345678901234567890123456789012345678901',
    name: 'WBERA/HONEY',
    token0Address: '0x6969696969696969696969696969696969696969',
    token1Address: '0x1111111111111111111111111111111111111111',
    token0Symbol: 'WBERA',
    token1Symbol: 'USDC',
    token0LogoUri: '/tokens/wbera.png',
    token1LogoUri: 'https://res.cloudinary.com/duv0g402y/raw/upload/v1717773645/src/assets/honey.png',
    strategy: 'Stable Range',
    tvlUSD: 850000,
    apr: 12.3,
    feesApr: 6.8,
    rewardsApr: 5.5,
    dayVolumeUSD: 32000,
    monthVolumeUSD: 950000
  }
];

export const VaultsTable = ({ searchValue }: VaultsTableProps) => {
  const vaults = useMemo(() => {
    if (!searchValue) return MOCK_VAULTS
    return MOCK_VAULTS.filter((vault: any) =>
      (vault.name && vault.name.toLowerCase().includes(searchValue.toLowerCase())) ||
      (vault.address && vault.address.toLowerCase().includes(searchValue.toLowerCase())) ||
      (vault.token0Symbol && vault.token0Symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
      (vault.token1Symbol && vault.token1Symbol.toLowerCase().includes(searchValue.toLowerCase()))
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
            to={`/vaults/${row.address}`}
            className="VaultsTable__IndexLink"
          >
            <span className="Table__Address">
              {row.token0Symbol}/{row.token1Symbol}
            </span>
          </Link>
          <a
            href={`https://berascan.com/address/${row.address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="Table__Icon"
            title={row.address}
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
      sortValue: (row) => `${row.token0Symbol}/${row.token1Symbol}`,
      render: (row) => (
        <span className="VaultsTable__VaultCell">
          <span className="VaultsTable__LogoWrapper">
            <TokenPairLogos
              token0={{ address: row.token0Address, logoUri: row.token0LogoUri, symbol: row.token0Symbol }}
              token1={{ address: row.token1Address, logoUri: row.token1LogoUri, symbol: row.token1Symbol }}
              borderWidth={2}
              separatorWidth={1.5}
              size={28}
            />
          </span>
          <span className="VaultsTable__VaultName">{row.name || `${row.token0Symbol}/${row.token1Symbol}`}</span>
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
        return row.tvlUSD || 0
      },
      render: (row) => {
        return (
          <span className="VaultsTable__TvlCell">
            {row.tvlUSD !== 0
              ? `$${formatNumber(row.tvlUSD)}`
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
        return row.apr || 0;
      },
      render: (row) => {
        return (
          <span className="VaultsTable__AprCell">
            {row.apr !== 0
              ? `${row.apr.toFixed(2)}%`
              : "-"}
          </span>
        )
      }
    },
    {
      label: 'Fees APR',
      key: 'feesApr',
      className: 'VaultsTable__FeesAprTd',
      sortable: true,
      sortValue: (row) => {
        return row.feesApr || 0;
      },
      render: (row) => {
        return (
          <span className="VaultsTable__FeesAprCell">
            {row.feesApr !== 0
              ? `${row.feesApr.toFixed(2)}%`
              : "-"}
          </span>
        )
      }
    },
    {
      label: 'Rewards APR',
      key: 'rewardsApr',
      className: 'VaultsTable__RewardsAprTd',
      sortable: true,
      sortValue: (row) => {
        return row.rewardsApr || 0;
      },
      render: (row) => {
        return (
          <span className="VaultsTable__RewardsAprCell">
            {row.rewardsApr !== 0
              ? `${row.rewardsApr.toFixed(2)}%`
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
            {row.dayVolumeUSD !== 0
              ? `$${formatNumber(row.dayVolumeUSD)}`
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
            {row.monthVolumeUSD !== 0
              ? `$${formatNumber(row.monthVolumeUSD)}`
              : "-"}
          </span>
        )
      }
    },
  ];

  return (
    <Table
      columns={columns}
      data={vaults}
      isLoading={false}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      defaultSortKey="tvl"
      defaultSortDirection="desc"
    />
  )
}
