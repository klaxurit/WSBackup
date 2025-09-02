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

const GET_POOL_STATS = `
  query GetPoolsStats {
    pools {
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
      }
      token1Ref {
        id
        name
        symbol
      }
      totalValueLockedBERA
      totalValueLockedUSD
      volumeUSD
    }
  }
  }`

export const PoolsTable = ({ searchValue }: PoolsTableProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['poolStats'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: GET_POOL_STATS }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.pools;
    }

  });

  const pools = useMemo(() => {
    if (!data) return []
    // Normalement il n'y a plus besoin de ce useMemo, il faut passer toutes les params de paginations 
    // et de searchValue dans la requête au dessus et il retournera seulement les resultats paginé
    if (!searchValue) return data.items
    return data.items.filter((pool: any) =>
      (pool.id && pool.id.toLowerCase().includes(searchValue.toLowerCase())) ||
      (pool.token0Ref?.symbol && pool.token0Ref.symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
      (pool.token1Ref?.symbol && pool.token1Ref.symbol.toLowerCase().includes(searchValue.toLowerCase()))
    );
  }, [searchValue, data]);

  const columns: TableColumn[] = [
    {
      label: '#',
      key: 'index',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link
            to={`/pool/${row.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <span className={`Table__Address`}>
              {row.token0Ref.symbol}/{row.token1Ref.symbol}
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
      label: 'Pool',
      key: 'pool',
      sortable: true,
      sortValue: (row) => `${row.token0Ref.symbol}/${row.token1Ref.symbol}`,
      render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <TokenPairLogos
            token0={{ address: row.token0Ref.id, logoUri: row.token0Ref.logoUri, symbol: row.token0Ref.symbol }}
            token1={{ address: row.token1Ref.id, logoUri: row.token1Ref.logoUri, symbol: row.token1Ref.symbol }}
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
      sortValue: (row) => row.feeTier,
      render: (row) => (`${row.feeTier / 10000}%`)
    },
    {
      label: 'TVL',
      key: 'tvl',
      sortable: true,
      sortValue: (row) => {
        return row.totalValueLockedUSD
      },
      render: (row) => {
        return row.totalValueLockedUSD !== 0
          ? `$${formatNumber(Number(row.totalValueLockedUSD))}`
          : "-"
      }
    },
    {
      label: 'Pool APR',
      key: 'apr',
      sortable: true,
      sortValue: (row) => {
        return row.poolDayData.items[0]?.apr || "0";
      },
      render: (row) => {
        return row.poolDayData.items.length > 0 && Number(row.poolDayData.items[0].apr) > 0
          ? `${row.poolDayData.items[0].apr}%`
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
        return row.poolDayData.items[0]?.volumeUSD1D || 0;
      },
      render: (row) => {
        return row.poolDayData.items.length > 0 && Number(row.poolDayData.items[0].volumeUSD1D) > 0
          ? `$${formatNumber(parseFloat(row.poolDayData.items[0].volumeUSD1D))}`
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
        return row.poolDayData.items.length > 0 && Number(row.poolDayData.items[0].volumeUSD30D) > 0
          ? `$${formatNumber(parseFloat(row.poolDayData.items[0].volumeUSD30D))}`
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
