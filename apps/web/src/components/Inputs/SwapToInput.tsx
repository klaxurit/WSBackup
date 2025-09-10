import React, { useMemo, useRef, useState, useEffect } from "react";
import type { BerachainToken } from "../../hooks/useBerachainTokenList";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { usePrice } from "../../hooks/usePrice";
import TokenSelector from "../Buttons/TokenSelector";
import { useAccount, useBalance } from "wagmi";

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
  disabled?: boolean;
  onInputClick?: () => void;
  onBlur?: () => void;
  isListOpen?: boolean;
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
    disabled = false,
    onInputClick,
    onBlur,
  }) => {
    const textareaRef = useRef<HTMLInputElement>(null);
    const isInputting = useRef(false);
    const [inputDisplayValue, setInputDisplayValue] = useState('');

    const { address } = useAccount()
    const { data: balance, isLoading: loading } = useBalance({
      address,
      token: (preSelected?.address !== zeroAddress) ? preSelected?.address as `0x${string}` : undefined,
      query: {
        enabled: !!preSelected
      }
    })
    const { data: usdValue = 0 } = usePrice(preSelected)

    // Réinitialiser l'état interne quand le composant est remonté (key change)
    useEffect(() => {
      setInputDisplayValue('');
      isInputting.current = false;
    }, []);

    // Synchroniser l'affichage avec la valeur externe
    useEffect(() => {
      if (!isInputting.current) {
        const formattedValue = inputValue === 0n ? '' : formatUnits(inputValue, preSelected?.decimals || 18);
        setInputDisplayValue(formattedValue);
      }
    }, [inputValue, preSelected?.decimals]);

    // Forcer le nettoyage quand inputValue devient 0n
    useEffect(() => {
      if (inputValue === 0n) {
        setInputDisplayValue('');
        isInputting.current = false;
      }
    }, [inputValue]);

    const usdAmount = useMemo(() => {
      if (inputValue === 0n) return 0
      return (usdValue * +formatUnits(inputValue, preSelected?.decimals || 18)).toFixed(2)
    }, [usdValue, inputValue])

    return (
      <div className={`Inputs__To To`}>
        <div className="From__Label">
          <p>Buy</p>
        </div>
        <div className="From__AmountsAndChain">
          <div className="From__Amounts" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              ref={textareaRef}
              className="From__Input"
              value={inputDisplayValue}
              type="text"
              inputMode="decimal"
              placeholder="0"
              onChange={e => {
                const val = e.target.value;
                setInputDisplayValue(val);
                isInputting.current = true;

                // Validation améliorée
                if (/^\d*(\.\d*)?$/.test(val) && val !== '') {
                  try {
                    const parsedAmount = parseUnits(val, preSelected?.decimals || 18);
                    if (parsedAmount >= 0n) {
                      onInputChange(parsedAmount);
                    }
                  } catch (error) {
                    console.warn('Invalid input amount:', val);
                  }
                } else if (val === '') {
                  onInputChange(0n);
                }
              }}
              readOnly={disabled}
              onClick={disabled ? onInputClick : undefined}
              onBlur={() => {
                isInputting.current = false;
                setInputDisplayValue(inputValue === 0n ? '' : formatUnits(inputValue, preSelected?.decimals || 18));
                if (onBlur) onBlur();
              }}
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
                onlyPoolToken={true}
              />
            </div>
          </div>
        </div>
        <div className="From__Details">
          <p className="From__Convertion">${usdAmount}</p>
          <div className="From__Balance" style={{ display: 'flex', alignItems: 'baseline' }}>
            {preSelected && (
              <p className="From__Amount" style={{ margin: 0, fontWeight: 500 }}>
                Current: {loading ? "..." : (+formatUnits(balance?.value || 0n, preSelected?.decimals || 18)).toFixed(4)}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  },
);

SwapToInput.displayName = "SwapToInput";
