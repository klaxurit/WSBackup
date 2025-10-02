import React, { useMemo, useRef, useState, useEffect, useCallback } from "react";
import type { BerachainToken } from "../../hooks/useBerachainTokenList";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import TokenSelector from "../Buttons/TokenSelector";
import { useAccount, useBalance } from "wagmi";
import { useTokensInPool } from "../../hooks/useTokensInPool";

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
    const [inputDisplayValue, setInputDisplayValue] = useState('');
    const [isUserTyping, setIsUserTyping] = useState(false);

    const { address } = useAccount()

    // Hook Wagmi pour les balances (mise à jour automatique après transactions)
    const { data: wagmiBalance, isLoading: balanceLoading } = useBalance({
      address,
      token: (preSelected?.address !== zeroAddress) ? preSelected?.address as `0x${string}` : undefined,
      query: {
        enabled: !!preSelected
      }
    })

    // Données optimisées pour les prix USD
    const { data: tokensData } = useTokensInPool();

    // Trouver le token sélectionné dans les données optimisées pour le prix
    const selectedTokenData = useMemo(() => {
      if (!preSelected || !tokensData?.data?.tokens) return null;
      return tokensData.data.tokens.find(token =>
        token.address.toLowerCase() === preSelected.address.toLowerCase()
      );
    }, [preSelected, tokensData]);

    // Utiliser Wagmi pour la balance (mise à jour automatique) et les données optimisées pour le prix
    const balance = wagmiBalance;
    const usdValue = selectedTokenData?.priceUSD || 0;
    const loading = balanceLoading;

    // Reset internal state when component remounts
    useEffect(() => {
      setInputDisplayValue('');
      setIsUserTyping(false);
    }, []);

    // Synchronize display with external value when not typing
    useEffect(() => {
      if (!isUserTyping) {
        const formattedValue = inputValue === 0n ? '' : formatUnits(inputValue, preSelected?.decimals || 18);
        setInputDisplayValue(formattedValue);
      }
    }, [inputValue, preSelected?.decimals, isUserTyping]);

    // Force cleanup when inputValue becomes 0n
    useEffect(() => {
      if (inputValue === 0n) {
        setInputDisplayValue('');
        setIsUserTyping(false);
      }
    }, [inputValue]);

    const usdAmount = useMemo(() => {
      if (inputValue === 0n) return 0
      return (usdValue * +formatUnits(inputValue, preSelected?.decimals || 18)).toFixed(2)
    }, [usdValue, inputValue, preSelected?.decimals])

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
              onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                setInputDisplayValue(val);
                setIsUserTyping(true);

                // Enhanced validation
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
              }, [onInputChange, preSelected?.decimals])}
              readOnly={disabled}
              onClick={disabled ? onInputClick : undefined}
              onBlur={useCallback(() => {
                setIsUserTyping(false);
                setInputDisplayValue(inputValue === 0n ? '' : formatUnits(inputValue, preSelected?.decimals || 18));
                if (onBlur) onBlur();
              }, [inputValue, preSelected?.decimals, onBlur])}
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