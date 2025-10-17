import { useEffect, useMemo, useRef, useState, useImperativeHandle, forwardRef, type ChangeEvent } from 'react';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { useAccount, useBalance } from 'wagmi';
import { usePrice } from '../../hooks/usePrice';
import { formatUnits, parseUnits, zeroAddress } from 'viem';
import { formatTokenAmount } from '../../utils/format';
import { FallbackImg } from '../utils/FallbackImg';
import type { Token } from '../../hooks/usePositions';

// Type simple pour les tokens mockés
interface MockToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUri: string;
}

interface LiquidityInputProps {
  selectedToken: BerachainToken | Token | MockToken | null;
  onAmountChange: (amount: bigint) => void;
  value: bigint;
  isOverBalance: boolean;
  disabled?: boolean;
  showMaxButton?: boolean;
  customUsdValue?: number;
  customBalance?: bigint;
}

export interface LiquidityInputRef {
  refresh: () => void;
}

export const LiquidityInput = forwardRef<LiquidityInputRef, LiquidityInputProps>(({
  selectedToken,
  onAmountChange,
  value,
  isOverBalance,
  disabled = false,
  showMaxButton = true,
  customUsdValue,
  customBalance,
}, ref) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const isInputting = useRef(false);
  const lastUserInput = useRef<string>('');
  const [inputValue, setInputValue] = useState('');

  const { address } = useAccount()
  const { data: usdValue = 0 } = usePrice(selectedToken as any)

  // Use custom balance if provided, otherwise use useBalance hook
  const { data: wagmiBalance, isLoading: loadingWagmi } = useBalance({
    address,
    token: (selectedToken?.address !== zeroAddress) ? selectedToken?.address as `0x${string}` : undefined,
    query: {
      enabled: !!address && !customBalance
    }
  })

  // Use custom balance or wagmi balance
  const balance = customBalance !== undefined ? { value: customBalance } : wagmiBalance
  const loading = customBalance !== undefined ? false : loadingWagmi

  const usdAmount = useMemo(() => {
    if (value === 0n) return 0
    if (customUsdValue !== undefined) {
      return (customUsdValue * +formatUnits(value, selectedToken?.decimals || 18)).toFixed(2)
    }
    return (usdValue * +formatUnits(value, selectedToken?.decimals || 18)).toFixed(2)
  }, [usdValue, value, customUsdValue, selectedToken?.decimals])


  useEffect(() => {
    if (!isInputting.current) {
      const formattedValue = value === 0n ? '' : formatUnits(value, selectedToken?.decimals || 18);

      // Si la valeur correspond à ce que l'utilisateur a tapé, garder l'input utilisateur
      if (lastUserInput.current && value > 0n) {
        try {
          const parsedUserInput = parseUnits(lastUserInput.current, selectedToken?.decimals || 18);
          if (parsedUserInput === value) {
            setInputValue(lastUserInput.current);
            return;
          }
        } catch {
          // Si erreur de parsing, utiliser la valeur formatée
        }
      }

      setInputValue(formattedValue);
    }
  }, [value, selectedToken?.decimals]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    isInputting.current = true;
    lastUserInput.current = val;

    if (/^\d*(\.\d*)?$/.test(val) && val !== '') {
      onAmountChange(parseUnits(val, selectedToken?.decimals || 18));
    } else if (val === '') {
      lastUserInput.current = '';
      onAmountChange(0n);
    }
  };

  const handleBlur = () => {
    isInputting.current = false;
    lastUserInput.current = '';
    setInputValue(value === 0n ? '' : formatUnits(value, selectedToken?.decimals || 18));
  };

  const setMax = () => {
    if (inputRef.current) {
      inputRef.current.value = formatUnits(balance?.value || 0n, selectedToken?.decimals || 18)
      onAmountChange(balance?.value || 0n)
    }
  }

  // Fonction de refresh pour remettre à zéro l'input
  const refreshInput = () => {
    setInputValue('');
    onAmountChange(0n);
    isInputting.current = false;
    lastUserInput.current = '';
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // Exposer la fonction de refresh via useImperativeHandle
  useImperativeHandle(ref, () => ({
    refresh: refreshInput,
  }), []);
  return (
    <div className="LiquidityInput">
      <div className="Inputs">
        <div className="LiquidityInput__InputWrapper">
          <div
            className={`Inputs__From From From--${isOverBalance ? "error" : "idle"}`}
          >
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
                  onBlur={handleBlur}
                  min={0}
                  style={{ color: isOverBalance ? '#FF7456' : undefined }}
                  readOnly={disabled}
                />
              </div>
              <div className="From__LogosAndBalance">
                <div className={`From__Logos${disabled ? " From__disabled" : ""}`}>
                  <button
                    className={`networkSelector has-token`}
                    disabled
                  >
                    <span className="networkSelector__logoWrapper">
                      {!selectedToken?.logoUri
                        ? <FallbackImg content={selectedToken?.symbol || ""} />
                        : (
                          <img
                            src={selectedToken?.logoUri}
                            alt={selectedToken?.name}
                          />
                        )}
                    </span>
                    <span className="networkSelector__symbol">{selectedToken?.symbol}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="From__Details">
              <p className="From__Convertion">${usdAmount}</p>
              <div className="From__Balance">
                {selectedToken && (
                  <>
                    {showMaxButton && (
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
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});