import React, { useMemo, useState } from 'react';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { Link } from 'react-router-dom';
import '../../styles/pages/_positionPage.scss';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { usePositions } from '../../hooks/usePositions';
import { TokenPairLogos } from '../../components/Common/TokenPairLogos';
import honeyIcon from '../../assets/honey_icon.png';
import NewBanner from '../../components/Common/NewBanner';
import { getPoolDisplayToken } from '../../utils/tokenMapping';
import { FallbackImg } from '../../components/utils/FallbackImg';
import { formatUnits } from 'viem';

const PositionSizeCell: React.FC<{ row: any }> = ({ row }) => {
  const amount0 = parseFloat(formatUnits(row.position.amount0, row.pool.token0.decimals)).toFixed(2)
  const amount1 = parseFloat(formatUnits(row.position.amount1, row.pool.token1.decimals)).toFixed(2)
  const value0 = (Number(amount0) * row.pool.token0.TokenPrice[0].price)
  const value1 = (Number(amount1) * row.pool.token1.TokenPrice[0].price)
  const totalValue = (value0 + value1).toFixed(2);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amount0}
          {row.pool.token0.logoUri ? (
            <img src={row.pool.token0.logoUri} alt={row.pool.token0.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.pool.token0.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {amount1}
          {row.pool.token1.logoUri ? (
            <img src={row.pool.token1.logoUri} alt={row.pool.token1.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={row.pool.token1.symbol} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
        ${totalValue}
      </div>
    </div>
  );
};

const PoolPage: React.FC = () => {
  const { isConnected } = useAccount()
  const { positions, isLoading } = usePositions()
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed'>('open')

  const filteredPositions = useMemo(() => {
    return positions.filter((p: any) => {
      return statusFilter === "open"
        ? p.liquidity !== "0"
        : p.liquidity === "0"
    })
  }, [positions, statusFilter])

  const columns: TableColumn[] = [
    { label: 'TokenId', key: 'tokenid', render: (row) => ('#' + row.position.tokenId) },
    {
      label: 'Pair',
      key: 'pair',
      render: (row) => (
        <Link to={`/pools/${row.nftTokenId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
            <TokenPairLogos
              token0={row.pool.token0}
              token1={row.pool.token1}
              size={28}
              gap={3}
              borderWidth={2}
              separatorWidth={1.5}
            />
            {`${row.pool.token0.symbol} / ${row.pool.token1.symbol}`}
          </span>
        </Link>
      ),
    },
    { label: 'Fee Tier', key: 'fee', render: (row) => (`${row.pool.fee / 10000}%`) },
    {
      label: 'Position size', key: 'size', render: (row) => <PositionSizeCell row={row} />
    },
    {
      label: 'Pool APR', key: 'apr', render: (row) => {
        return row.pool.apr !== 0
          ? `${row.pool.apr.toFixed(2)}%`
          : "-"
      }
    },
    {
      label: '', key: 'actions', render: (row) => (
        <Link to={`/pools/${row.position.tokenId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <button className="PoolPage__ManageBtn">Manage</button>
        </Link>
      )
    },
  ];
  const { data: topPools = [] } = useQuery({
    queryKey: ['topPools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/pool/top`)
      if (!resp.ok) return []

      return resp.json()
    }
  })

  return (
    <div className="PoolPage">
      <NewBanner title="Pools" subtitle="Manage your liquidity pools and positions" image={honeyIcon} />
      <div className="PoolPage__ContentWrapper">
        {/* Left Section (70%) */}
        <div className="PoolPage__Left">
          <div className="PoolPage__Header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <h2 className="PoolPage__Title">Your positions</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                className={`PoolPage__FilterBtn ${statusFilter === 'open' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('open')}
              >Open</button>
              <button
                className={`PoolPage__FilterBtn ${statusFilter === 'closed' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('closed')}
              >Closed</button>
              {isConnected && <Link className="PoolPage__NewBtn" to="/pools/create">New</Link>}
            </div>
          </div>
          {isConnected
            ? isLoading
              ? (
                <div className="PoolPage__TableWrapper">
                  <p>Loading</p>
                </div>
              )
              : (
                <div className="PoolPage__TableWrapper">
                  <Table
                    columns={columns}
                    data={filteredPositions}
                    tableClassName="Table"
                    wrapperClassName="Table__Wrapper"
                    scrollClassName="Table__Scroll"
                    emptyMessage="No positions found"
                  />
                </div>
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
              <div className="PoolPage__TopCard" key={pool.address}>
                <div className="PoolPage__TopPair" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TokenPairLogos
                    token0={{
                      address: pool.token0Address,
                      symbol: pool.token0Symbol,
                      logoUri: pool.token0LogoUri
                    }}
                    token1={{
                      address: pool.token1Address,
                      symbol: pool.token1Symbol,
                      logoUri: pool.token1LogoUri
                    }}
                    borderWidth={3}
                    separatorWidth={2.5}
                  />
                  {(() => {
                    const displayToken0 = getPoolDisplayToken(pool.token0Address);
                    const displayToken1 = getPoolDisplayToken(pool.token1Address);
                    const symbol0 = displayToken0.symbol || pool.token0Symbol;
                    const symbol1 = displayToken1.symbol || pool.token1Symbol;
                    return `${symbol0} / ${symbol1}`;
                  })()} <span className="PoolPage__TopVersion">v3</span>
                </div>
                <div className="PoolPage__TopFee">{pool.fee / 10000}% fee</div>
                <div className="PoolPage__TopApr">
                  {pool.apr ? pool.apr.toFixed(2) : '0'}% APR
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
