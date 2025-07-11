import React, { useMemo, useState, useEffect, type ChangeEvent, useCallback, useRef } from "react";
import { ConnectButton } from '../Buttons/ConnectButton';
import { FromInput } from '../Inputs/FromInput';
import { SwapToInput } from '../Inputs/SwapToInput';
import { Divider } from '../Inputs/Divider';
import { Nut } from "../SVGs/ProductSVGs";
import { TransactionStatusModal } from '../TransactionStatusModal/TransactionStatusModal';
import { useSwap } from '../../hooks/useSwap';
import { useAccount, useWatchBlockNumber } from "wagmi";
import { zeroAddress } from "viem";
import { usePrice } from '../../hooks/usePrice';
import { formatEther, parseEther } from "viem";
import { usePoolAddress } from '../../hooks/usePoolAddress';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { useTokens } from '../../hooks/useBerachainTokenList';
import { Loader } from '../Loader/Loader';

interface FormProps {
  toggleSidebar: () => void;
  dominantColor?: string;
  secondaryColor?: string;
  customClassName?: string;
  isHomePage?: boolean;
  isSticky?: boolean; // New prop for sticky mode
  onPoolChange?: (poolAddress: string | null, fromToken: BerachainToken | null, toToken: BerachainToken | null) => void;
  initialFromToken?: BerachainToken | null;
}

