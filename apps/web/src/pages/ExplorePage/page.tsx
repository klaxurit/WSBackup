import React, { useState } from 'react';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import MiniChart from '../../components/Charts/MiniChart';
import type { MiniChartPoint } from '../../components/Charts/MiniChart';
import { BERACHAIN_TOKENS } from '../../config/berachainTokens';
import { FallbackImg } from '../../components/utils/FallbackImg';
import { usePrice } from '../../hooks/usePrice';

const TABS = [
  { key: 'tokens', label: 'Tokens' },
  { key: 'pools', label: 'Pools' },
  { key: 'transactions', label: 'Transactions' },
];

// Colonnes pour le tableau
const tokenColumns: TableColumn[] = [
  { label: '#', key: 'index' },
  { label: 'Token name', key: 'tokenName' },
  { label: 'Prix', key: 'price' },
  { label: '1h', key: 'change1h' },
  { label: '1d', key: 'change1d' },
  { label: 'FDV', key: 'fdv' },
  { label: 'Volume', key: 'volume' },
  { label: '1D Chart', key: 'chart' },
];

// Génère une ligne droite pour le MiniChart
function generateFlatChartData(points = 24, value = 1): MiniChartPoint[] {
  return Array.from({ length: points }, (_, i) => ({ x: i, y: value }));
}

// Composant pour une ligne du tableau token
const TokenTableRow: React.FC<{ token: typeof BERACHAIN_TOKENS[number]; rowIndex: number }> = ({ token, rowIndex }) => {
  const [displayFallback, setDisplayFallback] = React.useState(false);
  const { data: price, isLoading } = usePrice(token);
  return (
    <>
      <td>{rowIndex + 1}</td>
      <td style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {displayFallback || !token.logoUri
          ? <FallbackImg content={token.symbol} />
          : (
            <img
              src={token.logoUri}
              alt={token.name}
              style={{ width: 28, height: 28, borderRadius: 8 }}
              onError={() => setDisplayFallback(true)}
            />
          )}
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 600 }}>{token.name}</span>
          <span style={{ color: '#aaa', fontSize: 13, fontWeight: 500 }}>{token.symbol}</span>
        </span>
      </td>
      <td>{isLoading ? <span>...</span> : price ? `$${price.toFixed(4)}` : '-'}</td>
      <td>N/A</td>
      <td>N/A</td>
      <td>N/A</td>
      <td>N/A</td>
      <td><MiniChart data={generateFlatChartData()} /></td>
    </>
  );
};

const ExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tokens');
  const [search, setSearch] = useState('');
  const filteredTokens = search
    ? BERACHAIN_TOKENS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase()))
    : BERACHAIN_TOKENS;

  const tokenLogos: Record<string, string> = {
    USDC: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png',
    WETH: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    ETH: 'https://assets.trustwalletapp.com/blockchains/ethereum/info/logo.png',
    DAI: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png',
    USDT: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png',
    WBTC: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png',
    UNI: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png',
    LINK: 'https://assets.trustwalletapp.com/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png',
  };
  function getTokenLogo(symbol: string) {
    return tokenLogos[symbol] || 'https://etherscan.io/images/main/empty-token.png';
  }

  const poolColumns: TableColumn[] = [
    { label: '#', key: 'index', render: (_row, i) => i + 1 },
    {
      label: 'Pool', key: 'pool', render: (row) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
            <img src={row.logoA} alt={row.tokenA} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} />
            <img src={row.logoB} alt={row.tokenB} style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 16, zIndex: 1 }} />
          </span>
          <span style={{ fontWeight: 600 }}>{row.pool}</span>
        </span>
      )
    },
    { label: 'Protocol', key: 'protocol' },
    { label: 'Fee Tier', key: 'fee' },
    { label: 'TVL', key: 'tvl' },
    { label: 'Pool APR', key: 'apr' },
    { label: 'Reward APR', key: 'rewardApr' },
    { label: 'Vol. 1d', key: 'vol1d' },
    { label: 'Vol. 30d', key: 'vol30d' },
    { label: 'Vol. 1d/TVL', key: 'vol1dTvl' },
  ];

  function fakePoolName() {
    const pools = ['USDC/WETH', 'DAI/USDT', 'WBTC/ETH', 'UNI/USDC', 'LINK/ETH'];
    return pools[Math.floor(Math.random() * pools.length)];
  }
  function fakeProtocol() {
    const protocols = ['Uniswap', 'Sushiswap', 'Balancer', 'Curve', 'WinnieSwap'];
    return protocols[Math.floor(Math.random() * protocols.length)];
  }
  function fakeFee() {
    const fees = ['0.05%', '0.3%', '1%'];
    return fees[Math.floor(Math.random() * fees.length)];
  }
  function fakeTVL() {
    return (Math.random() * 10_000_000).toLocaleString() + ' $';
  }
  function fakeAPR() {
    return (Math.random() * 20).toFixed(2) + ' %';
  }
  function fakeVol() {
    return (Math.random() * 1_000_000).toLocaleString() + ' $';
  }
  function fakeVolTvl() {
    return (Math.random() * 0.5).toFixed(2);
  }
  const poolData = Array.from({ length: 10 }, (_, i) => {
    const poolName = fakePoolName();
    const [tokenA, tokenB] = poolName.split('/');
    return {
      index: i + 1,
      logoA: getTokenLogo(tokenA),
      logoB: getTokenLogo(tokenB),
      tokenA,
      tokenB,
      pool: poolName,
      protocol: fakeProtocol(),
      fee: fakeFee(),
      tvl: fakeTVL(),
      apr: fakeAPR(),
      rewardApr: fakeAPR(),
      vol1d: fakeVol(),
      vol30d: fakeVol(),
      vol1dTvl: fakeVolTvl(),
    };
  });

  const txColumns: TableColumn[] = [
    {
      label: 'Time',
      key: 'time',
      render: (row) => {
        const now = new Date();
        const txTime = new Date(row.time);
        const diffMs = now.getTime() - txTime.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Just now';
        if (diffMin < 60) return `${diffMin} min ago`;
        const diffH = Math.floor(diffMin / 60);
        return `${diffH}h ago`;
      },
    },
    {
      label: 'Type',
      key: 'type',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          Swap
          <img src={getTokenLogo(row.token1)} alt={row.token1} style={{ width: 18, height: 18, borderRadius: 6, margin: '0 2px' }} />
          {row.token1} for
          <img src={getTokenLogo(row.token2)} alt={row.token2} style={{ width: 18, height: 18, borderRadius: 6, margin: '0 2px' }} />
          {row.token2}
        </span>
      ),
    },
    { label: 'USD', key: 'usd' },
    {
      label: 'Token amount (sent)',
      key: 'amount1',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {row.amount1}
          <img src={getTokenLogo(row.token1)} alt={row.token1} style={{ width: 18, height: 18, borderRadius: 6, marginLeft: 2 }} />
        </span>
      ),
    },
    {
      label: 'Token amount (received)',
      key: 'amount2',
      render: (row) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {row.amount2}
          <img src={getTokenLogo(row.token2)} alt={row.token2} style={{ width: 18, height: 18, borderRadius: 6, marginLeft: 2 }} />
        </span>
      ),
    },
    {
      label: 'Wallet',
      key: 'wallet',
      render: (row) => (
        <a
          href={`https://beratrail.io/address/${row.wallet}`}
          target="_blank"
          rel="noopener noreferrer"
          className="Table__Address"
          title={row.wallet}
        >
          {row.wallet?.slice(0, 6) + '...' + row.wallet?.slice(-4)}
        </a>
      ),
    },
  ];

  function fakeTxType() {
    return Math.random() > 0.5 ? 'Buy' : 'Sell';
  }
  function fakeTxAmount() {
    return (Math.random() * 1000).toFixed(3);
  }
  function fakeTxToken() {
    const tokens = ['USDC', 'ETH', 'DAI', 'WBTC', 'UNI'];
    return tokens[Math.floor(Math.random() * tokens.length)];
  }
  function fakeTxValue() {
    return (Math.random() * 10000).toFixed(2) + ' $';
  }
  function fakeTxAddress() {
    const chars = 'abcdef0123456789';
    let addr = '0x';
    for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)];
    return addr;
  }
  function fakeTxTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - Math.floor(Math.random() * 120));
    return now.toISOString();
  }
  const txData = Array.from({ length: 12 }, () => ({
    time: fakeTxTime(),
    type: fakeTxType(),
    usd: fakeTxValue(),
    amount1: fakeTxAmount(),
    token1: fakeTxToken(),
    amount2: fakeTxAmount(),
    token2: fakeTxToken(),
    wallet: fakeTxAddress(),
  })).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="ExplorePage">
      <div className="ExplorePage__Header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="ExplorePage__Tabs" style={{ display: 'flex', gap: 8 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'Table__FilterBtn active' : 'Table__FilterBtn'}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <SearchBar
          searchValue={search}
          setSearchValue={setSearch}
          mode="compact"
        />
      </div>
      {activeTab === 'tokens' && (
        <div className="Table__Wrapper Table__Scroll">
          <table className="Table Table--bordered">
            <thead>
              <tr>
                {tokenColumns.map(col => <th key={col.key}>{col.label}</th>)}
              </tr>
            </thead>
            <tbody>
              {filteredTokens.length === 0 ? (
                <tr><td colSpan={tokenColumns.length}>Aucun token</td></tr>
              ) : (
                filteredTokens.map((token, i) => (
                  <tr key={token.address}>
                    <TokenTableRow token={token} rowIndex={i} />
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {activeTab === 'pools' && (
        <Table
          columns={poolColumns}
          data={poolData}
          tableClassName="Table"
          wrapperClassName="Table__Wrapper"
          scrollClassName="Table__Scroll"
        />
      )}
      {activeTab === 'transactions' && (
        <Table
          columns={txColumns}
          data={txData}
          tableClassName="Table"
          wrapperClassName="Table__Wrapper"
          scrollClassName="Table__Scroll"
        />
      )}
    </div>
  );
};

export default ExplorePage; 
