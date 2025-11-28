import React from 'react';
import { formatTokenAmount } from '../../../utils/formatTokenAmount';
import { TokenLogo } from '../../Common/TokenLogo';
import { Button } from '../../Button/Button';

interface ApprovalStepProps {
  tokenSymbol: string;
  tokenLogoUri: string;
  amount: bigint;
  decimals: number;
  currentAllowance?: bigint;
  isApproving: boolean;
  onApprove: () => void;
}

/**
 * Étape d'approval d'un token
 * Utilisé pour token0, token1, ou vault token
 */
export const ApprovalStep: React.FC<ApprovalStepProps> = ({
  tokenSymbol,
  tokenLogoUri,
  amount,
  decimals,
  currentAllowance,
  isApproving,
  onApprove
}) => {
  return (
    <div className="VaultDepositModal__StepContent">
      {/* Token Info */}
      <div className="VaultDepositModal__TokenInfo">
        <TokenLogo logoUri={tokenLogoUri} symbol={tokenSymbol} size="xlarge" />
        <div style={{ flex: 1 }}>
          <div>
            <span className="amount">{formatTokenAmount(amount, decimals)}</span>
            <span className="symbol">{tokenSymbol}</span>
          </div>
        </div>
      </div>

      {/* Allowance Info */}
      <div className="VaultDepositModal__AllowanceInfo">
        <div className="VaultDepositModal__InfoRow">
          <span className="label">Current allowance</span>
          <span className="value">
            {currentAllowance !== undefined
              ? `${formatTokenAmount(currentAllowance, decimals)} ${tokenSymbol}`
              : '0 ' + tokenSymbol
            }
          </span>
        </div>
        <div className="VaultDepositModal__InfoRow">
          <span className="label">Requested allowance</span>
          <span className="value">∞</span>
        </div>
      </div>

      {/* Action Button */}
      <Button
        size="large"
        variant="main"
        onClick={onApprove}
        loading={isApproving}
        customClassName="btn__vault-approve"
        style={{ marginTop: 'auto' }}
      >
        {`Approve ${tokenSymbol}`}
      </Button>
    </div>
  );
};

