import React, { useCallback, useRef, useState, type ChangeEvent } from 'react'
import { Modal } from '../Common/Modal'
import { useDecreasePosition } from '../../hooks/position/useDecreasePosition'
import type { Position } from '../../hooks/position/usePositionDatas'
import type { Pool } from '../../pages/PoolPage/page'
import { formatUnits } from 'viem'
import { Nut } from '../SVGs/ProductSVGs'

interface WithdrawLiquidityModalProps {
  isOpen: boolean
  onClose: () => void
  position: Position
  pool: Pool
  onSuccess?: () => void
}

const PERCENTAGE_OPTIONS = [25, 50, 75, 100]

export const WithdrawLiquidityModal: React.FC<WithdrawLiquidityModalProps> = ({
  isOpen,
  onClose,
  position,
  pool,
  onSuccess
}) => {
  const [paramOpen, setParamOpen] = useState(false)
  const paramBoxRef = useRef<HTMLDivElement>(null);
  const [slippageConfig, setSlippageConfig] = useState<{ real: number, display: string, isAuto: boolean }>({
    real: 3.0,
    display: "3",
    isAuto: true,
  })
  const [percentageInputValue, setPercentageInputValue] = useState<string>('')

  const {
    percentage,
    estimatedAmounts,
    canSubmit,
    status,
    isLoading,
    isSuccess,
    setPercentage,
    setSlippageTolerance,
    decreaseLiquidity,
    reset,
    decreaseHash,
    canDecrease,
    errors
  } = useDecreasePosition({ position, pool, isModalOpen: isOpen })

  React.useEffect(() => {
    if (!isOpen) {
      setPercentageInputValue('')
    }
  }, [isOpen])

  React.useEffect(() => {
    if (percentage === 0) {
      setPercentageInputValue('')
    }
  }, [percentage])

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
    setPercentageInputValue(newPercentage.toString())
  }

  const handlePercentageSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPercentage = parseInt(e.target.value)
    setPercentage(newPercentage)
    setPercentageInputValue(newPercentage === 0 ? '' : newPercentage.toString())
  }

  const handlePercentageInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    if (val === '' || /^\d{0,3}$/.test(val)) {
      setPercentageInputValue(val)

      if (val === '') {
        setPercentage(0)
      } else {
        const numVal = parseInt(val)
        if (numVal >= 0 && numVal <= 100) {
          setPercentage(numVal)
        }
      }
    }
  }

  const handlePercentageInputBlur = () => {
    setPercentageInputValue(percentage === 0 ? '' : percentage.toString())
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
        <span className="PoolView__ModalTitle">Withdraw Liquidity</span>
        <button className="PoolView__ModalClose" onClick={handleClose} disabled={isLoading} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* Form */}
      <div className="PoolView__Form">

        {/* Percentage Selection */}
        <div className="PoolView__InfoSection">
          <h4 className="PoolView__InfoTitle">
            Amount to Withdraw
          </h4>

          {/* Percentage Direct Input with LiquidityInput-like design */}
          <div className="LiquidityInput">
            <div className="Inputs">
              <div className="LiquidityInput__InputWrapper">
                <div className="Inputs__From From From--idle">
                  <div className="From__AmountsAndChain">
                    <div className="From__Amounts" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        className="From__Input"
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={percentageInputValue}
                        onChange={handlePercentageInputChange}
                        onBlur={handlePercentageInputBlur}
                        readOnly={isLoading}
                        style={{ textAlign: 'left' }}
                      />
                    </div>
                    <div className="From__LogosAndBalance">
                      <div className="From__Logos">
                        <button className="networkSelector" disabled style={{ cursor: 'default' }}>
                          <span className="networkSelector__symbol">%</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="From__Details">
                    <p className="From__Convertion" style={{ opacity: 0.6 }}>
                      {percentage > 0 ? `${percentage}% of your position` : 'Enter percentage to withdraw'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Percentage Buttons */}
          <div className="PoolView__PercentageButtons">
            {PERCENTAGE_OPTIONS.map((option) => (
              <button
                key={option}
                className={`PoolView__PercentageButton ${percentage === option ? 'active' : ''}`}
                onClick={() => handlePercentageSelect(option)}
                disabled={isLoading}
              >
                {option}%
              </button>
            ))}
          </div>

          {/* Percentage Slider */}
          <div className="PoolView__Slider">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={percentage}
              onChange={handlePercentageSliderChange}
              disabled={isLoading}
            />
            <div className="PoolView__SliderLabels">
              <span>0%</span>
              <span className="PoolView__SliderValue">{percentage}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Estimated Amounts */}
        {percentage > 0 && (
          <div className="PoolView__InfoSection">
            <h4 className="PoolView__InfoTitle">
              You will receive (estimated)
            </h4>
            <div className="PoolView__InfoRow">
              <span className="PoolView__InfoLabel">{pool.token0Ref.symbol}:</span>
              <span className="PoolView__InfoValue">
                {formatEstimatedAmount(estimatedAmounts.token0Amount, pool.token0Ref.decimals)}
              </span>
            </div>
            <div className="PoolView__InfoRow">
              <span className="PoolView__InfoLabel">{pool.token1Ref.symbol}:</span>
              <span className="PoolView__InfoValue">
                {formatEstimatedAmount(estimatedAmounts.token1Amount, pool.token1Ref.decimals)}
              </span>
            </div>
          </div>
        )}

        {/* Withdraw Button */}
        <button
          className={`PoolView__MainButton btn btn--large btn__main ${(!canSubmit ||
            !canDecrease ||
            status === 'decreasing' ||
            status === 'waitingDecrease' ||
            status === 'simulating') && !isSuccess
            ? ' btn__disabled'
            : ''
            } ${isSuccess ? ' PoolView__MainButton--success' : ''}`}
          onClick={isSuccess ? handleSuccess : decreaseLiquidity}
          disabled={
            (!canSubmit ||
              !canDecrease ||
              status === 'decreasing' ||
              status === 'waitingDecrease' ||
              status === 'simulating') && !isSuccess
          }
        >
          {isSuccess && <div className="withdraw-bear" />}
          {status === 'simulating' && 'Simulating...'}
          {status === 'decreasing' && 'Withdrawing Liquidity...'}
          {status === 'waitingDecrease' && 'Confirming...'}
          {status === 'idle' && 'Withdraw Liquidity'}
          {isSuccess && 'Liquidity Withdrawn Successfully'}
        </button>

        {isSuccess && decreaseHash && (
          <a
            className="PoolView__SuccessLink btn btn--small btn__shade"
            href={`https://berascan.com/tx/${decreaseHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Explorer
          </a>
        )}

        {/* Error Messages */}
        {(errors.simulate || errors.decrease) && (
          <div className="PoolView__FormError">
            <p>{errors.simulate?.message || errors.decrease?.message}</p>
          </div>
        )}
      </div>
    </Modal>
  )
}