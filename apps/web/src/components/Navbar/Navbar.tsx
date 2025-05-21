import React, { useState } from "react";
import "../../styles/navbar.scss";
import { SearchBar } from "../SearchBar/SearchBar";
import { Menu } from "./Menu";
import { NavbarConnectButton } from "../Buttons/NavbarConnectButton";

const Navbar = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <nav className="Navbar">
      <div className="Navbar__Content">
        <div className="Navbar__Menu">
          <Menu onMenuClick={toggleSidebar} />
        </div>
        <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} />
        <div className="Navbar__ConnectButton">
          <NavbarConnectButton onClick={toggleSidebar} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 