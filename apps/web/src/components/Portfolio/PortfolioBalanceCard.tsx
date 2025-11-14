import React from 'react';
import { formatNumber } from '../../utils/formatNumber';
import { usePortfolioStats } from '../../hooks/usePortfolioStats';
import { Loader } from '../Loader/Loader';

export const PortfolioBalanceCard: React.FC = () => {
  const { stats, isLoading } = usePortfolioStats();

  if (isLoading) {
    return (
      <div className="PortfolioPage__BalanceCard">
        <div className="PortfolioPage__BalanceCardContent">
          <Loader size="mobile" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="PortfolioPage__BalanceCard">
        <div className="PortfolioPage__BalanceCardContent">
          <p className="PortfolioPage__BalanceCardEmpty">Connect your wallet to see your portfolio balance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="PortfolioPage__BalanceCard">
      <div className="PortfolioPage__BalanceCardHeader">
        <h3 className="PortfolioPage__BalanceCardTitle">Total Portfolio Value</h3>
        <span className="PortfolioPage__BalanceCardTotal">
          ${formatNumber(stats.totalValueUSD)}
        </span>
      </div>

      <div className="PortfolioPage__BalanceCardBreakdown">
        <div className="PortfolioPage__BalanceCardItem">
          <span className="PortfolioPage__BalanceCardLabel">Pools</span>
          <span className="PortfolioPage__BalanceCardValue">
            ${formatNumber(stats.poolValueUSD)}
          </span>
          <span className="PortfolioPage__BalanceCardCount">
            {stats.poolPositions} {stats.poolPositions === 1 ? 'position' : 'positions'}
          </span>
        </div>

        <div className="PortfolioPage__BalanceCardDivider" />

        <div className="PortfolioPage__BalanceCardItem">
          <span className="PortfolioPage__BalanceCardLabel">Vaults</span>
          <span className="PortfolioPage__BalanceCardValue">
            ${formatNumber(stats.vaultValueUSD)}
          </span>
          <span className="PortfolioPage__BalanceCardCount">
            {stats.vaultPositions} {stats.vaultPositions === 1 ? 'position' : 'positions'}
          </span>
        </div>
      </div>

      {stats.totalFeesEarned > 0 && (
        <div className="PortfolioPage__BalanceCardFees">
          <span className="PortfolioPage__BalanceCardFeesLabel">Total Fees Earned</span>
          <span className="PortfolioPage__BalanceCardFeesValue">
            ${formatNumber(stats.totalFeesEarned)}
          </span>
        </div>
      )}
    </div>
  );
};

