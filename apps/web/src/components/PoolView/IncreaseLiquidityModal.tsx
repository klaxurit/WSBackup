import React, { useCallback, useRef, useState, type ChangeEvent } from 'react'
import { Modal } from '../Common/Modal'
import { LiquidityInput } from '../Inputs/LiquidityInput'
import { useIncreasePosition } from '../../hooks/position/useIncreasePosition'
import type { Position } from '../../hooks/position/usePositionDatas'
import type { Pool } from '../../pages/PoolPage/page'
import { transformGraphQLTokenToLegacyToken } from '../../types/api'
import { Nut } from '../SVGs/ProductSVGs'
import { processTransactionError } from '../../utils/errorMapping'

interface IncreaseLiquidityModalProps {
  isOpen: boolean
  onClose: () => void
  position: Position
  pool: Pool
  onSuccess?: () => void
}

export const IncreaseLiquidityModal: React.FC<IncreaseLiquidityModalProps> = ({
  isOpen,
  onClose,
  position,
  pool,
  onSuccess
}) => {
  const [paramOpen, setParamOpen] = useState(false)
  const paramBoxRef = useRef<HTMLDivElement>(null);
  const [slippageConfig, setSlippageConfig] = useState<{ real: number, display: string, isAuto: boolean }>({
    real: 5.0,
    display: "5",
    isAuto: true,
  })

  // Transform tokens to match LiquidityInput interface
  const token0 = pool?.token0Ref ? transformGraphQLTokenToLegacyToken(pool.token0Ref) : null
  const token1 = pool?.token1Ref ? transformGraphQLTokenToLegacyToken(pool.token1Ref) : null

  const {
    // Form state
    parsedToken0Amount,
    parsedToken1Amount,

    // Validation
    validationErrors,
    canSubmit,

    // Approvals
    token0NeedsApproval,
    token1NeedsApproval,
    canApproveToken0,
    canApproveToken1,

    // Status
    status,
    isLoading,
    isSuccess,

    // Actions
    setToken0Amount,
    setToken1Amount,
    setSlippageTolerance,
    approveToken0,
    approveToken1,
    increaseLiquidity,
    reset,

    // Transaction data
    increaseLiquidityHash,

    // Capabilities
    canIncrease,

    // Errors
    errors
  } = useIncreasePosition({ position, pool, isModalOpen: isOpen })

  const handleSlippageChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
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

    setSlippageTolerance(numVal)
    setSlippageConfig({ real, display: val, isAuto: false })
  }, [])

  const handleToken0AmountChange = (amount: bigint) => {
    setToken0Amount(amount.toString())
  }

  const handleToken1AmountChange = (amount: bigint) => {
    setToken1Amount(amount.toString())
  }

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
    reset()
  }

  const handleClose = () => {
    onClose()
    reset()
  }

  if (!isOpen) return null

  return (
    <Modal open={isOpen} onClose={handleClose} className="PoolView__ModalContent" overlayClassName="PoolView__ModalOverlay">
      <div className="PoolView__ModalHeader">
        <div className="PoolView__ModalHeaderLeft">
          <button className="iconLink" onClick={() => setParamOpen(!paramOpen)}>
            {!slippageConfig.isAuto ? `${slippageConfig.display}%` : ""}
            <Nut />
          </button>
          <div ref={paramBoxRef} className={`ParamBox ${paramOpen ? "" : "ParamBox--hide"}`}>
            <div className="ParamBox__param">
              <p>Max slippage</p>
              <div className="ParamBox__slippageInput">
                <button
                  className={slippageConfig.isAuto ? "active" : ""}
                  onClick={() => setSlippageConfig({ real: 5.0, display: "5", isAuto: true })}
                >
                  Auto
                </button>
                <input
                  type="text"
                  value={slippageConfig.display}
                  onChange={handleSlippageChange}
                />
                <p>%</p>
              </div>
            </div>
          </div>
        </div>
        <span className="PoolView__ModalTitle">Increase Liquidity</span>
        <button className="PoolView__ModalClose" onClick={handleClose} disabled={isLoading} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* Form */}
      <div className="PoolView__Form">

        {/* Token Inputs using LiquidityInput */}
        <LiquidityInput
          selectedToken={token0}
          onAmountChange={handleToken0AmountChange}
          value={parsedToken0Amount}
          isOverBalance={validationErrors.some(e => e.field === 'token0')}
          disabled={isLoading}
        />
        <LiquidityInput
          selectedToken={token1}
          onAmountChange={handleToken1AmountChange}
          value={parsedToken1Amount}
          isOverBalance={validationErrors.some(e => e.field === 'token1')}
          disabled={isLoading}
        />

        {/* Slippage Settings */}
        {/* <div style={{ marginTop: '16px', marginBottom: '16px' }}>
              <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>
                Slippage Tolerance
              </h4>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {SLIPPAGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={`btn btn__secondary ${slippageTolerance === option && !showCustomSlippage ? 'active' : ''
                      }`}
                    onClick={() => handleSlippageSelect(option)}
                    disabled={isLoading}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      backgroundColor: slippageTolerance === option && !showCustomSlippage ? '#FFD056' : undefined,
                      color: slippageTolerance === option && !showCustomSlippage ? '#232323' : undefined
                    }}
                  >
                    {option}%
                  </button>
                ))}
                <button
                  className={`btn btn__secondary ${showCustomSlippage ? 'active' : ''}`}
                  onClick={() => setShowCustomSlippage(true)}
                  disabled={isLoading}
                  style={{
                    padding: '8px 12px',
                    fontSize: '13px',
                    backgroundColor: showCustomSlippage ? '#FFD056' : undefined,
                    color: showCustomSlippage ? '#232323' : undefined
                  }}
                >
                  Custom
                </button>
              </div>
              {showCustomSlippage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="number"
                    placeholder="1.0"
                    value={customSlippage}
                    onChange={(e) => handleCustomSlippageChange(e.target.value)}
                    min="0"
                    max="50"
                    step="0.1"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      width: '80px'
                    }}
                  />
                  <span style={{ color: '#888', fontSize: '13px' }}>%</span>
                </div>
              )}
            </div> */}

        {/* Validation Errors */}
        {/* {validationErrors.length > 0 && (
          <div className="PoolView__ValidationErrors">
            {validationErrors.map((error, index) => (
              <div key={index} className="PoolView__ValidationError">
                {error.message}
              </div>
            ))}
          </div>
        )} */}

        {/* Action Buttons */}

        {/* Token 0 Approval */}
        {token0NeedsApproval && canApproveToken0 && (
          <button
            className="PoolView__ApprovalButton"
            onClick={approveToken0}
            disabled={status === 'approving' || status === 'waitingApproval'}
          >
            {status === 'approving' || status === 'waitingApproval'
              ? `Approving ${pool.token0Ref.symbol}...`
              : `Approve ${pool.token0Ref.symbol}`
            }
          </button>
        )}

        {/* Token 1 Approval */}
        {token1NeedsApproval && canApproveToken1 && (
          <button
            className="PoolView__ApprovalButton"
            onClick={approveToken1}
            disabled={status === 'approving' || status === 'waitingApproval'}
          >
            {status === 'approving' || status === 'waitingApproval'
              ? `Approving ${pool.token1Ref.symbol}...`
              : `Approve ${pool.token1Ref.symbol}`
            }
          </button>
        )}

        {/* Increase Liquidity Button */}
        <button
          className={`PoolView__MainButton btn btn--large btn__main ${(!canSubmit ||
            !canIncrease ||
            token0NeedsApproval ||
            token1NeedsApproval ||
            status === 'increasing' ||
            status === 'waitingIncrease' ||
            status === 'simulating') && !isSuccess
            ? ' btn__disabled'
            : ''
            } ${isSuccess ? ' PoolView__MainButton--success' : ''}`}
          onClick={isSuccess ? handleSuccess : increaseLiquidity}
          disabled={
            (!canSubmit ||
              !canIncrease ||
              token0NeedsApproval ||
              token1NeedsApproval ||
              status === 'increasing' ||
              status === 'waitingIncrease' ||
              status === 'simulating') && !isSuccess
          }
        >
          {isSuccess && <div className="increase-bear" />}
          {status === 'simulating' && 'Simulating...'}
          {status === 'increasing' && 'Adding Liquidity...'}
          {status === 'waitingIncrease' && 'Confirming...'}
          {(status === 'idle' || status === 'approving' || status === 'waitingApproval') && 'Add Liquidity'}
          {isSuccess && 'Liquidity Added Successfully'}
        </button>

        {/* View on Explorer Button - Only show on success */}
        {isSuccess && increaseLiquidityHash && (
          <a
            className="PoolView__SuccessLink btn btn--small btn__shade"
            href={`https://berascan.com/tx/${increaseLiquidityHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>
        )}

        {/* Status Messages */}
        {/* {(status === 'simulating' || status === 'increasing' || status === 'waitingIncrease') && (
            <div className="PoolView__StatusMessage">
              {status === 'simulating' && 'Validating transaction...'}
              {status === 'increasing' && 'Please confirm the transaction in your wallet'}
              {status === 'waitingIncrease' && 'Transaction submitted. Waiting for confirmation...'}
            </div>
          )} */}

        {/* Error Messages */}
        {(errors.simulate || errors.increase || errors.approveToken0 || errors.approveToken1) && (() => {
          const currentError = errors.increase || errors.simulate || errors.approveToken0 || errors.approveToken1;

          if (!currentError) return null;

          const errorInfo = processTransactionError(currentError, {
            onRetry: () => {
              if (canIncrease) {
                increaseLiquidity();
              }
            },
            onClose: handleClose,
            onApprove: () => {
              if (token0NeedsApproval && canApproveToken0) {
                approveToken0();
              } else if (token1NeedsApproval && canApproveToken1) {
                approveToken1();
              }
            }
          });

          return (
            <div className="PoolView__FormError">
              <h4 style={{ color: '#FF6B6B', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                {errorInfo.title}
              </h4>
              <p style={{ marginBottom: '12px', fontSize: '13px', lineHeight: '1.5' }}>
                {errorInfo.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {errorInfo.actions.map((action, index) => (
                  <button
                    key={index}
                    className={`btn btn--small ${action.type === 'primary' ? 'btn__main' : 'btn__shade'}`}
                    onClick={action.action}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </Modal>
  )
}