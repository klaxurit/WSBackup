import React, { useState } from 'react';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { BERACHAIN_TOKENS } from '../../config/berachainTokens';
import { TransactionsTable } from '../../components/ExploreTables/transactions';
import { PoolsTable } from '../../components/ExploreTables/pools';
import { TokensTable } from '../../components/ExploreTables/tokens';

const TABS = [
  { key: 'tokens', label: 'Tokens' },
  { key: 'pools', label: 'Pools' },
  { key: 'transactions', label: 'Transactions' },
];

const ExplorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tokens');
  const [search, setSearch] = useState('');
  const filteredTokens = search
    ? BERACHAIN_TOKENS.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.symbol.toLowerCase().includes(search.toLowerCase()))
    : BERACHAIN_TOKENS;

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
      {activeTab === 'tokens' && <TokensTable />}
      {activeTab === 'pools' && <PoolsTable />}
      {activeTab === 'transactions' && <TransactionsTable />}
    </div>
  );
};

export default ExplorePage; 
