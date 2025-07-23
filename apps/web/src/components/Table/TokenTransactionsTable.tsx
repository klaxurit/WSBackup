import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "./Table";
import { FallbackImg } from "../utils/FallbackImg";
import { formatEther } from "viem";

// Types
export interface Transaction {
  type: 'Buy' | 'Sell';
  amount: string;
  token: string;
  value: string;
  address: string;
  time: string;
}

export const TokenTransactionsTable = ({ tokenAddress }: { tokenAddress: string }) => {
  const { data: txs = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/swaps`);
      if (!resp.ok) return [];
      return resp.json();
    },
    select: (data) => {
      return data
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
        })
        .filter((tx: any) =>
          tx.tokenIn.address?.toLowerCase() === tokenAddress.toLowerCase() ||
          tx.tokenOut.address?.toLowerCase() === tokenAddress.toLowerCase()
        );
    }
  });

  const txColumns: TableColumn[] = [
    {
      label: 'Time',
      key: 'time',
      render: (row) => {
        const now = new Date();
        const txTime = new Date(row.createdAt);
        const diffMs = now.getTime() - txTime.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        const diffH = Math.floor(diffMin / 60);
        return `${diffH}h ago`;
      },
    },
    {
      label: 'Type',
      key: 'type',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Swap
          {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }} /> : <FallbackImg content={row.tokenIn.symbol} />}
          for
          {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }} /> : <FallbackImg content={row.tokenOut.symbol} />}
        </span>
      ),
    },
    {
      label: 'USD', key: 'usd'
    },
    {
      label: 'Token amount (sent)',
      key: 'amount1',
      render: (row) => {
        const amount = parseFloat(formatEther(row.amountIn))
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
        const amount = parseFloat(formatEther(BigInt(row.amountOut) * -1n))
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
      render: (row) => (
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
    <Table
      columns={txColumns}
      data={txs}
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
    />
  );
};

export default TokenTransactionsTable; 
