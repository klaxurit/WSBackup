import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { formatUnits, parseUnits } from 'viem';

interface ClaimInputProps {
  defaultValue: bigint;
  onAmountChange: (amount: bigint) => void;
  value: bigint;
  decimals: number
}

export const ClaimInput = ({
  defaultValue,
  onAmountChange,
  value,
  decimals
}: ClaimInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const isInputting = useRef(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (!isInputting.current) {
      setInputValue(value === 0n ? '' : formatUnits(value, decimals));
    }
  }, [value]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    isInputting.current = true;

    if (/^\d*(\.\d*)?$/.test(val) && val !== '') {
      onAmountChange(parseUnits(val, decimals));
    } else if (val === '') {
      onAmountChange(0n);
    }
  };

  const handleBlur = () => {
    isInputting.current = false;
    setInputValue(value === 0n ? '' : formatUnits(value, decimals));
  };

  const setPercent = (percent: bigint) => {
    if (inputRef.current) {
      const v = (defaultValue * percent) / 100n
      inputRef.current.value = formatUnits(v || 0n, decimals)
      onAmountChange(v || 0n)
    }
  }

  return (
    <div className="LiquidityInput" >
      <div className="Inputs" >
        <div className="LiquidityInput__InputWrapper" >
          <div className="Inputs__From From From--idle" >
            <div className="From__AmountsAndChain" >
              <div className="From__Amounts" style={{ position: 'relative', display: 'flex', alignItems: 'center' }
              }>
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
                />
              </div>
            </div>
            < div className="From__Details" >
              < div className="From__Balance" >
                <button type="button"
                  className="From__Max"
                  onClick={() => setPercent(50n)}
                  tabIndex={- 1}
                >
                  50%
                </button>
                <button type="button"
                  className="From__Max"
                  onClick={() => setPercent(100n)}
                  tabIndex={- 1}
                >
                  100%
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
