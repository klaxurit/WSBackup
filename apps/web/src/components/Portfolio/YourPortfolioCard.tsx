import React, { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolioStats } from '../../hooks/usePortfolioStats';
import { useReferral, useUpdateReferral, useApplyReferralCode, useReferralCount } from '../../hooks/useReferral';
import { formatNumber } from '../../utils/formatNumber';
import { Loader } from '../Loader/Loader';
import { CopyIcon } from '../SVGs/ProductSVGs';
import { HelpTooltip } from '../Common/HelpTooltip';

interface YourPortfolioCardProps {
  // rankChange est maintenant géré via stats.rankChange depuis le backend
}

export const YourPortfolioCard: React.FC<YourPortfolioCardProps> = () => {
  const { address, isConnected } = useAccount();
  const { stats, isLoading, isWalletInLeaderboard } = usePortfolioStats();

  // Récupérer le referral code actuel
  const { data: referralData, isLoading: isLoadingReferral } = useReferral(address);
  const { data: referralCountData, isLoading: isLoadingReferralCount } = useReferralCount(referralData?.referralCode);

  // Hooks pour les mutations
  const updateReferralMutation = useUpdateReferral();
  const applyReferralMutation = useApplyReferralCode();

  // État pour l'application d'un referral code (code d'un autre utilisateur)
  const [referralCodeToApply, setReferralCodeToApply] = useState('');
  const [applied, setApplied] = useState(false);

  // État pour la personnalisation du referral code
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Hooks pour signer les messages - séparés pour chaque action
  const { signMessageAsync: signMessageForApply, isPending: isSigningForApply } = useSignMessage();
  const { signMessageAsync: signMessageForUpdate, isPending: isSigningForUpdate } = useSignMessage();

  // Copier le code de referral
  const handleCopyReferralCode = async () => {
    if (!referralData?.referralCode) return;

    try {
      await navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral code:', error);
    }
  };

  // Appliquer un referral code (code d'un autre utilisateur)
  const handleApplyReferralCode = async () => {
    if (!referralCodeToApply.trim() || !address) return;

    try {
      // Signer le message (le code à appliquer)
      const signature = await signMessageForApply({
        message: referralCodeToApply.trim(),
      });

      // Appeler l'API pour appliquer le code
      await applyReferralMutation.mutateAsync({
        referralCode: referralCodeToApply.trim(),
        signature,
      });

      setApplied(true);
      setReferralCodeToApply('');
      setTimeout(() => setApplied(false), 3000);
    } catch (error: any) {
      console.error('Failed to apply referral code:', error);
      alert(error?.message || 'Failed to apply referral code');
    }
  };

  // Gérer le clic sur "Customize Referral Code"
  const handleCustomizeClick = () => {
    setIsCustomizing(true);
    setCustomCode(referralData?.referralCode || '');
  };

  // Mettre à jour le referral code personnalisé
  const handleUpdateReferralCode = async () => {
    if (!customCode.trim() || !address) return;

    // Validation : minimum 6 caractères, alphanumériques, underscores ou hyphens
    const codeRegex = /^[a-zA-Z0-9_-]{6,20}$/;
    if (!codeRegex.test(customCode.trim())) {
      alert('Referral code must be 6-20 alphanumeric characters, underscores or hyphens');
      return;
    }

    try {
      // Signer le message (le nouveau code)
      const signature = await signMessageForUpdate({
        message: customCode.trim(),
      });

      // Appeler l'API pour mettre à jour le code
      await updateReferralMutation.mutateAsync({
        referralCode: customCode.trim(),
        signature,
      });

      setIsCustomizing(false);
      setCustomCode('');
    } catch (error: any) {
      console.error('Failed to update referral code:', error);
      alert(error?.message || 'Failed to update referral code');
    }
  };

  const availableBalance = stats ? stats.totalValueUSD * 0.3 : 0;
  const earningBalance = stats ? stats.totalFeesEarned : 0;
  const referralCount = referralCountData?.count;
  const referralCountDisplay = typeof referralCount === 'number'
    ? referralCount
    : (isLoadingReferral || isLoadingReferralCount ? '...' : '---');
  const referralUsersLabel = typeof referralCount === 'number' && referralCount === 1 ? 'Invited User' : 'Invited Users';

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

  if (isLoading || isLoadingReferral) {
    return (
      <div className="PortfolioPage__YourPortfolioCard">
        {/* <div className="PortfolioPage__YourPortfolioContent PortfolioPage__YourPortfolioContent--loading"> */}
        <Loader size="mobile" />
        {/* </div> */}
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
        {/* Referral Input and Apply (pour appliquer un code d'un autre utilisateur) */}
        <div className="PortfolioPage__YourPortfolioReferralInput">
          <input
            type="text"
            placeholder="Referral code"
            value={referralCodeToApply}
            onChange={(e) => setReferralCodeToApply(e.target.value)}
            className="PortfolioPage__YourPortfolioReferralInputField SearchBar__input"
            disabled={applied || applyReferralMutation.isPending || isSigningForApply}
          />
          <button
            className={`btn btn--tiny btn__accent ${applied ? 'btn__success' : 'btn__accent'}`}
            onClick={handleApplyReferralCode}
            disabled={!referralCodeToApply.trim() || applied || applyReferralMutation.isPending || isSigningForApply}
            type="button"
          >
            {isSigningForApply || applyReferralMutation.isPending
              ? 'Signing...'
              : applied
                ? 'Applied!'
                : 'Apply'}
          </button>
        </div>

        {/* Referrals Stats Row */}
        <div className="PortfolioPage__YourPortfolioReferralStats">
          <div className="PortfolioPage__YourPortfolioReferralStatItem">
            <span className="PortfolioPage__YourPortfolioReferralStatLabel">
              Referrals <HelpTooltip text={'You earn 20% of every referred user’s points'} size="small" />
            </span>
            <span className="PortfolioPage__YourPortfolioReferralStatValue">
              {referralCountDisplay}
            </span>
            <span
              className="PortfolioPage__YourPortfolioReferralStatSubtext"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {referralUsersLabel}
            </span>
          </div>

          <div className="PortfolioPage__YourPortfolioReferralStatItem PortfolioPage__YourPortfolioReferralStatItem--button">
            <AnimatePresence mode="wait" initial={false}>
              {isCustomizing ? (
                <motion.div
                  key="customize-input"
                  initial={{ opacity: 0, scale: 0.95, x: -10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, x: -10 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  className="PortfolioPage__YourPortfolioCustomizeInput"
                >
                  <input
                    type="text"
                    placeholder="Code (6-20 chars)"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="PortfolioPage__YourPortfolioCustomizeInputField"
                    disabled={updateReferralMutation.isPending || isSigningForUpdate}
                    maxLength={20}
                    autoFocus
                  />
                  <button
                    className="btn btn--tiny btn__main"
                    onClick={handleUpdateReferralCode}
                    disabled={!customCode.trim() || customCode.trim().length < 6 || updateReferralMutation.isPending || isSigningForUpdate}
                    type="button"
                  >
                    {isSigningForUpdate || updateReferralMutation.isPending ? 'Signing...' : 'Update'}
                  </button>
                  <button
                    className="btn btn--tiny btn__shade"
                    onClick={() => {
                      setIsCustomizing(false);
                      setCustomCode('');
                    }}
                    disabled={updateReferralMutation.isPending || isSigningForUpdate}
                    type="button"
                  >
                    Cancel
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="customize-button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {referralData?.referralCode && (
                    <motion.button
                      className="btn btn--tiny btn__shade PortfolioPage__CopyButton"
                      onClick={handleCopyReferralCode}
                      type="button"
                      title="Copy referral code"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.svg
                            key="check"
                            width="14"
                            height="14"
                            viewBox="0 0 16 16"
                            fill="none"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <path
                              d="M13.5 4.5L6 12L2.5 8.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </motion.svg>
                        ) : (
                          <motion.div
                            key="copy"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <CopyIcon />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  )}
                  <button
                    className="btn btn--tiny btn__main"
                    onClick={handleCustomizeClick}
                    type="button"
                  >
                    Customize Referral Code
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

