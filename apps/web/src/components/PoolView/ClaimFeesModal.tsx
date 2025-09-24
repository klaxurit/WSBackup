import React from 'react'
import { Modal } from '../Common/Modal'
import { useClaimFees } from '../../hooks/position/useClaimFees'
import type { Position, usePositionDatas } from '../../hooks/position/usePositionDatas'
import type { Pool } from '../../pages/PoolPage/page'
import { FallbackImg } from '../utils/FallbackImg'

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
    <Modal open={isOpen} onClose={handleClose} className="PoolView__Modal" overlayClassName="PoolView__ModalOverlay">
      <div className="PoolView__ModalHeader">
        <span className="PoolView__ModalTitle">Claim Fees</span>
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
            <div className="PoolView__ConfirmationMessage">
              You are about to claim the following unclaimed fees:
            </div>

            {/* Fees Summary */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '20px',
              margin: '20px 0'
            }}>
              {/* Token 0 Fees */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {token0?.logoUri ? (
                    <img
                      src={token0.logoUri}
                      alt={token0.symbol}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FallbackImg content={token0?.symbol || 'T0'} />
                    </div>
                  )}
                  <span style={{ color: '#fff', fontWeight: '500' }}>
                    {token0?.symbol || 'Token 0'}
                  </span>
                </div>
                <div style={{ color: '#FFD056', fontWeight: '600', fontSize: '16px' }}>
                  {unclaimedFees?.token0Amount || '0'}
                </div>
              </div>

              {/* Token 1 Fees */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {token1?.logoUri ? (
                    <img
                      src={token1.logoUri}
                      alt={token1.symbol}
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#333',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FallbackImg content={token1?.symbol || 'T1'} />
                    </div>
                  )}
                  <span style={{ color: '#fff', fontWeight: '500' }}>
                    {token1?.symbol || 'Token 1'}
                  </span>
                </div>
                <div style={{ color: '#FFD056', fontWeight: '600', fontSize: '16px' }}>
                  {unclaimedFees?.token1Amount || '0'}
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                {validationErrors.map((error, index) => (
                  <div key={index} style={{ color: '#ff6b6b', fontSize: '14px' }}>
                    {error.message}
                  </div>
                ))}
              </div>
            )}

            {/* Transaction Error */}
            {(errors.claim || errors.receipt || errors.simulation) && (
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ color: '#ff6b6b', fontSize: '14px' }}>
                  {errors.claim?.message ||
                    errors.receipt?.message ||
                    errors.simulation?.message ||
                    'Transaction failed'}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px'
            }}>
              <button
                className="btn btn__secondary"
                onClick={handleClose}
                disabled={isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#fff'
                }}
              >
                Cancel
              </button>
              <button
                className={`btn btn__main ${!canSubmit || isLoading ? 'btn__disabled' : ''}`}
                onClick={handleConfirm}
                disabled={!canSubmit || isLoading}
                style={{
                  padding: '12px 24px',
                  backgroundColor: canSubmit && !isLoading ? '#FFD056' : '#666',
                  color: canSubmit && !isLoading ? '#232323' : '#999',
                  minWidth: '120px'
                }}
              >
                {status === 'pending' ? 'Claiming...' : 'Confirm Claim'}
              </button>
            </div>

            {/* Information Note */}
            <div style={{
              fontSize: '12px',
              color: '#888',
              textAlign: 'center',
              marginTop: '16px',
              padding: '8px',
              background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '6px'
            }}>
              💡 Claiming fees will collect all available fees to your wallet
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}