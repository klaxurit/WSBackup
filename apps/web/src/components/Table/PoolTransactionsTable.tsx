import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Table, { type TableColumn } from '../Table/Table';
import { FallbackImg } from '../utils/FallbackImg';
import { formatUnits } from 'viem';

interface PoolTransactionsTableProps {
  poolAddress: string;
}

interface Transaction {
  id: string;
  recipient: string;
  amount0: string;
  amount1: string;
  createdAt: string;
  transactionHash: string;
  pool: {
    token0: {
      symbol: string;
      logoUri?: string;
    };
    token1: {
      symbol: string;
      logoUri?: string;
    };
  };
  tokenIn: {
    symbol: string;
    logoUri?: string;
  };
  tokenOut: {
    symbol: string;
    logoUri?: string;
  };
  amountIn: string;
  amountOut: string;
}

export const PoolTransactionsTable: React.FC<PoolTransactionsTableProps> = ({ poolAddress }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['pool-transactions', poolAddress],
    enabled: !!poolAddress,
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pool/${poolAddress}/swaps`);
      if (!resp.ok) return [];
      const allSwaps = await resp.json();

      // Filter transactions for this specific pool and transform data
      const poolTransactions = allSwaps
        .map((s: any) => {
          if (s.amount0 > 0n) {
            // A -> B
            return {
              ...s,
              tokenIn: s.pool.token0,
              tokenOut: s.pool.token1,
              amountIn: s.amount0,
              amountOut: s.amount1,
            }
          } else {
            // B -> A
            return {
              ...s,
              tokenIn: s.pool.token1,
              tokenOut: s.pool.token0,
              amountIn: s.amount1,
              amountOut: s.amount0,
            }
          }
        });

      return poolTransactions;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const txColumns: TableColumn[] = [
    {
      label: 'Time',
      key: 'time',
      render: (row) => {
        let text
        const now = new Date();
        const txTime = new Date(row.createdAt);
        const diffMs = now.getTime() - txTime.getTime();
        const diffMin = Math.floor(diffMs / 60000);

        const diffH = Math.floor(diffMin / 60);
        const diffD = Math.floor(diffH / 24);
        const diffM = Math.floor(diffD / 30);
        const diffY = Math.floor(diffM / 12);

        if (diffMin < 1) {
          text = 'Just now'
        } else if (diffMin < 60) {
          text = `${diffMin} min ago`
        } else if (diffH < 24) {
          text = `${diffH}h ago`
        } else if (diffD < 30) {
          text = `${diffD}d ago`
        } else if (diffM < 12) {
          text = `${diffM}m ago`
        } else {
          text = `${diffY}y ago`
        }

        return (
          <a
            href={`https://berascan.com/tx/${row.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="Table__Address"
            title={row.recipient}
          >
            {text}
          </a>
        )
      },
    },
    {
      label: 'Type',
      key: 'type',
      render: (row: Transaction) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Swap
          {row.tokenIn.logoUri ? (
            <img
              src={row.tokenIn.logoUri}
              style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }}
              alt={row.tokenIn.symbol}
            />
          ) : (
            <FallbackImg
              content={row.tokenIn.symbol}
              style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }}
            />
          )}
          for
          {row.tokenOut.logoUri ? (
            <img
              src={row.tokenOut.logoUri}
              style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }}
              alt={row.tokenOut.symbol}
            />
          ) : (
            <FallbackImg
              content={row.tokenOut.symbol}
              style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }}
            />
          )}
        </span>
      ),
    },
    {
      label: 'USD', key: 'usd',
      render: (row) => {
        if (row.tokenIn.Statistic.length === 0 || row.tokenIn.Statistic[0]?.price === 0) return "-"

        const amount = (parseFloat(formatUnits(row.amountIn, row.tokenIn.decimals || 18)) * row.tokenIn.Statistic[0].price)
        if (amount < 0.01) return "<0.01$"
        return (
          <span>
            ${amount.toFixed(2)}
          </span>
        )
      },
    },
    {
      label: 'Token amount (sent)',
      key: 'amountIn',
      render: (row) => {
        const amount = parseFloat(formatUnits(row.amountIn, row.tokenIn.decimals || 18))
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 24, height: 24, borderRadius: 6, marginLeft: 2 }} /> : <FallbackImg content={row.tokenIn.symbol} style={{ width: 24, height: 24, borderRadius: 6, marginLeft: 2 }} />}
          </span>
        )
      },
    },
    {
      label: 'Token amount (received)',
      key: 'amount2',
      render: (row) => {
        const amount = parseFloat(formatUnits(BigInt(row.amountOut) * -1n, row.tokenOut.decimals || 18))
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 24, height: 24, borderRadius: 6, marginLeft: 2 }} /> : <FallbackImg content={row.tokenOut.symbol} style={{ width: 24, height: 24, borderRadius: 6, marginLeft: 2 }} />}
          </span>
        )
      },
    },
    {
      label: 'Wallet',
      key: 'wallet',
      render: (row: Transaction) => (
        <a
          href={`https://berascan.com/address/${row.recipient}`}
          target="_blank"
          rel="noopener noreferrer"
          className="Table__Address"
          title={row.recipient}
        >
          {row.recipient.slice(0, 6) + '...' + row.recipient.slice(-4)}
        </a>
      ),
    },
  ];

  return (
    <div className="Pool__TransactionsSection">
      <h3 className="Pool__TransactionsSectionTitle">Recent Transactions</h3>
      <Table
        columns={txColumns}
        data={data || []}
        isLoading={isLoading}
        tableClassName="Table"
        wrapperClassName="Table__Wrapper"
        scrollClassName="Table__Scroll"
        emptyMessage="No transactions found for this pool"
      />
    </div>
  );
};

export default PoolTransactionsTable;
