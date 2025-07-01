import { useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";
import { Menu } from "./Menu";
import { NavbarConnectButton } from "../Buttons/NavbarConnectButton";
import { MobileMenuModal } from './MobileMenuModal';

const Navbar = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <div className="Navbar__SearchBar Navbar__SearchBar--desktop">
            <SearchBar
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              mode="expanded"
            />
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
