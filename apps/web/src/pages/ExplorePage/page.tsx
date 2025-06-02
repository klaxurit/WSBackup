import React, { useState } from 'react';
import '../../styles/explorePage.scss';
import '../../styles/table.scss';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { useBerachainTokenList } from '../../hooks/useBerachainTokenList';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import MiniChart from '../../components/Charts/MiniChart';
import type { MiniChartPoint } from '../../components/Charts/MiniChart';

const TABS = [
  { key: 'tokens', label: 'Tokens' },
  { key: 'pools', label: 'Pools' },
  { key: 'transactions', label: 'Transactions' },
];

const ExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tokens');
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const tokens = useBerachainTokenList();

  // Génère des fausses données pour le mini chart
  function generateFakeChartData(points = 24): MiniChartPoint[] {
    let last = 100 + Math.random() * 20;
    return Array.from({ length: points }, (_, i) => {
      last += (Math.random() - 0.5) * 2;
      return { x: i, y: last };
    });
  }

  // Génère une fausse valeur de prix
  function fakePrice() {
    return (Math.random() * 10 + 0.1).toFixed(2) + ' $';
  }
  // Génère une fausse variation en pourcentage
  function fakePercent() {
    const n = +(Math.random() * 8 - 4).toFixed(2);
    return (n > 0 ? '+' : '') + n.toFixed(2) + ' %';
  }
  // Génère une fausse FDV
  function fakeFDV() {
    return (Math.random() * 1_000_000_000).toLocaleString() + ' $';
  }
  // Génère un faux volume
  function fakeVolume() {
    return (Math.random() * 10_000_000).toLocaleString() + ' $';
  }

  const tokenColumns: TableColumn[] = [
    { label: '#', key: 'index', render: (_row, i) => i + 1 },
    { label: '', key: 'logoURI', render: (row) => <img src={row.logoURI} alt={row.symbol} style={{ width: 28, height: 28, borderRadius: 8 }} /> },
    { label: 'Token Name', key: 'name', render: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span> },
    { label: 'Symbol', key: 'symbol' },
    { label: 'Price', key: 'price', render: () => fakePrice() },
    {
      label: '1h', key: 'change1h', render: () => {
        const value = fakePercent();
        const isNeg = value.includes('-');
        return <span style={{ color: isNeg ? '#ff4d4d' : '#16c784', fontWeight: 600 }}>{value}</span>;
      }
    },
    {
      label: '1d', key: 'change1d', render: () => {
        const value = fakePercent();
        const isNeg = value.includes('-');
        return <span style={{ color: isNeg ? '#ff4d4d' : '#16c784', fontWeight: 600 }}>{value}</span>;
      }
    },
    { label: 'FDV', key: 'fdv', render: () => fakeFDV() },
    { label: 'Volume', key: 'volume', render: () => fakeVolume() },
    { label: '1D Chart', key: 'chart', render: () => <MiniChart data={generateFakeChartData()} /> },
  ];

  const filteredTokens = search
    ? tokens.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase()))
    : tokens;

  // Liste de logos pour les tokens connus
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

  // FAKE DATA POUR LE TABLEAU POOLS
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
    { label: 'Time', key: 'time' },
    {
      label: 'Type', key: 'type', render: (row) => (
        <span className={`Table__TypeBadge Table__TypeBadge--${row.type?.toLowerCase?.()}`}>{row.type}</span>
      )
    },
    { label: 'USD', key: 'usd' },
    { label: 'Token Amount 1', key: 'amount1' },
    { label: 'Token 1', key: 'token1' },
    { label: 'Token Amount 2', key: 'amount2' },
    { label: 'Token 2', key: 'token2' },
    {
      label: 'Wallet', key: 'wallet', render: (row) => (
        <a
          href={`https://beratrail.io/address/${row.wallet}`}
          target="_blank"
          rel="noopener noreferrer"
          className="Table__Address"
          title={row.wallet}
        >
          {row.wallet?.slice(0, 6) + '...' + row.wallet?.slice(-4)}
        </a>
      )
    },
  ];

  // FAKE DATA POUR LE TABLEAU TRANSACTIONS
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
    return now.toLocaleTimeString();
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
  }));

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
      {/* Tableau selon le tab actif */}
      {activeTab === 'tokens' && (
        <Table
          columns={tokenColumns}
          data={filteredTokens}
          tableClassName="Table"
          wrapperClassName="Table__Wrapper"
          scrollClassName="Table__Scroll"
        />
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