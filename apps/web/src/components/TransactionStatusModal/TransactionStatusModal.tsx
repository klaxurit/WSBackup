import React, { useState, useMemo } from 'react';
import type { useSwap } from '../../hooks/useSwap';
import { formatEther } from 'viem';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { FallbackImg } from '../utils/FallbackImg';

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

  const { quote } = swap

  React.useEffect(() => {
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

    return swap.status
  }, [swap.status, swap.needsApproval])

  const totalFees = useMemo(() => {
    if (!swap.selectedRoute) return 0

    return swap.selectedRoute.pools.reduce((t, pool) => (t + pool.fee), 0)
  }, [swap.selectedRoute])
  const rateValue = useMemo(() => {
    if (!swap?.quote) return "0"

    return parseFloat(formatEther((inputAmount * (10n ** BigInt(18))) / swap.quote.amountOut)).toFixed(2)
  }, [swap.quote, inputAmount])

  const handleToggleDetails = () => setIsDetailsOpen((v) => !v);
  const handleSwap = async () => {
    await swap.swap()
  };

  if (!open || !inputToken || !outputToken) return <></>

  console.log(swap)

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
              <span className="TransactionModal__tokenAmount">{formatEther(inputAmount)} {inputToken.symbol}</span>
              <span className="TransactionModal__tokenPrice">$9.23</span> {/* TODO: rendre dynamique */}
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
              <span className="TransactionModal__tokenAmount">{quote?.amountOutFormatted} {outputToken.symbol}</span>
              <span className="TransactionModal__tokenPrice">$9.12</span> {/* TODO: rendre dynamique */}
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
            <span className="TransactionModal__infoContent">{totalFees} wei</span>
          </div>
          <div className="TransactionModal__infoRow">
            <span className="TransactionModal__infoLabel">Gas fees</span>
            <span className="TransactionModal__infoContent">{quote?.gasEstimate} wei</span>
          </div>
          <div className={`TransactionModal__detailsAnim${isDetailsOpen ? ' TransactionModal__detailsAnim--open' : ''}`}>
            {shouldRenderDetails && (
              <div className="TransactionModal__details">
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">Rate</span>
                  <span className="TransactionModal__infoContent">
                    1 {outputToken.symbol} &#8776; {rateValue} {inputToken.symbol}
                    <span className="TransactionModal__rateUsd">(0$)</span>
                  </span>
                </div>
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">Max slippage</span>
                  <span className="TransactionModal__infoContent">{swap.slippageTolerance}%</span>
                </div>
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">Min amount</span>
                  <span className="TransactionModal__infoContent">{quote?.amountOutFormatted}{" "}{outputToken.symbol}</span>
                </div>
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">Price impact</span>
                  <span className="TransactionModal__infoContent">{quote?.priceImpact}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          className={`TransactionModal__swapBtn TransactionModal__swapBtn--ready`}
          onClick={handleSwap}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
};
