"use client";
import { useEffect, useRef, useState } from "react";
import React from "react";
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { formatUnits, parseUnits } from "viem";
import { FallbackImg } from "../utils/FallbackImg";

interface InitialPriceInputProps {
  tokens: BerachainToken[];
  onAmountChange: (amount: bigint) => void;
  onDisplayPriceChange?: (displayPrice: string) => void;
  onTokenSelect: (token: BerachainToken) => void;
  value: bigint;
}

export const InitialPriceInput: React.FC<InitialPriceInputProps> = (
  {
    tokens,
    onAmountChange,
    onDisplayPriceChange,
    onTokenSelect,
    value,
  }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedToken, setSelectedToken] = useState<BerachainToken>(tokens[0])
  const [inputValue, setInputValue] = useState<string>("0")

  const cleanAndValidateInput = (rawValue: string): string => {
    let cleaned = rawValue.replace(',', '.');
    cleaned = cleaned.replace(/[^\d.]/g, '');

    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    if (parts.length === 2 && parts[1].length > 18) {
      cleaned = parts[0] + '.' + parts[1].substring(0, 18);
    }

    return cleaned;
  };

  const safeParseUnits = (value: string, decimals: number): bigint => {
    try {
      if (!value || value === '' || value === '.') {
        return 0n;
      }

      const cleanValue = value.endsWith('.') ? value.slice(0, -1) : value;
      if (!cleanValue || cleanValue === '') {
        return 0n;
      }

      return parseUnits(cleanValue, decimals);
    } catch (error) {
      return 0n;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanedValue = cleanAndValidateInput(rawValue);
    const parsedValue = safeParseUnits(cleanedValue, selectedToken?.decimals || 18);

    onAmountChange(parsedValue);

    if (onDisplayPriceChange) {
      onDisplayPriceChange(cleanedValue);
    }

    setInputValue(cleanedValue);
  };

  const handleTokenClick = (t: BerachainToken) => {
    setSelectedToken(t);
    onTokenSelect(t);

    if (inputValue && inputValue !== "0" && inputValue !== "") {
      const parsedValue = safeParseUnits(inputValue, t.decimals || 18);
      onAmountChange(parsedValue);
    }
  };

  useEffect(() => {
    if (value > 0n && (!inputValue || inputValue === "")) {
      const formattedValue = formatUnits(value, selectedToken?.decimals || 18);
      setInputValue(formattedValue);
    }
  }, [value, selectedToken?.decimals]);

  return (
    <div className="LiquidityInput">
      <div className="Inputs">
        <div className="LiquidityInput__InputWrapper">
          <div className={`Inputs__From From From--idle`}>
            <div className="From__AmountsAndChain">
              <div className="From__Amounts" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  className="From__Input"
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="0.0"
                />
              </div>
              <div className="From__LogosAndBalance">
                <div className={`From__Logos`}>
                  <div className={`toggleBtn`}>
                    {tokens.map(t => (
                      <button
                        key={t.address}
                        className={`toggleBtn__item ${selectedToken.address === t.address ? "active" : ""}`}
                        onClick={() => handleTokenClick(t)}
                      >
                        <span className="networkSelector__logoWrapper">
                          {!t.logoUri
                            ? <FallbackImg content={t.symbol} />
                            : (
                              <img
                                src={t.logoUri}
                                alt={t.name}
                              />
                            )}
                        </span>
                        <span className="networkSelector__symbol">{t.symbol}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="From__Details">
              <p className="From__Convertion">
                {selectedToken.symbol} = 1 {tokens.find(t => (t.address !== selectedToken.address))?.symbol || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

InitialPriceInput.displayName = "InitialPriceInput";