import React from 'react';
import { Loader } from '../../Loader/Loader';
import { formatTokenAmount } from '../../../utils/formatTokenAmount';
import { FallbackImg } from '../../utils/FallbackImg';
import { StickyIcon } from '../../Common/StickyIcon';

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
  minShares: bigint;
  autoCompoundEnabled?: boolean;
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
  minShares,
  autoCompoundEnabled = false,
  isPending,
  onConfirm
}) => {
  return (
    <div className="VaultDepositModal__StepContent">
      {/* Auto-Compound Info (si activé) */}
      {autoCompoundEnabled && (
        <div className="VaultDepositModal__AutoCompoundBanner">
          <div className="VaultDepositModal__AutoCompoundHeader">
            <span className="label">Auto-Compound Enabled</span>
            <span className="status">✓ Active</span>
          </div>
          <div className="VaultDepositModal__InfoRow">
            <span className="label">Expected Vault Shares</span>
            <span className="value">{formatTokenAmount(expectedShares, 18)} Pool Tokens</span>
          </div>
          <p className="description">
            Your LP tokens will be automatically staked in the Vault, where rewards are harvested
            and reinvested to maximize your yield.
          </p>
        </div>
      )}

      {/* My Deposits */}
      <div className="VaultDepositModal__MyDeposits">
        <h4>My deposits:</h4>
        <div className="deposits-list">
          <div className="deposit-item">
            {token0.logoUri ? (
              <img src={token0.logoUri} alt={token0.symbol} />
            ) : (
              <FallbackImg content={token0.symbol.charAt(0)} style={{ width: '24px', height: '24px' }} />
            )}
            <span className="symbol">{token0.symbol}</span>
            <span className="amount">{formatTokenAmount(amount0, token0.decimals)}</span>
          </div>
          <div className="deposit-item">
            {token1.logoUri ? (
              <img src={token1.logoUri} alt={token1.symbol} />
            ) : (
              <FallbackImg content={token1.symbol.charAt(0)} style={{ width: '24px', height: '24px' }} />
            )}
            <span className="symbol">{token1.symbol}</span>
            <span className="amount">{formatTokenAmount(amount1, token1.decimals)}</span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="VaultDepositModal__Summary">
        <h4>You will receive:</h4>
        <div className="summary-list">
          <div className="summary-item">
            <span className="label">Est. Received</span>
            <span className="value">
              {formatTokenAmount(expectedShares, 18)} <StickyIcon width={14} height={14} /> {token0.symbol}-{token1.symbol}
            </span>
          </div>
          <div className="summary-item">
            <span className="label">Min. Received</span>
            <span className="value">
              {formatTokenAmount(minShares, 18)} <StickyIcon width={14} height={14} /> {token0.symbol}-{token1.symbol}
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
          <Loader size="small" color="rgba(255, 208, 86)" className="btn__main-loader" />
        ) : (
          'Confirm Supply'
        )}
      </button>
    </div>
  );
};

