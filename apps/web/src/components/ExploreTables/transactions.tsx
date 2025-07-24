import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";
import { formatEther } from "viem";
import { useEffect, useState } from "react";

interface TransactionsTableProps {
  searchValue: string | null;
}

export const TransactionsTable = ({ searchValue }: TransactionsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  // const [itemByPage, setItemByPage] = useState(20)
  const itemByPage = 20
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/swaps?` + new URLSearchParams({
        currentPage: `${currentPage}`,
        itemByPage: `${itemByPage}`,
        searchValue: searchValue || ""
      }).toString()
      )
      if (!resp.ok) return []
      return resp.json()
    },
    select: (data) => {
      return {
        pagination: {
          ...data.pagination,
          onPageChange: setCurrentPage
        },
        txs: data.data.map((s: any) => {
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
    }
  });

  useEffect(() => {
    refetch()
  }, [currentPage])

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
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Swap
          {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }} /> : <FallbackImg content={row.tokenIn.symbol} style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }} />}
          for
          {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }} /> : <FallbackImg content={row.tokenOut.symbol} style={{ width: 24, height: 24, borderRadius: 6, margin: "0 2px" }} />}
        </span>
      ),
    },
    {
      label: 'USD', key: 'usd',
      render: (row) => {
        if (row.tokenIn.Statistic.length === 0 || row.tokenIn.Statistic[0]?.price === 0) return "-"

        const amount = (parseFloat(formatEther(row.amountIn)) * row.tokenIn.Statistic[0].price)
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
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      pagination={data?.pagination}
    />
  )
}
