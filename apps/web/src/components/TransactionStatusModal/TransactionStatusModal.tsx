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

  const swapInfo = {
    feeLabel: 'Fee (0.25%)',
    feeValue: '$0.64',
    networkLabel: 'Network cost',
    networkValue: '$1.61',
    rateLabel: 'Rate',
    rateValue: '1 ETH = 2546.49 USDC',
    rateValueUSD: '($2,546.49)',
    slippageLabel: 'Max slippage',
    slippageValue: 'Auto\n0.75%',
    routingLabel: 'Order routing',
    routingValue: 'Uniswap API',
    priceImpactLabel: 'Price impact',
    priceImpactValue: '-0.05%',
  };

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

  if (!open) return null;

  const handleToggleDetails = () => setIsDetailsOpen((v) => !v);
  const handleSwap = async () => {
    // setButtonState('loading');
    await swap.swap()
  };

  if (!inputToken || !outputToken) return <></>


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
            <span className="TransactionModal__infoLabel">{swapInfo.feeLabel}</span>
            <span className="TransactionModal__infoContent">{quote?.gasEstimate}</span>
          </div>
          <div className="TransactionModal__infoRow">
            <span className="TransactionModal__infoLabel">{swapInfo.networkLabel}</span>
            <span className="TransactionModal__infoContent">{quote?.gasEstimate}wei</span>
          </div>
          <div className={`TransactionModal__detailsAnim${isDetailsOpen ? ' TransactionModal__detailsAnim--open' : ''}`}>
            {shouldRenderDetails && (
              <div className="TransactionModal__details">
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">{swapInfo.rateLabel}</span>
                  <span className="TransactionModal__infoContent">{swapInfo.rateValue} <span className="TransactionModal__rateUsd">{swapInfo.rateValueUSD}</span></span>
                </div>
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">{swapInfo.slippageLabel}</span>
                  <span className="TransactionModal__infoContent">{swapInfo.slippageValue}</span>
                </div>
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">{swapInfo.routingLabel}</span>
                  <span className="TransactionModal__infoContent">{swapInfo.routingValue}</span>
                </div>
                <div className="TransactionModal__infoRow">
                  <span className="TransactionModal__infoLabel">{swapInfo.priceImpactLabel}</span>
                  <span className="TransactionModal__infoContent">{quote?.priceImpact ? 100 - quote.priceImpact : "0"}</span>
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
