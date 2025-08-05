import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { ExplorerIcon } from "../SVGs";
import { Link } from "react-router-dom";
import { formatNumber } from "../../utils/formatNumber";
import { useMemo } from "react";

interface PoolsTableProps {
  searchValue: string
}

export const PoolsTable = ({ searchValue }: PoolsTableProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools`)
      if (!resp.ok) return []
      return resp.json()
    }
  });

  const pools = useMemo(() => {
    if (!data) return []
    if (!searchValue) return data.data;
    return data.data.filter((pool: any) =>
      (pool.pool && pool.pool.toLowerCase().includes(searchValue.toLowerCase())) ||
      (pool.address && pool.address.toLowerCase().includes(searchValue.toLowerCase())) ||
      (pool.token0?.symbol && pool.token0.symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
      (pool.token1?.symbol && pool.token1.symbol.toLowerCase().includes(searchValue.toLowerCase()))
    );
  }, [searchValue, data]);

  const columns: TableColumn[] = [
    {
      label: '#',
      key: 'index',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to={`/pool/${row.address}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <span className={`Table__Address`}>
              {row.token0.symbol + '/' + row.token1.symbol}
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
      label: 'Pool',
      key: 'pool',
      sortable: true,
      sortValue: (row) => `${row.token0.symbol}/${row.token1.symbol}`,
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <TokenPairLogos token0={row.token0} token1={row.token1} />
          <span style={{ fontWeight: 600 }}>{row.pool}</span>
        </span>
      )
    },
    {
      label: 'Fee Tier',
      key: 'fee',
      sortable: true,
      sortValue: (row) => row.fee,
      render: (row) => (`${row.fee / 10000}%`)
    },
    {
      label: 'TVL',
      key: 'tvl',
      sortable: true,
      sortValue: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].tvlUSD !== "0"
          ? parseFloat(row.PoolStatistic[0].tvlUSD)
          : 0;
      },
      render: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].tvlUSD !== "0"
          ? `$${formatNumber(parseFloat(row.PoolStatistic[0].tvlUSD))}`
          : "-"
      }
    },
    {
      label: 'Pool APR',
      key: 'apr',
      sortable: true,
      sortValue: (row) => {
        return row.PoolStatistic.length > 0 ? row.PoolStatistic[0].apr : 0;
      },
      render: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].apr !== 0
          ? `${row.PoolStatistic[0].apr.toFixed(2)}%`
          : "-"
      }
    },
    {
      label: 'BGT APR',
      key: 'bgtApr',
      render: () => {
        return "-"
      }
    },
    {
      label: 'Vol. 1d',
      key: 'vol1d',
      sortable: true,
      sortValue: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].volOneDay !== "0"
          ? parseFloat(row.PoolStatistic[0].volOneDay)
          : 0;
      },
      render: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].volOneDay !== "0"
          ? `$${formatNumber(parseFloat(row.PoolStatistic[0].volOneDay))}`
          : "-"
      }
    },
    {
      label: 'Vol. 30d',
      key: 'vol30d',
      sortable: true,
      sortValue: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].volOneMonth !== "0"
          ? parseFloat(row.PoolStatistic[0].volOneMonth)
          : 0;
      },
      render: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].volOneMonth !== "0"
          ? `$${formatNumber(parseFloat(row.PoolStatistic[0].volOneMonth))}`
          : "-"
      }
    },
  ];

  return (
    <Table
      columns={columns}
      data={pools}
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      defaultSortKey="tvl"
      defaultSortDirection="desc"
    />
  )
}
