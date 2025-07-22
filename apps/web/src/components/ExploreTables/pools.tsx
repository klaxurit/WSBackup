import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { formatEther } from "viem";
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { ExplorerIcon } from "../SVGs";
import { Link, useLocation } from "react-router-dom";

interface PoolsTableProps {
  data?: any[];
  isLoading?: boolean;
}

export const PoolsTable = ({ data, isLoading }: PoolsTableProps) => {
  const query = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools`)
      if (!resp.ok) return []
      return resp.json()
    }
  });
  const pools = data ?? query.data ?? [];
  const loading = isLoading ?? query.isLoading;

  const columns: TableColumn[] = [
    {
      label: '#', key: 'index', render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link className={`Table__Address`} to="/pools/create">
            {row.token0.symbol + '/' + row.token1.symbol}
          </Link>
          <a
            href={`https://beratrail.io/address/${row.address}`}
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
      label: 'Pool', key: 'pool', render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <TokenPairLogos token0={row.token0} token1={row.token1} />
          <span style={{ fontWeight: 600 }}>{row.pool}</span>
        </span>
      )
    },
    { label: 'Fee Tier', key: 'fee', render: (row) => (`${row.fee / 10000}%`) },
    {
      label: 'TVL', key: 'tvl', render: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].tvlUSD !== "0"
          ? `$${parseInt(row.PoolStatistic[0].tvlUSD).toFixed(2)}`
          : "-"
      }
    },
    {
      label: 'Pool APR', key: 'apr', render: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].apr !== 0
          ? `${row.PoolStatistic[0].apr}%`
          : "-"
      }
    },
    {
      label: 'Vol. 1d', key: 'vol1d', render: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].volOneDay !== "0"
          ? `$${parseFloat(formatEther(row.PoolStatistic[0].volOneDay)).toFixed(2)}`
          : "-"
      }
    },
    {
      label: 'Vol. 30d', key: 'vol30d', render: (row) => {
        return row.PoolStatistic.length > 0 && row.PoolStatistic[0].volOneMonth !== "0"
          ? `$${parseFloat(formatEther(BigInt(row.PoolStatistic[0].volOneMonth))).toFixed(2)}`
          : "-"
      }
    },
    // { label: 'Vol. 1d/TVL', key: 'vol1dTvl' },
  ];

  return (
    <Table
      columns={columns}
      data={pools}
      isLoading={loading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
    />
  )
}
