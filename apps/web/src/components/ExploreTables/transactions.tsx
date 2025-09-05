import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";
import { formatUnits } from "viem";
import { useEffect, useState } from "react";

interface TransactionsTableProps {
  searchValue: string | null;
}

const GET_TRANSACTIONS = `
  query GetTransactions {
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
        burns {
          totalCount
        }
        collects {
          totalCount
        }
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
        mints {
          totalCount
        }
      }
    }
  }
`

export const TransactionsTable = ({ searchValue }: TransactionsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions', currentPage],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_GRAPHQL_URL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_TRANSACTIONS
        }),
      });

      if (!resp.ok) {
        return { pageInfo: {}, items: [] }
      }

      const data = await resp.json()

      if (data.errors) {
        throw new Error(data.errors[0].message);
      }

      return data.data.transactions
    },
    select: (data) => {
      const allTxs = data.items.map((s: any) => {
        if (s.swaps?.items?.length > 0) { // C'est un swap
          if (BigInt(s.swaps.items[0].amount0) > 0n) {
            // A -> B
            return {
              ...s,
              ...s.swaps.items[0],
              tokenIn: {
                ...s.swaps.items[0].pool.token0Ref,
                priceUSD: s.swaps.items[0].pool.token0Ref.tokenDayData.items[0]?.priceUSD,
              },
              tokenOut: {
                ...s.swaps.items[0].pool.token1Ref,
                priceUSD: s.swaps.items[0].pool.token1Ref.tokenDayData.items[0]?.priceUSD,
              },
              amountIn: BigInt(s.swaps.items[0].amount0),
              amountOut: BigInt(s.swaps.items[0].amount1),
            }
          } else {
            // B -> A
            return {
              ...s,
              ...s.swaps.items[0],
              tokenIn: {
                ...s.swaps.items[0].pool.token1Ref,
                priceUSD: s.swaps.items[0].pool.token1Ref.tokenDayData.items[0]?.priceUSD,
              },
              tokenOut: {
                ...s.swaps.items[0].pool.token0Ref,
                priceUSD: s.swaps.items[0].pool.token0Ref.tokenDayData.items[0]?.priceUSD,
              },
              amountIn: BigInt(s.swaps.items[0].amount1),
              amountOut: BigInt(s.swaps.items[0].amount0),
            }
          }
        }

        return null
      }).filter(Boolean);

      // Pagination côté client
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedTxs = allTxs.slice(startIndex, endIndex);

      return {
        pagination: {
          currentPage,
          totalPages: Math.ceil(allTxs.length / itemsPerPage),
          itemsPerPage,
          totalItems: allTxs.length,
          hasNextPage: currentPage < Math.ceil(allTxs.length / itemsPerPage),
          hasPreviousPage: currentPage > 1,
          onPageChange: setCurrentPage
        },
        txs: paginatedTxs
      }
    }
  });

  useEffect(() => {
    refetch()
  }, [currentPage, searchValue, refetch])

  const txColumns: TableColumn[] = [
    {
      label: 'Time',
      key: 'time',
      render: (row) => {
        let text
        const now = new Date();
        // Corriger le timestamp : createdAt est en secondes, pas en millisecondes
        const txTime = new Date(Number(row.timestamp) * 1000);
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
        // Calculer la valeur USD du token envoyé (tokenIn)
        const tokenInAmount = parseFloat(formatUnits(row.amountIn, row.tokenIn.decimals || 18));
        const tokenInPrice = parseFloat(row.tokenIn.priceUSD || '0');
        const tokenInValueUSD = tokenInAmount * tokenInPrice;

        // Si le prix n'est pas disponible, essayer avec le token reçu
        if (tokenInPrice === 0) {
          const tokenOutAmount = parseFloat(formatUnits(BigInt(row.amountOut) * -1n, row.tokenOut.decimals || 18));
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
          href={`https://berascan.com/address/${row.swaps.items[0].recipient}`}
          target="_blank"
          rel="noopener noreferrer"
          className="Table__Address"
          title={row.swaps.items[0].recipient}
        >
          {row.swaps.items[0].recipient.slice(0, 6) + '...' + row.swaps.items[0].recipient.slice(-4)}
        </a>
      ),
    },
  ];

  return (
    <Table
      columns={txColumns}
      data={data?.txs || []}
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      pagination={data?.pagination}
    />
  )
}
