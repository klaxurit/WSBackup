import React from 'react';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { Link } from 'react-router-dom';
import '../../styles/pages/_poolsPage.scss';

// Logos fictifs pour l'exemple
const tokenLogos: Record<string, string> = {
  USDC: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
  ETH: 'https://assets.trustwalletapp.com/blockchains/ethereum/info/logo.png',
  WBTC: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
  WISE: 'https://cryptologos.cc/logos/wise-token-wise-logo.png',
  USDTE: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
};

const columns: TableColumn[] = [
  {
    label: 'Pair',
    key: 'pair',
    render: (row) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
          <img src={getTokenLogo(row.tokenA)} alt={row.tokenA} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} />
          <img src={getTokenLogo(row.tokenB)} alt={row.tokenB} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 16, zIndex: 1 }} />
        </span>
        {row.tokenA} / {row.tokenB}
      </span>
    ),
  },
  { label: 'Fee', key: 'fee' },
  { label: 'APR', key: 'apr' },
  { label: 'Actions', key: 'actions', render: () => <button className="PoolPage__ManageBtn">Gérer</button> },
];

const data = [
  { tokenA: 'USDC', tokenB: 'ETH', fee: '0.05%', apr: '25.35%' },
  { tokenA: 'WBTC', tokenB: 'ETH', fee: '0.3%', apr: '28.54%' },
];

const topPools = [
  { tokens: ['WISE', 'ETH'], version: 'v2', fee: '0.3%', apr: '0.00%', aprChange: '', },
  { tokens: ['USDC', 'USDTE'], version: 'v4', fee: '0.01%', apr: '2.33%', aprChange: '+8.92%' },
  { tokens: ['USDC', 'ETH'], version: 'v3', fee: '0.05%', apr: '25.35%', aprChange: '' },
  { tokens: ['WBTC', 'ETH'], version: 'v3', fee: '0.3%', apr: '28.54%', aprChange: '' },
];

const getTokenLogo = (symbol: string) => tokenLogos[symbol] || 'https://etherscan.io/images/main/empty-token.png';

const PoolPage: React.FC = () => {
  return (
    <div className="PoolPage">
      {/* Section gauche (70%) */}
      <div className="PoolPage__Left">
        <div className="PoolPage__Header">
          <h2 className="PoolPage__Title">Your positions</h2>
          <Link className="PoolPage__NewBtn" to="/pools/create">New</Link>
        </div>
        <div className="PoolPage__TableWrapper">
          <Table
            columns={columns}
            data={data}
            tableClassName="PoolPage__Table"
            wrapperClassName="PoolPage__TableWrapper"
            scrollClassName="PoolPage__TableScroll"
            emptyMessage="Aucune position trouvée"
          />
        </div>
        <button className="PoolPage__ClosedBtn">Voir les positions fermées</button>
      </div>
      {/* Section droite (30%) */}
      <div className="PoolPage__Right">
        <h3 className="PoolPage__TopTitle">Top pools by TVL</h3>
        <div className="PoolPage__TopList">
          {topPools.map((pool, i) => (
            <div className="PoolPage__TopCard" key={i}>
              <div className="PoolPage__TopPair" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
                  <img src={getTokenLogo(pool.tokens[0])} alt={pool.tokens[0]} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} />
                  <img src={getTokenLogo(pool.tokens[1])} alt={pool.tokens[1]} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 16, zIndex: 1 }} />
                </span>
                {pool.tokens.join(' / ')} <span className="PoolPage__TopVersion">{pool.version}</span>
              </div>
              <div className="PoolPage__TopFee">{pool.fee} fee</div>
              <div className="PoolPage__TopApr">
                {pool.apr} APR {pool.aprChange && <span className="PoolPage__TopApr--positive">{pool.aprChange}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PoolPage; 