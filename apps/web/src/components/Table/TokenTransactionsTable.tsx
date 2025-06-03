import React, { useState, useMemo } from 'react';

// Types
export interface Transaction {
  type: 'Buy' | 'Sell';
  amount: string;
  token: string;
  value: string;
  address: string;
  time: string;
}

interface TokenTransactionsTableProps {
  transactions: Transaction[];
  referenceToken: { symbol: string; address: string };
  chainId: number;
}

const shortenAddress = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

const getExplorerLink = (address: string) => {
  return `https://beratrail.io/address/${address}`;
};

const FILTERS = ['All', 'Buy', 'Sell'] as const;
type FilterType = typeof FILTERS[number];

export const TokenTransactionsTable: React.FC<TokenTransactionsTableProps> = ({ transactions, referenceToken }) => {
  const [filter, setFilter] = useState<FilterType>('All');

  const filteredTxs = useMemo(() =>
    filter === 'All' ? transactions : transactions.filter(tx => tx.type === filter),
    [transactions, filter]
  );

  return (
    <div className="TokenTxTable__Wrapper">
      <div className="TokenTxTable__Filters">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`TokenTxTable__FilterBtn${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
            type="button"
          >
            {f}
          </button>
        ))}
      </div>
      <div className="TokenTxTable__Scroll">
        <table className="TokenTxTable">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>{referenceToken.symbol}</th>
              <th>For</th>
              <th>Value</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredTxs.length === 0 ? (
              <tr><td colSpan={6} className="TokenTxTable__Empty">No transactions</td></tr>
            ) : filteredTxs.map((tx, i) => (
              <tr key={i} className={`TokenTxTable__Row TokenTxTable__Row--${tx.type.toLowerCase()}`}>
                <td>{tx.time}</td>
                <td>
                  <span className={`TokenTxTable__Type TokenTxTable__Type--${tx.type.toLowerCase()}`}>{tx.type}</span>
                </td>
                <td>{tx.amount}</td>
                <td>{tx.token}</td>
                <td>{tx.value}</td>
                <td>
                  <a
                    href={getExplorerLink(tx.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="TokenTxTable__Address"
                    title={tx.address}
                  >
                    {shortenAddress(tx.address)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TokenTransactionsTable; 