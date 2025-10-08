import React from 'react';
import Table, { type TableColumn } from '../Table/Table';
import { StickyIcon } from '../Common/StickyIcon';
import { formatNumber } from '../../utils/formatNumber';
import { formatTokenAmount } from '../../utils/formatTokenAmount';

interface UserPosition {
  type: 'vanilla' | 'autowin';
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
            {row.type === 'autowin' ? 'AutoWin' : 'Vanilla'}
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
          ${formatNumber(row.valueUSD)}
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
            <StickyIcon width={20} height={20} />
          </span>
          <span className="UserPositionsTable__TokenName">
            {row.tokenName}
          </span>
          <span className="UserPositionsTable__TokenAmount">
            {formatTokenAmount(row.tokenAmount, 18)}
          </span>
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
          {row.apr > 0 ? `${row.apr}%` : '-'}
        </span>
      )
    }
  ];

  return (
    <div className="UserPositionsTable__Wrapper">
      <h3 className="UserPositionsTable__Title">Your Positions</h3>
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
