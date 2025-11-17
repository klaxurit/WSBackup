import React from 'react';
import { useAccount } from 'wagmi';
import { usePortfolioStats } from '../../hooks/usePortfolioStats';
import { formatNumber } from '../../utils/formatNumber';
import { Loader } from '../Loader/Loader';

interface YourPortfolioCardProps {
  rankChange?: number;
}

export const YourPortfolioCard: React.FC<YourPortfolioCardProps> = ({ rankChange = 5 }) => {
  const { isConnected } = useAccount();
  const { stats, isLoading } = usePortfolioStats();

  const availableBalance = stats ? stats.totalValueUSD * 0.3 : 0; 
  const earningBalance = stats ? stats.totalFeesEarned : 0;

  const volumePoints = stats ? Math.floor(stats.points * 0.54) : 0;
  const liquidityPoints = stats ? Math.floor(stats.points * 0.46) : 0;

  if (!isConnected) {
    return (
      <div className="PortfolioPage__YourPortfolioCard">
        <div className="PortfolioPage__YourPortfolioEmpty">
          <p>Connect your wallet to see your portfolio</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="PortfolioPage__YourPortfolioCard">
        <div className="PortfolioPage__YourPortfolioContent">
          <Loader size="mobile" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const isRankGain = rankChange > 0;
  const rankChangeAbs = Math.abs(rankChange);

  return (
    <div className="PortfolioPage__YourPortfolioCard">
      <div className="PortfolioPage__YourPortfolioContent">
        {/* Left side (50%) */}
        <div className="PortfolioPage__YourPortfolioLeft">
          {/* Total balance - full width of left side */}
          <div className="PortfolioPage__YourPortfolioTotalBalance">
            <span className="PortfolioPage__YourPortfolioTotalBalanceLabel">Total balance</span>
            <span className="PortfolioPage__YourPortfolioTotalBalanceValue">
              ${formatNumber(stats.totalValueUSD)}
            </span>
          </div>

          {/* Available / Earning row */}
          <div className="PortfolioPage__YourPortfolioBalanceRow">
            <div className="PortfolioPage__YourPortfolioBalanceItem">
              <span className="PortfolioPage__YourPortfolioBalanceLabel">Available</span>
              <span className="PortfolioPage__YourPortfolioBalanceValue">
                ${formatNumber(availableBalance)}
              </span>
            </div>
            <div className="PortfolioPage__YourPortfolioBalanceDivider" />
            <div className="PortfolioPage__YourPortfolioBalanceItem">
              <span className="PortfolioPage__YourPortfolioBalanceLabel">Earning</span>
              <span className="PortfolioPage__YourPortfolioBalanceValue">
                ${formatNumber(earningBalance)}
              </span>
            </div>
          </div>
        </div>

        {/* Vertical separator */}
        <div className="PortfolioPage__YourPortfolioVerticalDivider" />

        {/* Right side (50%) */}
        <div className="PortfolioPage__YourPortfolioRight">
          {/* Total points and Rank */}
          <div className="PortfolioPage__YourPortfolioPointsHeader">
            <span className="PortfolioPage__YourPortfolioPointsLabel">Total points</span>
            <div className="PortfolioPage__YourPortfolioRank">
              <span className="PortfolioPage__YourPortfolioRankLabel">Rank</span>
              <div className="PortfolioPage__YourPortfolioRankValue">
                <span>{stats.rank}</span>
                <div className={`PortfolioPage__YourPortfolioRankChange ${isRankGain ? 'PortfolioPage__YourPortfolioRankChange--gain' : 'PortfolioPage__YourPortfolioRankChange--loss'}`}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {isRankGain ? (
                      <path
                        d="M6 2L10 8H2L6 2Z"
                        fill="currentColor"
                      />
                    ) : (
                      <path
                        d="M6 10L2 4H10L6 10Z"
                        fill="currentColor"
                      />
                    )}
                  </svg>
                  <span>{rankChangeAbs}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Points value */}
          <div className="PortfolioPage__YourPortfolioPointsValue">
            {formatNumber(stats.points)}
          </div>

          {/* Volume / Liquidity row */}
          <div className="PortfolioPage__YourPortfolioPointsRow">
            <div className="PortfolioPage__YourPortfolioPointsItem">
              <span className="PortfolioPage__YourPortfolioPointsItemLabel">Volume</span>
              <span className="PortfolioPage__YourPortfolioPointsItemValue">
                {formatNumber(volumePoints)}pts
              </span>
            </div>
            <div className="PortfolioPage__YourPortfolioPointsItem">
              <span className="PortfolioPage__YourPortfolioPointsItemLabel">Liquidity</span>
              <span className="PortfolioPage__YourPortfolioPointsItemValue">
                {formatNumber(liquidityPoints)}pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

