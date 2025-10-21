import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Table, { type TableColumn } from '../Table/Table';
import { TokenLogo } from '../Common/TokenLogo';
import { ExplorerLink } from '../Common/ExplorerLink';
import { formatUnits } from 'viem';

interface PoolTransactionsTableProps {
  poolAddress: string;
}

// Requête GraphQL pour récupérer les transactions (filtrage côté client)
const GET_POOL_TRANSACTIONS = `
  query GetPoolTransactions {
    transactions(orderBy: "timestamp", orderDirection: "desc") {
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
                tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
                  items {
                    priceUSD
                  }
                }
              }
              token1Ref {
                symbol
                id
                logoUri
                decimals
                tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
                  items {
                    priceUSD
                  }
                }
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
          tokenDayData: {
            items: Array<{
              priceUSD: string;
            }>;
          };
        };
        token1Ref: {
          symbol: string;
          id: string;
          logoUri?: string;
          decimals: number;
          tokenDayData: {
            items: Array<{
              priceUSD: string;
            }>;
          };
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
  amountUSD: number;
  createdAt: string;
  transactionHash: string;
  pool: {
    token0: {
      symbol: string;
      logoUri?: string;
      decimals: number;
      priceUSD?: string;
    };
    token1: {
      symbol: string;
      logoUri?: string;
      decimals: number;
      priceUSD?: string;
    };
  };
  tokenIn: {
    symbol: string;
    logoUri?: string;
    decimals: number;
    priceUSD?: string;
  };
  tokenOut: {
    symbol: string;
    logoUri?: string;
    decimals: number;
    priceUSD?: string;
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

      const transaction = {
        id: graphqlTx.id,
        recipient: swap.recipient,
        amount0: swap.amount0,
        amount1: swap.amount1,
        amountUSD: swap.amountUSD,
        createdAt: new Date(parseInt(graphqlTx.timestamp) * 1000).toISOString(),
        transactionHash: graphqlTx.id,
        pool: {
          token0: {
            symbol: swap.pool.token0Ref.symbol,
            logoUri: swap.pool.token0Ref.logoUri,
            decimals: swap.pool.token0Ref.decimals,
            priceUSD: swap.pool.token0Ref.tokenDayData.items[0]?.priceUSD,
          },
          token1: {
            symbol: swap.pool.token1Ref.symbol,
            logoUri: swap.pool.token1Ref.logoUri,
            decimals: swap.pool.token1Ref.decimals,
            priceUSD: swap.pool.token1Ref.tokenDayData.items[0]?.priceUSD,
          },
        },
        tokenIn: isAmount0Positive ? {
          symbol: swap.pool.token0Ref.symbol,
          logoUri: swap.pool.token0Ref.logoUri,
          decimals: swap.pool.token0Ref.decimals,
          priceUSD: swap.pool.token0Ref.tokenDayData.items[0]?.priceUSD,
        } : {
          symbol: swap.pool.token1Ref.symbol,
          logoUri: swap.pool.token1Ref.logoUri,
          decimals: swap.pool.token1Ref.decimals,
          priceUSD: swap.pool.token1Ref.tokenDayData.items[0]?.priceUSD,
        },
        tokenOut: isAmount0Positive ? {
          symbol: swap.pool.token1Ref.symbol,
          logoUri: swap.pool.token1Ref.logoUri,
          decimals: swap.pool.token1Ref.decimals,
          priceUSD: swap.pool.token1Ref.tokenDayData.items[0]?.priceUSD,
        } : {
          symbol: swap.pool.token0Ref.symbol,
          logoUri: swap.pool.token0Ref.logoUri,
          decimals: swap.pool.token0Ref.decimals,
          priceUSD: swap.pool.token0Ref.tokenDayData.items[0]?.priceUSD,
        },
        amountIn: isAmount0Positive ? swap.amount0 : swap.amount1,
        amountOut: isAmount0Positive ? swap.amount1 : swap.amount0,
      };

      transactions.push(transaction);
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
          query: GET_POOL_TRANSACTIONS
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

  // Pagination côté client
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return transactions.slice(startIndex, endIndex);
  }, [transactions, currentPage, itemsPerPage]);

  const pagination = useMemo(() => {
    if (!transactions.length) return undefined;

    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems: transactions.length,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      onPageChange: setCurrentPage,
      dataname: "transactions"
    };
  }, [transactions, currentPage, itemsPerPage]);

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
          <ExplorerLink
            address={row.transactionHash}
            type="tx"
            showIcon={false}
            className="Table__Address"
          >
            {text}
          </ExplorerLink>
        )
      },
    },
    {
      label: 'Type',
      key: 'type',
      render: (row: Transaction) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Swap
          <TokenLogo logoUri={row.tokenIn.logoUri} symbol={row.tokenIn.symbol} size="medium" style={{ margin: "0 2px" }} />
          for
          <TokenLogo logoUri={row.tokenOut.logoUri} symbol={row.tokenOut.symbol} size="medium" style={{ margin: "0 2px" }} />
        </span>
      ),
    },
    {
      label: 'USD', key: 'usd',
      render: (row) => {
        // Calculer la valeur USD du token envoyé (tokenIn)
        const tokenInAmount = parseFloat(formatUnits(BigInt(row.amountIn), row.tokenIn.decimals));
        const tokenInPrice = parseFloat(row.tokenIn.priceUSD || '0');
        const tokenInValueUSD = tokenInAmount * tokenInPrice;

        // Si le prix n'est pas disponible, essayer avec le token reçu
        if (tokenInPrice === 0) {
          const tokenOutAmount = parseFloat(formatUnits(BigInt(row.amountOut) * -1n, row.tokenOut.decimals));
          const tokenOutPrice = parseFloat(row.tokenOut.priceUSD || '0');
          const tokenOutValueUSD = tokenOutAmount * tokenOutPrice;

          if (tokenOutValueUSD < 0.01) return "<0.01$";
          return (
            <span>
              ${tokenOutValueUSD.toFixed(2)}
            </span>
          );
        }

        if (tokenInValueUSD < 0.01) return "<0.01$";
        return (
          <span>
            ${tokenInValueUSD.toFixed(2)}
          </span>
        );
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
            <TokenLogo logoUri={row.tokenIn.logoUri} symbol={row.tokenIn.symbol} size="medium" style={{ marginLeft: 2 }} />
          </span>
        )
      },
    },
    {
      label: 'Token amount (received)',
      key: 'amount2',
      render: (row) => {
        const amount = parseFloat(formatUnits(BigInt(row.amountOut) * -1n, row.tokenOut.decimals))
        return (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: "end", gap: 4 }}>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            <TokenLogo logoUri={row.tokenOut.logoUri} symbol={row.tokenOut.symbol} size="medium" style={{ marginLeft: 2 }} />
          </span>
        )
      },
    },
    {
      label: 'Wallet',
      key: 'wallet',
      render: (row: Transaction) => (
        <ExplorerLink
          address={row.recipient}
          showIcon={false}
          className="Table__Address"
        >
          {row.recipient.slice(0, 6) + '...' + row.recipient.slice(-4)}
        </ExplorerLink>
      ),
    },
  ];

  return (
    <div className="Pool__TransactionsSection">
      <h3 className="Pool__TransactionsSectionTitle">Recent Transactions</h3>
      <Table
        columns={txColumns}
        data={paginatedTransactions}
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