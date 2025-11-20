import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePortfolioStats } from '../../hooks/usePortfolioStats';
import { formatNumber } from '../../utils/formatNumber';
import { Loader } from '../Loader/Loader';

interface YourPortfolioCardProps {
  rankChange?: number;
}

export const YourPortfolioCard: React.FC<YourPortfolioCardProps> = ({ rankChange = 5 }) => {
  const { address, isConnected } = useAccount();
  const { stats, isLoading } = usePortfolioStats();
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

