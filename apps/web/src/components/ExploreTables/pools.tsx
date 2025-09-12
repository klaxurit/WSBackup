import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { ExplorerIcon } from "../SVGs";
import { Link } from "react-router-dom";
import { formatNumber } from "../../utils/formatNumber";
import { useMemo, useState } from "react";


interface PoolsTableProps {
  searchValue: string
}

const BL = [
  "0xc06aD7fF55D1d53Ed9371C17eDC557C9E1A06B2E".toLowerCase() // WETH-USDC.e 0.05%
]

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
        logoUri
      }
      token1Ref {
        id
        name
        symbol
        logoUri
      }
      totalValueLockedBERA
      totalValueLockedUSD
      volumeUSD
    }
  }
  }`

export const PoolsTable = ({ searchValue }: PoolsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fonction utilitaire pour trier les pools par TVL
  const sortPoolsByTvl = (pools: any[]) => {
    return [...pools].sort((a, b) => {
      const tvlA = parseFloat(a.totalValueLockedUSD || '0');
      const tvlB = parseFloat(b.totalValueLockedUSD || '0');
      return tvlB - tvlA; // Décroissant
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['poolStats', currentPage, searchValue],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_POOL_STATS
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.pools;
    }

  });

  const pools = useMemo(() => {
    if (!data?.items) return [];
    const approvedpools = data.items.filter((p: any) => !BL.includes(p.id))
    // Filtrage par recherche
    let filteredPools = approvedpools;
    if (searchValue && searchValue.trim() !== '') {
      filteredPools = approvedpools.filter((pool: any) =>
        (pool.id && pool.id.toLowerCase().includes(searchValue.toLowerCase())) ||
        (pool.token0Ref?.symbol && pool.token0Ref.symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
        (pool.token1Ref?.symbol && pool.token1Ref.symbol.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }

    // Tri par TVL (décroissant) avant la pagination
    const sortedPools = sortPoolsByTvl(filteredPools);

    // Pagination côté client
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return sortedPools.slice(startIndex, endIndex);
  }, [data, searchValue, currentPage, itemsPerPage]);

  const pagination = useMemo(() => {
    if (!data) return undefined;

    // Filtrage pour calculer le total
    let filteredPools = data.items;
    if (searchValue && searchValue.trim() !== '') {
      filteredPools = data.items.filter((pool: any) =>
        (pool.id && pool.id.toLowerCase().includes(searchValue.toLowerCase())) ||
        (pool.token0Ref?.symbol && pool.token0Ref.symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
        (pool.token1Ref?.symbol && pool.token1Ref.symbol.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }

    // Tri par TVL (décroissant) pour le calcul de pagination
    const sortedPools = sortPoolsByTvl(filteredPools);

    const totalPages = Math.ceil(sortedPools.length / itemsPerPage);

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems: sortedPools.length,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      onPageChange: setCurrentPage,
      dataname: "pools"
    };
  }, [data, searchValue, currentPage, itemsPerPage]);

  const columns: TableColumn[] = [
    {
      label: '#',
      key: 'index',
      className: 'PoolsTable__IndexTd',
      render: (row) => (
        <span className="PoolsTable__IndexCell">
          <Link
            to={`/pool/${row.id || ''}`}
            className="PoolsTable__IndexLink"
          >
            <span className="Table__Address">
              {row.token0Ref.symbol}/{row.token1Ref.symbol}
            </span>
          </Link>
          <a
            href={`https://berascan.com/address/${row.id || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="Table__Icon"
            title={row.id || ''}
          >
            <ExplorerIcon />
          </a>
        </span>
      )
    },
    {
      label: 'Pool',
      key: 'pool',
      className: 'PoolsTable__PoolTd',
      sortable: true,
      sortValue: (row) => `${row.token0Ref.symbol}/${row.token1Ref.symbol}`,
      render: (row) => (
        <span className="PoolsTable__PoolCell">
          <span className="PoolsTable__LogoWrapper">
            <TokenPairLogos
              token0={{ id: row.token0Ref.id, address: row.token0Ref.id, logoUri: row.token0Ref.logoUri, symbol: row.token0Ref.symbol }}
              token1={{ id: row.token1Ref.id, address: row.token1Ref.id, logoUri: row.token1Ref.logoUri, symbol: row.token1Ref.symbol }}
              borderWidth={2}
              separatorWidth={1.5}
              size={28}
            />
          </span>
          <span className="PoolsTable__PoolName">{row.pool}</span>

        </span>
      )
    },
    {
      label: 'Fee Tier',
      key: 'fee',
      className: 'PoolsTable__FeeTd',
      sortable: true,
      sortValue: (row) => row.feeTier,
      render: (row) => (
        <span className="PoolsTable__FeeCell">
          {`${row.feeTier / 10000}%`}
        </span>
      )
    },
    {
      label: 'TVL',
      key: 'tvl',
      className: 'PoolsTable__TvlTd',
      sortable: true,
      sortValue: (row) => {
        return row.totalValueLockedUSD
      },
      render: (row) => {
        return (
          <span className="PoolsTable__TvlCell">
            {row.totalValueLockedUSD !== 0
              ? `$${formatNumber(Number(row.totalValueLockedUSD))}`
              : "-"}
          </span>
        )
      }
    },
    {
      label: 'Pool APR',
      key: 'apr',
      className: 'PoolsTable__AprTd',
      sortable: true,
      sortValue: (row) => {
        return row.poolDayData?.items?.[0]?.apr || "0";
      },
      render: (row) => {
        return (
          <span className="PoolsTable__AprCell">
            {row.poolDayData?.items?.length > 0 && Number(row.poolDayData.items[0].apr) > 0
              ? `${row.poolDayData.items[0].apr}%`
              : "-"}
          </span>
        )
      }
    },
    {
      label: 'BGT APR',
      key: 'bgtApr',
      className: 'PoolsTable__BgtAprTd',
      render: () => {
        return <span className="PoolsTable__BgtAprCell">-</span>
      }
    },
    {
      label: 'Vol. 1d',
      key: 'vol1d',
      className: 'PoolsTable__Vol1dTd',
      sortable: true,
      sortValue: (row) => {
        return row.poolDayData?.items?.[0]?.volumeUSD1D || 0;
      },
      render: (row) => {
        return (
          <span className="PoolsTable__Vol1dCell">
            {row.poolDayData?.items?.length > 0 && Number(row.poolDayData.items[0].volumeUSD1D) > 0
              ? `$${formatNumber(parseFloat(row.poolDayData.items[0].volumeUSD1D))}`
              : "-"}
          </span>
        )
      }
    },
    {
      label: 'Vol. 30d',
      key: 'vol30d',
      className: 'PoolsTable__Vol30dTd',
      sortable: true,
      sortValue: (row) => {
        return row.monthVolumeUSD
      },
      render: (row) => {
        return (
          <span className="PoolsTable__Vol30dCell">
            {row.poolDayData?.items?.length > 0 && Number(row.poolDayData.items[0].volumeUSD30D) > 0
              ? `$${formatNumber(parseFloat(row.poolDayData.items[0].volumeUSD30D))}`
              : "-"}
          </span>
        )
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
      pagination={pagination}
      itemLabel="pools"
    />
  )
}
