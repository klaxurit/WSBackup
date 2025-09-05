import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Table, { type TableColumn } from '../Table/Table';
import { FallbackImg } from '../utils/FallbackImg';
import { formatUnits } from 'viem';

interface PoolTransactionsTableProps {
  poolAddress: string;
}

// Requête GraphQL pour récupérer les transactions (filtrage côté client)
const GET_POOL_TRANSACTIONS = `
  query GetPoolTransactions($limit: Int = 20, $offset: Int = 0) {
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

// Interface pour les données GraphQL des transactions
interface GraphQLTransaction {
  id: string;
  from: string;
  timestamp: string;
  swaps: {
    items: Array<{
      amount0: string;
      amount1: string;
      amountUSD: number;
      recipient: string;
      pool: {
        id: string;
        token0Ref: {
          symbol: string;
          id: string;
          logoUri?: string;
          decimals: number;
        };
        token1Ref: {
          symbol: string;
          id: string;
          logoUri?: string;
          decimals: number;
        };
      };
    }>;
  };
}

// Interface pour la réponse GraphQL
interface GraphQLResponse {
  transactions: {
    totalCount: number;
    pageInfo: {
      endCursor: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor: string;
    };
    items: GraphQLTransaction[];
  };
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
      decimals: number;
    };
    token1: {
      symbol: string;
      logoUri?: string;
      decimals: number;
    };
  };
  tokenIn: {
    symbol: string;
    logoUri?: string;
    decimals: number;
  };
  tokenOut: {
    symbol: string;
    logoUri?: string;
    decimals: number;
  };
  amountIn: string;
  amountOut: string;
}

// Fonction pour transformer les données GraphQL en format Transaction
const transformGraphQLTransactionToTransaction = (graphqlTx: GraphQLTransaction, poolAddress: string): Transaction[] => {
  const transactions: Transaction[] = [];

  // Parcourir tous les swaps de cette transaction
  graphqlTx.swaps.items.forEach((swap) => {
    // Vérifier si ce swap concerne la pool spécifique
    if (swap.pool.id.toLowerCase() === poolAddress.toLowerCase()) {
      const isAmount0Positive = BigInt(swap.amount0) > 0n;

      transactions.push({
        id: graphqlTx.id,
        recipient: swap.recipient,
        amount0: swap.amount0,
        amount1: swap.amount1,
        createdAt: new Date(parseInt(graphqlTx.timestamp) * 1000).toISOString(),
        transactionHash: graphqlTx.id,
        pool: {
          token0: {
            symbol: swap.pool.token0Ref.symbol,
            logoUri: swap.pool.token0Ref.logoUri,
            decimals: swap.pool.token0Ref.decimals,
          },
          token1: {
            symbol: swap.pool.token1Ref.symbol,
            logoUri: swap.pool.token1Ref.logoUri,
            decimals: swap.pool.token1Ref.decimals,
          },
        },
        tokenIn: isAmount0Positive ? {
          symbol: swap.pool.token0Ref.symbol,
          logoUri: swap.pool.token0Ref.logoUri,
          decimals: swap.pool.token0Ref.decimals,
        } : {
          symbol: swap.pool.token1Ref.symbol,
          logoUri: swap.pool.token1Ref.logoUri,
          decimals: swap.pool.token1Ref.decimals,
        },
        tokenOut: isAmount0Positive ? {
          symbol: swap.pool.token1Ref.symbol,
          logoUri: swap.pool.token1Ref.logoUri,
          decimals: swap.pool.token1Ref.decimals,
        } : {
          symbol: swap.pool.token0Ref.symbol,
          logoUri: swap.pool.token0Ref.logoUri,
          decimals: swap.pool.token0Ref.decimals,
        },
        amountIn: isAmount0Positive ? swap.amount0 : swap.amount1,
        amountOut: isAmount0Positive ? swap.amount1 : swap.amount0,
      });
    }
  });

  return transactions;
};

export const PoolTransactionsTable: React.FC<PoolTransactionsTableProps> = ({ poolAddress }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['pool-transactions', poolAddress, currentPage],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_POOL_TRANSACTIONS,
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

      return data.data as GraphQLResponse;
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Transformer les données GraphQL en format Transaction
  const transactions: Transaction[] = React.useMemo(() => {
    if (!data?.transactions?.items) return [];

    const allTransactions: Transaction[] = [];
    data.transactions.items.forEach((tx) => {
      const poolTransactions = transformGraphQLTransactionToTransaction(tx, poolAddress);
      allTransactions.push(...poolTransactions);
    });

    return allTransactions;
  }, [data, poolAddress]);

  const pagination = useMemo(() => {
    if (!data?.transactions) return undefined;

    const totalPages = Math.ceil(data.transactions.totalCount / itemsPerPage);

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems: data.transactions.totalCount,
      hasNextPage: data.transactions.pageInfo.hasNextPage,
      hasPreviousPage: data.transactions.pageInfo.hasPreviousPage,
      onPageChange: setCurrentPage
    };
  }, [data, currentPage, itemsPerPage]);

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
              style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px", borderWidth: 2, borderColor: 'rgb(255, 193, 100)', borderStyle: 'solid' }}
              alt={row.tokenIn.symbol}
            />
          ) : (
            <FallbackImg
              content={row.tokenIn.symbol}
              style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px", borderWidth: 2, borderColor: 'rgb(255, 193, 100)', borderStyle: 'solid' }}
            />
          )}
          for
          {row.tokenOut.logoUri ? (
            <img
              src={row.tokenOut.logoUri}
              style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px", borderWidth: 2, borderColor: 'rgb(255, 193, 100)', borderStyle: 'solid' }}
              alt={row.tokenOut.symbol}
            />
          ) : (
            <FallbackImg
              content={row.tokenOut.symbol}
              style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px", borderWidth: 2, borderColor: 'rgb(255, 193, 100)', borderStyle: 'solid' }}
            />
          )}
        </span>
      ),
    },
    {
      label: 'USD', key: 'usd',
      render: (row) => {
        // Pour l'instant, on utilise amountUSD si disponible, sinon on calcule approximativement
        const amountUSD = row.pool.token0.symbol === 'USDC' || row.pool.token0.symbol === 'USDT'
          ? parseFloat(formatUnits(BigInt(row.amountIn), row.tokenIn.decimals))
          : parseFloat(formatUnits(BigInt(row.amountOut), row.tokenOut.decimals));

        if (amountUSD < 0.01) return "<0.01$"
        return (
          <span>
            ${amountUSD.toFixed(2)}
          </span>
        )
      },
    },
    {
      label: 'Token amount (sent)',
      key: 'amountIn',
      render: (row) => {
        const amount = parseFloat(formatUnits(BigInt(row.amountIn), row.tokenIn.decimals))
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 24, height: 24, borderRadius: 50, marginLeft: 2, borderWidth: 2, borderColor: 'rgb(255, 193, 100)', borderStyle: 'solid' }} /> : <FallbackImg content={row.tokenIn.symbol} style={{ width: 24, height: 24, borderRadius: 50, marginLeft: 2, borderWidth: 2, borderColor: 'rgb(255, 193, 100)', borderStyle: 'solid' }} />}
          </span>
        )
      },
    },
    {
      label: 'Token amount (received)',
      key: 'amount2',
      render: (row) => {
        const amount = parseFloat(formatUnits(BigInt(row.amountOut), row.tokenOut.decimals))
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 24, height: 24, borderRadius: 50, marginLeft: 2, borderWidth: 2, borderColor: 'rgb(255, 193, 100)', borderStyle: 'solid' }} /> : <FallbackImg content={row.tokenOut.symbol} style={{ width: 24, height: 24, borderRadius: 50, marginLeft: 2, borderWidth: 2, borderColor: 'rgb(255, 193, 100)', borderStyle: 'solid' }} />}
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
        data={transactions}
        isLoading={isLoading}
        tableClassName="Table"
        wrapperClassName="Table__Wrapper"
        scrollClassName="Table__Scroll"
        emptyMessage="No transactions found for this pool"
        pagination={pagination}
      />
    </div>
  );
};

export default PoolTransactionsTable;