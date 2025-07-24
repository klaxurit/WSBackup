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

const TRANSACTIONS_PER_PAGE = 10;

const ExplorePage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'tokens';

  const [activeTab, setActiveTab] = useState<'tokens' | 'pools' | 'transactions'>(
    TABS.some(t => t.key === initialTab) ? initialTab as 'tokens' | 'pools' | 'transactions' : 'tokens'
  );
  const [search, setSearch] = useState('');
  const [transactionsPage, setTransactionsPage] = useState(1);

  // Reset pagination when changing tabs or search
  React.useEffect(() => {
    setTransactionsPage(1);
  }, [activeTab, search]);

  // Récupération des données pour chaque tableau
  const { data: tokens = [], isLoading: tokensLoading } = useQuery({
    queryKey: ['tokens'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/tokens`);
      if (!resp.ok) return [];
      return resp.json();
    }
  });

  const { data: pools = [], isLoading: poolsLoading } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools`);
      if (!resp.ok) return [];
      return resp.json();
    }
  });

  const { data: txs = [], isLoading: txsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/swaps`);
      if (!resp.ok) return [];
      return resp.json();
    },
    select: (data) => {
      return data.map((s: any) => {
        if (s.amount0 > 0n) {
          // A -> B
          return {
            ...s,
            tokenIn: s.pool.token0,
            tokenOut: s.pool.token1,
            amountIn: s.amount0,
            amountOut: s.amount1,
          }
        } else {
          // B -> A
          return {
            ...s,
            tokenIn: s.pool.token1,
            tokenOut: s.pool.token0,
            amountIn: s.amount1,
            amountOut: s.amount0,
          }
        }
      })
    }
  });

  // Filtrage contextuel selon l'onglet actif
  const filteredTokens = useMemo(() => {
    const inPoolTokens = tokens.filter((t: any) => t.inPool)
    if (!search) return inPoolTokens
    return inPoolTokens.filter((token: any) =>
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.symbol.toLowerCase().includes(search.toLowerCase()) ||
      token.address.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, tokens]);

  const filteredPools = useMemo(() => {
    if (!search) return pools;
    return pools.filter((pool: any) =>
      (pool.pool && pool.pool.toLowerCase().includes(search.toLowerCase())) ||
      (pool.address && pool.address.toLowerCase().includes(search.toLowerCase())) ||
      (pool.token0?.symbol && pool.token0.symbol.toLowerCase().includes(search.toLowerCase())) ||
      (pool.token1?.symbol && pool.token1.symbol.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, pools]);

  const filteredTxs = useMemo(() => {
    if (!search) return txs;
    return txs.filter((tx: any) =>
      (tx.recipient && tx.recipient.toLowerCase().includes(search.toLowerCase())) ||
      (tx.tokenIn?.symbol && tx.tokenIn.symbol.toLowerCase().includes(search.toLowerCase())) ||
      (tx.tokenOut?.symbol && tx.tokenOut.symbol.toLowerCase().includes(search.toLowerCase()))
    );
  }, [search, txs]);

  // Pagination pour les transactions
  const transactionsPagination = useMemo(() => {
    const totalTransactions = filteredTxs.length;
    const totalPages = Math.ceil(totalTransactions / TRANSACTIONS_PER_PAGE);
    const startIndex = (transactionsPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
    const paginatedTransactions = filteredTxs.slice(startIndex, endIndex);

    return {
      data: paginatedTransactions,
      pagination: {
        currentPage: transactionsPage,
        totalPages,
        onPageChange: setTransactionsPage,
        itemsPerPage: TRANSACTIONS_PER_PAGE,
        totalItems: totalTransactions,
      }
    };
  }, [filteredTxs, transactionsPage]);

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
      {activeTab === 'tokens' && <TokensTable data={filteredTokens} isLoading={tokensLoading} />}
      {activeTab === 'pools' && <PoolsTable data={filteredPools} isLoading={poolsLoading} />}
      {activeTab === 'transactions' && (
        <TransactionsTable
          data={transactionsPagination.data}
          isLoading={txsLoading}
          pagination={transactionsPagination.pagination}
        />
      )}
    </div>
  );
};

export default ExplorePage;
