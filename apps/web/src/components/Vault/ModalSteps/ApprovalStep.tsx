import React from 'react';
import { Loader } from '../../Loader/Loader';
import { formatTokenAmount } from '../../../utils/formatTokenAmount';
import { FallbackImg } from '../../utils/FallbackImg';

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
        {tokenLogoUri ? (
          <img src={tokenLogoUri} alt={tokenSymbol} onError={(e) => {
            e.currentTarget.style.display = 'none';
          }} />
        ) : (
          <FallbackImg content={tokenSymbol.charAt(0)} style={{ width: '40px', height: '40px' }} />
        )}
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
      <button
        className="btn btn--large btn__main"
        onClick={onApprove}
        disabled={isApproving}
        style={{ marginTop: 'auto' }}
      >
        {isApproving ? (
          <Loader size="small" className="btn__main-loader" />
        ) : (
          `Approve ${tokenSymbol}`
        )}
      </button>
    </div>
  );
};

