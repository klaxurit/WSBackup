import { useState } from "react";
import { SearchBar } from "../SearchBar/SearchBar";
import { Menu } from "./Menu";
import { NavbarConnectButton } from "../Buttons/NavbarConnectButton";
import { MobileMenuModal } from './MobileMenuModal';

const Navbar = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="Navbar">
      <div className="Navbar__Content">
        {/* Mobile: burger | logo | connect - Desktop: logo | search | connect */}
        <div className="Navbar__Left">
          <button className="Navbar__Hamburger" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
        </div>
        <div className="Navbar__Center">
          <Menu />
        </div>
        <div className="Navbar__SearchBar Navbar__SearchBar--desktop">
          <SearchBar
            searchValue={searchValue}
            setSearchValue={setSearchValue}
            mode="expanded"
          />
        </div>
        <div className="Navbar__Right">
          <div className="Navbar__ConnectButton">
            <NavbarConnectButton onClick={toggleSidebar} />
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
