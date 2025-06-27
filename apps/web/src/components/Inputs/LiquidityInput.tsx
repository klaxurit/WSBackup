import React, { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { useAccount, useBalance } from 'wagmi';
import { usePrice } from '../../hooks/usePrice';
import { formatEther, parseEther, zeroAddress } from 'viem';
import { formatTokenAmount } from '../../utils/format';
import { FallbackImg } from '../utils/FallbackImg';
import type { Token } from '../../hooks/usePositions';

interface LiquidityInputProps {
  selectedToken: BerachainToken | Token | null;
  onAmountChange: (amount: bigint) => void;
  value: bigint;
  isOverBalance: boolean;
  disabled?: boolean;
}

export const LiquidityInput: React.FC<LiquidityInputProps> = ({
  selectedToken,
  onAmountChange,
  value,
  isOverBalance,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const isInputting = useRef(false);
  const [inputValue, setInputValue] = useState('');

  const { address } = useAccount()
  const { data: usdValue = 0 } = usePrice(selectedToken)

  const { data: balance, isLoading: loading } = useBalance({
    address,
    token: (selectedToken?.address !== zeroAddress) ? selectedToken?.address as `0x${string}` : undefined,
    query: {
      enabled: !!address
    }
  })

  const usdAmount = useMemo(() => {
    if (value === 0n) return 0
    return (usdValue * +formatEther(value)).toFixed(2)
  }, [usdValue, value])


  useEffect(() => {
    if (!isInputting.current) {
      setInputValue(value === 0n ? '' : formatEther(value));
    }
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    isInputting.current = true;

    if (/^\d*(\.\d*)?$/.test(val) && val !== '') {
      onAmountChange(parseEther(val));
    } else if (val === '') {
      onAmountChange(0n);
    }
  };

  const handleBlur = () => {
    isInputting.current = false;
    setInputValue(value === 0n ? '' : formatEther(value));
  };

  const setMax = () => {
    if (inputRef.current) {
      inputRef.current.value = formatEther(balance?.value || 0n)
      onAmountChange(balance?.value || 0n)
    }
  }
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
        </div>
      </div>
    </div>
  );
};
