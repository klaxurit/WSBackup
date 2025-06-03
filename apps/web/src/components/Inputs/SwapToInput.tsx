import React, { useRef } from "react";
import NetworkSelector from "../Buttons/NetworkSelector";

interface ToInputProps {
  steps: any;
  preSelected?: any;
  onSelect?: (token: any) => void;
  dominantColor?: string;
  secondaryColor?: string;
  onToggleNetworkList?: (isOpen: boolean) => void;
  isHomePage?: boolean;
  balance?: string;
  loading?: boolean;
  isOverBalance?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export const SwapToInput: React.FC<ToInputProps> = React.memo(
  ({
    preSelected,
    onSelect,
    onToggleNetworkList,
    dominantColor,
    secondaryColor,
    isHomePage,
    inputValue = "",
    onInputChange,
  }) => {
    const textareaRef = useRef<HTMLInputElement>(null);

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
              value={inputValue}
              type="number"
              placeholder="0"
              onChange={e => onInputChange && onInputChange(e.target.value)}
            />
          </div>
          <div className="From__LogosAndBalance">
            <div className="To__Logos">
              <NetworkSelector
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
          <p className="From__Convertion">0 $US</p>
        </div>
      </div>
    );
  },
);

SwapToInput.displayName = "SwapToInput";
