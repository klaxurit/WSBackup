"use client";
import { useMemo, useRef } from "react";
import React from "react";
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { useAccount, useBalance } from "wagmi";
import { formatUnits, parseUnits, zeroAddress } from "viem";
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
  onInputClick?: () => void;
  onBlur?: () => void;
  isListOpen?: boolean;
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
    onInputClick,
    onBlur,
    isListOpen,
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
    return (usdValue * +formatUnits(value, selectedToken?.decimals || 18)).toFixed(2)
  }, [usdValue, value])

  const isOverBalance = useMemo(() => (value > (balance?.value || 0n)), [value, balance])

  const [inputValue, setInputValue] = React.useState('');
  const isInputting = React.useRef(false);

  React.useEffect(() => {
    if (!isInputting.current) {
      setInputValue(value === 0n ? '' : formatUnits(value, selectedToken?.decimals || 18));
    }
  }, [value, selectedToken?.decimals]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    isInputting.current = true;

    if (/^\d*(\.\d*)?$/.test(val) && val !== '') {
      try {
        onAmountChange(parseUnits(val, selectedToken?.decimals || 18));
      } catch { }
    } else if (val === '') {
      onAmountChange(0n);
    }
  };

  const handleBlur = () => {
    isInputting.current = false;
    setInputValue(value === 0n ? '' : formatUnits(value, selectedToken?.decimals || 18));
  };

  const setMax = () => {
    if (inputRef.current) {
      const val = selectedToken?.address === zeroAddress
        ? (balance?.value || 0n) * 99n / 100n
        : balance?.value
      inputRef.current.value = formatUnits(val || 0n, selectedToken?.decimals || 18)
      onAmountChange(val || 0n)
    }
  }

  return (
    <div
      className={`Inputs__From From From--${isOverBalance ? "error" : "idle"}`}
    >
      {showLabel && (
        <div className="From__Label">
          <p>Sell</p>
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
            value={inputValue}
            onChange={handleInputChange}
            onBlur={() => { handleBlur(); if (typeof onBlur === 'function') onBlur(); }}
            min={0}
            style={{ color: isOverBalance ? '#FF7456' : undefined }}
            readOnly={disabled}
            onClick={(e) => {
              if (disabled && onInputClick) {
                e.stopPropagation();
                onInputClick();
              }
            }}
          />
        </div>
        <div className="From__LogosAndBalance">
          <div className={`From__Logos${disabled ? " From__disabled" : ""}`}>
            <TokenSelector
              preSelected={selectedToken}
              onToggleNetworkList={onToggleNetworkList}
              minimized={minimized}
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
              isHomePage={isHomePage}
              onSelect={onTokenSelect}
              onForceOpen={onInputClick}
              forceListOpen={isListOpen}
              onlyPoolToken={true}
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
                {loading ? "..." : formatTokenAmount(formatUnits(balance?.value || 0n, selectedToken?.decimals || 18))}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

FromInput.displayName = "FromInput";
