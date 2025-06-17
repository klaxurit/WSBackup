"use client";
import { useMemo, useRef } from "react";
import React from "react";
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { useAccount, useBalance } from "wagmi";
import { formatEther, parseEther, zeroAddress } from "viem";
import { usePrice } from "../../hooks/usePrice";
import TokenSelector from "../Buttons/TokenSelector";
import { formatTokenAmount } from '../../utils/format';

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
            value={value === 0n ? '' : formatEther(value)}
            onChange={(e) => onAmountChange(parseEther(e.target.value || '0'))}
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
        <div className="From__Balance">
          {selectedToken && (
            <>
              <button
                type="button"
                className="From__Max"
                onClick={setMax}
                tabIndex={-1}
              >
                Max
              </button>
              <p className={`From__Amount${isOverBalance ? ' From__Amount--error' : ''}`}>
                {loading ? "..." : formatTokenAmount(formatEther(balance?.value || 0n))}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

FromInput.displayName = "FromInput";
