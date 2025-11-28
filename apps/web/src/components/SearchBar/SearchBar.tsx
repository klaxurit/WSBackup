import { useRef, useState, useEffect } from "react";

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
  const [isExpanded, setIsExpanded] = useState(mode === 'expanded' || mode === 'default');
  const inputRef = useRef<HTMLInputElement>(null);

  const cleanSearchBar = () => setSearchValue("");

  // Add keyboard shortcut handler for "/" key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle "/" key when not in an input/textarea and when the component is visible
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA" &&
        !document.activeElement?.hasAttribute("contenteditable")
      ) {
        // Check if this input is visible before trying to focus it
        const inputElement = inputRef.current;
        if (!inputElement) return;

        // Check if the input or its parent container is visible
        const isVisible = inputElement.offsetParent !== null;
        if (!isVisible) return;

        e.preventDefault(); // Prevent "/" from being typed
        inputElement.focus();

        // If in compact mode and not expanded, expand it
        if (mode === 'compact' && !isExpanded) {
          setIsExpanded(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mode, isExpanded]);

  const handleIconClick = () => {
    if (mode === 'compact' && !isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
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
      case 'Vaults':
        return "Search vaults";
      default:
        return "Search";
    }
  })();

  const getClassName = () => {
    let classes = 'SearchBar';
    if (mode === 'compact') {
      classes += ' SearchBar__compact';
      if (isExpanded) {
        classes += ' expanded';
      }
    } else if (mode === 'expanded') {
      classes += ' expanded';
    }
    return classes;
  };

  const className = getClassName();
  const placeholderText = mode === 'compact' ? (networksList ? "Search networks" : "Search tokens") :
    !networksList ? "Search" : "Search tokens, pools, transactions";

  const showRightContent = !(mode === 'compact' && !isExpanded);

  return (
    <form className={className}>
      <div className="SearchBar__Content" onClick={handleIconClick}>
        <svg className="SearchBar__iconSearch" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M13.3333 13.3333L16.6666 16.6666M15 9.16665C15 12.3883 12.3883 15 9.16665 15C5.94499 15 3.33331 12.3883 3.33331 9.16665C3.33331 5.94499 5.94499 3.33331 9.16665 3.33331C12.3883 3.33331 15 5.94499 15 9.16665Z" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          className="SearchBar__input"
          placeholder={mode === 'compact' ? arraySearchPlaceholderText : placeholderText}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          onBlur={() => {
            if (!searchValue && mode === 'compact') {
              setIsExpanded(false);
            }
          }}
        />
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
