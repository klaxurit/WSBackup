import { useQuery } from "@tanstack/react-query";
import Table, { type TableColumn } from "../Table/Table"
import { FallbackImg } from "../utils/FallbackImg";

export const TokensTable = () => {
  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/tokens`)
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
      label: 'Token name', key: 'name', render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
            {row.logoUri ? <img src={row.logoUri} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} /> : <FallbackImg content={row.symbol} />}
          </span>
          <span style={{ fontWeight: 600 }}>{row.name}</span>
        </span>
      )
    },
    {
      label: 'Reward APR', key: 'rewardapr', render: (row) => {
        return row.Statistic?.length > 0 ? `-` : '-'
      }
    },
    {
      label: '1h', key: '1h', render: (row) => {
        return row.Statistic?.length > 0 ? `${row.Statistic[0].oneHourEvolution.toFixed(2)}%` : '-'
      }
    },
    {
      label: '1d', key: '1d', render: (row) => {
        return row.Statistic?.length > 0 ? `${row.Statistic[0].oneDayEvolution.toFixed(2)}%` : '-'
      }
    },
    { label: 'FDV', key: 'fdv' },
    { label: 'Volume', key: 'volume' },
  ];

  return (
    <Table
      columns={columns}
      data={tokens}
      isLoading={isLoading}
      tableClassName="Table"
      wrapperClassName="Table__Wrapper"
      scrollClassName="Table__Scroll"
    />
  )
}
