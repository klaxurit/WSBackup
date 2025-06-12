"use client";
import { useMemo, useRef } from "react";
import React from "react";
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { useAccount, useBalance } from "wagmi";
import { formatEther, parseEther, zeroAddress } from "viem";
import { usePrice } from "../../hooks/usePrice";
import TokenSelector from "../Buttons/TokenSelector";

interface FromInputProps {
  onToggleNetworkList?: (isOpen: boolean) => void;
  onSelect?: (token: BerachainToken) => void;
  disabled?: boolean;
  dominantColor?: string;
  secondaryColor?: string;
  minimized?: boolean;
  isHomePage?: boolean;
  selectedToken: BerachainToken | null;
  onAmountChange: (amount: bigint) => void;
  onTokenSelect: (token: BerachainToken) => void;
  defaultValue?: number;
  value: bigint;
  showLabel?: boolean;
}

export const FromInput: React.FC<FromInputProps> = (
  {
    onToggleNetworkList,
    disabled,
    minimized,
    dominantColor,
    secondaryColor,
    isHomePage,
    selectedToken,
    onAmountChange,
    onTokenSelect,
    value,
    showLabel = true,
  }) => {
  const { address } = useAccount()
  const inputRef = useRef<HTMLInputElement>(null)
  const { data: balance, isLoading: loading } = useBalance({
    address,
    token: (selectedToken?.address !== zeroAddress) ? selectedToken?.address as `0x${string}` : undefined,
    query: {
      enabled: !!selectedToken
    }
  })
  const { data: usdValue = 0 } = usePrice(selectedToken)

  const usdAmount = useMemo(() => {
    if (value === 0n) return 0
    return (usdValue * +formatEther(value)).toFixed(2)
  }, [usdValue, value])

  const isOverBalance = useMemo(() => (value > (balance?.value || 0n)), [value, balance])

  const setMax = () => {
    if (inputRef.current) {
      inputRef.current.value = formatEther(balance?.value || 0n)
      onAmountChange(balance?.value || 0n)
    }
  }

  return (
    <div
      className={`Inputs__From From From--${isOverBalance ? "error" : "idle"}`}
    >
      {showLabel && (
        <div className="From__Label">
          <p>Buy</p>
        </div>
      )}
      <div className="From__AmountsAndChain">
        <div className="From__Amounts" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            ref={inputRef}
            className="From__Input"
            type="text"
            inputMode="decimal"
            placeholder="0"
            onChange={(e) => onAmountChange(parseEther(e.target.value))}
            min={0}
            style={{ color: isOverBalance ? '#FF7456' : undefined }}
          />
        </div>
        <div className="From__LogosAndBalance">
          <div
            className={`From__Logos ${disabled ? "From__disabled" : ""}`}
          >
            <TokenSelector
              preSelected={selectedToken}
              onToggleNetworkList={onToggleNetworkList}
              minimized={minimized}
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
              isHomePage={isHomePage}
              onSelect={onTokenSelect}
            />
          </div>
        </div>
      </div>
      <div className="From__Details">
        <p className="From__Convertion">${usdAmount}</p>
        <div className="From__Balance" style={{ display: 'flex', alignItems: 'baseline' }}>
          {selectedToken && (
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
                {loading ? "..." : formatEther(balance?.value || 0n)}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

FromInput.displayName = "FromInput";
