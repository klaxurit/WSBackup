import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../Button/Button';
import { formatTokenAmount } from '../../../utils/formatTokenAmount';
import { TokenLogo } from '../../Common/TokenLogo';
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
  initialAmount0: bigint;
  initialAmount1: bigint;
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
  initialAmount0,
  initialAmount1,
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

  // Check if amounts were adjusted by comparing initial vs final amounts
  // Use 1% threshold to avoid showing warning for tiny rounding differences
  const hasAmountAdjustment = React.useMemo(() => {
    if (initialAmount0 === 0n || initialAmount1 === 0n) return false

    const token0Diff = initialAmount0 > amount0
      ? Number((initialAmount0 - amount0) * 10000n / initialAmount0) / 100
      : Number((amount0 - initialAmount0) * 10000n / amount0) / 100

    const token1Diff = initialAmount1 > amount1
      ? Number((initialAmount1 - amount1) * 10000n / initialAmount1) / 100
      : Number((amount1 - initialAmount1) * 10000n / amount1) / 100

    return token0Diff > 1 || token1Diff > 1
  }, [initialAmount0, initialAmount1, amount0, amount1])


  return (
    <div className="VaultDepositModal__StepContent">
      {/* Pool Ratio Adjustment Warning */}
      {hasAmountAdjustment && (
        <div className="VaultDepositModal__WarningBanner">
          <div className="warning-header">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM11 15H9V13H11V15ZM11 11H9V5H11V11Z" fill="currentColor"/>
            </svg>
            <span className="warning-title">Pool Ratio Adjustment</span>
          </div>
          <p className="warning-message">
            Your input amounts were adjusted to match the current pool liquidity ratio.
          </p>
          <div className="warning-details">
            <div className="detail-row">
              <span className="detail-label">You entered:</span>
              <span className="detail-value">
                {formatTokenAmount(initialAmount0, token0.decimals)} {token0.symbol} + {formatTokenAmount(initialAmount1, token1.decimals)} {token1.symbol}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Actual deposit:</span>
              <span className="detail-value detail-value--highlighted">
                {formatTokenAmount(amount0, token0.decimals)} {token0.symbol} + {formatTokenAmount(amount1, token1.decimals)} {token1.symbol}
              </span>
            </div>
          </div>
          <p className="warning-note">
            The vault automatically adjusts amounts to maintain the optimal ratio. Total value remains approximately the same.
          </p>
        </div>
      )}

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
              <TokenLogo logoUri={token0.logoUri} symbol={token0.symbol} size="medium" />
              <span className="symbol">{token0.symbol}</span>
            </div>
            <span className="amount">{formatTokenAmount(amount0, token0.decimals)}</span>
          </div>
          <div className="token-row">
            <div className="token-info">
              <TokenLogo logoUri={token1.logoUri} symbol={token1.symbol} size="medium" />
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
      <Button
        size="large"
        variant="main"
        onClick={onConfirm}
        loading={isPending}
        customClassName="btn__vault-confirm"
        style={{ marginTop: 'auto' }}
      >
        Confirm Supply
      </Button>
    </div>
  );
};

