import { useInfiniteQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../utils/formatNumber";
import { useMemo, useState } from "react";
import { usePositionsGraphQL } from '../../hooks/usePositionsGraphQL';
import { useAccount } from 'wagmi';
import { Pool as PoolV3, Position as PositionV3 } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { currentChain } from "../../config/wagmi";


interface PoolsTableProps {
  searchValue: string
}

const BL = [
  "0xc06aD7fF55D1d53Ed9371C17eDC557C9E1A06B2E".toLowerCase() // WETH-USDC.e 0.05%
]

const GET_POOLS_STATS = `
  query GetPoolsStats($limit: Int!, $after: String, $orderBy: String!, $orderDirection: String!) {
    pools(
      limit: $limit
      after: $after
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
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
            activeRangeAPR
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

// Configuration des champs triables
const SORT_CONFIG = {
  // Champs triables côté serveur (champs directs de la table pool)
  SERVER_SORTABLE: {
    'tvl': 'totalValueLockedUSD',
    'fee': 'feeTier',
    'pool': 'totalValueLockedUSD',
    // Ajout d'autres champs directs si nécessaire
  },
  // Champs nécessitant un tri côté client (champs de relations)
  CLIENT_SORTABLE: {
    'apr_global': (pool: any) => {
      const latestDayData = pool.poolDayData?.items?.[0];
      return parseFloat(latestDayData?.apr || '0');
    },
    'vol1d': (pool: any) => {
      const latestDayData = pool.poolDayData?.items?.[0];
      return parseFloat(latestDayData?.volumeUSD1D || '0');
    },
    'vol30d': (pool: any) => {
      const latestDayData = pool.poolDayData?.items?.[0];
      return parseFloat(latestDayData?.volumeUSD30D || '0');
    }
  }
};

export const PoolsTable = ({ searchValue }: PoolsTableProps) => {
  const itemsPerPage = 20;
  const navigate = useNavigate();
  const { address } = useAccount();
  const { positions } = usePositionsGraphQL();
  const getPoolHolding = useMemo(() => {
    return (poolId: string): number => {
      if (!address || !positions || positions.length === 0) return 0;

      const poolPositions = positions.filter((pos: any) =>
        pos.pool.address.toLowerCase() === poolId.toLowerCase()
      );

      if (poolPositions.length === 0) return 0;

      return poolPositions.reduce((total: number, posData: any) => {
        try {
          const position = posData.position;
          const pool = posData.pool;

          const liquidity = BigInt(position.liquidity || '0');
          if (liquidity === 0n) return total;

          const token0 = new Token(
            currentChain.id,
            pool.token0.address,
            pool.token0.decimals,
            pool.token0.symbol,
            pool.token0.name
          );
          const token1 = new Token(
            currentChain.id,
            pool.token1.address,
            pool.token1.decimals,
            pool.token1.symbol,
            pool.token1.name
          );

          const sdkPool = new PoolV3(
            token0,
            token1,
            pool.fee * 10000,
            pool.sqrtPriceX96,
            pool.liquidity,
            pool.tick
          );

          const sdkPosition = new PositionV3({
            pool: sdkPool,
            tickLower: position.tickLower,
            tickUpper: position.tickUpper,
            liquidity: liquidity.toString()
          });

          const t0Price = pool.token0?.TokenPrice?.[0]?.price || 0;
          const t1Price = pool.token1?.TokenPrice?.[0]?.price || 0;
          const amount0 = parseFloat(sdkPosition.amount0.toExact());
          const amount1 = parseFloat(sdkPosition.amount1.toExact());
          const t0Usd = amount0 * t0Price;
          const t1Usd = amount1 * t1Price;
          const posValueUSD = t0Usd + t1Usd;

          return total + posValueUSD;
        } catch (error) {
          console.warn('Error calculating position value with SDK:', error);
          return total;
        }
      }, 0);
    };
  }, [address, positions]);

  // État pour gérer le mode de tri
  const [sortMode, setSortMode] = useState<'server' | 'client'>('server');

  // État pour gérer le tri côté serveur
  const [serverSort, setServerSort] = useState({
    field: 'totalValueLockedUSD',
    direction: 'desc' as 'asc' | 'desc'
  });

  // État pour gérer le tri côté client
  const [clientSort, setClientSort] = useState<{
    key: string;
    direction: 'asc' | 'desc';
    sortFn: (pool: any) => number;
  } | null>(null);

  const defaultSortKey = 'tvl';

  const isSearching = searchValue && searchValue.trim() !== '';

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: ['poolStats', searchValue, sortMode, serverSort.field, serverSort.direction, clientSort?.key, clientSort?.direction],
    queryFn: async ({ pageParam }) => {
      const limit = (sortMode === 'client' || isSearching) ? 1000 : itemsPerPage;
      const after = (sortMode === 'client' || isSearching) ? null : (pageParam || null);

      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_POOLS_STATS,
          variables: {
            limit,
            after,
            orderBy: serverSort.field,
            orderDirection: serverSort.direction
          }
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.pools;
    },
    getNextPageParam: (lastPage) => {
      if (sortMode === 'client' || isSearching) return undefined;

      return lastPage?.pageInfo?.hasNextPage ? lastPage.pageInfo.endCursor : undefined;
    },
    initialPageParam: null,
    staleTime: 30000,
  });

  const pools = useMemo(() => {
    if (!data?.pages) return [];

    let allPools = data.pages.flatMap(page => page.items || []);

    allPools = allPools.filter((p: any) => !BL.includes(p.id.toLowerCase()));

    if (isSearching) {
      const searchLower = searchValue.toLowerCase();
      allPools = allPools.filter((pool: any) =>
        (pool.id && pool.id.toLowerCase().includes(searchLower)) ||
        (pool.token0Ref?.symbol && pool.token0Ref.symbol.toLowerCase().includes(searchLower)) ||
        (pool.token1Ref?.symbol && pool.token1Ref.symbol.toLowerCase().includes(searchLower)) ||
        (pool.token0Ref?.name && pool.token0Ref.name.toLowerCase().includes(searchLower)) ||
        (pool.token1Ref?.name && pool.token1Ref.name.toLowerCase().includes(searchLower))
      );
    }

    if (sortMode === 'client' && clientSort) {
      allPools = [...allPools].sort((a, b) => {
        const aValue = clientSort.sortFn(a);
        const bValue = clientSort.sortFn(b);

        if (clientSort.direction === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    if (isSearching) {
      return allPools;
    }

    if (sortMode === 'client') {
      return allPools;
    }

    return allPools;
  }, [data, searchValue, isSearching, sortMode, clientSort]);

  const getCurrentSortKey = (): string => {
    if (sortMode === 'client' && clientSort) {
      return clientSort.key;
    }

    for (const [tableKey, gqlField] of Object.entries(SORT_CONFIG.SERVER_SORTABLE)) {
      if (gqlField === serverSort.field) return tableKey;
    }
    return 'tvl';
  };

  const getCurrentSortDirection = (): 'asc' | 'desc' => {
    if (sortMode === 'client' && clientSort) {
      return clientSort.direction;
    }
    return serverSort.direction;
  };

  const handleSort = (columnKey: string, direction: 'asc' | 'desc' | null) => {
    const sortDirection = direction || 'desc';

    // Cas spécial pour Holdings - tri côté client avec accès au hook
    if (columnKey === 'holdings') {
      setSortMode('client');
      setClientSort({
        key: columnKey,
        direction: sortDirection,
        sortFn: (pool: any) => getPoolHolding(pool.id)
      });
      setServerSort({
        field: 'totalValueLockedUSD',
        direction: 'desc'
      });
      return;
    }

    const serverField = SORT_CONFIG.SERVER_SORTABLE[columnKey as keyof typeof SORT_CONFIG.SERVER_SORTABLE];
    if (serverField) {
      setSortMode('server');
      setClientSort(null);
      setServerSort({
        field: serverField,
        direction: sortDirection
      });
    }
    else {
      const clientSortFn = SORT_CONFIG.CLIENT_SORTABLE[columnKey as keyof typeof SORT_CONFIG.CLIENT_SORTABLE];
      if (clientSortFn) {
        setSortMode('client');
        setClientSort({
          key: columnKey,
          direction: sortDirection,
          sortFn: clientSortFn
        });
        setServerSort({
          field: 'totalValueLockedUSD',
          direction: 'desc'
        });
      } else {
        setSortMode('server');
        setClientSort(null);
        setServerSort({
          field: 'totalValueLockedUSD',
          direction: sortDirection
        });
      }
    }
  };

  const infiniteLoadProps = useMemo(() => {
    if (!data?.pages?.length) return undefined;

    const firstPage = data.pages[0];

    const canLoadMore = sortMode === 'server' && !isSearching && !!hasNextPage;

    return {
      hasNextPage: canLoadMore,
      isFetchingNextPage: sortMode === 'server' && !isSearching ? isFetchingNextPage : false,
      onLoadMore: canLoadMore ? fetchNextPage : () => { },
      totalItems: firstPage?.totalCount || 0,
      currentItems: pools.length,
      itemLabel: "pools",
      onSort: handleSort,
      currentSortKey: getCurrentSortKey(),
      currentSortDirection: getCurrentSortDirection()
    };
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage, pools.length, sortMode, isSearching, serverSort, clientSort]);

  const columns: TableColumn[] = [
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
          <span className="PoolsTable__PoolName">
            {row.token0Ref.symbol}/{row.token1Ref.symbol}
          </span>
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
    // {
    //   label: 'Active APR',
    //   key: 'apr_active',
    //   className: 'PoolsTable__AprTd',
    //   sortable: true,
    //   sortValue: (row) => {
    //     return row.poolDayData?.items?.[0]?.activeRangeAPR || "0";
    //   },
    //   render: (row) => {
    //     return (
    //       <span className="PoolsTable__AprCell">
    //         {row.poolDayData?.items?.length > 0 && Number(row.poolDayData.items[0].activeRangeAPR) > 0
    //           ? `${row.poolDayData.items[0].activeRangeAPR}%`
    //           : "-"}
    //       </span>
    //     )
    //   }
    // },
    {
      label: 'APR',
      key: 'apr_global',
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
    {
      label: 'Holdings',
      key: 'holdings',
      className: 'PoolsTable__HoldingsTd',
      sortable: true,
      sortValue: (row) => {
        if (!address) return 0;
        return getPoolHolding(row.id);
      },
      render: (row) => {
        if (!address) {
          return <span className="PoolsTable__HoldingsCell">-</span>;
        }

        const holding = getPoolHolding(row.id);
        return (
          <span className="PoolsTable__HoldingsCell">
            ${formatNumber(holding)}
          </span>
        );
      }
    },
  ];

  return (
    <Table
      columns={columns}
      data={pools}
      isLoading={isLoading}
      tableClassName="Table Table--bordered"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      defaultSortKey={defaultSortKey}
      defaultSortDirection="desc"
      infiniteLoad={infiniteLoadProps}
      itemLabel="pools"
      onRowClick={(row) => navigate(`/pool/${row.id || ''}`)}
    />
  )
}
