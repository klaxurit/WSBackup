import React, { useMemo, useState, useEffect, type ChangeEvent, useCallback, useRef } from "react";
import { ConnectButton } from '../Buttons/ConnectButton';
import { FromInput } from '../Inputs/FromInput';
import { SwapToInput } from '../Inputs/SwapToInput';
import { Divider } from '../Inputs/Divider';
import { Nut } from "../SVGs/ProductSVGs";
import { RouteDisplay } from '../RouteDisplay';
import { TransactionStatusModal } from '../TransactionStatusModal/TransactionStatusModal';
import { useSwap } from '../../hooks/swap/useSwap';
import { useAccount, useWatchBlockNumber } from "wagmi";
import { zeroAddress } from "viem";
import { usePoolAddress } from '../../hooks/usePoolAddress';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { useTokens } from '../../hooks/useBerachainTokenList';
import { Loader } from '../Loader/Loader';
import { ensureArray } from '../../utils/dataValidation';

interface FormProps {
  toggleSidebar: () => void;
  dominantColor?: string;
  secondaryColor?: string;
  customClassName?: string;
  isHomePage?: boolean;
  isSticky?: boolean;
  onPoolChange?: (poolAddress: string | null, fromToken: BerachainToken | null, toToken: BerachainToken | null) => void;
  initialFromToken?: BerachainToken | null;
  initialToToken?: BerachainToken | null;
}

/**
 * SwapForm utilisant le nouveau hook useSwap modulaire
 * Version finale après migration et tests réussis
 */
