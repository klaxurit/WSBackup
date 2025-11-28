import React from "react";
import { TokenLogo } from '../Common/TokenLogo';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import type { OptimizedRoute } from '../../hooks/swap/useSwap';
import { cleanTokenSymbol, isStickyVaultToken } from '../../utils/tokenDisplay';

interface RouteDisplayProps {
  optimizedRoute: OptimizedRoute | null;
  fromToken: BerachainToken | null;
  toToken: BerachainToken | null;
}

interface TokenDisplayProps {
  token: BerachainToken;
  size?: number;
}

const TokenDisplay: React.FC<TokenDisplayProps> = React.memo(({ token, size = 20 }) => {
  const displaySymbol = isStickyVaultToken(token.name)
    ? cleanTokenSymbol(token.symbol)
    : token.symbol;

  return (
    <div className="RouteDisplay__Token">
      <TokenLogo logoUri={token.logoUri} symbol={token.symbol} size={size} className="RouteDisplay__TokenIcon" />
      <span className="RouteDisplay__TokenSymbol">{displaySymbol}</span>
    </div>
  );
});

TokenDisplay.displayName = "TokenDisplay";

const RouteArrow: React.FC = () => (
  <svg
    className="RouteDisplay__Arrow"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
  >
    <path
      d="M2 6H10M10 6L7 3M10 6L7 9"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RoutePath: React.FC<{
  tokens: BerachainToken[];
  percentage?: number;
  fee?: number;
}> = React.memo(({ tokens, percentage, fee }) => {
  return (
    <div className="RouteDisplay__Path">
      {percentage && (
        <span className="RouteDisplay__Percentage">{percentage}%</span>
      )}
      <div className="RouteDisplay__TokenPath">
        {tokens.map((token, index) => (
          <React.Fragment key={token.address}>
            <TokenDisplay token={token} size={16} />
            {index < tokens.length - 1 && <RouteArrow />}
          </React.Fragment>
        ))}
      </div>
      {fee && (
        <span className="RouteDisplay__Fee">({(fee / 10000).toFixed(2)}%)</span>
      )}
    </div>
  );
});

RoutePath.displayName = "RoutePath";

export const RouteDisplay: React.FC<RouteDisplayProps> = React.memo(({
  optimizedRoute,
  fromToken,
  toToken
}) => {
  if (!optimizedRoute || !fromToken || !toToken || optimizedRoute.routes.length === 0) {
    return null;
  }

  const isSingleRoute = optimizedRoute.type === 'single';
  const isSplitRoute = optimizedRoute.type === 'split';

  // Construire les tokens du path pour chaque route
  const getTokensFromRoute = (route: any) => {
    return route.path.filter((tokenInfo: any) => tokenInfo).map((tokenInfo: any) => ({
      address: tokenInfo.address,
      symbol: tokenInfo.symbol || 'Unknown',
      decimals: tokenInfo.decimals || 18,
      name: tokenInfo.name || tokenInfo.symbol || 'Unknown',
      logoUri: tokenInfo.logoUri,
      totalSupply: tokenInfo.totalSupply || '0',
      lastPrice: tokenInfo.lastPrice || 0,
      status: tokenInfo.status || 'UNKNOWN'
    }));
  };

  const calculateTotalFee = () => {
    let totalFeeBps = 0;
    optimizedRoute.routes.forEach(route => {
      route.route.fees.forEach(fee => {
        totalFeeBps += fee * (route.percentage / 100);
      });
    });
    return totalFeeBps;
  };

  const totalFee = calculateTotalFee();

  return (
    <div className="RouteDisplay">
      <div className="RouteDisplay__Header">
        <div className="RouteDisplay__TypeIndicator">
          {isSingleRoute ? (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 7H12M12 7L8.5 3.5M12 7L8.5 10.5"
                  stroke="#E39229"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="RouteDisplay__TypeText RouteDisplay__TypeText--single">
                Best Route
              </span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2 4H12M12 4L8.5 0.5M12 4L8.5 7.5M2 10H12M12 10L8.5 6.5M12 10L8.5 13.5"
                  stroke="#F59E0B"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="RouteDisplay__TypeText RouteDisplay__TypeText--split">
                Split Order
              </span>
            </>
          )}
        </div>
        {totalFee > 0 && (
          <span className="RouteDisplay__TotalFee">
            {(totalFee / 10000).toFixed(3)}% fee
          </span>
        )}
      </div>

      <div className="RouteDisplay__Routes">
        {optimizedRoute.routes.map((routeData, index) => {
          const tokens = getTokensFromRoute(routeData.route);
          const avgFee = routeData.route.fees.length > 0
            ? routeData.route.fees.reduce((a, b) => a + b, 0) / routeData.route.fees.length
            : 0;

          return (
            <RoutePath
              key={index}
              tokens={tokens}
              percentage={isSplitRoute ? routeData.percentage : undefined}
              fee={isSingleRoute ? avgFee : undefined}
            />
          );
        })}
      </div>

      {isSplitRoute && optimizedRoute.routes.length > 1 && (
        <div className="RouteDisplay__SplitInfo">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#8A8984" strokeWidth="1" />
            <path d="M6 3.5V6M6 8.5H6.005" stroke="#8A8984" strokeWidth="1" strokeLinecap="round" />
          </svg>
          <span className="RouteDisplay__SplitText">
            Order split across {optimizedRoute.routes.length} routes for better pricing
          </span>
        </div>
      )}
    </div>
  );
});

RouteDisplay.displayName = "RouteDisplay";

export default RouteDisplay;