import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";
import { formatUnits } from "viem";
import { useEffect, useState, useMemo } from "react";

interface TransactionsTableProps {
  searchValue: string | null;
}

export const TransactionsTable = ({ searchValue }: TransactionsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  // const [itemByPage, setItemByPage] = useState(20)
  const itemByPage = 20

  // Récupérer la liste des tokens pour enrichir les transactions
  const { data: tokensList } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/token/list`);
      if (!resp.ok) return [];
      const result = await resp.json();
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Récupérer la liste des pools pour avoir les adresses des tokens
  const { data: poolsList } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/pools`);
      if (!resp.ok) return [];
      const result = await resp.json();
      console.log("API /pools response:", result);
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Créer un map des tokens par adresse pour un accès rapide
  const tokensMap = useMemo(() => {
    if (!tokensList) return new Map();
    const map = new Map(
      tokensList.map((token: any) => [
        token.address.toLowerCase(),
        {
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          logoUri: token.logoUri
        }
      ])
    );
    return map;
  }, [tokensList]);

  // Créer un map des pools par adresse pour récupérer les tokens
  const poolsMap = useMemo(() => {
    if (!poolsList || !poolsList.data || !Array.isArray(poolsList.data)) {
      return new Map();
    }
    const map = new Map(
      poolsList.data.map((pool: any) => [
        pool.address.toLowerCase(),
        {
          token0Address: pool.token0Address,
          token1Address: pool.token1Address,
          token0Symbol: pool.token0Symbol,
          token1Symbol: pool.token1Symbol
        }
      ])
    );
    return map;
  }, [poolsList]);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/indexer/swaps?` + new URLSearchParams({
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
          const getTokenInfo = (address: string) => {
            const token = tokensMap.get(address.toLowerCase());
            return token || {
              symbol: 'Unknown',
              name: 'Unknown Token',
              decimals: 18,
              logoUri: null
            };
          };

          // Récupérer les adresses des tokens depuis le pool
          const poolInfo = poolsMap.get(s.poolAddress.toLowerCase());
          let token0Address = '0x0000000000000000000000000000000000000000';
          let token1Address = '0x0000000000000000000000000000000000000000';

          if (poolInfo) {
            token0Address = poolInfo.token0Address;
            token1Address = poolInfo.token1Address;
          } else {
            console.log("Pool non trouvé pour l'adresse:", s.poolAddress);
          }

          const token0 = getTokenInfo(token0Address);
          const token1 = getTokenInfo(token1Address);

          if (BigInt(s.amount0) > 0n) {
            // A -> B
            return {
              ...s,
              tokenIn: token0,
              tokenOut: token1,
              amountIn: s.amount0,
              amountOut: s.amount1,
            }
          } else {
            // B -> A
            return {
              ...s,
              tokenIn: token1,
              tokenOut: token0,
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
  }, [currentPage, searchValue])

  console.log(data)
  const txColumns: TableColumn[] = [
    {
      label: 'Time',
      key: 'time',
      render: (row) => {
        let text
        const now = new Date();
        // Corriger le timestamp : createdAt est en secondes, pas en millisecondes
        const txTime = new Date(Number(row.createdAt) * 1000);
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
          {row.tokenIn.logoUri ? <img src={row.tokenIn.logoUri} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} /> : <FallbackImg content={row.tokenIn.symbol} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} />}
          for
          {row.tokenOut.logoUri ? <img src={row.tokenOut.logoUri} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} /> : <FallbackImg content={row.tokenOut.symbol} style={{ width: 24, height: 24, borderRadius: 50, margin: "0 2px" }} />}
        </span>
      ),
    },
    {
      label: 'USD', key: 'usd',
      render: (row) => {
        // Vérifier que Statistic existe et a des données
        if (!row.tokenIn.Statistic || row.tokenIn.Statistic.length === 0 || row.tokenIn.Statistic[0]?.price === 0) return "-"

        const amount = (parseFloat(formatUnits(row.amountIn, row.tokenIn.decimals || 18)) * row.tokenIn.Statistic[0].price)
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
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
      pagination={data?.pagination}
    />
  )
}
