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

interface ConfirmWithdrawStepProps {
  vaultToken: {
    symbol: string;
    logoUri: string;
  };
  token0: Token;
  token1: Token;
  withdrawAmount: bigint;
  estimatedAmount0: bigint;
  estimatedAmount1: bigint;
  isPending: boolean;
  onConfirm: () => void;
}

/**
 * Étape de confirmation du retrait
 * Affiche un résumé simplifié avant la transaction
 */
export const ConfirmWithdrawStep: React.FC<ConfirmWithdrawStepProps> = ({
  vaultToken,
  token0,
  token1,
  withdrawAmount,
  estimatedAmount0,
  estimatedAmount1,
  isPending,
  onConfirm
}) => {
  return (
    <div className="VaultDepositModal__StepContent">
      {/* Withdraw Amount */}
      <div className="VaultDepositModal__WithdrawAmount">
        <h4>Withdrawing</h4>
        <div className="amount-display">
          <span className="amount">{formatTokenAmount(withdrawAmount, 18)}</span>
          <StickyIcon width={14} height={14} />
          <span className="symbol">{token0.symbol}-{token1.symbol}</span>
        </div>
      </div>

      {/* You will receive */}
      <div className="VaultDepositModal__ReceiveTokens">
        <h4>You will receive</h4>
        <div className="token-row">
          <div className="token-info">
            {token0.logoUri ? (
              <img src={token0.logoUri} alt={token0.symbol} />
            ) : (
              <FallbackImg content={token0.symbol.charAt(0)} style={{ width: '24px', height: '24px' }} />
            )}
            <span className="symbol">{token0.symbol}</span>
          </div>
          <span className="amount">{formatTokenAmount(estimatedAmount0, token0.decimals)}</span>
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
          <span className="amount">{formatTokenAmount(estimatedAmount1, token1.decimals)}</span>
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
          `Withdraw ${formatTokenAmount(withdrawAmount, 18)} ${vaultToken.symbol}`
        )}
      </button>
    </div>
  );
};

