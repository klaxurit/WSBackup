import React from 'react';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { usePopularTokens } from '../../hooks/usePopularTokens';

interface PopularTokensProps {
  tokens: BerachainToken[];
  onTokenSelect: (token: BerachainToken) => void;
  selectedToken?: BerachainToken | null;
}

export const PopularTokens: React.FC<PopularTokensProps> = ({
  tokens,
  onTokenSelect,
  selectedToken
}) => {
  const popularTokens = usePopularTokens(tokens);

  if (popularTokens.length === 0) {
    return null;
  }

  return (
    <div className="PopularTokens">
      <div className="PopularTokens__Label">
        Popular tokens
      </div>
      <div className="PopularTokens__List">
        {popularTokens.map((token) => (
          <button
            key={token.address || token.symbol}
            className={`PopularTokens__Button ${selectedToken?.symbol === token.symbol ? 'PopularTokens__Button--selected' : ''
              }`}
            onClick={() => onTokenSelect(token)}
            type="button"
          >
            <div className="PopularTokens__ButtonContent">
              {token.logoUri ? (
                <img
                  src={token.logoUri}
                  alt={token.symbol}
                  className="PopularTokens__ButtonLogo"
                />
              ) : (
                <div className="PopularTokens__ButtonLogo PopularTokens__ButtonLogo--placeholder">
                  {token.symbol[0]}
                </div>
              )}
              <span className="PopularTokens__ButtonSymbol">
                {token.symbol}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};