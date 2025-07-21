import React from 'react';
import { SearchBar } from '../SearchBar/SearchBar';
import { useTokens } from '../../hooks/useBerachainTokenList';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FallbackImg } from '../utils/FallbackImg';

interface MobileMenuModalProps {
  open: boolean;
  onClose: () => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
}

export const MobileMenuModal: React.FC<MobileMenuModalProps> = ({ open, onClose, searchValue, setSearchValue }) => {
  const { data: tokens = [] } = useTokens();
  const { data: pools = [] } = useQuery({
    queryKey: ['pools'],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/stats/pools`);
      if (!resp.ok) return [];
      return resp.json();
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const filteredTokens = searchValue.length > 0 ? tokens.filter(token =>
    token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
    token.address.toLowerCase().includes(searchValue.toLowerCase())
  ) : [];

  const filteredPools = searchValue.length > 0 ? pools.filter((pool: any) =>
    (pool.pool && pool.pool.toLowerCase().includes(searchValue.toLowerCase())) ||
    (pool.address && pool.address.toLowerCase().includes(searchValue.toLowerCase())) ||
    (pool.token0?.symbol && pool.token0.symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
    (pool.token1?.symbol && pool.token1.symbol.toLowerCase().includes(searchValue.toLowerCase()))
  ) : [];

  const showDropdown = searchValue.length > 0 && (filteredTokens.length > 0 || filteredPools.length > 0);

  if (!open) return null;
  return (
    <div className={`MobileMenuModal__Overlay${open ? ' open' : ''}`}>
      <div className={`MobileMenuModal__Box${open ? ' open' : ''}`}>
        <button className="MobileMenuModal__Close" onClick={onClose} aria-label="Close menu">✕</button>
        <nav className="MobileMenuModal__Nav">
          <a href="/" className="MobileMenuModal__Link">Swap</a>
          <a href="/explore" className="MobileMenuModal__Link">Explore</a>
          <a href="/pools" className="MobileMenuModal__Link">Pools</a>
        </nav>
        <div style={{ position: 'relative', width: '100%' }}>
          <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} mode="expanded" />
          {showDropdown && (
            <div className="GlobalSearch__Dropdown" style={{
              position: 'absolute',
              top: 48,
              left: 0,
              right: 0,
              background: '#232323',
              borderRadius: 12,
              boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
              padding: 8,
              maxHeight: 340,
              overflowY: 'auto',
              border: '1px solid #363636',
              zIndex: 10
            }}>
              {filteredTokens.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: '#e39229', fontSize: 13, margin: '4px 0 4px 8px' }}>Tokens</div>
                  {filteredTokens.map(token => (
                    <Link
                      key={token.address}
                      to={`/tokens/${token.address}`}
                      className="GlobalSearch__DropdownItem"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8,
                        color: '#fff', textDecoration: 'none', fontSize: 15, cursor: 'pointer',
                      }}
                      onClick={() => {
                        setSearchValue("");
                        onClose();
                      }}
                    >
                      {token.logoUri
                        ? <img src={token.logoUri} alt={token.symbol} style={{ width: 22, height: 22, borderRadius: '50%' }} />
                        : <FallbackImg content={token.symbol} width={22} height={22} />}
                      <span style={{ fontWeight: 600 }}>{token.symbol}</span>
                      <span style={{ color: '#aaa', fontSize: 13 }}>{token.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              {filteredPools.length > 0 && (
                <div>
                  <div style={{ fontWeight: 600, color: '#e39229', fontSize: 13, margin: '4px 0 4px 8px' }}>Pools</div>
                  {filteredPools.map((pool: any) => (
                    <Link
                      key={pool.address}
                      to={`/pools/${pool.address}`}
                      className="GlobalSearch__DropdownItem"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderRadius: 8,
                        color: '#fff', textDecoration: 'none', fontSize: 15, cursor: 'pointer',
                      }}
                      onClick={() => {
                        setSearchValue("");
                        onClose();
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', position: 'relative', width: 36, height: 28, marginRight: 4 }}>
                        {pool.token0?.logoUri
                          ? <img src={pool.token0.logoUri} alt={pool.token0.symbol} style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 0, zIndex: 2 }} />
                          : <FallbackImg content={pool.token0?.symbol || '?'} width={22} height={22} style={{ position: 'absolute', left: 0, zIndex: 2, border: '2px solid #232323', background: '#fff', borderRadius: '50%' }} />}
                        {pool.token1?.logoUri
                          ? <img src={pool.token1.logoUri} alt={pool.token1.symbol} style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid #232323', background: '#fff', position: 'absolute', left: 14, zIndex: 1 }} />
                          : <FallbackImg content={pool.token1?.symbol || '?'} width={22} height={22} style={{ position: 'absolute', left: 14, zIndex: 1, border: '2px solid #232323', background: '#fff', borderRadius: '50%' }} />}
                      </span>
                      <span style={{ fontWeight: 600 }}>{pool.token0?.symbol}/{pool.token1?.symbol}</span>
                      <span style={{ color: '#aaa', fontSize: 13 }}>{pool.pool}</span>
                    </Link>
                  ))}
                </div>
              )}
              {filteredTokens.length === 0 && filteredPools.length === 0 && (
                <div style={{ color: '#aaa', padding: '8px 0', textAlign: 'center' }}>No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenuModal; 