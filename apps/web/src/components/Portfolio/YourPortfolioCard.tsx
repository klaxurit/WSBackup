import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePortfolioStats } from '../../hooks/usePortfolioStats';
import { formatNumber } from '../../utils/formatNumber';
import { Loader } from '../Loader/Loader';

interface YourPortfolioCardProps {
  // rankChange est maintenant géré via stats.rankChange depuis le backend
}

export const YourPortfolioCard: React.FC<YourPortfolioCardProps> = () => {
  const { address, isConnected } = useAccount();
  const { stats, isLoading, isWalletInLeaderboard } = usePortfolioStats();
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  const referralLink = React.useMemo(() => {
    if (!address) return '';

    const baseUrl = window.location.origin;
    const referralId = address.toLowerCase();

    return `${baseUrl}?ref=${referralId}`;
  }, [address]);

  const handleCopyReferralLink = async () => {
    if (!referralLink) return;

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  const handleApplyReferralCode = () => {
    if (!referralCode.trim()) return;

    // TODO: Appeler l'API backend pour appliquer le referral code
    console.log('Applying referral code:', referralCode);
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  const availableBalance = stats ? stats.totalValueUSD * 0.3 : 0;
  const earningBalance = stats ? stats.totalFeesEarned : 0;

  // Utiliser les vraies données du leaderboard si disponibles
  // Si le wallet n'est pas dans le leaderboard, afficher 0 pour les points
  const volumePoints = isWalletInLeaderboard && stats?.volumePoints !== undefined
    ? stats.volumePoints
    : (stats && isWalletInLeaderboard ? Math.floor(stats.points * 0.54) : 0);
  const liquidityPoints = isWalletInLeaderboard && stats?.liquidityPoints !== undefined
    ? stats.liquidityPoints
    : (stats && isWalletInLeaderboard ? Math.floor(stats.points * 0.46) : 0);

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

  // rankChange est maintenant géré directement dans le rendu avec stats.rankChange

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
                <span>{isWalletInLeaderboard ? (stats.rank || '-') : '---'}</span>
                {isWalletInLeaderboard && stats.rankChange !== undefined && stats.rankChange !== 0 && (
                  <div className={`PortfolioPage__YourPortfolioRankChange ${stats.rankChange > 0 ? 'PortfolioPage__YourPortfolioRankChange--gain' : 'PortfolioPage__YourPortfolioRankChange--loss'}`}>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      {stats.rankChange > 0 ? (
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
                    <span>{Math.abs(stats.rankChange)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Points value */}
          <div className="PortfolioPage__YourPortfolioPointsValue">
            {isWalletInLeaderboard ? formatNumber(stats.points) : '---'}
          </div>
          {!isWalletInLeaderboard && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
              Start trading to earn points
            </div>
          )}

          {/* Volume / Liquidity row */}
          <div className="PortfolioPage__YourPortfolioPointsRow">
            <div className="PortfolioPage__YourPortfolioPointsItem">
              <span className="PortfolioPage__YourPortfolioPointsItemLabel">Volume</span>
              <span className="PortfolioPage__YourPortfolioPointsItemValue">
                {isWalletInLeaderboard ? `${formatNumber(volumePoints)}pts` : '---'}
              </span>
            </div>
            <div className="PortfolioPage__YourPortfolioPointsItem">
              <span className="PortfolioPage__YourPortfolioPointsItemLabel">Liquidity</span>
              <span className="PortfolioPage__YourPortfolioPointsItemValue">
                {isWalletInLeaderboard ? `${formatNumber(liquidityPoints)}pts` : '---'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Section - Full Width */}
      <div className="PortfolioPage__YourPortfolioReferralSection">
        {/* Referral Input and Apply */}
        <div className="PortfolioPage__YourPortfolioReferralInput">
          <input
            type="text"
            placeholder="Referral code"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
            className="PortfolioPage__YourPortfolioReferralInputField SearchBar__input"
          />
          <button
            className={`btn btn--tiny btn__accent ${applied ? 'btn__success' : 'btn__accent'}`}
            onClick={handleApplyReferralCode}
            disabled={!referralCode.trim() || applied}
            type="button"
          >
            {applied ? 'Applied!' : 'Apply'}
          </button>
        </div>

        {/* Referrals Stats Row */}
        <div className="PortfolioPage__YourPortfolioReferralStats">
          <div className="PortfolioPage__YourPortfolioReferralStatItem">
            <span className="PortfolioPage__YourPortfolioReferralStatLabel">Referrals</span>
            <span className="PortfolioPage__YourPortfolioReferralStatValue">
              {stats.referrals}
              <span className="PortfolioPage__YourPortfolioReferralStatSubtext"> Invited Users</span>
            </span>
          </div>

          <div className="PortfolioPage__YourPortfolioReferralStatDivider" />

          <div className="PortfolioPage__YourPortfolioReferralStatItem">
            <span className="PortfolioPage__YourPortfolioReferralStatLabel">Multiplier</span>
            <span className="PortfolioPage__YourPortfolioReferralStatValue PortfolioPage__YourPortfolioReferralStatValue--highlight">
              {((stats.multiplier - 1) * 100).toFixed(0)}%
            </span>
          </div>

          <div className="PortfolioPage__YourPortfolioReferralStatItem PortfolioPage__YourPortfolioReferralStatItem--button">
            <button
              className={`btn btn--tiny btn__main ${copied ? 'btn__success' : ''}`}
              onClick={handleCopyReferralLink}
              type="button"
            >
              {copied ? 'Copied!' : 'Create Referral Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

