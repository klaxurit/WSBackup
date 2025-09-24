import React, { useState, useMemo, useEffect } from 'react';
import type { UseSwapReturn } from '../../hooks/swap/useSwap';
import { formatEther, formatUnits } from 'viem';
import type { BerachainToken } from '../../hooks/useBerachainTokenList';
import { FallbackImg } from '../utils/FallbackImg';
import { usePrice } from '../../hooks/usePrice';
import { formatTokenAmount, formatUsdAmount } from '../../utils/format';
import { getUsdAmount, getPoolFeesInBera } from '../../utils/transaction';
import { Modal } from '../Common/Modal';
import { Loader } from '../Loader/Loader';
import { processSwapError, type ErrorAction } from '../../utils/errorMapping';

interface TransactionStatusModalProps {
  open: boolean;
  onClose: () => void;
  inputToken: BerachainToken | null;
  outputToken: BerachainToken | null;
  inputAmount: bigint;
  outputAmount: bigint;
  swap: UseSwapReturn;
  onRefreshInputs: () => void;
  onAdjustSettings?: () => void;
}

export const TransactionStatusModal: React.FC<TransactionStatusModalProps> = ({
  open,
  onClose,
  inputToken,
  outputToken,
  inputAmount,
  swap,
  onRefreshInputs,
  onAdjustSettings
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [shouldRenderDetails, setShouldRenderDetails] = useState(false);
  const { data: usdValueIn = 0 } = usePrice(inputToken)
  const { data: usdValueOut = 0 } = usePrice(outputToken)
  const { quote } = swap

  const usdAmountIn = useMemo(() => {
    if (inputAmount === 0n) return 0
    return (usdValueIn * +formatUnits(inputAmount, inputToken?.decimals || 18)).toFixed(2)
  }, [usdValueIn, inputAmount])
  const usdAmountOut = useMemo(() => {
    if (!quote || quote?.amountOut === 0n) return 0
    return (usdValueOut * +formatUnits(quote.amountOut, outputToken?.decimals || 18)).toFixed(2)
  }, [usdValueOut, quote])

  const poolFeesInBera = useMemo(() => getPoolFeesInBera(swap.optimizedRoute), [swap.optimizedRoute]);
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
    if (["approving"].includes(swap.status)) return null
    if (swap.status === "idle") return "Loading routes..."
    return swap.status.replace(/^./, swap.status[0].toUpperCase())
  }, [swap.status, swap.needsApproval])

  const rateValue = useMemo(() => {
    if (!swap?.quote) return "0"
    const inputDecimals = inputToken?.decimals || 18;
    const outputDecimals = outputToken?.decimals || 18;
    return parseFloat(formatUnits((inputAmount * (10n ** BigInt(outputDecimals))) / swap.quote.amountOut, inputDecimals)).toFixed(2)
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

  const isSuccess = swap.status === "success";
  const isError = swap.status === "error";
  const isLoadingStep = [
    "idle", "loading-routes", "quoting", "approving", "confirming", "swapping"
  ].includes(swap.status);

  useEffect(() => {
    if (open) {
      setIsDetailsOpen(false);
      setShouldRenderDetails(false);
    }
  }, [open]);

  const handleCloseAndRefresh = () => {
    onClose();
    swap.reset();
    if (onRefreshInputs) {
      setTimeout(() => {
        onRefreshInputs();
      }, 100);
    }
  };

  const handleModalClose = isSuccess ? handleCloseAndRefresh : onClose;

  // Process error for user-friendly display
  const errorInfo = useMemo(() => {
    if (!isError || !swap.error) return null;

    return processSwapError(swap.error, {
      onRetry: () => {
        swap.refresh();
      },
      onAdjustSettings: () => {
        onAdjustSettings?.();
        onClose();
      },
      onCheckWallet: () => {
        // Open wallet or close modal
        onClose();
      },
      onClose,
      onApprove: () => {
        if (swap.needsApproval) {
          swap.approve();
        }
      }
    });
  }, [isError, swap.error, swap.refresh, swap.needsApproval, swap.approve, onAdjustSettings, onClose]);

  // Helper function to render action button
  const renderActionButton = (action: ErrorAction, index: number) => (
    <button
      key={index}
      className={`TransactionModal__swapBtn ${action.type === 'primary'
        ? 'TransactionModal__swapBtn--primary'
        : 'TransactionModal__swapBtn--secondary'
        }`}
      onClick={action.action}
      style={{ marginTop: index === 0 ? 16 : 8 }}
    >
      {action.label}
    </button>
  );

  return (
    <Modal open={open} onClose={handleModalClose} className="TransactionModal__box" overlayClassName="TransactionModal__overlay">
      {isError ? (
        <div className="TransactionModal__error">
          <div className="TransactionModal__head" style={{ marginBottom: 16 }}>
            <span className="TransactionModal__title">{errorInfo?.title || 'Transaction Failed'}</span>
            <button className="TransactionModal__close" onClick={onClose} aria-label="Close">
              &#10005;
            </button>
          </div>
          <div className="TransactionModal__errorMessage" style={{ marginBottom: 16 }}>
            <p>{errorInfo?.description || 'An unexpected error occurred. Please try again.'}</p>
          </div>
          {/* Error details (for debugging) */}
          {swap.error?.code && (
            <div className="TransactionModal__errorDetails" style={{ marginBottom: 16, fontSize: '12px', color: '#666' }}>
              Error Code: {swap.error.code}
            </div>
          )}
          {/* Action buttons */}
          <div className="TransactionModal__errorActions">
            {errorInfo?.actions.map((action, index) => renderActionButton(action, index)) || (
              <button
                className="TransactionModal__swapBtn TransactionModal__swapBtn--error"
                onClick={onClose}
                style={{ marginTop: 16 }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      ) : (!inputToken || !outputToken) ? null : (
        <>
          <div className="TransactionModal__head">
            <span className="TransactionModal__title">You're swapping</span>
            <button className="TransactionModal__close" onClick={isSuccess ? handleCloseAndRefresh : onClose} aria-label="Close">
              &#10005;
            </button>
          </div>
          <div className="TransactionModal__swapblock">
            <div className="TransactionModal__tokenRow">
              <div className="TransactionModal__tokenInfo">
                <span className="TransactionModal__tokenAmount">
                  {formatTokenAmount(formatUnits(inputAmount, inputToken?.decimals || 18))} {inputToken.symbol}
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
                  {quote?.amountOut ? formatTokenAmount(formatUnits(quote.amountOut, outputToken?.decimals || 18)) : '0'} {outputToken.symbol}
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
                    <span className="TransactionModal__infoContent">{quote?.amountOut ? formatTokenAmount(formatUnits(quote.amountOut, outputToken?.decimals || 18)) : '0'} {outputToken.symbol}</span>
                  </div>
                  <div className="TransactionModal__infoRow">
                    <span className="TransactionModal__infoLabel">Price impact</span>
                    <span className="TransactionModal__infoContent">{priceImpact}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {!isError && (
            <button
              className={`TransactionModal__swapBtn TransactionModal__swapBtn--ready${isLoadingStep ? ' btn__disabled' : ''}${isSuccess ? ' TransactionModal__swapBtn--success' : ''}`}
              onClick={handleSwap}
              disabled={isLoadingStep || isSuccess || !['ready'].includes(swap.status)}
            >
              {isSuccess && <div className="psychedelic-bear" />}
              {isLoadingStep ? <Loader size="small" color="#191816" /> : isSuccess ? 'Success' : btnText}
            </button>
          )}
        </>
      )}
    </Modal>
  );
};