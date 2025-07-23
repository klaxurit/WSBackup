import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";
import { formatEther } from "viem";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

interface TransactionsTableProps {
  data?: any[];
  isLoading?: boolean;
  pagination?: PaginationProps;
}

export const TransactionsTable = ({ data, isLoading, pagination }: TransactionsTableProps) => {
  const query = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/swaps`)
      if (!resp.ok) return []
      return resp.json()
    },
    select: (data) => {
      return data.map((s: any) => {
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
    }
  });
  const txs = data ?? query.data ?? [];
  const loading = isLoading ?? query.isLoading;

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
        if (diffH < 24) return `${diffH}h ago`;
        const diffD = Math.floor(diffH / 24);
        if (diffD < 30) return `${diffD}d ago`;
        const diffM = Math.floor(diffD / 30);
        if (diffM < 12) return `${diffM}m ago`;
        const diffY = Math.floor(diffM / 12);
        return `${diffY}y ago`;
      },
    },
    {
      label: 'Type',
      key: 'type',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Swap
          {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 18, height: 18, borderRadius: 6, margin: "0 2px" }} /> : <FallbackImg content={row.tokenIn.symbol} style={{ width: 18, height: 18, borderRadius: 6, margin: "0 2px" }} />}
          for
          {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 18, height: 18, borderRadius: 6, margin: "0 2px" }} /> : <FallbackImg content={row.tokenOut.symbol} style={{ width: 18, height: 18, borderRadius: 6, margin: "0 2px" }} />}
        </span>
      ),
    },
    {
      label: 'USD', key: 'usd'
    },
    {
      label: 'Token amount (sent)',
      key: 'amount1',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
          {formatEther(row.amountIn)}
          {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 18, height: 18, borderRadius: 6, marginLeft: 2 }} /> : <FallbackImg content={row.tokenIn.symbol} style={{ width: 18, height: 18, borderRadius: 6, marginLeft: 2 }} />}
        </span>
      ),
    },
    {
      label: 'Token amount (received)',
      key: 'amount2',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
          {formatEther(BigInt(row.amountOut) * -1n)}
          {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 18, height: 18, borderRadius: 6, marginLeft: 2 }} /> : <FallbackImg content={row.tokenOut.symbol} style={{ width: 18, height: 18, borderRadius: 6, marginLeft: 2 }} />}
        </span>
      ),
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
      isLoading={loading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      pagination={pagination}
    />
  )
}