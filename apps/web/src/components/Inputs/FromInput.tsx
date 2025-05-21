"use client";
import { useCallback, useRef, useState } from "react";
import "../../styles/inputs.scss";
import NetworkSelector from "../Buttons/NetworkSelector";
import React from "react";

interface FromInputProps {
  onToggleNetworkList?: (isOpen: boolean) => void;
  onSelect?: (token: any) => void;
  disabled?: boolean;
  dominantColor?: string;
  secondaryColor?: string;
  minimized?: boolean;
  isHomePage?: boolean;
  preSelectedToken?: any;
  onAmountChange?: (amount: string) => void;
  onTokenSelect?: (token: any) => void;
  defaultValue?: number;
}

export const FromInput: React.FC<FromInputProps> = React.memo(
  ({
    onToggleNetworkList,
    disabled,
    minimized,
    dominantColor,
    secondaryColor,
    isHomePage,
    preSelectedToken,
    onAmountChange,
    onTokenSelect,
    defaultValue,
  }) => {
    const isConnected = false;
    const InputRef = useRef<HTMLInputElement>(null);
    const [fromInputState, setFromInputState] = useState<string>("");
    const [currentToken, setCurrentToken] = useState<any>(null);
    const [inputValue, setInputValue] = useState<string>(`${defaultValue || ""}`);
    const isPending = false;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      setFromInputState(value ? "focus" : "idle");
      onAmountChange && onAmountChange(value);
    };

    const handleTokenSelect = (token: any) => {
      onTokenSelect && onTokenSelect(token);
      setCurrentToken(token);
    };

    const setMax = useCallback(() => {
      setFromInputState("focus");
      setInputValue("1000");
      onAmountChange && onAmountChange("1000");
    }, [onAmountChange]);

    return (
      <div
        className={`Inputs__From From From--${fromInputState}`}
      >
        <div className="From__Label">
          <p>Buy</p>
        </div>
        <div className="From__AmountsAndChain">
          <div className="From__Amounts">
            <input
              ref={InputRef}
              className="From__Input"
              type="number"
              placeholder="0"
              value={inputValue}
              onFocus={() => setFromInputState("focus")}
              onBlur={() => setFromInputState("idle")}
              onChange={handleInputChange}
            />
          </div>
          <div className="From__LogosAndBalance">
            <div
              className={`From__Logos ${disabled ? "From__disabled" : ""}`}
            >
              <NetworkSelector
                preSelected={preSelectedToken}
                onToggleNetworkList={onToggleNetworkList}
                minimized={minimized}
                dominantColor={dominantColor}
                secondaryColor={secondaryColor}
                isHomePage={isHomePage}
                onSelect={handleTokenSelect}
              />
            </div>
          </div>
        </div>
          <div className="From__Details">
            <p className="From__Convertion">0 $US</p>
            <div className="From__Balance">
              {isConnected && (
                <>
                  <p className="From__Amount">
                    {isPending ? "..." : "0.00"}
                  </p>
                  <p
                    className="From__Max"
                    style={{ color: dominantColor }}
                    onClick={setMax}
                  >
                    Max
                  </p>
                </>
              )}
            </div>
          </div>
      </div>
    );
  },
);

FromInput.displayName = "FromInput";
