import React, { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import Table from '../Table/Table';
import type { TableColumn } from '../Table/Table';
import { MOCK_LEADERBOARD_DATA, type LeaderboardUser } from '../../utils/mockLeaderboardData';
import { formatNumber } from '../../utils/formatNumber';


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

  const leaderboardData = useMemo(() => {
    const data = MOCK_LEADERBOARD_DATA;
    // Si limit est défini, limiter les données
    return limit ? data.slice(0, limit) : data;
  }, [timeFilter, limit]);

  const columns: TableColumn<LeaderboardUser>[] = [
    {
      label: 'Rank',
      key: 'rank',
      width: '80px',
      render: (row: LeaderboardUser) => {
        return (
          <span className="Leaderboard__RankCell">
            <span className={`Leaderboard__Rank ${row.rank <= 3 ? 'Leaderboard__Rank--top' : ''}`}>
              #{row.rank}
            </span>
          </span>
        );
      },
      sortable: true,
      sortValue: (row: LeaderboardUser) => row.rank,
    },
    {
      label: 'User',
      key: 'address',
      render: (row: LeaderboardUser) => {
        const isCurrentUser = address && row.address.toLowerCase() === address.toLowerCase();
        return (
          <span className={`Leaderboard__UserCell ${isCurrentUser ? 'Leaderboard__UserCell--current' : ''}`}>
            <span className="Leaderboard__Address">
              {formatAddress(row.address, row.beraname)}
            </span>
            {isCurrentUser && <span className="Leaderboard__YouBadge">YOU</span>}
          </span>
        );
      },
    },
    {
      label: 'Total Value',
      key: 'totalValueUSD',
      render: (row: LeaderboardUser) => `$${formatNumber(row.totalValueUSD)}`,
      sortable: true,
      sortValue: (row: LeaderboardUser) => row.totalValueUSD,
    },
    {
      label: 'Positions',
      key: 'positions',
      width: '120px',
      render: (row: LeaderboardUser) => row.positions.toString(),
      sortable: true,
      sortValue: (row: LeaderboardUser) => row.positions,
    },
    {
      label: 'Fees Earned',
      key: 'feesEarned',
      render: (row: LeaderboardUser) => `$${formatNumber(row.feesEarned)}`,
      sortable: true,
      sortValue: (row: LeaderboardUser) => row.feesEarned,
    },
    {
      label: '7D Change',
      key: 'weeklyChange',
      width: '120px',
      render: (row: LeaderboardUser) => {
        const isPositive = row.weeklyChange >= 0;
        return (
          <span className={`Leaderboard__ChangeCell ${isPositive ? 'Leaderboard__ChangeCell--positive' : 'Leaderboard__ChangeCell--negative'}`}>
            {isPositive ? '+' : ''}{row.weeklyChange.toFixed(1)}%
          </span>
        );
      },
      sortable: true,
      sortValue: (row: LeaderboardUser) => row.weeklyChange,
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

      <Table
        columns={columns}
        data={leaderboardData}
        tableClassName="Table Table--bordered"
        wrapperClassName="Table__Wrapper"
        defaultSortKey="rank"
        defaultSortDirection="asc"
        emptyMessage="No data available"
        getRowClassName={(row: LeaderboardUser) => {
          const isCurrentUser = address && row.address.toLowerCase() === address.toLowerCase();

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
    </div>
  );
};
