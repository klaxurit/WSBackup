import React, { useEffect, useMemo, useState } from "react";
import "../../styles/navbar.scss";
import { SearchBar } from "../SearchBar/SearchBar";
import { Menu } from "./Menu";
import { ConnectButton } from "../Buttons/ConnectButton";

const Navbar = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const formatedAddr = useMemo(() => {
    if (address) {
      const start = address.substring(0, 5);
      const end = address.substring(address.length - 4);
      return `${start}...${end}`;
    }
    return null;
  }, [address]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <nav className={`Navbar ${isSidebarOpen ? 'transparent' : ''}`}>
      <div className="Navbar__Content">
        <div className="Navbar__Menu">
          <Menu onMenuClick={toggleSidebar} />
        </div>
        <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} />
        {!isSidebarOpen ? (
          <div className="Navbar__ConnectButton">
            <ConnectButton
              type="shade"
              text={formatedAddr || "Connect"}
              size="small"
              onClick={toggleSidebar}
            />
          </div>
        ) : (
          <div className="Navbar__ConnectButton">
            <div className="ConnectButtonPlaceholder"></div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 