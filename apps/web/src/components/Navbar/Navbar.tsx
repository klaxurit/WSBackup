import { useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";
import { Menu } from "./Menu";
import { NavbarConnectButton } from "../Buttons/NavbarConnectButton";
import { MobileMenuModal } from './MobileMenuModal';
import { useTokens, type BerachainToken } from '../../hooks/useBerachainTokenList';
import { usePools, type Pool } from '../../hooks/usePools';
import { Link } from 'react-router-dom';
import { FallbackImg } from '../utils/FallbackImg';
import { SafeImage } from '../utils/SafeImage';
import { ensureArray } from '../../utils/dataValidation';

const Navbar = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Recherche globale ---
  const { data: tokens } = useTokens();
  const { data: pools = [] } = usePools();

  // S'assurer que tokens et pools sont des tableaux
  const tokensArray = ensureArray(tokens) as BerachainToken[];
  const poolsArray = ensureArray(pools) as Pool[];

  const filteredTokens = searchValue.length > 0 ? tokensArray.filter((token: BerachainToken) =>
    token.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
    token.address.toLowerCase().includes(searchValue.toLowerCase())
  ) : [];

  const filteredPools = searchValue.length > 0 ? poolsArray.filter((pool: Pool) =>
    (pool.id && pool.id.toLowerCase().includes(searchValue.toLowerCase())) ||
    (pool.token0Ref?.symbol && pool.token0Ref.symbol.toLowerCase().includes(searchValue.toLowerCase())) ||
    (pool.token1Ref?.symbol && pool.token1Ref.symbol.toLowerCase().includes(searchValue.toLowerCase()))
  ) : [];

  const showDropdown = searchValue.length > 0 && (filteredTokens.length > 0 || filteredPools.length > 0);
  // --- Fin recherche globale ---

  return (
    <nav className="Navbar">
      <div className="Navbar__Content">
        {/* Mobile: burger | logo | connect - Desktop: logo | search | connect */}
        <div className="Navbar__Left">
          <button className="Navbar__Hamburger Navbar__Hamburger--mobile" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
          <Menu />
        </div>
        <div className="Navbar__Center">
          <div className="Navbar__SearchBar Navbar__SearchBar--desktop" style={{ position: 'relative', zIndex: 30 }}>
            <SearchBar
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              mode="expanded"
            />
            {showDropdown && (
              <div className="GlobalSearch__Dropdown">
                {filteredTokens.length > 0 && (
                  <div className="GlobalSearch__Section">
                    <div className="GlobalSearch__SectionTitle">Tokens</div>
                    {filteredTokens.map(token => (
                      <Link
                        key={token.address}
                        to={`/tokens/${token.address}`}
                        className="GlobalSearch__DropdownItem"
                        onClick={() => setSearchValue("")}
                      >
                        <div className="GlobalSearch__TokenInfo">
                          <div className="GlobalSearch__TokenLogo">
                            {token.logoUri
                              ? <SafeImage
                                src={token.logoUri}
                                alt={token.symbol}
                                fallbackContent={token.symbol}
                                width={22}
                                height={22}
                              />
                              : <FallbackImg content={token.symbol} width={22} height={22} />}
                          </div>
                          <span className="GlobalSearch__TokenSymbol">{token.symbol}</span>
                          <span className="GlobalSearch__TokenName">{token.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {filteredPools.length > 0 && (
                  <div className="GlobalSearch__Section">
                    <div className="GlobalSearch__SectionTitle">Pools</div>
                    {filteredPools.map((pool: Pool) => (
                      <Link
                        key={pool.id}
                        to={`/pool/${pool.id}`}
                        className="GlobalSearch__DropdownItem"
                        onClick={() => setSearchValue("")}
                      >
                        <div className="GlobalSearch__PoolLogos">
                          <div className="GlobalSearch__PoolLogo GlobalSearch__PoolLogo--token0">
                            {pool.token0Ref?.logoUri
                              ? <SafeImage
                                src={pool.token0Ref.logoUri}
                                alt={pool.token0Ref.symbol}
                                fallbackContent={pool.token0Ref.symbol}
                                width={22}
                                height={22}
                              />
                              : <FallbackImg content={pool.token0Ref?.symbol || '?'} width={22} height={22} />}
                          </div>
                          <div className="GlobalSearch__PoolLogo GlobalSearch__PoolLogo--token1">
                            {pool.token1Ref?.logoUri
                              ? <SafeImage
                                src={pool.token1Ref.logoUri}
                                alt={pool.token1Ref.symbol}
                                fallbackContent={pool.token1Ref.symbol}
                                width={22}
                                height={22}
                              />
                              : <FallbackImg content={pool.token1Ref?.symbol || '?'} width={22} height={22} />}
                          </div>
                        </div>
                        <span className="GlobalSearch__TokenSymbol">{pool.token0Ref?.symbol}/{pool.token1Ref?.symbol}</span>
                        <span className="GlobalSearch__PoolFee">{pool.feeTier / 10000}%</span>
                      </Link>
                    ))}
                  </div>
                )}
                {filteredTokens.length === 0 && filteredPools.length === 0 && (
                  <div className="GlobalSearch__NoResults">No results found</div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="Navbar__Right">
          <div className="Navbar__ConnectButton">
            <NavbarConnectButton />
          </div>
        </div>
        <MobileMenuModal
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
        />
      </div>
    </nav>
  );
};

export default Navbar; 
