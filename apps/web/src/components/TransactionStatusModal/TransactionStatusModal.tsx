import React, { useState } from 'react';
import '../../styles/transactionStatusModal.scss';

export type TransactionStep = {
  label: string;
  description?: string;
  icon: React.ReactNode;
  helpLink?: string;
  status: 'pending' | 'success' | 'error' | 'idle';
};

interface TokenInfo {
  symbol: string;
  name: string;
  logoURI: string;
}

interface TransactionStatusModalProps {
  open: boolean;
  onClose: () => void;
  steps: TransactionStep[];
  inputToken: TokenInfo;
  outputToken: TokenInfo;
  inputAmount: string;
  outputAmount: string;
  currentStep: number;
}

export const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
  open,
  onClose,
  steps,
  inputToken,
  outputToken,
  inputAmount,
  outputAmount,
  currentStep,
}) => {
  if (!open) return null;

  // Dummy values for demo, to be replaced by backend/API later
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
  const [buttonState, setButtonState] = useState<'ready' | 'loading' | 'success' | 'error'>('ready');

  React.useEffect(() => {
    if (isDetailsOpen) {
      setShouldRenderDetails(true);
    } else if (shouldRenderDetails) {
      const timeout = setTimeout(() => setShouldRenderDetails(false), 350);
      return () => clearTimeout(timeout);
    }
  }, [isDetailsOpen, shouldRenderDetails]);

  const handleToggleDetails = () => setIsDetailsOpen((v) => !v);
  const handleSwap = () => {
    setButtonState('loading');
    setTimeout(() => setButtonState('success'), 1800);
  };

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
              <span className="TransactionModal__tokenAmount">{inputAmount} {inputToken.symbol}</span>
              <span className="TransactionModal__tokenPrice">$9.23</span> {/* TODO: rendre dynamique */}
            </div>
            <img src={inputToken.logoURI} alt={inputToken.symbol} className="TransactionModal__tokenLogo" />
          </div>
        </div>
        <div className="TransactionModal__arrowDown">↓</div>
        <div className="TransactionModal__swapblock">
          <div className="TransactionModal__tokenRow">
            <div className="TransactionModal__tokenInfo">
              <span className="TransactionModal__tokenAmount">{outputAmount} {outputToken.symbol}</span>
              <span className="TransactionModal__tokenPrice">$9.12</span> {/* TODO: rendre dynamique */}
            </div>
            <img src={outputToken.logoURI} alt={outputToken.symbol} className="TransactionModal__tokenLogo" />
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
            <span className="TransactionModal__infoContent">{swapInfo.feeValue}</span>
          </div>
          <div className="TransactionModal__infoRow">
            <span className="TransactionModal__infoLabel">{swapInfo.networkLabel}</span>
            <span className="TransactionModal__infoContent">{swapInfo.networkValue}</span>
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
                  <span className="TransactionModal__infoContent">{swapInfo.priceImpactValue}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          className={`TransactionModal__swapBtn TransactionModal__swapBtn--${buttonState}`}
          onClick={handleSwap}
          disabled={buttonState !== 'ready'}
        >
          {buttonState === 'loading' ? 'Swapping...' : buttonState === 'success' ? 'Success!' : 'Swap'}
        </button>
      </div>
    </div>
  );
};
