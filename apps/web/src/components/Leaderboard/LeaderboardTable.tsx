import React, { useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { useInfiniteQuery, useQuery, type InfiniteData } from '@tanstack/react-query';
import Table from '../Table/Table';
import type { TableColumn } from '../Table/Table';
import { type LeaderboardEntry, type LeaderboardResponse, useLeaderboardWallet } from '../../hooks/useLeaderboard';
import { formatNumber } from '../../utils/formatNumber';
import { Loader } from '../Loader/Loader';


const formatAddress = (address: string, beraname?: string) => {
  if (beraname) {
    // Remplacer .bera par .🐻⛓️
    return beraname.replace('.bera', '.🐻⛓️');
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

interface LeaderboardTableProps {
  limit?: number; // Limite le nombre de lignes affichées (pour la page portfolio)
  showTitle?: boolean; // Affiche ou cache le titre "Global Rankings"
  contextMode?: boolean; // Mode contexte : affiche top 3 + 2 avant + user + 2 après
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  limit, 
  showTitle = true,
  contextMode = false
}) => {
  const { address } = useAccount();
  const itemsPerPage = limit && limit > 0 ? limit : 20;

  // Récupérer les données de l'utilisateur connecté si en mode contexte
  const { data: userData } = useLeaderboardWallet(
    contextMode && address ? address.toLowerCase() : undefined
  );

  // Calculer les rangs à récupérer en mode contexte
  const ranksToFetch = useMemo(() => {
    if (!contextMode) {
      return null; // Pas en mode contexte
    }

    // Toujours afficher le top 3
    const ranks: number[] = [1, 2, 3];

    // Si l'utilisateur est dans le leaderboard, ajouter le contexte autour
    if (userData?.rank) {
      const userRank = userData.rank;

      // 2 avant l'utilisateur (si pas déjà dans le top 3)
      if (userRank > 3) {
        if (userRank - 2 > 3) ranks.push(userRank - 2);
        if (userRank - 1 > 3) ranks.push(userRank - 1);
        ranks.push(userRank); // Position de l'utilisateur
      }

      // 2 après l'utilisateur
      ranks.push(userRank + 1, userRank + 2);
    }

    return ranks.filter((rank, index, self) => self.indexOf(rank) === index).sort((a, b) => a - b);
  }, [contextMode, userData?.rank]);

  // Récupérer les entrées spécifiques en mode contexte
  const { data: contextData, isLoading: isLoadingContext } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard-context', ranksToFetch?.join(',')],
    queryFn: async () => {
      if (!ranksToFetch || ranksToFetch.length === 0) return [];

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const baseUrl = apiUrl.replace(/\/$/, '');

      // Récupérer toutes les pages nécessaires en parallèle pour optimiser les performances
      const allEntries: LeaderboardEntry[] = [];
      const maxRank = Math.max(...ranksToFetch);
      const itemsPerPage = 100;
      const pagesNeeded = Math.ceil(maxRank / itemsPerPage);

      // Charger toutes les pages en parallèle au lieu de séquentiellement
      const pagePromises = Array.from({ length: pagesNeeded }, (_, i) => {
        const page = i + 1;
        const params = new URLSearchParams({
          page: page.toString(),
          limit: itemsPerPage.toString(),
        });

        const url = `${baseUrl}/leaderboard?${params.toString()}`;
        return fetch(url, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard page ${page}: ${response.status}`);
          }
          return response.json() as Promise<LeaderboardResponse>;
        });
      });

      const pagesData = await Promise.all(pagePromises);
      pagesData.forEach(pageData => {
        allEntries.push(...pageData.entries);
      });

      // Filtrer pour garder seulement les rangs demandés et les organiser
      const filtered = allEntries.filter(entry => ranksToFetch.includes(entry.rank));
      
      // Organiser : top 3 + contexte autour de l'utilisateur
      const top3 = filtered.filter(e => e.rank <= 3).sort((a, b) => a.rank - b.rank);
      
      if (!userData) {
        // Si l'utilisateur n'est pas dans le leaderboard, afficher seulement le top 3
        return top3;
      }

      const userEntry = filtered.find(e => e.wallet.toLowerCase() === userData.wallet.toLowerCase());
      const aroundUser: LeaderboardEntry[] = [];

      if (userEntry && userEntry.rank > 3) {
        // 2 avant
        const before = filtered
          .filter(e => e.rank < userEntry.rank && e.rank > 3)
          .sort((a, b) => b.rank - a.rank)
          .slice(0, 2)
          .reverse();
        aroundUser.push(...before);
        // L'utilisateur
        aroundUser.push(userEntry);
        // 2 après
        const after = filtered
          .filter(e => e.rank > userEntry.rank)
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 2);
        aroundUser.push(...after);
      } else if (userEntry && userEntry.rank <= 3) {
        // Si l'utilisateur est dans le top 3, afficher seulement les 2 après le top 3
        const afterTop3 = filtered
          .filter(e => e.rank > 3)
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 2);
        aroundUser.push(...afterTop3);
      }

      return [...top3, ...aroundUser];
    },
    enabled: contextMode && ranksToFetch !== null && ranksToFetch.length > 0 && ranksToFetch.length >= 3, // Au moins le top 3
    staleTime: 60000, // 1 minute - même que useLeaderboardWallet pour cohérence
    gcTime: 300000, // 5 minutes - garder en cache plus longtemps
    refetchOnWindowFocus: false, // Ne pas refetch automatiquement en mode contexte
  });
  
  // État pour gérer le tri
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({
    key: 'rank',
    direction: 'asc'
  });

  // Récupérer les données du leaderboard avec pagination infinie (seulement si pas en mode contexte)
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error
  } = useInfiniteQuery<LeaderboardResponse, Error, InfiniteData<LeaderboardResponse>, (string | number)[], number>({
    queryKey: ['leaderboard-list-infinite', itemsPerPage.toString()],
    queryFn: async ({ pageParam = 1 }) => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const baseUrl = apiUrl.replace(/\/$/, '');
      
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
      });

      const url = `${baseUrl}/leaderboard?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    getNextPageParam: (lastPage) => {
      // Calculer si il y a une page suivante
      const currentPage = lastPage.page || 1;
      const totalPages = Math.ceil((lastPage.total || 0) / itemsPerPage);
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60000, // 1 minute - cohérent avec les autres queries
    gcTime: 300000, // 5 minutes - garder en cache plus longtemps
    refetchOnWindowFocus: true, // Refetch si l'utilisateur revient sur la page
    enabled: !contextMode, // Désactiver si en mode contexte
  });

  const leaderboardData = useMemo(() => {
    // En mode contexte, utiliser les données du contexte
    if (contextMode) {
      return contextData || [];
    }

    // Sinon, utiliser les données de la pagination normale
    if (!data?.pages) return [];
    
    // Combiner toutes les pages en un seul tableau
    let allEntries = data.pages.flatMap(page => page.entries || []);

    // Appliquer le tri côté client
    if (sortConfig.key) {
      allEntries = [...allEntries].sort((a, b) => {
        let aValue: number | string = 0;
        let bValue: number | string = 0;

        switch (sortConfig.key) {
          case 'rank':
            aValue = a.rank;
            bValue = b.rank;
            break;
          case 'totalVolumeUSD':
            aValue = a.totalVolumeUSD;
            bValue = b.totalVolumeUSD;
            break;
          case 'volumePoints':
            aValue = a.volumePoints;
            bValue = b.volumePoints;
            break;
          case 'positionsCount':
            aValue = a.positionsCount;
            bValue = b.positionsCount;
            break;
          case 'currentLiquidityUSD':
            aValue = a.currentLiquidityUSD;
            bValue = b.currentLiquidityUSD;
            break;
          case 'liquidityPoints':
            aValue = a.liquidityPoints;
            bValue = b.liquidityPoints;
            break;
          case 'totalPoints':
            aValue = a.totalPoints;
            bValue = b.totalPoints;
            break;
          case 'rankChange':
            aValue = a.rankChange ?? 0;
            bValue = b.rankChange ?? 0;
            break;
          default:
            return 0;
        }

        if (sortConfig.direction === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });
    }

    // Si limit est défini (pour la page portfolio), limiter les données
    return limit ? allEntries.slice(0, limit) : allEntries;
  }, [contextMode, contextData, data, sortConfig, limit]);

  // Fonction pour gérer le changement de tri
  const handleSort = (columnKey: string, direction: 'asc' | 'desc' | null) => {
    const sortDirection = direction || 'asc';
    setSortConfig({
      key: columnKey,
      direction: sortDirection
    });
  };


  const infiniteLoadProps = useMemo(() => {
    // Pas de pagination en mode contexte ou si limit est défini
    if (contextMode || !data?.pages?.length || limit) return undefined;

    const firstPage = data.pages[0];
    const canLoadMore = !!hasNextPage;

    return {
      hasNextPage: canLoadMore,
      isFetchingNextPage: isFetchingNextPage,
      onLoadMore: canLoadMore ? fetchNextPage : () => {},
      totalItems: firstPage?.total || 0,
      currentItems: leaderboardData.length,
      itemLabel: "entries",
      onSort: handleSort,
      currentSortKey: sortConfig.key,
      currentSortDirection: sortConfig.direction
    };
  }, [contextMode, data, hasNextPage, isFetchingNextPage, fetchNextPage, leaderboardData.length, limit, sortConfig]);

  const columns: TableColumn<LeaderboardEntry>[] = [
    {
      label: 'Rank',
      key: 'rank',
      width: '80px',
      render: (row: LeaderboardEntry) => {
        return (
          <span className="Leaderboard__RankCell">
            <span className={`Leaderboard__Rank ${row.rank <= 3 ? 'Leaderboard__Rank--top' : ''}`}>
              #{row.rank}
            </span>
          </span>
        );
      },
      sortable: true,
      sortValue: (row: LeaderboardEntry) => row.rank,
    },
    {
      label: 'User',
      key: 'wallet',
      render: (row: LeaderboardEntry) => {
        const isCurrentUser = address && row.wallet.toLowerCase() === address.toLowerCase();
        return (
          <span className={`Leaderboard__UserCell ${isCurrentUser ? 'Leaderboard__UserCell--current' : ''}`}>
            <span className="Leaderboard__Address">
              {formatAddress(row.wallet)}
            </span>
            {isCurrentUser && <span className="Leaderboard__YouBadge">YOU</span>}
          </span>
        );
      },
    },
    {
      label: 'Total Volume',
      key: 'totalVolumeUSD',
      render: (row: LeaderboardEntry) => `$${formatNumber(row.totalVolumeUSD)}`,
      sortable: true,
      sortValue: (row: LeaderboardEntry) => row.totalVolumeUSD,
    },
    {
      label: 'Volume Points',
      key: 'volumePoints',
      render: (row: LeaderboardEntry) => formatNumber(row.volumePoints),
      sortable: true,
      sortValue: (row: LeaderboardEntry) => row.volumePoints,
    },
    {
      label: 'Current Positions',
      key: 'positionsCount',
      width: '140px',
      render: (row: LeaderboardEntry) => row.positionsCount.toString(),
      sortable: true,
      sortValue: (row: LeaderboardEntry) => row.positionsCount,
    },
    {
      label: 'Current Liquidity',
      key: 'currentLiquidityUSD',
      render: (row: LeaderboardEntry) => `$${formatNumber(row.currentLiquidityUSD)}`,
      sortable: true,
      sortValue: (row: LeaderboardEntry) => row.currentLiquidityUSD,
    },
    {
      label: 'Liquidity Points',
      key: 'liquidityPoints',
      render: (row: LeaderboardEntry) => formatNumber(row.liquidityPoints),
      sortable: true,
      sortValue: (row: LeaderboardEntry) => row.liquidityPoints,
    },
    {
      label: 'Total Points',
      key: 'totalPoints',
      render: (row: LeaderboardEntry) => formatNumber(row.totalPoints),
      sortable: true,
      sortValue: (row: LeaderboardEntry) => row.totalPoints,
    },
    {
      label: 'Change',
      key: 'rankChange',
      width: '120px',
      render: (row: LeaderboardEntry) => {
        if (row.rankChange === undefined || row.rankChange === 0) {
          return <span className="Leaderboard__ChangeCell">---</span>;
        }
        const isPositive = row.rankChange > 0;
        return (
          <span className={`Leaderboard__ChangeCell ${isPositive ? 'Leaderboard__ChangeCell--positive' : 'Leaderboard__ChangeCell--negative'}`}>
            {isPositive ? '+' : ''}{row.rankChange}
          </span>
        );
      },
      sortable: true,
      sortValue: (row: LeaderboardEntry) => row.rankChange ?? 0,
    },
  ];

  return (
    <div className="Leaderboard__TableSection">
      {showTitle && (
        <div className="Leaderboard__TableHeader">
          <h2 className="Leaderboard__SectionTitle">Global Rankings</h2>
        </div>
      )}

      {(isLoading || (contextMode && isLoadingContext)) ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Loader size="mobile" />
        </div>
      ) : error ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p style={{ color: '#f87171', margin: 0 }}>Error loading leaderboard</p>
          <p style={{ color: '#aaa', margin: 0, fontSize: '14px' }}>{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      ) : (
        <Table
          columns={columns}
          data={leaderboardData}
          tableClassName="Table Table--bordered"
          wrapperClassName="Table__Wrapper"
          defaultSortKey="rank"
          defaultSortDirection="asc"
          emptyMessage="No data available"
          infiniteLoad={infiniteLoadProps}
          itemLabel="entries"
          getRowClassName={(row: LeaderboardEntry) => {
            const isCurrentUser = address && row.wallet.toLowerCase() === address.toLowerCase();

            // Ajouter les classes pour le gradient des top 10
            const classes: string[] = [];

            if (isCurrentUser) {
              classes.push('Leaderboard__TableRow--current');
            }

            if (row.rank <= 10) {
              classes.push(`Leaderboard__TableRow--rank${row.rank}`);
            }

            return classes.join(' ');
          }}
        />
      )}
    </div>
  );
};
