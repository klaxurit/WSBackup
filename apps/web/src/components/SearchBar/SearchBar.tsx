import { useRef, useState, useEffect } from "react";
import "../../styles/searchBar.scss";

type SearchBarProps = {
  searchValue: string;
  setSearchValue: (value: string) => void;
  networksList?: boolean;
  mode?: 'default' | 'network' | 'compact' | 'expanded';
  activeTab?: string;
};

export const SearchBar = ({
  searchValue,
  setSearchValue,
  networksList = false,
  mode = 'default',
  activeTab,
}: SearchBarProps) => {
  const [isExpanded, setIsExpanded] = useState(mode === 'expanded');
  const [showPlaceholder, setShowPlaceholder] = useState(mode !== 'compact');
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanSearchBar = () => setSearchValue("");

  const handleIconClick = () => {
    if (mode === 'compact' && !isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        if (mode === 'compact') {
          setShowPlaceholder(true);
        }
      }, 300);
      inputRef.current?.focus();
    }
  };

  const arraySearchPlaceholderText = (() => {
    switch (activeTab) {
      case 'Transactions':
        return "Search transactions";
      case 'Pools':
        return "Search pools";
      case 'Tokens':
        return "Search tokens";
      default:
        return "Search";
    }
  })();

  useEffect(() => {
    if (!isExpanded) {
      setShowPlaceholder(mode !== 'compact');
    }
  }, [isExpanded, mode]);

  const className = `SearchBar ${mode === 'compact' && !isExpanded ? 'SearchBar__compact' : ''} ${mode === 'compact' && isExpanded ? 'expanded' : ''}`;
  const placeholderText = mode === 'compact' ? (networksList ? "Search networks" : "Search tokens") :
    !networksList ? "Search tokens" : "Search tokens";

  const showRightContent = !(mode === 'compact' && !isExpanded);

  return (
    <form className={className}>
      <div className="SearchBar__Content" onClick={handleIconClick}>
        <svg className="SearchBar__iconSearch" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M13.3333 13.3333L16.6666 16.6666M15 9.16665C15 12.3883 12.3883 15 9.16665 15C5.94499 15 3.33331 12.3883 3.33331 9.16665C3.33331 5.94499 5.94499 3.33331 9.16665 3.33331C12.3883 3.33331 15 5.94499 15 9.16665Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        {(isExpanded || mode !== 'compact') && showPlaceholder ? (
          <input
            ref={inputRef}
            type="text"
            className="SearchBar__input"
            style={{ width: isExpanded ? 200 : 'auto' }}
            placeholder={mode === 'compact' ? arraySearchPlaceholderText : placeholderText}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={() => { if (!searchValue && mode === 'compact') setIsExpanded(false); }}
          />
        ) : null}
      </div>
      {showRightContent && (
        <div className="SearchBar__RightContent">
          {searchValue === "" && !networksList && mode !== 'compact' && (
            <span className="SearchBar__iconSlash">/</span>
          )}
          {searchValue !== "" && (
            <span className="SearchBar__icon" onClick={cleanSearchBar}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.66652 4.66666L11.3332 11.3333M11.3332 4.66666L4.6665 11.3333"
                  stroke="#868391"
                  strokeWidth="1.6"
                  strokeLinecap="square"
                />
              </svg>
            </span>
          )}
        </div>
      )}
    </form>
  );
};
