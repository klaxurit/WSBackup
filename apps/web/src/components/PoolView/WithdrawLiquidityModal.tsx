import React, { useCallback, useRef, useState, type ChangeEvent } from 'react'
import { Modal } from '../Common/Modal'
import { useDecreasePosition } from '../../hooks/position/useDecreasePosition'
import type { Position, usePositionDatas } from '../../hooks/position/usePositionDatas'
import type { Pool } from '../../pages/PoolPage/page'
import { formatUnits } from 'viem'
import { Nut } from '../SVGs/ProductSVGs'

interface WithdrawLiquidityModalProps {
  isOpen: boolean
  onClose: () => void
  position: Position
  pool: Pool
  onSuccess?: () => void
  posData: ReturnType<typeof usePositionDatas>
}

const PERCENTAGE_OPTIONS = [25, 50, 75, 100]

export const WithdrawLiquidityModal: React.FC<WithdrawLiquidityModalProps> = ({
  isOpen,
  onClose,
  position,
  pool,
  onSuccess,
  posData
}) => {
  const [paramOpen, setParamOpen] = useState(false)
  const paramBoxRef = useRef<HTMLDivElement>(null);
  const [slippageConfig, setSlippageConfig] = useState<{ real: number, display: string, isAuto: boolean }>({
    real: 3.0,
    display: "3",
    isAuto: true,
  })

  const {
    // Form state
    percentage,
    estimatedAmounts,

    // Validation
    validationErrors,
    canSubmit,

    // Status
    status,
    isLoading,
    isSuccess,

    // Actions
    setPercentage,
    setSlippageTolerance,
    decreaseLiquidity,
    reset,

    // Transaction data
    decreaseHash,

    // Capabilities
    canDecrease,

    // Errors
    errors
  } = useDecreasePosition({ position, pool, isModalOpen: isOpen, posData })

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

    if (numVal < 0 || numVal > 100) return

    setSlippageTolerance(numVal)
    setSlippageConfig({ real: numVal, display: val, isAuto: false })
  }, [setSlippageTolerance])

  const handlePercentageSelect = (newPercentage: number) => {
    setPercentage(newPercentage)
  }

  const handlePercentageSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPercentage = parseInt(e.target.value)
    setPercentage(newPercentage)
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

  // Format estimated amounts for display
  const formatEstimatedAmount = (amount: bigint, decimals: number) => {
    if (amount === 0n) return "0"
    const formatted = formatUnits(amount, decimals)
    return parseFloat(formatted).toFixed(6)
  }

  if (!isOpen) return null

  return (
    <Modal open={isOpen} onClose={handleClose} className="PoolView__Modal" overlayClassName="PoolView__ModalOverlay">
      <div className="PoolView__ModalHeader">
        <span className="PoolView__ModalTitle">Withdraw Liquidity</span>
        <button className="PoolView__ModalClose" onClick={handleClose} disabled={isLoading} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <div className="PoolView__ModalContent">
        {/* Success State */}
        {isSuccess && (
          <div className="PoolView__Success">
            <div className="PoolView__SuccessTitle">Liquidity Withdrawn Successfully!</div>
            {decreaseHash && (
              <a
                className="PoolView__SuccessLink"
                href={`https://berascan.com/tx/${decreaseHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer
              </a>
            )}
            <button
              className="PoolView__ActionBtn PoolView__ActionBtn--remove"
              onClick={handleSuccess}
              style={{ marginTop: '16px' }}
            >
              Close
            </button>
          </div>
        )}

        {/* Form */}
        {!isSuccess && (
          <div className="PoolView__Form">
            <div className="Form__head">
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
                      onClick={() => {
                        setSlippageConfig({ real: 3.0, display: "3", isAuto: true })
                        setSlippageTolerance(3.0)
                      }}
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

            {/* Percentage Selection */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: '0 0 16px 0' }}>
                Amount to Withdraw
              </h4>

              {/* Percentage Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {PERCENTAGE_OPTIONS.map((option) => (
                  <button
                    key={option}
                    className={`btn btn__secondary ${percentage === option ? 'active' : ''}`}
                    onClick={() => handlePercentageSelect(option)}
                    disabled={isLoading}
                    style={{
                      padding: '8px 12px',
                      fontSize: '13px',
                      backgroundColor: percentage === option ? '#FFD056' : undefined,
                      color: percentage === option ? '#232323' : undefined
                    }}
                  >
                    {option}%
                  </button>
                ))}
              </div>

              {/* Percentage Slider */}
              <div style={{ marginBottom: '16px' }}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={percentage}
                  onChange={handlePercentageSliderChange}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    marginBottom: '8px'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#888',
                  fontSize: '12px'
                }}>
                  <span>0%</span>
                  <span style={{ color: '#FFD056', fontWeight: '600' }}>{percentage}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Estimated Amounts */}
            {percentage > 0 && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <h4 style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>
                  You will receive (estimated)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>{pool.token0Ref.symbol}:</span>
                    <span style={{ color: '#fff' }}>
                      {formatEstimatedAmount(estimatedAmounts.token0Amount, pool.token0Ref.decimals)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>{pool.token1Ref.symbol}:</span>
                    <span style={{ color: '#fff' }}>
                      {formatEstimatedAmount(estimatedAmounts.token1Amount, pool.token1Ref.decimals)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                {validationErrors.map((error, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 107, 107, 0.1)',
                    border: '1px solid rgba(255, 107, 107, 0.2)',
                    color: '#FF6B6B',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: index < validationErrors.length - 1 ? '8px' : '0'
                  }}>
                    {error.message}
                  </div>
                ))}
              </div>
            )}

            {/* Withdraw Button */}
            <button
              className={`btn btn__main btn--large${!canSubmit ||
                !canDecrease ||
                status === 'decreasing' ||
                status === 'waitingDecrease' ||
                status === 'simulating'
                ? ' btn__disabled'
                : ''
                }`}
              onClick={decreaseLiquidity}
              disabled={
                !canSubmit ||
                !canDecrease ||
                status === 'decreasing' ||
                status === 'waitingDecrease' ||
                status === 'simulating'
              }
            >
              {status === 'simulating' && 'Simulating...'}
              {status === 'decreasing' && 'Withdrawing Liquidity...'}
              {status === 'waitingDecrease' && 'Confirming...'}
              {status === 'idle' && 'Withdraw Liquidity'}
            </button>

            {/* Status Messages */}
            {(status === 'simulating' || status === 'decreasing' || status === 'waitingDecrease') && (
              <div style={{
                background: 'rgba(255, 208, 86, 0.1)',
                border: '1px solid rgba(255, 208, 86, 0.2)',
                color: '#FFD056',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '14px',
                textAlign: 'center',
                marginTop: '16px'
              }}>
                {status === 'simulating' && 'Validating transaction...'}
                {status === 'decreasing' && 'Please confirm the transaction in your wallet'}
                {status === 'waitingDecrease' && 'Transaction submitted. Waiting for confirmation...'}
              </div>
            )}

            {/* Error Messages */}
            {(errors.simulate || errors.decrease) && (
              <div className="PoolView__FormError">
                <p>{errors.simulate?.message || errors.decrease?.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}