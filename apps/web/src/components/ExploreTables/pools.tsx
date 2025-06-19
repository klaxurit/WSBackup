import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";
import { formatEther } from "viem";

export const PoolsTable = () => {
  const { data: pools = [], isLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/indexer/pools`)
      if (!resp.ok) return []

      return resp.json()
    }
  })

  const columns: TableColumn[] = [
    {
      label: '#', key: 'index', render: (row) => (
        <a
          href={`https://beratrail.io/address/${row.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="Table__Address"
          title={row.address}
        >
          {row.address.slice(0, 4) + '...' + row.address.slice(-4)}
        </a>)
    },
    {
      label: 'Pool', key: 'pool', render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
            {row.token0.logoUri ? <img src={row.token0.logoUri} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} /> : <FallbackImg content={row.token0.symbol} />}
            {row.token1.logoUri ? <img src={row.token1.logoUri} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 16, zIndex: 1 }} /> : <FallbackImg content={row.token1.symbol} />}
          </span>
          <span style={{ fontWeight: 600 }}>{row.pool}</span>
        </span>
      )
    },
    // { label: 'Protocol', key: 'protocol' },
    { label: 'Fee Tier', key: 'fee' },
    { label: 'TVL', key: 'liquidity', render: (row) => (formatEther(row.liquidity || "0")) },
    { label: 'Pool APR', key: 'apr' },
    { label: 'Reward APR', key: 'rewardApr' },
    { label: 'Vol. 1d', key: 'vol1d' },
    { label: 'Vol. 30d', key: 'vol30d' },
    { label: 'Vol. 1d/TVL', key: 'vol1dTvl' },
  ];

  return (
    <Table
      columns={columns}
      data={pools}
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
    />
  )
}
