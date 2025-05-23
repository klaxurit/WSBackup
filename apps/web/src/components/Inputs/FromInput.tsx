"use client";
import { useCallback, useRef, useState, useMemo } from "react";
import "../../styles/inputs.scss";
import NetworkSelector from "../Buttons/NetworkSelector";
import React from "react";
import { useAppSelector } from '../../store/hooks';
import { useTokenBalances } from '../../hooks/useTokenBalances';
import { useBerachainTokenList } from '../../hooks/useBerachainTokenList';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';

interface FromInputProps {
  onToggleNetworkList?: (isOpen: boolean) => void;
  onSelect?: (token: BerachainToken) => void;
  disabled?: boolean;
  dominantColor?: string;
  secondaryColor?: string;
  minimized?: boolean;
  isHomePage?: boolean;
  preSelectedToken?: BerachainToken;
  onAmountChange?: (amount: string) => void;
  onTokenSelect?: (token: BerachainToken) => void;
  defaultValue?: number;
}

function formatAmount(amount: string | number): string {
  const num = Number(amount);
  if (isNaN(num)) return '0.000';
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}

function formatAmountTruncate(amount: string | number): string {
  const num = Number(amount);
  if (isNaN(num)) return '0.000';
  const truncated = Math.trunc(num * 1000) / 1000;
  return truncated.toFixed(3).replace(',', '.');
}

function getMaxWithFee(balance: string | number, symbol?: string): string {
  const num = Number(balance);
  if (isNaN(num)) return '0.000';
  if (num < 0.001) return formatAmount(num);
  if (symbol === 'BERA') {
    const max = num * 0.999;
    return formatAmount(max);
  }
  return formatAmount(num);
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
    const address = useAppSelector((state) => state.wallet.address);
    const tokens = useBerachainTokenList();
    const [currentToken, setCurrentToken] = useState<BerachainToken | null>(preSelectedToken || null);
    const [inputValue, setInputValue] = useState<string>(`${defaultValue || ""}`);
    const tokenArray = useMemo(() => currentToken ? [currentToken] : [], [currentToken]);
    const { balances, loading } = useTokenBalances(tokenArray, address) as { balances: Record<string, string>, loading: boolean };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);
      onAmountChange && onAmountChange(value);
    };

    const handleTokenSelect = useCallback((token: BerachainToken) => {
      onTokenSelect && onTokenSelect(token);
      setCurrentToken(token);
    }, [onTokenSelect]);

    const setMax = useCallback(() => {
      if (!currentToken) return;
      const max = getMaxWithFee(balances[currentToken.symbol] || "0", currentToken.symbol);
      setInputValue(max);
      onAmountChange && onAmountChange(max);
    }, [onAmountChange, balances, currentToken]);

    const balance = currentToken ? balances[currentToken.symbol] : undefined;
    const isOverBalance = balance !== undefined && inputValue && parseFloat(inputValue) > parseFloat(balance);

    return (
      <div
        className={`Inputs__From From From--${isOverBalance ? "error" : "idle"}`}
      >
        <div className="From__Label">
          <p>Buy</p>
        </div>
        <div className="From__AmountsAndChain">
          <div className="From__Amounts" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              className="From__Input"
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={inputValue}
              onFocus={() => { }}
              onBlur={() => { }}
              onChange={handleInputChange}
              min={0}
              style={{ color: isOverBalance ? '#FF7456' : undefined }}
            />
          </div>
          <div className="From__LogosAndBalance">
            <div
              className={`From__Logos ${disabled ? "From__disabled" : ""}`}
            >
              <NetworkSelector
                preSelected={currentToken || undefined}
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
          <div className="From__Balance" style={{ display: 'flex', alignItems: 'baseline' }}>
            {currentToken && (
              <>
                <button
                  type="button"
                  className="From__Max"
                  style={{
                    color: '#8a8984',
                    background: 'none',
                    border: 'none',
                    borderRadius: 8,
                    marginLeft: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '2px 4px',
                    cursor: 'pointer',
                    height: 14,
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                    transition: 'color 0.15s',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = '#fff')}
                  onMouseOut={e => (e.currentTarget.style.color = '#8a8984')}
                  onClick={setMax}
                  tabIndex={-1}
                >
                  Max
                </button>
                <p className="From__Amount" style={{ margin: 0, fontWeight: 500, color: isOverBalance ? '#FF7456' : undefined }}>
                  {loading ? "..." : formatAmountTruncate(balance || '0')}
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
