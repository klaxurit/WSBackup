import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Table, { type TableColumn } from '../Table/Table';
import { FallbackImg } from '../utils/FallbackImg';
import { formatEther } from 'viem';

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
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['pool-transactions', poolAddress],
    enabled: !!poolAddress,
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/swaps`);
      if (!resp.ok) return [];
      const allSwaps = await resp.json();

      // Filter transactions for this specific pool and transform data
      const poolTransactions = allSwaps
        .filter((swap: any) => swap.pool.address?.toLowerCase() === poolAddress.toLowerCase())
        .map((swap: any) => {
          if (swap.amount0 > 0n) {
            // Token0 -> Token1
            return {
              ...swap,
              tokenIn: swap.pool.token0,
              tokenOut: swap.pool.token1,
              amountIn: swap.amount0,
              amountOut: Math.abs(Number(swap.amount1)).toString(),
            };
          } else {
            // Token1 -> Token0
            return {
              ...swap,
              tokenIn: swap.pool.token1,
              tokenOut: swap.pool.token0,
              amountIn: Math.abs(Number(swap.amount1)).toString(),
              amountOut: Math.abs(Number(swap.amount0)).toString(),
            };
          }
        });

      return poolTransactions;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const txTime = new Date(dateString);
    const diffMs = now.getTime() - txTime.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;

    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;

    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `${diffD}d ago`;

    const diffM = Math.floor(diffD / 30);
    if (diffM < 12) return `${diffM}m ago`;

    const diffY = Math.floor(diffM / 12);
    return `${diffY}y ago`;
  };

  const txColumns: TableColumn[] = [
    {
      label: 'Time',
      key: 'time',
      render: (row: Transaction) => formatTimeAgo(row.createdAt),
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
              style={{ width: 18, height: 18, borderRadius: 6, margin: "0 2px" }}
              alt={row.tokenIn.symbol}
            />
          ) : (
            <FallbackImg
              content={row.tokenIn.symbol}
              style={{ width: 18, height: 18, borderRadius: 6, margin: "0 2px" }}
            />
          )}
          for
          {row.tokenOut.logoUri ? (
            <img
              src={row.tokenOut.logoUri}
              style={{ width: 18, height: 18, borderRadius: 6, margin: "0 2px" }}
              alt={row.tokenOut.symbol}
            />
          ) : (
            <FallbackImg
              content={row.tokenOut.symbol}
              style={{ width: 18, height: 18, borderRadius: 6, margin: "0 2px" }}
            />
          )}
        </span>
      ),
    },
    {
      label: 'USD',
      key: 'usd',
      render: (_row: Transaction) => {
        // This would need actual price data to calculate USD value
        // For now, showing placeholder
        return 'N/A';
      }
    },
    {
      label: 'Token amount (sent)',
      key: 'amountIn',
      render: (row) => {
        const amount = parseFloat(formatEther(row.amountIn))
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 18, height: 18, borderRadius: 6, marginLeft: 2 }} /> : <FallbackImg content={row.tokenIn.symbol} style={{ width: 18, height: 18, borderRadius: 6, marginLeft: 2 }} />}
          </span>
        )
      },
    },
    {
      label: 'Token amount (received)',
      key: 'amountOut',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
          {formatEther(BigInt(row.amountOut) * -1n)}
          {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 18, height: 18, borderRadius: 6, marginLeft: 2 }} /> : <FallbackImg content={row.tokenOut.symbol} />}
        </span>
      ),
    },
    {
      label: 'Wallet',
      key: 'wallet',
      render: (row: Transaction) => (
        <a
          href={`https://beratrail.io/address/${row.recipient}`}
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
        data={transactions}
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
