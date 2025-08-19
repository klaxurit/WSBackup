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
import { getAmountsForPosition } from '../../utils/positionManager';
import { usePrice } from '../../hooks/usePrice';
import { FallbackImg } from '../../components/utils/FallbackImg';

// Composant pour afficher la taille de position avec valeur USD
const PositionSizeCell: React.FC<{ row: any }> = ({ row }) => {
  const price0 = usePrice(row.pool.token0);
  const price1 = usePrice(row.pool.token1);

  const display0 = getPoolDisplayToken(row.pool.token0.address);
  const display1 = getPoolDisplayToken(row.pool.token1.address);
  const logo0 = display0.logoUri || row.pool.token0.logoUri;
  const logo1 = display1.logoUri || row.pool.token1.logoUri;
  const symbol0 = display0.symbol || row.pool.token0.symbol;
  const symbol1 = display1.symbol || row.pool.token1.symbol;

  const value0 = parseFloat(row.__amount0 || '0') * (price0.data || 0);
  const value1 = parseFloat(row.__amount1 || '0') * (price1.data || 0);
  const totalValue = value0 + value1;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {row.__amount0}
          {logo0 ? (
            <img src={logo0} alt={symbol0} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={symbol0} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {row.__amount1}
          {logo1 ? (
            <img src={logo1} alt={symbol1} style={{ width: 16, height: 16, borderRadius: 999 }} />
          ) : (
            <FallbackImg content={symbol1} style={{ width: 16, height: 16, borderRadius: 999 }} />
          )}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
        ${totalValue.toFixed(2)}
      </div>
    </div>
  );
};


const isPositionOpen = (row: any) => {
  try {
    return BigInt(row?.position?.liquidity ?? '0') > 0n;
  } catch {
    return false;
  }
};

const PoolPage: React.FC = () => {
  const { isConnected } = useAccount()
  const { positions, isLoading } = usePositions()
  const [statusFilter, setStatusFilter] = useState<'open' | 'closed'>('open')

  const positionsWithAmounts = useMemo(() => {
    return (positions || []).map((row: any) => {
      const hasPoolData = row?.pool && row?.pool?.sqrtPriceX96 && row?.pool?.tick !== undefined && row?.pool?.tick !== null
      const hasPositionData = row?.position && row.position.tickLower !== undefined && row.position.tickUpper !== undefined
      let amount0 = '0'
      let amount1 = '0'

      if (hasPoolData && hasPositionData) {
        try {
          const { amount0: a0, amount1: a1 } = getAmountsForPosition({
            liquidity: row.position.liquidity ?? '0',
            tickLower: row.position.tickLower,
            tickUpper: row.position.tickUpper,
            tickCurrent: row.pool.tick,
            sqrtPriceX96: row.pool.sqrtPriceX96 ?? '0',
            fee: row.position.fee ?? row.pool.fee,
            token0: { address: row.pool.token0.address, decimals: row.pool.token0.decimals, symbol: row.pool.token0.symbol },
            token1: { address: row.pool.token1.address, decimals: row.pool.token1.decimals, symbol: row.pool.token1.symbol },
          })
          amount0 = a0
          amount1 = a1
        } catch { }
      }

      const displayToken0 = getPoolDisplayToken(row.pool.token0.address);
      const displayToken1 = getPoolDisplayToken(row.pool.token1.address);
      const symbol0 = displayToken0.symbol || row.pool.token0.symbol;
      const symbol1 = displayToken1.symbol || row.pool.token1.symbol;

      return {
        ...row,
        __amount0: amount0,
        __amount1: amount1,
        __symbol0: symbol0,
        __symbol1: symbol1,
        __isOpen: isPositionOpen(row),
      }
    })
  }, [positions])

  const filteredPositions = useMemo(() => {
    if (statusFilter === 'open') return positionsWithAmounts.filter((p: any) => p.__isOpen)
    return positionsWithAmounts.filter((p: any) => !p.__isOpen)
  }, [positionsWithAmounts, statusFilter])

  const columns: TableColumn[] = [
    { label: 'TokenId', key: 'tokenid', render: (row) => ('#' + row.nftTokenId) },
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
            {`${row.__symbol0} / ${row.__symbol1}`}
          </span>
        </Link>
      ),
    },
    { label: 'Fee Tier', key: 'fee', render: (row) => (`${row.position.fee / 10000}%`) },
    {
      label: 'Position size', key: 'size', render: (row) => <PositionSizeCell row={row} />
    },
    {
      label: 'Pool APR', key: 'apr', render: (row) => {
        return row.pool.PoolStatistic.length > 0 && row.pool.PoolStatistic[0].apr !== 0
          ? `${row.pool.PoolStatistic[0].apr.toFixed(2)}%`
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
                <>
                  <div className="PoolPage__TableWrapper">
                    <Table
                      columns={columns}
                      data={filteredPositions}
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
