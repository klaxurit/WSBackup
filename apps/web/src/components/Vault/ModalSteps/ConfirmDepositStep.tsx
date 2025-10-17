import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from '../../Loader/Loader';
import { formatTokenAmount } from '../../../utils/formatTokenAmount';
import { FallbackImg } from '../../utils/FallbackImg';
import { StickyIcon } from '../../Common/StickyIcon';
import { AutoWinIcon } from '../../Common/AutoWinIcon';
import { useQuery } from '@tanstack/react-query';

interface Token {
  symbol: string;
  logoUri: string;
  decimals: number;
}

interface ConfirmDepositStepProps {
  token0: Token;
  token1: Token;
  amount0: bigint;
  amount1: bigint;
  expectedShares: bigint;
  minShares: bigint; // Kept for future use, not currently displayed
  hasAutoWinVault?: boolean; // Does this vault have an AutoWin vault?
  isAutoWinEnabled?: boolean; // Current toggle state
  onToggleAutoWin?: (enabled: boolean) => void; // Toggle handler
  isPending: boolean;
  onConfirm: () => void;
}

/**
 * Étape de confirmation du dépôt
 * Affiche un résumé avant la transaction
 */
export const ConfirmDepositStep: React.FC<ConfirmDepositStepProps> = ({
  token0,
  token1,
  amount0,
  amount1,
  expectedShares,
  hasAutoWinVault = false,
  isAutoWinEnabled = false,
  onToggleAutoWin,
  isPending,
  onConfirm
}) => {
  const infraredVaultSlug = `winnieswap-${token0.symbol.toLowerCase()}-${token1.symbol.toLowerCase()}`
  const { data: infraredApr } = useQuery({
    queryKey: ["infraredData", infraredVaultSlug],
    queryFn: async () => {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/vaults/infrared/${infraredVaultSlug}`)

      if (!resp.ok) return "-"

      const { success, vault } = await resp.json()
      if (!success) return "-"

      return (vault?.apr * 100).toFixed(2) || "-"
    }
  })


  return (
    <div className="VaultDepositModal__StepContent">
      {/* AutoWin Banner (always shown if vault has AutoWin) */}
      {hasAutoWinVault && (
        <div className="VaultDepositModal__AutoCompoundBanner">
          <div className="VaultDepositModal__AutoCompoundHeader">
            <motion.span
              className="label"
              key={isAutoWinEnabled ? 'enabled' : 'disabled'}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {isAutoWinEnabled ? 'AUTO-WIN ENABLED' : 'AUTO-WIN DISABLED'}
            </motion.span>
            {/* Toggle Button */}
            <div className="VaultDetailPage__Toggle">
              <motion.button
                className={`VaultDetailPage__ToggleButton ${isAutoWinEnabled ? 'active' : ''}`}
                onClick={() => onToggleAutoWin?.(!isAutoWinEnabled)}
                type="button"
                title="AutoWin Enabled - Your shares will be automatically staked to earn BGT rewards"
                transition={{ duration: 0.1 }}
              >
                <motion.span
                  key={isAutoWinEnabled ? 'on' : 'off'}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {isAutoWinEnabled ? 'ON' : 'OFF'}
                </motion.span>
              </motion.button>
            </div>
          </div>
          {/* APR Grid with Transition */}
          <motion.div
            className="VaultDepositModal__APRGrid"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className={`apr-item apr-item--autowin ${isAutoWinEnabled ? 'apr-item--highlighted' : 'apr-item--dimmed'}`}>
              <span className="apr-label">With AutoWin APR</span>
              <span className={`apr-value ${!isAutoWinEnabled ? 'apr-value--shiny' : ''}`}>- %</span>
            </div>
            <div className="apr-item apr-item--infrared">
              <span className="apr-label">Staking Infrared APR</span>
              <span className="apr-value">{infraredApr} %</span>
            </div>
            <div className="apr-item apr-item--without">
              <span className="apr-label">Without AutoWin APR</span>
              <span className="apr-value">- %</span>
            </div>
            <div className="apr-item apr-item--berahub">
              <span className="apr-label">Staking Berahub APR</span>
              <span className="apr-value">- %</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Deposit Details - Combined My Deposits and You Will Receive */}
      <div className="VaultDepositModal__DepositDetails">
        {/* My Deposits Section */}
        <div className="section">
          <h4>My deposits:</h4>
          <div className="token-row">
            <div className="token-info">
              {token0.logoUri ? (
                <img src={token0.logoUri} alt={token0.symbol} />
              ) : (
                <FallbackImg content={token0.symbol.charAt(0)} style={{ width: '24px', height: '24px' }} />
              )}
              <span className="symbol">{token0.symbol}</span>
            </div>
            <span className="amount">{formatTokenAmount(amount0, token0.decimals)}</span>
          </div>
          <div className="token-row">
            <div className="token-info">
              {token1.logoUri ? (
                <img src={token1.logoUri} alt={token1.symbol} />
              ) : (
                <FallbackImg content={token1.symbol.charAt(0)} style={{ width: '24px', height: '24px' }} />
              )}
              <span className="symbol">{token1.symbol}</span>
            </div>
            <span className="amount">{formatTokenAmount(amount1, token1.decimals)}</span>
          </div>
        </div>

        {/* You will receive Section - Always visible with different icons based on AutoWin state */}
        <div className="divider"></div>
        <div className="section">
          <h4>You will receive:</h4>
          <div className="summary-item">
            <span className="label">Vault Shares</span>
            <span className="value">
              {formatTokenAmount(expectedShares, 18)}
              {isAutoWinEnabled ? (
                <AutoWinIcon width={14} height={14} />
              ) : (
                <StickyIcon width={14} height={14} />
              )}
              <span className="token-symbol">
                {isAutoWinEnabled ? 'AW-' : ''}{token0.symbol}-{token1.symbol}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        className="btn btn--large btn__main"
        onClick={onConfirm}
        disabled={isPending}
        style={{ marginTop: 'auto' }}
      >
        {isPending ? (
          <Loader size="small" className="btn__main-loader" />
        ) : (
          'Confirm Supply'
        )}
      </button>
    </div>
  );
};

