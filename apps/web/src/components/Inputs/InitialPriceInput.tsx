"use client";
import { useEffect, useRef, useState } from "react";
import React from "react";
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { formatUnits, parseUnits } from "viem";
import { FallbackImg } from "../utils/FallbackImg";

interface InitialPriceInputProps {
  tokens: BerachainToken[];
  onAmountChange: (amount: bigint) => void;
  onTokenSelect: (token: BerachainToken) => void;
  value: bigint;
}

export const InitialPriceInput: React.FC<InitialPriceInputProps> = (
  {
    tokens,
    onAmountChange,
    onTokenSelect,
    value,
  }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedToken, setSelectedToken] = useState<BerachainToken>(tokens[0])
  const [inputValue, setInputValue] = useState<string>("0")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d.,]/g, '')
    val = val.replace(',', '.')

    if (val.includes('.')) {
      const parts = val.split('.')
      if (parts[1] && parts[1].length > 2) {
        val = parts[0] + '.' + parts[1].substring(0, 2)
      }
    }

    onAmountChange(parseUnits(val, selectedToken?.decimals || 18));
    setInputValue(val)
  };

  const handleTokenClick = (t: BerachainToken) => {
    setSelectedToken(t)
    onTokenSelect(t)
  }

  useEffect(() => {
    if (value > 0n && inputValue === "0") {
      setInputValue(formatUnits(value, selectedToken?.decimals || 18))
    }
  }, [value, inputValue])

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
                />
              </div>
              <div className="From__LogosAndBalance">
                <div className={`From__Logos`}>
                  <div className={`toggleBtn`}>
                    {tokens.map(t => (
                      <button
                        key={t.id}
                        className={`toggleBtn__item ${selectedToken.id === t.id ? "active" : ""}`}
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
                {selectedToken.symbol} = 1 {tokens.find(t => (t.id !== selectedToken.id))?.symbol || ""}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

InitialPriceInput.displayName = "InitialPriceInput";
