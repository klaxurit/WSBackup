import React, { useState, useMemo } from 'react';
import { SearchBar } from '../../components/SearchBar/SearchBar';
import { TransactionsTable } from '../../components/ExploreTables/transactions';
import { PoolsTable } from '../../components/ExploreTables/pools';
import { TokensTable } from '../../components/ExploreTables/tokens';
import { useQuery } from '@tanstack/react-query';
import { Banner } from '../../components/Common/Banner';
import { useLocation } from 'react-router-dom';

const TABS = [
  { key: 'tokens', label: 'Tokens' },
  { key: 'pools', label: 'Pools' },
  { key: 'transactions', label: 'Transactions' },
];

const ExplorePage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'tokens';

  const [activeTab, setActiveTab] = useState<'tokens' | 'pools' | 'transactions'>(
    TABS.some(t => t.key === initialTab) ? initialTab as 'tokens' | 'pools' | 'transactions' : 'tokens'
  );
  const [search, setSearch] = useState('');

  const { data: pools = [], isLoading: poolsLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools`);
      if (!resp.ok) return [];
      return resp.json();
    }
  });

  const filteredPools = useMemo(() => {
    if (!search) return pools;
    return pools.filter((pool: any) =>
      (pool.pool && pool.pool.toLowerCase().includes(search.toLowerCase())) ||
      (pool.address && pool.address.toLowerCase().includes(search.toLowerCase())) ||
      (pool.token0?.symbol && pool.token0.symbol.toLowerCase().includes(search.toLowerCase())) ||
      (pool.token1?.symbol && pool.token1.symbol.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, pools]);

  return (
    <div className="ExplorePage">
      <Banner title="Explore" subtitle="Discover tokens, pools and transactions" />
      <div className="ExplorePage__Header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="ExplorePage__Tabs" style={{ display: 'flex', gap: 8 }}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? 'Table__FilterBtn active' : 'Table__FilterBtn'}
              onClick={() => setActiveTab(tab.key as 'tokens' | 'pools' | 'transactions')}
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
      {activeTab === 'pools' && <PoolsTable data={filteredPools} isLoading={poolsLoading} />}
      {activeTab === 'transactions' && <TransactionsTable searchValue={search} />}
    </div>
  );
};

export default ExplorePage;
