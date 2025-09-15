import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";
import { formatUnits } from "viem";
import { useEffect, useState } from "react";

interface TransactionsTableProps {
  searchValue: string | null;
}

const GET_TRANSACTIONS_FAST = `
  query GetTransactionsFast($limit: Int) {
    transactions(
      orderBy: "timestamp", 
      orderDirection: "desc",
      limit: $limit
    ) {
      totalCount
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

export const TransactionsTable = ({ searchValue }: TransactionsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [loadedTransactions, setLoadedTransactions] = useState(100) // ✅ Commence avec 100
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasReachedEnd, setHasReachedEnd] = useState(false)
  const itemsPerPage = 20;

  const handlePageChange = (newPage: number) => {
    const neededTransactions = newPage * itemsPerPage;
    const buffer = 50; // Buffer de sécurité

    // ✅ Si on a besoin de plus de données, les charger progressivement
    if (neededTransactions > loadedTransactions - buffer && !hasReachedEnd) {
      const newLimit = Math.min(neededTransactions + 200, 10000); // Charge par blocs de 200, max 10K
      setLoadedTransactions(newLimit);
      setIsLoadingMore(true);
    }

    setCurrentPage(newPage);
  };

  // ✅ Charger plus de données quand on approche de la fin
  const loadMoreData = () => {
    if (!isLoadingMore && !hasReachedEnd) {
      const newLimit = Math.min(loadedTransactions + 500, 50000); // Charge par blocs de 500
      setLoadedTransactions(newLimit);
      setIsLoadingMore(true);
    }
  };

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', loadedTransactions, searchValue],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_TRANSACTIONS_FAST,
          variables: {
            limit: loadedTransactions // ✅ Charge progressivement
          }
        }),
      });

      if (!resp.ok) {
        return { items: [], totalCount: 0 }
      }

      const data = await resp.json()

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.transactions
    },
    select: (data) => {
      const allTxs = data.items.map((s: any) => {
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
      }).filter(Boolean);

      // ✅ Vérifier si on a atteint la fin des données
      const hasMoreData = data.totalCount > allTxs.length;
      if (!hasMoreData && !hasReachedEnd) {
        setHasReachedEnd(true);
      }

      // ✅ Arrêter le loading si on a chargé toutes les données
      if (isLoadingMore && (hasReachedEnd || allTxs.length >= data.totalCount)) {
        setIsLoadingMore(false);
      }

      // ✅ Pagination côté client
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTxs = allTxs.slice(startIndex, endIndex);

      const maxAvailablePages = Math.ceil(allTxs.length / itemsPerPage);
      const totalPagesInDb = Math.ceil(data.totalCount / itemsPerPage);

      return {
        pagination: {
          currentPage,
          totalPages: hasReachedEnd ? maxAvailablePages : Math.min(maxAvailablePages, totalPagesInDb),
          itemsPerPage,
          totalItems: data.totalCount,
          availableItems: allTxs.length,
          hasNextPage: currentPage < maxAvailablePages,
          hasPreviousPage: currentPage > 1,
          onPageChange: handlePageChange
        },
        txs: paginatedTxs,
        totalInDb: data.totalCount,
        isLoadingMore: isLoadingMore,
        hasReachedEnd: hasReachedEnd,
        loadMoreData: loadMoreData
      }
    },
    // ✅ Cache intelligent
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    // ✅ Garde les données précédentes pendant le rechargement
    placeholderData: (previousData) => previousData,
  });

  useEffect(() => {
    refetch()
  }, [searchValue, refetch])

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
          <a
            href={`https://berascan.com/tx/${row.id || ''}`}
            target="_blank"
            rel="noopener noreferrer"
            className="Table__Address"
            title={`https://berascan.com/tx/${row.id || ''}`}
          >
            {text}
          </a>
        )
      },
    },
    {
      label: 'Type',
      key: 'type',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Swap
          {row.tokenIn.logoUri
            ? <img src={row.tokenIn.logoUri} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} />
            : <FallbackImg content={row.tokenIn.symbol} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} />
          }
          for
          {row.tokenOut.logoUri
            ? <img src={row.tokenOut.logoUri} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} />
            : <FallbackImg content={row.tokenOut.symbol} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} />
          }
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
        const amount = parseFloat(formatUnits(BigInt(row.amountOut) * -1n, row.tokenOut.decimals || 18))
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
      data={data?.txs || []}
      isLoading={isLoading && !data} // ✅ Seulement loading si pas de données
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      pagination={data?.pagination}
      itemLabel="transactions"
    />
  )
}