import React, { useMemo, useRef } from "react";
import type { BerachainToken } from "../../hooks/useBerachainTokenList";
import { formatEther, parseEther } from "viem";
import { usePrice } from "../../hooks/usePrice";
import TokenSelector from "../Buttons/TokenSelector";

interface ToInputProps {
  steps: any;
  preSelected: BerachainToken | null;
  onSelect: (token: BerachainToken) => void;
  dominantColor?: string;
  secondaryColor?: string;
  onToggleNetworkList?: (isOpen: boolean) => void;
  isHomePage?: boolean;
  balance?: string;
  loading?: boolean;
  isOverBalance?: boolean;
  inputValue: bigint;
  onInputChange: (value: bigint) => void;
}

export const SwapToInput: React.FC<ToInputProps> = React.memo(
  ({
    preSelected,
    onSelect,
    onToggleNetworkList,
    dominantColor,
    secondaryColor,
    isHomePage,
    inputValue,
    onInputChange,
  }) => {
    const textareaRef = useRef<HTMLInputElement>(null);
    const { data: usdValue = 0 } = usePrice(preSelected)

    const usdAmount = useMemo(() => {
      if (inputValue === 0n) return 0
      return (usdValue * +formatEther(inputValue)).toFixed(2)
    }, [usdValue, inputValue])

    return (
      <div className={`Inputs__To To`}>
        <div className="From__Label">
          <p>Sell</p>
        </div>
        <div className="From__AmountsAndChain">
          <div className="From__Amounts" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              ref={textareaRef}
              className="From__Input"
              value={formatEther(inputValue)}
              type="number"
              placeholder="0"
              onChange={e => onInputChange(parseEther(e.target.value))}
            />
          </div>
          <div className="From__LogosAndBalance">
            <div className="To__Logos">
              <TokenSelector
                preSelected={preSelected}
                onSelect={onSelect}
                onToggleNetworkList={onToggleNetworkList}
                dominantColor={dominantColor}
                secondaryColor={secondaryColor}
                isHomePage={isHomePage}
              />
            </div>
          </div>
        </div>
        <div className="From__Details">
          <p className="From__Convertion">${usdAmount}</p>
        </div>
      </div>
    );
  },
);

SwapToInput.displayName = "SwapToInput";
