import { useInfiniteQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { TokenLogo } from '../Common/TokenLogo';
import { ExplorerLink } from '../Common/ExplorerLink';
import { formatUnits } from "viem";
import { useMemo } from "react";

interface TransactionsTableProps { }

const GET_TRANSACTIONS_FAST = `
  query GetTransactionsFast($limit: Int!, $after: String) {
    transactions(
      orderBy: "timestamp",
      orderDirection: "desc",
      limit: $limit,
      after: $after
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      items {
        id
        timestamp
        swaps {
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
`

export const TransactionsTable = ({ }: TransactionsTableProps) => {
  const itemsPerPage = 50; // Plus d'éléments par page pour les transactions

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = useInfiniteQuery({
    queryKey: ['transactions'],
    queryFn: async ({ pageParam }) => {
      const resp = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_TRANSACTIONS_FAST,
          variables: {
            limit: itemsPerPage,
            after: pageParam || null
          }
        }),
      });

      if (!resp.ok) {
        return { items: [], totalCount: 0, pageInfo: { hasNextPage: false, endCursor: null } }
      }

      const result = await resp.json()

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return result.data.transactions;
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.pageInfo?.hasNextPage ? lastPage.pageInfo.endCursor : undefined;
    },
    initialPageParam: null,
    staleTime: 30000, // 30 seconds
  });

  const transactions = useMemo(() => {
    if (!data?.pages) return [];

    // Combine all pages into a single array and transform data
    const allTxs = data.pages.flatMap(page =>
      page.items.map((s: any) => {
        if (s.swaps?.items?.length > 0) {
          const swap = s.swaps.items[0];
          if (BigInt(swap.amount0) > 0n) {
            return {
              ...s,
              ...swap,
              tokenIn: {
                ...swap.pool.token0Ref,
              },
              tokenOut: {
                ...swap.pool.token1Ref,
              },
              amountIn: BigInt(swap.amount0),
              amountOut: BigInt(swap.amount1),
            }
          } else {
            return {
              ...s,
              ...swap,
              tokenIn: {
                ...swap.pool.token1Ref,
              },
              tokenOut: {
                ...swap.pool.token0Ref,
              },
              amountIn: BigInt(swap.amount1),
              amountOut: BigInt(swap.amount0),
            }
          }
        }
        return null
      }).filter(Boolean)
    );

    return allTxs;
  }, [data]);

  const infiniteLoadProps = useMemo(() => {
    if (!data?.pages?.length) return undefined;

    const firstPage = data.pages[0];

    return {
      hasNextPage: !!hasNextPage,
      isFetchingNextPage,
      onLoadMore: fetchNextPage,
      totalItems: firstPage?.totalCount || 0,
      currentItems: transactions.length,
      itemLabel: "transactions"
    };
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage, transactions.length]);

  const txColumns: TableColumn[] = [
    {
      label: 'Time',
      key: 'time',
      render: (row) => {
        const now = new Date();
        const txTime = new Date(Number(row.timestamp) * 1000);
        const diffMs = now.getTime() - txTime.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        const diffH = Math.floor(diffMin / 60);
        const diffD = Math.floor(diffH / 24);

        let text;
        if (diffMin < 1) {
          text = 'Just now'
        } else if (diffMin < 60) {
          text = `${diffMin}m ago`
        } else if (diffH < 24) {
          text = `${diffH}h ago`
        } else {
          text = `${diffD}d ago`
        }

        return (
          <ExplorerLink
            address={row.id || ''}
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
      render: (row) => (
        <span>
          Swap
          <TokenLogo logoUri={row.tokenIn.logoUri} symbol={row.tokenIn.symbol} size="medium" />
          for
          <TokenLogo logoUri={row.tokenOut.logoUri} symbol={row.tokenOut.symbol} size="medium" />
        </span>
      ),
    },
    {
      label: 'USD', key: 'usd',
      render: (row) => {
        const amountUSD = parseFloat(row.amountUSD || '0');
        if (amountUSD < 0.01) return "<$0.01";
        return <span>${amountUSD.toFixed(2)}</span>;
      },
    },
    {
      label: 'Token amount (sent)',
      key: 'amount1',
      render: (row) => {
        const amount = parseFloat(formatUnits(row.amountIn, row.tokenIn.decimals || 18))
        return (
          <span>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            <TokenLogo logoUri={row.tokenIn.logoUri} symbol={row.tokenIn.symbol} size="medium" />
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
          <span>
            {amount < 0.01 ? "<0.01" : amount.toFixed(2)}
            <TokenLogo logoUri={row.tokenOut.logoUri} symbol={row.tokenOut.symbol} size="medium" />
          </span>
        )
      },
    },
    {
      label: 'Wallet',
      key: 'wallet',
      render: (row) => (
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
    <Table
      columns={txColumns}
      data={transactions}
      isLoading={isLoading}
      tableClassName="Table Table--bordered"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      infiniteLoad={infiniteLoadProps}
      itemLabel="transactions"
    />
  )
}