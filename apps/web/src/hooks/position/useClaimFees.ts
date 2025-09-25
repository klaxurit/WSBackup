import { useState, useCallback, useEffect, useMemo } from 'react'
import { useAccount, useWriteContract, useSimulateContract, useWaitForTransactionReceipt } from 'wagmi'
import { type Address } from 'viem'
import { POSITION_MANAGER_ABI } from '../../config/abis/positionManagerABI'
import { CONTRACTS_ADDRESS } from '../../config/contractsAddress'
import type { Position, usePositionDatas } from './usePositionDatas'

interface UseClaimFeesParams {
  position: Position
  posData: ReturnType<typeof usePositionDatas>
  isModalOpen: boolean
}

interface ValidationError {
  type: 'no_fees' | 'not_ready' | 'invalid_position'
  message: string
}

export const useClaimFees = ({ position, posData, isModalOpen }: UseClaimFeesParams) => {
  const { address } = useAccount()
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [resetTrigger, setResetTrigger] = useState(0)

  // Contract interaction hooks
  const { error: simulationError } = useSimulateContract({
    address: CONTRACTS_ADDRESS.positionManager as Address,
    abi: POSITION_MANAGER_ABI,
    functionName: 'collect',
    args: [{
      tokenId: BigInt(position.tokenId),
      recipient: address as Address,
      amount0Max: BigInt('0xffffffffffffffffffffffffffffffff'), // Max uint128
      amount1Max: BigInt('0xffffffffffffffffffffffffffffffff'), // Max uint128
    }],
    query: {
      enabled: !!(
        address &&
        position.tokenId &&
        posData.unclaimedFees?.hasUnclaimed &&
        isModalOpen
      )
    }
  })

  const {
    writeContract,
    data: claimHash,
    isPending: isClaimPending,
    error: claimError,
    reset: resetWriteContract
  } = useWriteContract()

  const {
    data: claimReceipt,
    isLoading: isClaimLoading,
    isSuccess: isClaimSuccess,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash: claimHash,
    query: { enabled: !!claimHash }
  })

  // Validation
  const validateClaim = useCallback(() => {
    const errors: ValidationError[] = []

    if (!posData.isReady) {
      errors.push({
        type: 'not_ready',
        message: 'Position data not loaded'
      })
    }

    if (!posData.unclaimedFees?.hasUnclaimed) {
      errors.push({
        type: 'no_fees',
        message: 'No fees available to claim'
      })
    }

    if (!position.tokenId) {
      errors.push({
        type: 'invalid_position',
        message: 'Invalid position'
      })
    }

    setValidationErrors(errors)
    return errors.length === 0
  }, [posData.isReady, posData.unclaimedFees?.hasUnclaimed, position.tokenId])

  // Auto-validate when dependencies change
  useEffect(() => {
    validateClaim()
  }, [validateClaim, resetTrigger])

  // Derived states - use memoization to avoid re-renders
  const canSubmit = useMemo(() => {
    return validationErrors.length === 0 && !!address && !isClaimPending && !isClaimLoading
  }, [validationErrors.length, address, isClaimPending, isClaimLoading])

  const isLoading = isClaimPending || isClaimLoading
  const isSuccess = isClaimSuccess && !!claimReceipt

  // Status for UI
  const status = isClaimPending || isClaimLoading ? 'pending' :
                 isSuccess ? 'success' :
                 (claimError || receiptError || simulationError) ? 'error' : 'idle'

  // Main action
  const claimFees = useCallback(async () => {
    if (validationErrors.length > 0 || !address) return

    try {
      writeContract({
        address: CONTRACTS_ADDRESS.positionManager as Address,
        abi: POSITION_MANAGER_ABI,
        functionName: 'collect',
        args: [{
          tokenId: BigInt(position.tokenId),
          recipient: address as Address,
          amount0Max: BigInt('0xffffffffffffffffffffffffffffffff'), // Max uint128
          amount1Max: BigInt('0xffffffffffffffffffffffffffffffff'), // Max uint128
        }]
      })
    } catch (error) {
      console.error('Failed to claim fees:', error)
    }
  }, [validationErrors.length, address, writeContract, position.tokenId])

  // Reset function
  const reset = useCallback(() => {
    resetWriteContract()
    setValidationErrors([])
    setResetTrigger(prev => prev + 1)
  }, [resetWriteContract])

  // Error aggregation
  const errors = {
    claim: claimError,
    receipt: receiptError,
    simulation: simulationError
  }

  return {
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
    claimReceipt,

    // Capabilities
    canClaim: canSubmit,

    // Errors
    errors,

    // Fees data (passed through for convenience)
    unclaimedFees: posData.unclaimedFees
  }
}