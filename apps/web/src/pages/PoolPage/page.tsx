import React from 'react';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { Link } from 'react-router-dom';
import '../../styles/pages/_poolsPage.scss';
import { useQuery } from '@tanstack/react-query';
import { FallbackImg } from '../../components/utils/FallbackImg';
import { useAccount } from 'wagmi';

const columns: TableColumn[] = [
  {
    label: 'Pair',
    key: 'pair',
    render: (row) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
          {row.token0.logoUri ? <img src={row.token0.logoUri} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} /> : <FallbackImg content={row.token0.symbol} />}
          {row.token1.logoUri ? <img src={row.token1.logoUri} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 16, zIndex: 1 }} /> : <FallbackImg content={row.token1.symbol} />}
        </span>
        {row.token0.symbol} / {row.token1.symbol}
      </span>
    ),
  },
  { label: 'Fee Tier', key: 'fee', render: (row) => (`${row.fee / 10000}%`) },
  {
    label: 'Pool APR', key: 'apr', render: (row) => {
      return row.PoolStatistic.length > 0 && row.PoolStatistic[0].apr !== 0
        ? `$${parseInt(row.PoolStatistic[0].apr).toFixed(2)}`
        : "-"
    }
  },
  // { label: '', key: 'actions', render: () => <button className="PoolPage__ManageBtn">Manage</button> },
];

const PoolPage: React.FC = () => {
  const { address } = useAccount()
  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions', address],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/positions/${address}`)
      if (!resp.ok) return []

      return resp.json()
    },
    enabled: !!address
  })

  const { data: topPools } = useQuery({
    queryKey: ['topPools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/topPools`)
      if (!resp.ok) return []

      return resp.json()
    }
  })

  return (
    <div className="PoolPage">
      {/* Section gauche (70%) */}
      <div className="PoolPage__Left">
        <div className="PoolPage__Header">
          <h2 className="PoolPage__Title">Your positions</h2>
          {!!address && <Link className="PoolPage__NewBtn" to="/pools/create">New</Link>}
        </div>
        {address
          ? isLoading
            ? (
              <div className="PoolPage__TableWrapper">
                <p>Loading</p>
              </div>
            )
            : (
              <>
                <div className="PoolPage__TableWrapper">
                  <Table
                    columns={columns}
                    data={positions}
                    tableClassName="PoolPage__Table"
                    wrapperClassName="PoolPage__TableWrapper"
                    scrollClassName="PoolPage__TableScroll"
                    emptyMessage="Aucune position trouvée"
                  />
                </div>
                {/* <button className="PoolPage__ClosedBtn">Voir les positions fermées</button> */}
              </>
            )
          : (
            <div className="PoolPage__TableWrapper">
              <p>Connect your wallet</p>
            </div>
          )}
      </div>
      {/* Section droite (30%) */}
      <div className="PoolPage__Right">
        <h3 className="PoolPage__TopTitle">Top pools by TVL</h3>
        <div className="PoolPage__TopList">
          {topPools.map((pool: any, i: number) => (
            <div className="PoolPage__TopCard" key={i}>
              <div className="PoolPage__TopPair" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
                  {pool.token0.logoUri ? <img src={pool.token0.logoUri} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} /> : <FallbackImg content={pool.token0.symbol} />}
                  {pool.token1.logoUri ? <img src={pool.token1.logoUri} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 16, zIndex: 1 }} /> : <FallbackImg content={pool.token1.symbol} />}
                </span>
                {pool.token0.symbol} / {pool.token1.symbol} <span className="PoolPage__TopVersion">v3</span>
              </div>
              <div className="PoolPage__TopFee">{pool.fee / 10000}% fee</div>
              <div className="PoolPage__TopApr">
                {pool.PoolStatistic[0]?.apr || '0%'} APR {pool.aprChange && <span className="PoolPage__TopApr--positive">{pool.aprChange}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PoolPage; 
