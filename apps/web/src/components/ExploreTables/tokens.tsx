import { useInfiniteQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { TokenLogo } from '../Common/TokenLogo';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from "react";
import { formatNumber } from "../../utils/formatNumber";

// Configuration des champs triables pour les tokens
const TOKEN_SORT_CONFIG = {
  // Champs triables côté serveur (champs directs de la table token)
  SERVER_SORTABLE: {
    'name': 'name',
    'symbol': 'symbol',
    'volume': 'volumeUSD',
  },
  // Champs nécessitant un tri côté client (champs de relations)
  CLIENT_SORTABLE: {
    'price': (token: any) => {
      const dayData = token.tokenDayData?.items?.[0];
      return parseFloat(dayData?.priceUSD || '0');
    },
    '1h': (token: any) => {
      const dayData = token.tokenDayData?.items?.[0];
      return parseFloat(dayData?.oneDayEvo || '0');
    },
    '1d': (token: any) => {
      const dayData = token.tokenDayData?.items?.[0];
      return parseFloat(dayData?.oneMonthEvo || '0');
    },
    '7d': (token: any) => {
      const dayData = token.tokenDayData?.items?.[0];
      return parseFloat(dayData?.oneWeekEvo || '0');
    },
    'mcap': (token: any) => {
      const dayData = token.tokenDayData?.items?.[0];
      return parseFloat(dayData?.marketCap || '0');
    }
  }
};

const GET_TOKENS_STATS = `
  query GetTokensStats($limit: Int!, $after: String, $orderBy: String!, $orderDirection: String!) {
    tokens(
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
        feesUSD
        id
        name
        totalSupply
        volumeUSD
        symbol
        logoUri
        tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
          items {
            priceUSD
            close
            high
            low
            open
            oneDayEvo
            oneMonthEvo
            oneWeekEvo
            marketCap
            fdv
            volume24hUSD
          }
        }
      }
    }
  }
`

export const TokensTable = ({ searchValue }: { searchValue: string }) => {
  const itemsPerPage = 20;
  const navigate = useNavigate();

  // État pour gérer le mode de tri
  const [sortMode, setSortMode] = useState<'server' | 'client'>('server');

  // État pour gérer le tri côté serveur
  const [serverSort, setServerSort] = useState({
    field: 'volumeUSD',
    direction: 'desc' as 'asc' | 'desc'
  });

  // État pour gérer le tri côté client
  const [clientSort, setClientSort] = useState<{
    key: string;
    direction: 'asc' | 'desc';
    sortFn: (token: any) => number;
  } | null>(null);

  // Clé correspondante dans le Table pour le tri par défaut
  const defaultSortKey = 'volume';

  // Déterminer si on est en mode recherche
  const isSearching = searchValue && searchValue.trim() !== '';

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: ['tokensStats', searchValue, sortMode, serverSort.field, serverSort.direction, clientSort?.key, clientSort?.direction],
    queryFn: async ({ pageParam }) => {
      // En mode recherche ou tri côté client, charger plus de données
      const limit = (sortMode === 'client' || isSearching) ? 1000 : itemsPerPage;
      // En mode recherche ou tri côté client, ignorer la pagination
      const after = (sortMode === 'client' || isSearching) ? null : (pageParam || null);

      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_TOKENS_STATS,
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

      return result.data.tokens;
    },
    getNextPageParam: (lastPage) => {
      // Désactiver la pagination pour le tri côté client ou en mode recherche
      if (sortMode === 'client' || isSearching) return undefined;

      return lastPage?.pageInfo?.hasNextPage ? lastPage.pageInfo.endCursor : undefined;
    },
    initialPageParam: null,
    staleTime: 30000, // 30 seconds
  });

  const tokens = useMemo(() => {
    if (!data?.pages) return [];

    // Combine all pages into a single array
    let allTokens = data.pages.flatMap(page => page.items || []);

    // Apply search filter if search value exists
    if (isSearching) {
      const searchLower = searchValue.toLowerCase();
      allTokens = allTokens.filter((token: any) =>
        (token.name && token.name.toLowerCase().includes(searchLower)) ||
        (token.symbol && token.symbol.toLowerCase().includes(searchLower)) ||
        (token.id && token.id.toLowerCase().includes(searchLower))
      );
    }

    // Apply client-side sorting if in client mode
    if (sortMode === 'client' && clientSort) {
      allTokens = [...allTokens].sort((a, b) => {
        const aValue = clientSort.sortFn(a);
        const bValue = clientSort.sortFn(b);

        if (clientSort.direction === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
    }

    // En mode recherche, afficher tous les résultats trouvés
    if (isSearching) {
      return allTokens;
    }

    // En mode tri client, afficher tous les résultats
    if (sortMode === 'client') {
      return allTokens;
    }

    // Sinon, retourner les résultats paginés
    return allTokens;
  }, [data, searchValue, isSearching, sortMode, clientSort]);

  // Fonction pour obtenir la clé de tri actuelle selon le mode
  const getCurrentSortKey = (): string => {
    if (sortMode === 'client' && clientSort) {
      return clientSort.key;
    }

    // Mode serveur : trouver la clé correspondant au champ GraphQL
    for (const [tableKey, gqlField] of Object.entries(TOKEN_SORT_CONFIG.SERVER_SORTABLE)) {
      if (gqlField === serverSort.field) return tableKey;
    }
    return 'volume'; // Par défaut
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
    const serverField = TOKEN_SORT_CONFIG.SERVER_SORTABLE[columnKey as keyof typeof TOKEN_SORT_CONFIG.SERVER_SORTABLE];
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
      const clientSortFn = TOKEN_SORT_CONFIG.CLIENT_SORTABLE[columnKey as keyof typeof TOKEN_SORT_CONFIG.CLIENT_SORTABLE];
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
          field: 'volumeUSD',
          direction: 'desc'
        });
      } else {
        // Fallback vers le mode serveur avec volume par défaut
        setSortMode('server');
        setClientSort(null);
        setServerSort({
          field: 'volumeUSD',
          direction: sortDirection
        });
      }
    }
  };

  const infiniteLoadProps = useMemo(() => {
    if (!data?.pages?.length) return undefined;

    const firstPage = data.pages[0];

    // Désactiver "Load More" en mode client, en mode recherche, ou s'il n'y a plus de pages
    const canLoadMore = sortMode === 'server' && !isSearching && !!hasNextPage;

    return {
      hasNextPage: canLoadMore,
      isFetchingNextPage: sortMode === 'server' && !isSearching ? isFetchingNextPage : false,
      onLoadMore: canLoadMore ? fetchNextPage : () => { },
      totalItems: firstPage?.totalCount || 0,
      currentItems: tokens.length,
      itemLabel: "tokens",
      onSort: handleSort,
      currentSortKey: getCurrentSortKey(),
      currentSortDirection: getCurrentSortDirection()
    };
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage, tokens.length, sortMode, isSearching, serverSort, clientSort]);

  const columns: TableColumn[] = [
    {
      label: 'Token name',
      key: 'name',
      className: 'TokensTable__NameTd',
      sortable: true,
      sortValue: (row) => row.name || row.symbol || '',
      render: (row) => {
        const isStickyToken = row.symbol?.startsWith('STICKY') || row.name?.includes('Sticky Vault');
        const displayName = isStickyToken ? row.symbol : `${row.symbol} - ${row.name}`;

        return (
          <span className="TokensTable__NameCell">
            <span className="TokensTable__LogoWrapper">
              <TokenLogo logoUri={row.logoUri} symbol={row.symbol} size="large" className="TokensTable__Logo" />
            </span>
            <span className="TokensTable__NameText">
              {displayName}
            </span>
          </span>
        );
      }
    },
    {
      label: 'Price',
      key: 'price',
      sortable: true,
      sortValue: (row) => {
        return row.tokenDayData?.items?.length > 0 ? row.tokenDayData.items[0].priceUSD : 0;
      },
      render: (row) => {
        return row.tokenDayData?.items?.length > 0
          ? `$${formatNumber(parseFloat(row.tokenDayData.items[0].priceUSD))}`
          : '-'
      }
    },
    {
      label: '1h',
      key: '1h',
      sortable: true,
      sortValue: (row) => {
        return row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneDayEvo) : 0;
      },
      render: (row) => {
        const evolution = row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneDayEvo) : 0;
        if (!evolution || evolution === 0) return '-';
        const isPositive = evolution > 0;
        return (
          <span style={{ color: isPositive ? '#00FFA3' : '#FF4D4D' }}>
            {evolution.toFixed(2)}%
          </span>
        );
      }
    },
    {
      label: '1d',
      key: '1d',
      sortable: true,
      sortValue: (row) => {
        return row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneMonthEvo) : 0;
      },
      render: (row) => {
        const evolution = row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneMonthEvo) : 0;
        if (!evolution || evolution === 0) return '-';
        const isPositive = evolution > 0;
        return (
          <span style={{ color: isPositive ? '#00FFA3' : '#FF4D4D' }}>
            {evolution.toFixed(2)}%
          </span>
        );
      }
    },
    {
      label: '7d',
      key: '7d',
      sortable: true,
      sortValue: (row) => {
        return row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneWeekEvo) : 0;
      },
      render: (row) => {
        const evolution = row.tokenDayData?.items?.length > 0 ? parseFloat(row.tokenDayData.items[0].oneWeekEvo) : 0;
        if (!evolution || evolution === 0) return '-';
        const isPositive = evolution > 0;
        return (
          <span style={{ color: isPositive ? '#00FFA3' : '#FF4D4D' }}>
            {evolution.toFixed(2)}%
          </span>
        );
      }
    },
    {
      label: 'Market Cap',
      key: 'mcap',
      sortable: true,
      sortValue: (row) => {
        return row.tokenDayData?.items?.length > 0 && row.tokenDayData.items[0].marketCap ? row.tokenDayData.items[0].marketCap : 0;
      },
      render: (row) => {
        return row.tokenDayData?.items?.length > 0 && row.tokenDayData.items[0].marketCap !== 0
          ? `$${formatNumber(parseFloat(row.tokenDayData.items[0].marketCap))}`
          : '-'
      }
    },
    {
      label: 'Volume',
      key: 'volume',
      sortable: true,
      sortValue: (row) => {
        return row.tokenDayData?.items?.length > 0 && row.tokenDayData.items[0].volume24hUSD
          ? parseFloat(row.tokenDayData.items[0].volume24hUSD)
          : 0;
      },
      render: (row) => {
        return parseFloat(row.volumeUSD) !== 0
          ? `$${formatNumber(parseFloat(row.volumeUSD))}`
          : '-'
      }
    },
  ];

  return (
    <Table
      columns={columns}
      data={tokens}
      isLoading={isLoading}
      tableClassName="Table Table--bordered"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      defaultSortKey={defaultSortKey}
      defaultSortDirection="desc"
      infiniteLoad={infiniteLoadProps}
      itemLabel="tokens"
      onRowClick={(row) => navigate(`/tokens/${row.id || ''}`)}
    />
  )
}
