import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import Table from '../Table/Table';
import type { TableColumn } from '../Table/Table';
import { useLeaderboardList, type LeaderboardEntry } from '../../hooks/useLeaderboard';
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
  limit?: number; // Limite le nombre de lignes affichées
  showFilters?: boolean; // Affiche ou cache les filtres temporels
  showTitle?: boolean; // Affiche ou cache le titre "Global Rankings"
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  limit, 
  showFilters = true,
  showTitle = true 
}) => {
  const { address } = useAccount();
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | 'all'>('7d');
  
  // Récupérer les données du leaderboard depuis le backend
  // Note: Le backend ne supporte pas encore les filtres temporels, on ignore timeFilter pour l'instant
  // S'assurer que limit est toujours un nombre valide
  const validLimit = limit && limit > 0 ? limit : 100;
  const { data: leaderboardResponse, isLoading, error } = useLeaderboardList(1, validLimit);

  const leaderboardData = useMemo(() => {
    if (!leaderboardResponse?.entries) return [];
    // Si limit est défini, limiter les données
    return limit ? leaderboardResponse.entries.slice(0, limit) : leaderboardResponse.entries;
  }, [leaderboardResponse, limit]);

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
      {(showTitle || showFilters) && (
        <div className="Leaderboard__TableHeader">
          {showTitle && (
            <h2 className="Leaderboard__SectionTitle">Global Rankings</h2>
          )}

          {showFilters && (
            <div className="Leaderboard__FilterButtons">
              <button
                className={`btn btn--tiny ${timeFilter === '7d' ? 'btn__main' : 'btn__shade'}`}
                onClick={() => setTimeFilter('7d')}
              >
                7D
              </button>
              <button
                className={`btn btn--tiny ${timeFilter === '30d' ? 'btn__main' : 'btn__shade'}`}
                onClick={() => setTimeFilter('30d')}
              >
                30D
              </button>
              <button
                className={`btn btn--tiny ${timeFilter === 'all' ? 'btn__main' : 'btn__shade'}`}
                onClick={() => setTimeFilter('all')}
              >
                All Time
              </button>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
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
