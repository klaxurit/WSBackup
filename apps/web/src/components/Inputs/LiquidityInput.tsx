import React from 'react';
import { FromInput } from '../Inputs/FromInput';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';

interface LiquidityInputProps {
  selectedToken: BerachainToken | null;
  onTokenSelect: (token: BerachainToken) => void;
  onAmountChange: (amount: bigint) => void;
  value: bigint;
  disabled?: boolean;
}

export const LiquidityInput: React.FC<LiquidityInputProps> = ({
  selectedToken,
  onTokenSelect,
  onAmountChange,
  value,
  disabled = false,
}) => {
  return (
    <div className="LiquidityInput">
      <div className="Inputs">
        <div className="LiquidityInput__InputWrapper">
          <FromInput
            selectedToken={selectedToken}
            onTokenSelect={onTokenSelect}
            onAmountChange={onAmountChange}
            value={value}
            disabled={disabled}
            showLabel={false}
          />
        </div>
      </div>
    </div>
  );
};