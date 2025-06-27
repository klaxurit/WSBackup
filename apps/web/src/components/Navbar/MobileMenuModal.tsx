import React from 'react';
import { SearchBar } from '../SearchBar/SearchBar';

interface MobileMenuModalProps {
  open: boolean;
  onClose: () => void;
  searchValue: string;
  setSearchValue: (v: string) => void;
}

export const MobileMenuModal: React.FC<MobileMenuModalProps> = ({ open, onClose, searchValue, setSearchValue }) => {
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
        <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} mode="expanded" />
      </div>
    </div>
  );
};

export default MobileMenuModal; 