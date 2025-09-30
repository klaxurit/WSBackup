import React, { useState } from 'react';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { TransactionsTable } from '../../components/ExploreTables/transactions';
import { PoolsTable } from '../../components/ExploreTables/pools';
import { TokensTable } from '../../components/ExploreTables/tokens';
import { VaultsTable } from '../../components/ExploreTables/vaults';
import { NewBanner } from '../../components/Common/NewBanner';
import { PageContentTransition } from '../../components/Transitions';
import beeIcon from '../../assets/bee_icon.png';
import { useLocation } from 'react-router-dom';

const TABS = [
  { key: 'tokens', label: 'Tokens' },
  { key: 'pools', label: 'Pools' },
  { key: 'vaults', label: 'Vaults' },
  { key: 'transactions', label: 'Transactions' },
];

const ExplorePage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'tokens';

  const [activeTab, setActiveTab] = useState<'tokens' | 'pools' | 'vaults' | 'transactions'>(
    TABS.some(t => t.key === initialTab) ? initialTab as 'tokens' | 'pools' | 'vaults' | 'transactions' : 'tokens'
  );
  const [search, setSearch] = useState('');


  return (
    <PageContentTransition className="ExplorePage">
      <NewBanner title="Explore" subtitle="Discover your next trading opportunities" image={beeIcon} />

      <div className="ExplorePage__Header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="ExplorePage__Tabs" style={{ display: 'flex', gap: 8 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`btn btn--tiny ${activeTab === tab.key ? 'btn__main' : 'btn__shade'}`}
              onClick={() => setActiveTab(tab.key as 'tokens' | 'pools' | 'vaults' | 'transactions')}
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
          activeTab={TABS.find(t => t.key === activeTab)?.label}
        />
      </div>

      {activeTab === 'tokens' && <TokensTable searchValue={search} />}
      {activeTab === 'pools' && <PoolsTable searchValue={search} />}
      {activeTab === 'vaults' && <VaultsTable searchValue={search} />}
      {activeTab === 'transactions' && <TransactionsTable />}
    </PageContentTransition>
  );
};

export default ExplorePage;
