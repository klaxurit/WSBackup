import React from 'react'
import { Modal } from '../Common/Modal'
import { useClaimFees } from '../../hooks/position/useClaimFees'
import type { Position, usePositionDatas } from '../../hooks/position/usePositionDatas'
import type { Pool } from '../../pages/PoolPage/page'
import { TokenLogo } from '../Common/TokenLogo'
import { processTransactionError } from '../../utils/errorMapping'

interface ClaimFeesModalProps {
  isOpen: boolean
  onClose: () => void
  position: Position
  pool: Pool
  onSuccess?: () => void
  posData: ReturnType<typeof usePositionDatas>
}

export const ClaimFeesModal: React.FC<ClaimFeesModalProps> = ({
  isOpen,
  onClose,
  position,
  pool,
  onSuccess,
  posData
}) => {
  const {
    // Validation
    validationErrors,
    canSubmit,

    // Status
    status,
    isLoading,
    isSuccess,

    // Actions
    claimFees,
    reset,

    // Transaction data
    claimHash,

    // Fees data
    unclaimedFees,

    // Errors
    errors
  } = useClaimFees({ position, posData, isModalOpen: isOpen })

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
    reset()
  }

  const handleClose = () => {
    onClose()
    reset()
  }

  const handleConfirm = () => {
    claimFees()
  }

  // Get token data
  const token0 = pool?.token0Ref || (pool as any)?.token0
  const token1 = pool?.token1Ref || (pool as any)?.token1

  if (!isOpen) return null

  return (
    <Modal open={isOpen} onClose={handleClose} className="PoolView__ModalContent" overlayClassName="PoolView__ModalOverlay">
      <div className="PoolView__ModalHeader">
        <span className="PoolView__ModalTitle">Claim Fees</span>
        <button className="PoolView__ModalClose" onClick={handleClose} disabled={isLoading} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6L14 14M14 6L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {/* Success State */}
      {isSuccess && (
        <div className="PoolView__Success">
          <div className="PoolView__SuccessIcon">✅</div>
          <div className="PoolView__SuccessTitle">Fees Claimed Successfully!</div>
          <div className="PoolView__SuccessMessage">
            Your fees have been collected and sent to your wallet.
          </div>
          {claimHash && (
            <a
              className="PoolView__SuccessLink"
              href={`https://berascan.com/tx/${claimHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View on Explorer
            </a>
          )}
          <button
            className="PoolView__ActionBtn PoolView__ActionBtn--claim"
            onClick={handleSuccess}
            style={{ marginTop: '16px' }}
          >
            Close
          </button>
        </div>
      )}

      {/* Confirmation Form */}
      {!isSuccess && (
        <div className="PoolView__Form">
          <div className="PoolView__InfoNote">
            You are about to claim the following unclaimed fees:
          </div>

          {/* Fees Summary */}
          <div className="PoolView__InfoSection">
            {/* Token 0 Fees */}
            <div className="PoolView__InfoRow" style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TokenLogo logoUri={token0?.logoUri} symbol={token0?.symbol || 'T0'} size="medium" />
                <span className="PoolView__InfoLabel">
                  {token0?.symbol || 'Token 0'}
                </span>
              </div>
              <div className="PoolView__InfoValue" style={{ color: '#FFD056', fontWeight: '600', fontSize: '16px' }}>
                {unclaimedFees?.token0Amount || '0'}
              </div>
            </div>

            {/* Token 1 Fees */}
            <div className="PoolView__InfoRow" style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TokenLogo logoUri={token1?.logoUri} symbol={token1?.symbol || 'T1'} size="medium" />
                <span className="PoolView__InfoLabel">
                  {token1?.symbol || 'Token 1'}
                </span>
              </div>
              <div className="PoolView__InfoValue" style={{ color: '#FFD056', fontWeight: '600', fontSize: '16px' }}>
                {unclaimedFees?.token1Amount || '0'}
              </div>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="PoolView__ValidationErrors">
              {validationErrors.map((error, index) => (
                <div key={index} className="PoolView__ValidationError">
                  {error.message}
                </div>
              ))}
            </div>
          )}

          {/* Transaction Error */}
          {(errors.claim || errors.receipt || errors.simulation) && (() => {
            const currentError = errors.claim || errors.receipt || errors.simulation;

            if (!currentError) return null;

            const errorInfo = processTransactionError(currentError, {
              onRetry: () => {
                if (canSubmit) {
                  claimFees();
                }
              },
              onClose: handleClose
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

          {/* Action Buttons */}
          <button
            className={`PoolView__ActionBtn PoolView__ActionBtn ${!canSubmit || isLoading ? 'btn btn--large btn__disabled' : 'btn btn--large btn__main'}`}
            onClick={handleConfirm}
            disabled={!canSubmit || isLoading}
          >
            {status === 'pending' ? 'Claiming...' : 'Confirm Claim'}
          </button>

          {/* Information Note */}
          <div className="PoolView__InfoNote">
            💡 Claiming fees will collect all available fees to your wallet
          </div>
        </div>
      )}
    </Modal>
  )
}