import React, { useState, useMemo, useEffect } from 'react';
import type { useSwap } from '../../hooks/useSwap';
import { formatEther } from 'viem';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { FallbackImg } from '../utils/FallbackImg';
import { usePrice } from '../../hooks/usePrice';
import { formatTokenAmount, formatUsdAmount } from '../../utils/format';
import { getUsdAmount, getPoolFeesInBera } from '../../utils/transaction';

interface TransactionStatusModalProps {
  open: boolean;
  onClose: () => void;
  inputToken: BerachainToken | null;
  outputToken: BerachainToken | null;
  inputAmount: bigint;
  outputAmount: bigint;
  swap: ReturnType<typeof useSwap>
}

export const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
  open,
  onClose,
  inputToken,
  outputToken,
  inputAmount,
  swap
}) => {

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [shouldRenderDetails, setShouldRenderDetails] = useState(false);
  const { data: usdValueIn = 0 } = usePrice(inputToken)
  const { data: usdValueOut = 0 } = usePrice(outputToken)

  const { quote } = swap

  const usdAmountIn = useMemo(() => {
    if (inputAmount === 0n) return 0
    return (usdValueIn * +formatEther(inputAmount)).toFixed(2)
  }, [usdValueIn, inputAmount])
  const usdAmountOut = useMemo(() => {
    if (!quote || quote?.amountOut === 0n) return 0
    return (usdValueOut * +formatEther(quote.amountOut)).toFixed(2)
  }, [usdValueOut, quote])

  const poolFeesInBera = useMemo(() => getPoolFeesInBera(swap.selectedRoute), [swap.selectedRoute]);
  const poolFeesUsd = useMemo(() => getUsdAmount(usdValueIn, BigInt(poolFeesInBera)), [usdValueIn, poolFeesInBera]);

  const gasFeesUsd = useMemo(() => {
    if (!usdValueIn) return 0;
    return usdValueIn * +formatEther(quote?.gasEstimate || 0n);
  }, [usdValueIn, quote]);

  useEffect(() => {
    if (isDetailsOpen) {
      setShouldRenderDetails(true);
    } else if (shouldRenderDetails) {
      const timeout = setTimeout(() => setShouldRenderDetails(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [isDetailsOpen, shouldRenderDetails]);

  const btnText = useMemo(() => {
    if (swap.status === "ready" && !swap.needsApproval) return "Swap"
    if (swap.status === "ready" && swap.needsApproval) return "Approve"
    if (["loading-routes", "quoting"].includes(swap.status)) return "Loading"

    return swap.status.replace(/^./, swap.status[0].toUpperCase())
  }, [swap.status, swap.needsApproval])

  const rateValue = useMemo(() => {
    if (!swap?.quote) return "0"

    return parseFloat(formatEther((inputAmount * (10n ** BigInt(18))) / swap.quote.amountOut)).toFixed(2)
  }, [swap.quote, inputAmount])
  
  const priceImpact = useMemo(() => {
    if (!quote?.priceImpact) return "0"

    if (quote.priceImpact <= 100) return `-${(100 - quote.priceImpact).toFixed(2)}`
    if (quote.priceImpact > 100) return `+${(quote.priceImpact - 100).toFixed(2)}`
  }, [quote])

  const handleToggleDetails = () => setIsDetailsOpen((v) => !v);
  const handleSwap = async () => {
    if (swap.needsApproval) {
      await swap.approve()
    } else {
      await swap.swap()
    }
  };

  if (!open || !inputToken || !outputToken) return <></>

  return (
    <div className="TransactionModal__overlay">
      <div className="TransactionModal__box">
        <div className="TransactionModal__head">
          <span className="TransactionModal__title">You're swapping</span>
          <button className="TransactionModal__close" onClick={onClose} aria-label="Close">
            &#10005;
          </button>
        </div>
        <div className="TransactionModal__swapblock">
          <div className="TransactionModal__tokenRow">
            <div className="TransactionModal__tokenInfo">
              <span className="TransactionModal__tokenAmount">
                {formatTokenAmount(formatEther(inputAmount))} {inputToken.symbol}
              </span>
              <span className="TransactionModal__tokenPrice">${usdAmountIn}</span>
            </div>
            {inputToken.logoUri
              ? (<img src={inputToken.logoUri} alt={inputToken.symbol} className="TransactionModal__tokenLogo" />)
              : <FallbackImg content={inputToken.symbol} />
            }
          </div>
        </div>
        <div className="TransactionModal__arrowDown">↓</div>
        <div className="TransactionModal__swapblock">
          <div className="TransactionModal__tokenRow">
            <div className="TransactionModal__tokenInfo">
              <span className="TransactionModal__tokenAmount">
                {quote?.amountOut ? formatTokenAmount(formatEther(quote.amountOut)) : '0'} {outputToken.symbol}
              </span>
              <span className="TransactionModal__tokenPrice">${usdAmountOut}</span>
            </div>
            {outputToken.logoUri
              ? (<img src={outputToken.logoUri} alt={outputToken.symbol} className="TransactionModal__tokenLogo" />)
              : <FallbackImg content={outputToken.symbol} />
            }
          </div>
        </div>
        <div className="TransactionModal__moreRow">
          <div className="TransactionModal__separator" />
          <button className="TransactionModal__more" onClick={handleToggleDetails}>
            {isDetailsOpen ? 'Hide details' : 'Show more'}
          </button>
          <div className="TransactionModal__separator" />
        </div>
        <div className="TransactionModal__swapinfo">
          <div className="TransactionModal__infoRow">
            <span className="TransactionModal__infoLabel">Pool(s) fees</span>
            <span className="TransactionModal__infoContent">{formatUsdAmount(poolFeesUsd)}</span>
          </div>
          <div className="TransactionModal__infoRow">
            <span className="TransactionModal__infoLabel">Gas fees</span>
            <span className="TransactionModal__infoContent">{formatUsdAmount(gasFeesUsd)}</span>
          </div>
          <div className={`TransactionModal__detailsAnim${isDetailsOpen ? ' TransactionModal__detailsAnim--open' : ''}`}>
            {shouldRenderDetails && (
              <div className="TransactionModal__details">
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">Rate</span>
                  <span className="TransactionModal__infoContent">
                    1 {outputToken.symbol} &#8776; {rateValue} {inputToken.symbol}
                    <span className="TransactionModal__rateUsd">(${usdValueOut.toFixed(2)})</span>
                  </span>
                </div>
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">Max slippage</span>
                  <span className="TransactionModal__infoContent">{swap.slippageTolerance}%</span>
                </div>
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">Min amount</span>
                  <span className="TransactionModal__infoContent">{quote?.amountOut ? formatTokenAmount(formatEther(quote.amountOut)) : '0'} {outputToken.symbol}</span>
                </div>
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">Price impact</span>
                  <span className="TransactionModal__infoContent">{priceImpact}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          className={`TransactionModal__swapBtn TransactionModal__swapBtn--ready`}
          onClick={handleSwap}
          disabled={swap.status !== "ready"}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
};