export const SwapForm: React.FC<FormProps> = React.memo(
  ({
    dominantColor,
    secondaryColor,
    customClassName,
    isHomePage,
    isSticky = false,
    onPoolChange,
    initialFromToken,
    initialToToken
  }) => {
    const { isConnected } = useAccount()
    const [fromToken, setFromToken] = useState<BerachainToken | null>(initialFromToken || null);
    const [toToken, setToToken] = useState<BerachainToken | null>(initialToToken || null);
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
    const [lastEditedField, setLastEditedField] = useState<'from' | 'to' | null>(null);
    const [editing, setEditing] = useState<'from' | 'to' | null>(null);
    const isUpdatingFromQuote = useRef<boolean>(false);
    const { data: tokens } = useTokens();

    // <<<< NOUVEAU HOOK MODULAIRE
    const swap = useSwap({
      tokenIn: (fromToken?.address as `0x${string}`) || zeroAddress,
      tokenOut: (toToken?.address as `0x${string}`) || zeroAddress,
      amountIn: fromAmount,
      slippageTolerance: slippageConfig.real,
      deadline: deadlineConfig.real,
      enableDebounce: true,
    })

    console.log(swap)

    const { poolAddress } = usePoolAddress(
      fromToken?.address as `0x${string}` | undefined,
      toToken?.address as `0x${string}` | undefined
    );

    const handleFromTokenSelect = useCallback((token: BerachainToken) => {
      setToToken(prevTo => {
        if (prevTo?.address === token.address) {
          return null;
        }
        return prevTo;
      });
      setFromToken(token);
    }, []);

    const handleToTokenSelect = useCallback((token: BerachainToken) => {
      setFromToken(prevFrom => {
        if (prevFrom?.address === token.address) {
          return null;
        }
        return prevFrom;
      });
      setToToken(token);
    }, []);

    // Simplified handlers for this version

    const handleSwitchTokens = useCallback(() => {
      const currentFromToken = fromToken;
      const currentToToken = toToken;
      const currentFromAmount = fromAmount;
      const currentToAmount = toAmount;

      setFromToken(currentToToken);
      setToToken(currentFromToken);
      setFromAmount(currentToAmount);
      setToAmount(currentFromAmount);
      setLastEditedField(null);
    }, [fromToken, toToken, fromAmount, toAmount]);

    const updateSlippage = useCallback((e: ChangeEvent<HTMLInputElement>) => {
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
    }, [])

    const updateDeadline = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/[^\d]/g, '')
      if (+val < 0) return

      setDeadlineConfig({ real: +val, display: val })
    }, [])

    const handleClickParams = () => {
      setParamOpen(!paramOpen)
    }

    const handleAdjustSettings = useCallback(() => {
      setParamOpen(true);
    }, []);

    const isButtonEnabled = useMemo(() => {
      const hasValidTokens = !!(fromToken && toToken);
      const hasValidAmount = fromAmount > 0n;

      // Bloquer seulement si le swap est en cours de chargement
      const isNotLoading = !["loading-routes", "quoting"].includes(swap.status);

      const enabled = hasValidTokens && hasValidAmount && isNotLoading;

      return enabled;
    }, [fromToken, toToken, fromAmount, swap.status]);

    const btnText = useMemo(() => {
      if (!fromToken || !toToken) return "Select a token"
      if (!fromAmount || fromAmount === 0n) return "Enter an amount"

      // Vérifier les cas de wrap/unwrap en priorité
      if (swap.isWrap) return "Wrap"
      if (swap.isUnWrap) return "Unwrap"

      if (swap.status === "ready" && swap.quote) return "Preview"
      if (swap.status === "success") return "Success! 🎉"
      if (swap.status === "error") {
        return "Error"
      }
      if (["loading-routes", "quoting"].includes(swap.status)) return null

      return "Preview"
    }, [swap.status, fromToken, toToken, fromAmount, toAmount, swap.isWrap, swap.isUnWrap, swap.error])

    const handleBtnClick = async () => {
      if (swap.isWrap) {
        await swap.wrap()  // Wrap/Unwrap restent directs
      } else if (swap.isUnWrap) {
        await swap.unwrap()
      } else {
        setShowModal(true)  // Ouvrir la modal pour les swaps normaux
      }
    }

    useWatchBlockNumber({
      onBlockNumber() {
        if (swap.status === "ready" && fromAmount > 0n && toAmount > 0n) {
          swap?.refresh()
        }
      }
    })

    useEffect(() => {
      if (swap?.quote?.amountOut &&
        lastEditedField !== 'to' &&
        fromToken && toToken &&
        fromAmount > 0n &&
        !isUpdatingFromQuote.current) {

        isUpdatingFromQuote.current = true;
        setToAmount(swap.quote.amountOut);

        // Reset the flag after state update
        setTimeout(() => {
          isUpdatingFromQuote.current = false;
        }, 0);
      } else if (fromAmount === 0n && lastEditedField !== 'to') {
        setToAmount(0n);
      }
    }, [swap?.quote?.amountOut, lastEditedField, fromToken, toToken, fromAmount])

    // Effet pour attendre que les routes soient recalculées après un changement
    useEffect(() => {
      if (editing === 'from' && fromAmount > 0n && fromToken && toToken && swap.status === 'ready' && swap.quote?.amountOut) {
        setToAmount(swap.quote.amountOut);
      }
    }, [editing, fromAmount, fromToken, toToken, swap.status, swap.quote?.amountOut])

    // Effet supplémentaire pour s'assurer que l'état editing est réinitialisé après un swap
    useEffect(() => {
      if (swap.status === 'success') {
        setEditing(null);
      }
    }, [swap.status])

    useEffect(() => {
      if (onPoolChange) {
        const poolAddressStr = poolAddress ? poolAddress : null;
        onPoolChange(poolAddressStr, fromToken, toToken);
      }
    }, [poolAddress, fromToken, toToken, onPoolChange]);

    useEffect(() => {
      if (!fromToken && tokens && tokens.length > 0) {
        const tokensArray = ensureArray(tokens) as BerachainToken[];
        const bera = tokensArray.find(t => t.address.toLowerCase() === '0x0000000000000000000000000000000000000000');
        if (bera) {
          setFromToken(bera);
        }
      }
    }, [tokens, fromToken]);

    // Effet supplémentaire pour s'assurer que BERA est sélectionné même si fromToken est null
    useEffect(() => {
      if (tokens && tokens.length > 0 && !fromToken && !initialFromToken) {
        const tokensArray = ensureArray(tokens) as BerachainToken[];
        const bera = tokensArray.find(t => t.address.toLowerCase() === '0x0000000000000000000000000000000000000000');
        if (bera) {
          setFromToken(bera);
        }
      }
    }, [tokens, fromToken, initialFromToken]);

    useEffect(() => {
      if (initialFromToken && initialFromToken.address !== fromToken?.address) {
        setFromToken(initialFromToken);
      }
    }, [initialFromToken]);

    useEffect(() => {
      if (initialToToken && initialToToken.address !== toToken?.address) {
        setToToken(initialToToken);
      }
    }, [initialToToken]);

    const handleFromAmountChange = useCallback((amount: bigint) => {
      setLastEditedField('from');
      setFromAmount(amount);
    }, []);

    const handleToAmountChange = useCallback((amount: bigint) => {
      setLastEditedField('to');
      setToAmount(amount);
    }, []);

    const formClasses = [
      'Form',
      isSticky ? 'Form--sticky' : '',
      customClassName || ''
    ].filter(Boolean).join(' ');

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
                    onClick={() => setSlippageConfig({ real: 0.05, display: "5", isAuto: true })}
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
              onBlur={() => setLastEditedField(null)}
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
              onBlur={() => setLastEditedField(null)}
            />
          </div>

          {/* RouteDisplay component - show optimal route visualization */}
          {fromToken && toToken && fromAmount > 0n && swap.optimizedRoute && (
            <RouteDisplay
              optimizedRoute={swap.optimizedRoute}
              fromToken={fromToken}
              toToken={toToken}
            />
          )}

          <div className="Form__ConnectBtnWrapper">
            {!isConnected ? (
              <ConnectButton
                size="large"
                dominantColor={dominantColor}
                secondaryColor={secondaryColor}
              />
            ) : (
              <div className="Form__ConnectBtn">
                <button
                  className={`btn btn--large btn__${isButtonEnabled ? "main" : "disabled"}`}
                  onClick={handleBtnClick}
                  disabled={!isButtonEnabled}
                >
                  {btnText === null ? <Loader size="small" /> : btnText}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transaction Status Modal */}
        <TransactionStatusModal
          open={showModal}
          onClose={() => setShowModal(false)}
          inputToken={fromToken}
          outputToken={toToken}
          inputAmount={fromAmount}
          outputAmount={toAmount}
          swap={swap}
          onRefreshInputs={() => {
            setFromAmount(0n)
            setToAmount(0n)
            swap.reset()
          }}
          onAdjustSettings={handleAdjustSettings}
        />
      </div >
    );
  },
);

SwapForm.displayName = "SwapForm";

export default SwapForm;