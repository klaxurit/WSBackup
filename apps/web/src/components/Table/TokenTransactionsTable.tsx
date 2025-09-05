import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "./Table";
import { FallbackImg } from "../utils/FallbackImg";
import { formatUnits } from "viem";
import { useState } from "react";

// Types
export interface Transaction {
  type: 'Buy' | 'Sell';
  amount: string;
  token: string;
  value: string;
  address: string;
  time: string;
}

const GET_TOKEN_TRANSACTIONS = `
  query GetTokenTransactions($limit: Int = 20, $offset: Int = 0) {
    transactions(limit: $limit, offset: $offset, orderBy: "timestamp", orderDirection: "desc") {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      items {
        from
        gasPrice
        gasUsed
        id
        timestamp
        swaps {
          totalCount
          items {
            amount1
            amount0
            amountUSD
            recipient
            pool {
              id
              token0Ref {
                symbol
                id
                logoUri
                decimals
              }
              token1Ref {
                symbol
                id
                logoUri
                decimals
              }
            }
          }
        }
      }
    }
  }
`;

export const TokenTransactionsTable = ({ tokenAddress }: { tokenAddress: string }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['token-transactions', tokenAddress, currentPage],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_TOKEN_TRANSACTIONS,
          variables: {
            limit: itemsPerPage,
            offset: (currentPage - 1) * itemsPerPage
          }
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.transactions;
    },
    select: (data) => {
      const allTransactions: any[] = [];

      data.items.forEach((tx: any) => {
        if (tx.swaps?.items?.length > 0) {
          tx.swaps.items.forEach((swap: any) => {
            // Vérifier si ce swap concerne le token spécifique
            if (swap.pool.token0Ref.id.toLowerCase() === tokenAddress.toLowerCase() ||
              swap.pool.token1Ref.id.toLowerCase() === tokenAddress.toLowerCase()) {

              const isAmount0Positive = BigInt(swap.amount0) > 0n;

              allTransactions.push({
                ...tx,
                ...swap,
                tokenIn: isAmount0Positive ? swap.pool.token0Ref : swap.pool.token1Ref,
                tokenOut: isAmount0Positive ? swap.pool.token1Ref : swap.pool.token0Ref,
                amountIn: isAmount0Positive ? swap.amount0 : swap.amount1,
                amountOut: isAmount0Positive ? swap.amount1 : swap.amount0,
              });
            }
          });
        }
      });

      return {
        pagination: {
          currentPage,
          totalPages: Math.ceil(data.totalCount / itemsPerPage),
          itemsPerPage,
          totalItems: data.totalCount,
          hasNextPage: data.pageInfo.hasNextPage,
          hasPreviousPage: data.pageInfo.hasPreviousPage,
          onPageChange: setCurrentPage
        },
        transactions: allTransactions
      };
    }
  });

  const txColumns: TableColumn[] = [
    {
      label: 'Time',
      key: 'time',
      render: (row) => {
        const now = new Date();
        const txTime = new Date(parseInt(row.timestamp) * 1000);
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
          {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} /> : <FallbackImg content={row.tokenIn.symbol} />}
          for
          {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} /> : <FallbackImg content={row.tokenOut.symbol} />}
        </span>
      ),
    },
    {
      label: 'USD',
      key: 'usd',
      render: (row) => {
        const amount = parseFloat(row.amountUSD || '0');
        if (amount < 0.01) return "<0.01$";
        return `$${amount.toFixed(2)}`;
      }
    },
    {
      label: 'Token amount (sent)',
      key: 'amount1',
      render: (row) => {
        const amount = parseFloat(formatUnits(BigInt(row.amountIn), row.tokenIn.decimals || 18))
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 24, height: 24, borderRadius: 50, marginLeft: 2 }} /> : <FallbackImg content={row.tokenIn.symbol} style={{ width: 24, height: 24, borderRadius: 50, marginLeft: 2 }} />}
          </span>
        )
      },
    },
    {
      label: 'Token amount (received)',
      key: 'amount2',
      render: (row) => {
        const amount = parseFloat(formatUnits(BigInt(row.amountOut), row.tokenOut.decimals || 18))
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 24, height: 24, borderRadius: 50, marginLeft: 2 }} /> : <FallbackImg content={row.tokenOut.symbol} style={{ width: 24, height: 24, borderRadius: 50, marginLeft: 2 }} />}
          </span>
        )
      },
    },
    {
      label: 'Wallet',
      key: 'wallet',
      render: (row) => (
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
    <Table
      columns={txColumns}
      data={data?.transactions || []}
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      pagination={data?.pagination}
    />
  );
};

export default TokenTransactionsTable; 
