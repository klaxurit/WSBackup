import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePortfolioStats } from '../../hooks/usePortfolioStats';
import { formatNumber } from '../../utils/formatNumber';
import { Loader } from '../Loader/Loader';
import { HelpTooltip } from '../Common/HelpTooltip';

export const PortfolioStatsHeader: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { stats, isLoading } = usePortfolioStats();
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);

  // TODO: Récupérer le beraname depuis le backend quand disponible
  // const beraname: string | undefined = undefined;

  const referralLink = React.useMemo(() => {
    if (!address) return '';

    const baseUrl = window.location.origin;
    // TODO: Utiliser beraname quand disponible depuis le backend
    const referralId = address.toLowerCase();

    return `${baseUrl}?ref=${referralId}`;
  }, [address]);

  // Suppression de formatAddress non utilisé (sera utilisé plus tard)
  // const formatAddress = (address: string, beraname?: string) => {
  //   if (beraname) {
  //     return beraname.replace('.bera', '.🐻⛓️');
  //   }
  //   return `${address.slice(0, 6)}...${address.slice(-4)}`;
  // };

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

  if (!isConnected) {
    return (
      <div className="PortfolioPage__StatsHeader">
        <div className="PortfolioPage__StatsHeaderEmpty">
          <p>Connect your wallet to see your stats</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="PortfolioPage__StatsHeader">
        <div className="PortfolioPage__StatsHeaderContent">
          <Loader size="mobile" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="PortfolioPage__StatsHeader">
      <h2 className="PortfolioPage__StatsHeaderTitle">Overview</h2>
      <div className="PortfolioPage__StatsHeaderGrid">
        {/* Points Card */}
        <div className="PortfolioPage__StatCard">
          <div className="PortfolioPage__StatCardHeader">
            <span className="PortfolioPage__StatCardLabel">Points</span>
            <HelpTooltip text="Total points earned from your liquidity positions and trading activity" />
          </div>
          <span className="PortfolioPage__StatCardValue">
            {formatNumber(stats.points)}
          </span>
          <span className="PortfolioPage__StatCardSubtext">Total Points</span>
          <div className="PortfolioPage__StatCardRank">
            <span className="PortfolioPage__StatCardRankLabel">Rank</span>
            <span className="PortfolioPage__StatCardRankValue">#{formatNumber(stats.rank)}</span>
          </div>
        </div>

        {/* Referrals Card */}
        <div className="PortfolioPage__StatCard">
          <div className="PortfolioPage__StatCardHeader">
            <span className="PortfolioPage__StatCardLabel">Referrals</span>
            <HelpTooltip text="Number of users you've referred to WinnieSwap" />
          </div>
          <span className="PortfolioPage__StatCardValue">
            {stats.referrals}
          </span>
          <span className="PortfolioPage__StatCardSubtext">Invited Users</span>
          <button
            className={`btn btn--tiny btn__main ${copied ? 'btn__success' : ''}`}
            onClick={handleCopyReferralLink}
            type="button"
          >
            {copied ? 'Copied!' : 'Create Referral Code'}
          </button>
        </div>

        {/* Multiplier Card */}
        <div className="PortfolioPage__StatCard">
          <div className="PortfolioPage__StatCardHeader">
            <span className="PortfolioPage__StatCardLabel">Multiplier</span>
            <HelpTooltip text="Point boost multiplier applied based on referrals and activity" />
          </div>
          <span className="PortfolioPage__StatCardValue PortfolioPage__StatCardValue--highlight">
            {((stats.multiplier - 1) * 100).toFixed(0)}%
          </span>
          <div className="PortfolioPage__StatCardReferralInput">
            <input
              type="text"
              placeholder="Referral code"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              className="PortfolioPage__StatCardInput SearchBar__input"
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
        </div>

        {/* Total Portfolio Value Card */}
        <div className="PortfolioPage__StatCard">
          <div className="PortfolioPage__StatCardHeader">
            <span className="PortfolioPage__StatCardLabel">Total Portfolio Value</span>
            <HelpTooltip text="Total value of all your positions in pools and vaults" />
          </div>
          <span className="PortfolioPage__StatCardValue">
            ${formatNumber(stats.totalValueUSD)}
          </span>
          <div className="PortfolioPage__StatCardBreakdown">
            <div className="PortfolioPage__StatCardBreakdownItem">
              <span className="PortfolioPage__StatCardBreakdownLabel">Pools</span>
              <span className="PortfolioPage__StatCardBreakdownValue">
                ${formatNumber(stats.poolValueUSD)}
              </span>
            </div>
            <div className="PortfolioPage__StatCardBreakdownDivider" />
            <div className="PortfolioPage__StatCardBreakdownItem">
              <span className="PortfolioPage__StatCardBreakdownLabel">Vaults</span>
              <span className="PortfolioPage__StatCardBreakdownValue">
                ${formatNumber(stats.vaultValueUSD)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

