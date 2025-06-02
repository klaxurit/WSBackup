import React, { useState } from 'react';
import '../../styles/explorePage.scss';
import '../../styles/table.scss';
import Table from '../../components/Table/Table';
import type { TableColumn } from '../../components/Table/Table';
import { useBerachainTokenList } from '../../hooks/useBerachainTokenList';
import { SearchBar } from '../../components/SearchBar/SearchBar';

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

  const tokenColumns: TableColumn[] = [
    { label: '#', key: 'index', render: (_row, i) => i + 1 },
    { label: '', key: 'logoURI', render: (row) => <img src={row.logoURI} alt={row.symbol} style={{ width: 28, height: 28, borderRadius: 8 }} /> },
    { label: 'Token Name', key: 'name', render: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span> },
    { label: 'Symbol', key: 'symbol' },
    { label: 'Price', key: 'price', render: () => '-' },
    { label: '1h', key: 'change1h', render: () => '-' },
    { label: '1d', key: 'change1d', render: () => '-' },
    { label: 'FDV', key: 'fdv', render: () => '-' },
    { label: 'Volume', key: 'volume', render: () => '-' },
    { label: '1D Chart', key: 'chart', render: () => '-' },
  ];

  const filteredTokens = search
    ? tokens.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase()))
    : tokens;

  const poolColumns: TableColumn[] = [
    { label: '#', key: 'index', render: (_row, i) => i + 1 },
    { label: 'Pool', key: 'pool' },
    { label: 'Protocol', key: 'protocol' },
    { label: 'Fee Tier', key: 'fee' },
    { label: 'TVL', key: 'tvl' },
    { label: 'Pool APR', key: 'apr' },
    { label: 'Reward APR', key: 'rewardApr' },
    { label: 'Vol. 1d', key: 'vol1d' },
    { label: 'Vol. 30d', key: 'vol30d' },
    { label: 'Vol. 1d/TVL', key: 'vol1dTvl' },
  ];
  const poolData: any[] = [];

  const txColumns: TableColumn[] = [
    { label: 'Time', key: 'time' },
    {
      label: 'Type', key: 'type', render: (row) => (
        <span className={`Table__Type Table__Type--${row.type?.toLowerCase?.()}`}>{row.type}</span>
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
  const txData: any[] = [];

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