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
    queryKey: ['poolStats'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/pool`)
      if (!resp.ok) return { data: [] }
      return resp.json()
    }
  });

  const pools = useMemo(() => {
    if (!data) return []
    // Normalement il n'y a plus besoin de ce useMemo, il faut passer toutes les params de paginations 
    // et de searchValue dans la requête au dessus et il retournera seulement les resultats paginé
    if (!searchValue) return data.data
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
            to={`/pools/${row.address}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <span className={`Table__Address`}>
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
      label: 'Pool',
      key: 'pool',
      sortable: true,
      sortValue: (row) => `${row.token0Symbol}/${row.token1Symbol}`,
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <TokenPairLogos
            token0={{ address: row.token0Address, logoUri: row.token0LogoUri, symbol: row.token0Symbol }}
            token1={{ address: row.token1Address, logoUri: row.token1LogoUri, symbol: row.token1Symbol }}
            borderWidth={3}
            separatorWidth={2.5}
          />
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
        return row.tvlUSD
      },
      render: (row) => {
        return row.tvlUSD !== 0
          ? `$${formatNumber(row.tvlUSD)}`
          : "-"
      }
    },
    {
      label: 'Pool APR',
      key: 'apr',
      sortable: true,
      sortValue: (row) => {
        return row.apr;
      },
      render: (row) => {
        return row.apr !== 0
          ? `${row.apr.toFixed(2)}%`
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
        return row.dayVolumeUSD !== 0
          ? row.dayVolumeUSD
          : 0;
      },
      render: (row) => {
        return row.dayVolumeUSD !== 0
          ? `$${formatNumber(row.dayVolumeUSD)}`
          : "-"
      }
    },
    {
      label: 'Vol. 30d',
      key: 'vol30d',
      sortable: true,
      sortValue: (row) => {
        return row.monthVolumeUSD
      },
      render: (row) => {
        return row.monthVolumeUSD !== 0
          ? `$${formatNumber(row.monthVolumeUSD)}`
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
