import React from 'react';
import { Button } from '../../Button/Button';
import { formatTokenAmount } from '../../../utils/formatTokenAmount';
import { TokenLogo } from '../../Common/TokenLogo';
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
  pooledAmount0?: bigint;
  pooledAmount1?: bigint;
  estimatedAmount0: bigint;
  estimatedAmount1: bigint;
  estimatedStakingTokens?: bigint;
  isPending: boolean;
  onConfirm: () => void;
  isAutoWin?: boolean;
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
  pooledAmount0,
  pooledAmount1,
  estimatedAmount0,
  estimatedAmount1,
  estimatedStakingTokens,
  isPending,
  onConfirm,
  isAutoWin = false
}) => {
  return (
    <div className="VaultDepositModal__StepContent">
      {/* Withdraw Amount */}
      <div className="VaultDepositModal__WithdrawAmount">
        <h4>Withdrawing</h4>
        <div className="amount-display">
          <span className="amount">{formatTokenAmount(withdrawAmount, 18)}</span>
          <StickyIcon width={14} height={14} />
          <span className="symbol">{vaultToken.symbol}</span>
        </div>
      </div>

      {/* Withdraw Details - Combined Pooled and Receive */}
      <div className="VaultDepositModal__WithdrawDetails">
        {/* Pooled Tokens Section - Only for Sticky vaults */}
        {!isAutoWin && pooledAmount0 !== undefined && pooledAmount1 !== undefined && (
          <div className="section">
            <h4>Pooled tokens:</h4>
            <div className="token-row">
              <div className="token-info">
                <TokenLogo logoUri={token0.logoUri} symbol={token0.symbol} size="medium" />
                <span className="symbol">{token0.symbol}</span>
              </div>
              <span className="amount">{formatTokenAmount(pooledAmount0, token0.decimals)}</span>
            </div>
            <div className="token-row">
              <div className="token-info">
                <TokenLogo logoUri={token1.logoUri} symbol={token1.symbol} size="medium" />
                <span className="symbol">{token1.symbol}</span>
              </div>
              <span className="amount">{formatTokenAmount(pooledAmount1, token1.decimals)}</span>
            </div>
          </div>
        )}

        {/* Divider */}
        {!isAutoWin && pooledAmount0 !== undefined && pooledAmount1 !== undefined && (
          <div className="divider"></div>
        )}

        {/* You will receive Section */}
        <div className="section">
          <h4>You will receive:</h4>
          {isAutoWin && estimatedStakingTokens !== undefined ? (
            // AutoWin: Show staking token amount (StickyVault shares)
            <div className="token-row">
              <div className="token-info">
                <StickyIcon width={24} height={24} />
                <span className="symbol">{token0.symbol}-{token1.symbol} Sticky Tokens</span>
              </div>
              <span className="amount">{formatTokenAmount(estimatedStakingTokens, 18)}</span>
            </div>
          ) : (
            // Sticky: Show individual token amounts
            <>
              <div className="token-row">
                <div className="token-info">
                  <TokenLogo logoUri={token0.logoUri} symbol={token0.symbol} size="medium" />
                  <span className="symbol">{token0.symbol}</span>
                </div>
                <span className="amount">{formatTokenAmount(estimatedAmount0, token0.decimals)}</span>
              </div>
              <div className="token-row">
                <div className="token-info">
                  <TokenLogo logoUri={token1.logoUri} symbol={token1.symbol} size="medium" />
                  <span className="symbol">{token1.symbol}</span>
                </div>
                <span className="amount">{formatTokenAmount(estimatedAmount1, token1.decimals)}</span>
              </div>
            </>
          )}
        </div>

        {/* AutoWin Exit Fee Notice */}
        {isAutoWin && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            background: 'rgba(255, 208, 86, 0.1)',
            borderRadius: '0.5rem'
          }}>
            Note: A 0.1% exit fee is applied on AutoWin withdrawals
          </div>
        )}
      </div>

      {/* Action Button */}
      <Button
        size="large"
        variant="main"
        onClick={onConfirm}
        loading={isPending}
        customClassName="btn__vault-withdraw"
        style={{ marginTop: 'auto' }}
      >
        {`Withdraw ${formatTokenAmount(withdrawAmount, 18)} ${vaultToken.symbol}`}
      </Button>
    </div>
  );
};