const SwapForm: React.FC<FormProps> = React.memo(
  ({
    dominantColor,
    secondaryColor,
    customClassName,
    isHomePage,
    isSticky = false, // Default to false for compatibility
    onPoolChange,
    initialFromToken,
  }) => {
    const { isConnected } = useAccount()
    const [fromToken, setFromToken] = useState<BerachainToken | null>(initialFromToken || null);
    const [toToken, setToToken] = useState<BerachainToken | null>(null);
    const [fromAmount, setFromAmount] = useState<bigint>(0n);
    const [toAmount, setToAmount] = useState<bigint>(0n);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [paramOpen, setParamOpen] = useState<boolean>(false)
    const paramBoxRef = useRef<HTMLDivElement>(null);
    const [slippageConfig, setSlippageConfig] = useState<{ real: number, display: string, isAuto: boolean }>({
      real: 0.05,
      display: "5",
      isAuto: true,
    })
    const [deadlineConfig, setDeadlineConfig] = useState<{ real: number, display: string }>({ real: 20, display: "20" })
    const [editing, setEditing] = useState<'from' | 'to' | null>(null);
    const { data: priceFrom = 0 } = usePrice(fromToken);
    const { data: priceTo = 0 } = usePrice(toToken);
    const { data: tokens } = useTokens();

    const swap = useSwap({
      tokenIn: fromToken?.address || zeroAddress,
      tokenOut: toToken?.address || zeroAddress,
      amountIn: fromAmount,
      slippageTolerance: slippageConfig.real,
      deadline: deadlineConfig.real,
    })

    const { poolAddress } = usePoolAddress(
      fromToken?.address,
      toToken?.address
    );

    const handleFromTokenSelect = useCallback((token: BerachainToken) => {
      if (toToken?.address === token.address) {
        setToToken(null);
      }
      setFromToken(token);
    }, [toToken]);

    const handleToTokenSelect = useCallback((token: BerachainToken) => {
      if (fromToken?.address === token.address) {
        setFromToken(null);
      }
      setToToken(token);
    }, [fromToken]);

    const handleOpenModal = () => {
      setShowModal(true);
    };
    const handleCloseModal = () => {
      setShowModal(false);
      if (swap.status === 'error') {
        swap.reset();
      }
    };
    const handleSwitchTokens = () => {
      setFromToken(toToken);
      setToToken(fromToken);
      setFromAmount(toAmount);
      setToAmount(fromAmount);
      setEditing(null);
    };

    const updateSlippage = (e: ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value.replace(/[^\d.,]/g, '')
      val = val.replace(',', '.')

      if (val.includes('.')) {
        const parts = val.split('.')
        if (parts[1] && parts[1].length > 2) {
          val = parts[0] + '.' + parts[1].substring(0, 2)
        }
      }
      const numVal = val === "" ? 0 : parseFloat(val)
      const real = numVal / 100

      if (numVal < 0 || numVal > 100) return

      setSlippageConfig({ real, display: val, isAuto: false })
    }
    const updateDeadline = (e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^\d]/g, '')
      if (+val < 0) return

      setDeadlineConfig({ real: +val, display: val })
    }

    const handleClickParams = () => {
      setParamOpen(!paramOpen)
    }
    const btnText = useMemo(() => {
      if (swap.status === "ready") return "Preview"
      if (swap.status === "idle" && (!fromToken || !toToken)) return "Select a token"
      if (swap.status === "idle" && (toAmount === 0n)) return "Enter Amount"
      if (swap.status === "error") {
        if (fromToken && toToken && fromAmount > 0n && toAmount > 0n) {
          return "Preview"
        }
        return swap?.error || "Error"
      }
      if (["loading-routes", "quoting"].includes(swap.status)) return null

      return swap.status.replace(/^./, swap.status[0].toUpperCase())
    }, [swap.status, fromToken, toToken, fromAmount, toAmount])

    useWatchBlockNumber({
      onBlockNumber() {
        if (swap.status === "ready") {
          swap?.refresh()
        }
      }
    })

    useEffect(() => {
      if (swap?.quote?.amountOut && editing !== 'to') {
        setToAmount(swap.quote.amountOut)
      }
    }, [swap.quote, editing])

    useEffect(() => {
      if (swap.status === "success") {
        setTimeout(() => {
          swap.reset()
          setShowModal(false)
          setFromAmount(0n)
          setToAmount(0n)
        }, 3000)
      }
    }, [swap.status])

    useEffect(() => {
      if (onPoolChange) {
        // Use the pool address retrieved by usePoolAddress
        const poolAddressStr = poolAddress ? poolAddress : null;
        onPoolChange(poolAddressStr, fromToken, toToken);
      }
    }, [poolAddress, fromToken, toToken, onPoolChange]);

    useEffect(() => {
      if (!fromToken && tokens) {
        const bera = tokens.find(t => t.address.toLowerCase() === '0x0000000000000000000000000000000000000000');
        if (bera) setFromToken(bera);
      }
    }, [tokens, fromToken]);

    useEffect(() => {
      if (initialFromToken && initialFromToken.address !== fromToken?.address) {
        setFromToken(initialFromToken);
      }
    }, [initialFromToken]);

    const handleFromAmountChange = (amount: bigint) => {
      setEditing('from');
      setFromAmount(amount);
    };

    const handleToAmountChange = (amount: bigint) => {
      setEditing('to');
      setToAmount(amount);
      // Synchronization: recalculate fromAmount so that the USD value is identical
      if (priceFrom && priceTo && toToken && fromToken) {
        const toAmountFloat = parseFloat(formatEther(amount));
        const fromAmountFloat = (toAmountFloat * priceTo) / priceFrom;
        const fromAmountWei = parseEther(fromAmountFloat.toFixed(fromToken.decimals));
        setFromAmount(fromAmountWei);
      }
    };

    // Conditional classes for sticky mode
    const formClasses = [
      'Form',
      isSticky ? 'Form--sticky' : '',
      customClassName || ''
    ].filter(Boolean).join(' ');

    // Fermer le panneau settings si clic en dehors
    useEffect(() => {
      if (!paramOpen) return;
      function handleClickOutside(event: MouseEvent) {
        if (paramBoxRef.current && !paramBoxRef.current.contains(event.target as Node)) {
          setParamOpen(false);
        }
      }
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [paramOpen]);

    return (
      <div className={formClasses}>
        <div className="Form__box">
          <div className="Form__head">
            <button className="iconLink" onClick={handleClickParams}>
              {!slippageConfig.isAuto ? slippageConfig.display : ""}
              <Nut />
            </button>
            <div ref={paramBoxRef} className={`ParamBox ${paramOpen ? "" : "ParamBox--hide"}`}>
              <div className="ParamBox__param">
                <p>Max slippage</p>
                <div className="ParamBox__slippageInput">
                  <button
                    className={slippageConfig.isAuto ? "active" : ""}
                    onClick={() => setSlippageConfig({ real: 0.05, display: "5%", isAuto: true })}
                  >
                    Auto
                  </button>
                  <input
                    type="text"
                    value={slippageConfig.display}
                    onChange={updateSlippage}
                  />
                  <p>%</p>
                </div>
              </div>
              <div className="ParamBox__param">
                <p>Swap deadline</p>
                <div className="ParamBox__slippageInput">
                  <input
                    type="text"
                    value={deadlineConfig.display}
                    onChange={updateDeadline}
                  />
                  <p>&nbsp;minutes</p>
                </div>
              </div>
            </div>
          </div>

          <div className="Inputs">
            <FromInput
              selectedToken={fromToken}
              onTokenSelect={handleFromTokenSelect}
              onAmountChange={handleFromAmountChange}
              value={fromAmount}
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
              isHomePage={isHomePage}
              disabled={!fromToken}
              onBlur={() => setEditing(null)}
            />
            <Divider
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
              onClick={handleSwitchTokens}
            />
            <SwapToInput
              steps={{ totalRatio: 0, steps: [] }}
              preSelected={toToken}
              onSelect={handleToTokenSelect}
              inputValue={toAmount}
              onInputChange={handleToAmountChange}
              dominantColor={dominantColor}
              secondaryColor={secondaryColor}
              isHomePage={isHomePage}
              disabled={!toToken}
              onBlur={() => setEditing(null)}
            />
          </div>

          <div className="Form__ConnectBtnWrapper">
            {!isConnected ? (
              <ConnectButton
                size="large"
                dominantColor={dominantColor}
                secondaryColor={secondaryColor}
              />
            ) : (
              <button
                className={`btn btn--large btn__${swap.status !== "ready" && swap.status !== "error" ? "disabled" : "main"}`}
                onClick={handleOpenModal}
                disabled={swap.status !== "ready" && swap.status !== "error"}
              >
                {btnText === null ? <Loader size="small" /> : btnText}
              </button>
            )}
          </div>
        </div>
        <TransactionStatusModal
          open={showModal}
          onClose={handleCloseModal}
          inputToken={fromToken}
          outputToken={toToken}
          inputAmount={fromAmount}
          outputAmount={toAmount}
          swap={swap}
        />
      </div >
    );
  },
);

SwapForm.displayName = "SwapForm";

export default SwapForm;
