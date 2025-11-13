import React from 'react';
import Table, { type TableColumn } from '../Table/Table';
import { StickyIcon } from '../Common/StickyIcon';
import { AutoWinIcon } from '../Common/AutoWinIcon';
import { formatTokenAmount } from '../../utils/formatTokenAmount';

interface UserPosition {
  type: 'sticky' | 'autowin' | 'staked';
  valueUSD: number;
  tokenName: string;
  tokenAmount: bigint;
  apr: number;
}

interface UserPositionsTableProps {
  vaultPositions: UserPosition[];
  isLoading?: boolean;
}

export const UserPositionsTable: React.FC<UserPositionsTableProps> = ({
  vaultPositions,
  isLoading = false
}) => {
  const columns: TableColumn[] = [
    {
      label: 'Type',
      key: 'type',
      className: 'UserPositionsTable__TypeTd',
      render: (row) => (
        <span className="UserPositionsTable__TypeCell">
          <span className={`UserPositionsTable__TypeBadge ${row.type}`}>
            {row.type === 'autowin' ? 'AutoWin' : row.type === 'staked' ? 'Staked (Infrared)' : 'Sticky'}
          </span>
        </span>
      )
    },
    {
      label: 'Position Value',
      key: 'value',
      className: 'UserPositionsTable__ValueTd',
      sortable: true,
      sortValue: (row) => row.valueUSD,
      render: (row) => (
        <span className="UserPositionsTable__ValueCell">
          ${Number(row.valueUSD).toFixed(2)}
        </span>
      )
    },
    {
      label: 'Token',
      key: 'token',
      className: 'UserPositionsTable__TokenTd',
      render: (row) => (
        <span className="UserPositionsTable__TokenCell">
          <span className="UserPositionsTable__TokenIcon">
            {row.type === 'autowin' ? (
              <AutoWinIcon width={20} height={20} />
            ) : (
              <StickyIcon width={20} height={20} />
            )}
          </span>
          <span className="UserPositionsTable__TokenName">
            {row.tokenName}
          </span>
        </span>
      )
    },
    {
      label: 'Amount',
      key: 'amount',
      className: 'UserPositionsTable__AmountTd',
      sortable: true,
      sortValue: (row) => Number(formatTokenAmount(row.tokenAmount, 18)),
      render: (row) => (
        <span className="UserPositionsTable__AmountCell">
          {formatTokenAmount(row.tokenAmount, 18)}
        </span>
      )
    },
    {
      label: 'APR',
      key: 'apr',
      className: 'UserPositionsTable__AprTd',
      sortable: true,
      sortValue: (row) => row.apr,
      render: (row) => (
        <span className="UserPositionsTable__AprCell">
          {row.apr > 0 ? `${Number(row.apr).toFixed(2)}%` : '-'}
        </span>
      )
    }
  ];

  return (
    <div className="UserPositionsTable__Wrapper">
      <h3 className="UserPositionsTable__Title">Your Deposits</h3>
      <Table
        columns={columns}
        data={vaultPositions}
        isLoading={isLoading}
        tableClassName="UserPositionsTable"
        wrapperClassName="UserPositionsTable__Container"
        scrollClassName="UserPositionsTable__Scroll"
        defaultSortKey="value"
        defaultSortDirection="desc"
        itemLabel="positions"
      />
    </div>
  );
};
