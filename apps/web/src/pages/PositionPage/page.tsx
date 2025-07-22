import React from 'react';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { Link } from 'react-router-dom';
import '../../styles/pages/_positionPage.scss';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { usePositions } from '../../hooks/usePositions';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import { Banner } from '../../components/Common/Banner';

const columns: TableColumn[] = [
  { label: 'TokenId', key: 'tokenid', render: (row) => ('#' + row.nftTokenId) },
  {
    label: 'Pair',
    key: 'pair',
    render: (row) => (
      <Link to={`/pools/${row.nftTokenId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <TokenPairLogos token0={row.pool.token0} token1={row.pool.token1} />
          {row.pool.token0.symbol} / {row.pool.token1.symbol}
        </span>
      </Link>
    ),
  },
  { label: 'Fee Tier', key: 'fee', render: (row) => (`${row.position.fee / 10000}%`) },
  {
    label: 'Pool APR', key: 'apr', render: (row) => {
      return row.pool.PoolStatistic.length > 0 && row.pool.PoolStatistic[0].apr !== 0
        ? `${row.pool.PoolStatistic[0].apr}%`
        : "-"
    }
  },
  {
    label: '', key: 'actions', render: (row) => (
      <Link to={`/pools/${row.nftTokenId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <button className="PoolPage__ManageBtn">Manage</button>
      </Link>
    )
  },
];

const PoolPage: React.FC = () => {
  const { isConnected } = useAccount()
  const { positions, isLoading } = usePositions()
  const { data: topPools = [] } = useQuery({
    queryKey: ['topPools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/topPools`)
      if (!resp.ok) return []

      return resp.json()
    }
  })

  return (
    <div className="PoolPage">
      <Banner title="Pools" subtitle="View your positions or create new ones" />
      <div className="PoolPage__ContentWrapper">
        {/* Left Section (70%) */}
        <div className="PoolPage__Left">
          <div className="PoolPage__Header">
            <h2 className="PoolPage__Title">Your positions</h2>
            {isConnected && <Link className="PoolPage__NewBtn" to="/pools/create">New</Link>}
          </div>
          {isConnected
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
                      emptyMessage="No positions found"
                    />
                  </div>
                  {/* <button className="PoolPage__ClosedBtn">View closed positions</button> */}
                </>
              )
            : (
              <div className="PoolPage__TableWrapper">
                <p>Connect your wallet</p>
              </div>
            )}
        </div>
        {/* Right Section (30%) */}
        <div className="PoolPage__Right">
          <h3 className="PoolPage__TopTitle">Top pools by TVL</h3>
          <div className="PoolPage__TopList">
            {topPools.map((pool: any) => (
              <div className="PoolPage__TopCard" key={pool.id}>
                <div className="PoolPage__TopPair" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <TokenPairLogos token0={pool.token0} token1={pool.token1} />
                  {pool.token0.symbol} / {pool.token1.symbol} <span className="PoolPage__TopVersion">v3</span>
                </div>
                <div className="PoolPage__TopFee">{pool.fee / 10000}% fee</div>
                <div className="PoolPage__TopApr">
                  {pool.PoolStatistic[0]?.apr || '0'}% APR {pool.aprChange && <span className="PoolPage__TopApr--positive">{pool.aprChange}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoolPage; 
