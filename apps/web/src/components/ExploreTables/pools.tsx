import { useInfiniteQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { TokenPairLogos } from '../Common/TokenPairLogos';
import { ExplorerLink } from '../Common/ExplorerLink';
import { useNavigate } from "react-router-dom";
import { formatNumber } from "../../utils/formatNumber";
import { useMemo, useState } from "react";


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

  // Clé correspondante dans le Table pour le tri par défaut
  const defaultSortKey = 'tvl';

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: ['poolStats', searchValue, sortMode, serverSort.field, serverSort.direction, clientSort?.key, clientSort?.direction],
    queryFn: async ({ pageParam }) => {
      // Pour le tri côté client, récupérer plus de données d'un coup
      const limit = sortMode === 'client' ? 1000 : itemsPerPage;
      // Pour le tri côté client, ignorer la pagination (pas de pageParam)
      const after = sortMode === 'client' ? null : (pageParam || null);

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
      // Désactiver la pagination pour le tri côté client
      if (sortMode === 'client') return undefined;

      return lastPage?.pageInfo?.hasNextPage ? lastPage.pageInfo.endCursor : undefined;
    },
    initialPageParam: null,
    staleTime: 30000, // 30 seconds
  });

  const pools = useMemo(() => {
    if (!data?.pages) return [];

    // Combine all pages into a single array
    let allPools = data.pages.flatMap(page => page.items || []);

    // Filter out blacklisted pools
    allPools = allPools.filter((p: any) => !BL.includes(p.id.toLowerCase()));

    // Apply search filter if search value exists
    if (searchValue && searchValue.trim() !== '') {
      allPools = allPools.filter((pool: any) =>
        (pool.id && pool.id.toLowerCase().includes(searchValue.toLowerCase())) ||
        (pool.token0Ref?.symbol && pool.token0Ref.symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
        (pool.token1Ref?.symbol && pool.token1Ref.symbol.toLowerCase().includes(searchValue.toLowerCase()))
      );
    }

    // Apply client-side sorting if in client mode
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

      // Apply client-side pagination
      const startIndex = 0; // Pour l'instant, on affiche tous les résultats
      const endIndex = sortMode === 'client' ? allPools.length : itemsPerPage;
      return allPools.slice(startIndex, endIndex);
    }

    return allPools;
  }, [data, searchValue, sortMode, clientSort]);

  // Fonction pour obtenir la clé de tri actuelle selon le mode
  const getCurrentSortKey = (): string => {
    if (sortMode === 'client' && clientSort) {
      return clientSort.key;
    }

    // Mode serveur : trouver la clé correspondant au champ GraphQL
    for (const [tableKey, gqlField] of Object.entries(SORT_CONFIG.SERVER_SORTABLE)) {
      if (gqlField === serverSort.field) return tableKey;
    }
    return 'tvl'; // Par défaut
  };

  const getCurrentSortDirection = (): 'asc' | 'desc' => {
    if (sortMode === 'client' && clientSort) {
      return clientSort.direction;
    }
    return serverSort.direction;
  };

  // Fonction pour gérer le changement de tri
  const handleSort = (columnKey: string, direction: 'asc' | 'desc' | null) => {
    const sortDirection = direction || 'desc';

    // Vérifier si le champ est triable côté serveur
    const serverField = SORT_CONFIG.SERVER_SORTABLE[columnKey as keyof typeof SORT_CONFIG.SERVER_SORTABLE];
    if (serverField) {
      // Mode serveur
      setSortMode('server');
      setClientSort(null);
      setServerSort({
        field: serverField,
        direction: sortDirection
      });
    }
    // Vérifier si le champ nécessite un tri côté client
    else {
      const clientSortFn = SORT_CONFIG.CLIENT_SORTABLE[columnKey as keyof typeof SORT_CONFIG.CLIENT_SORTABLE];
      if (clientSortFn) {
        // Mode client
        setSortMode('client');
        setClientSort({
          key: columnKey,
          direction: sortDirection,
          sortFn: clientSortFn
        });
        // Garder un ordre par défaut côté serveur pour récupérer les données
        setServerSort({
          field: 'totalValueLockedUSD',
          direction: 'desc'
        });
      } else {
        // Fallback vers le mode serveur avec TVL par défaut
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

    return {
      hasNextPage: sortMode === 'server' ? !!hasNextPage : false, // Désactiver "Load More" en mode client
      isFetchingNextPage: sortMode === 'server' ? isFetchingNextPage : false,
      onLoadMore: sortMode === 'server' ? fetchNextPage : () => { },
      totalItems: firstPage?.totalCount || 0,
      currentItems: pools.length,
      itemLabel: "pools",
      onSort: handleSort,
      currentSortKey: getCurrentSortKey(),
      currentSortDirection: getCurrentSortDirection()
    };
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage, pools.length, sortMode, serverSort, clientSort]);

  const columns: TableColumn[] = [
    {
      label: '#',
      key: 'index',
      className: 'PoolsTable__IndexTd',
      render: (row) => (
        <span className="PoolsTable__IndexCell">
          <button
            type="button"
            className="PoolsTable__IndexLink"
            onClick={() => navigate(`/pool/${row.id || ''}`)}
          >
            <span className="Table__Address">
              {row.token0Ref.symbol}/{row.token1Ref.symbol}
            </span>
          </button>
          <ExplorerLink address={row.id || ''} />
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
