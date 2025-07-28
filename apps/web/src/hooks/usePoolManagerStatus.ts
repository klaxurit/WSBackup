import { useReducer, useMemo } from 'react'

export type PoolManagerStatus = 
  | 'idle'
  | 'fetchPool'
  | 'fetchAllowance'
  | 'waitInitialAmount'
  | 'waitAmount'
  | 'needT0Approve'
  | 'needT1Approve'
  | 'needWrap'
  | 'waitUserApprovement'
  | 'waitApprovementReceipt'
  | 'waitMainUserSign'
  | 'waitMainReceipt'
  | 'readyMintPosition'
  | 'readyCreatePosition'

interface StatusState {
  phase: PoolManagerStatus
  error?: string
  isLoading: boolean
  isReady: boolean
}

type StatusAction = 
  | { type: 'SET_IDLE' }
  | { type: 'SET_FETCH_POOL' }
  | { type: 'SET_FETCH_ALLOWANCE' }
  | { type: 'SET_WAIT_INITIAL_AMOUNT' }
  | { type: 'SET_WAIT_AMOUNT' }
  | { type: 'SET_NEED_T0_APPROVE' }
  | { type: 'SET_NEED_T1_APPROVE' }
  | { type: 'SET_NEED_WRAP' }
  | { type: 'SET_WAIT_USER_APPROVAL' }
  | { type: 'SET_WAIT_APPROVAL_RECEIPT' }
  | { type: 'SET_WAIT_MAIN_USER_SIGN' }
  | { type: 'SET_WAIT_MAIN_RECEIPT' }
  | { type: 'SET_READY_MINT_POSITION' }
  | { type: 'SET_READY_CREATE_POSITION' }
  | { type: 'SET_ERROR'; error: string }

const statusReducer = (state: StatusState, action: StatusAction): StatusState => {
  switch (action.type) {
    case 'SET_IDLE':
      return { phase: 'idle', isLoading: false, isReady: false }
    case 'SET_FETCH_POOL':
      return { phase: 'fetchPool', isLoading: true, isReady: false }
    case 'SET_FETCH_ALLOWANCE':
      return { phase: 'fetchAllowance', isLoading: true, isReady: false }
    case 'SET_WAIT_INITIAL_AMOUNT':
      return { phase: 'waitInitialAmount', isLoading: false, isReady: false }
    case 'SET_WAIT_AMOUNT':
      return { phase: 'waitAmount', isLoading: false, isReady: false }
    case 'SET_NEED_T0_APPROVE':
      return { phase: 'needT0Approve', isLoading: false, isReady: true }
    case 'SET_NEED_T1_APPROVE':
      return { phase: 'needT1Approve', isLoading: false, isReady: true }
    case 'SET_NEED_WRAP':
      return { phase: 'needWrap', isLoading: false, isReady: true }
    case 'SET_WAIT_USER_APPROVAL':
      return { phase: 'waitUserApprovement', isLoading: true, isReady: false }
    case 'SET_WAIT_APPROVAL_RECEIPT':
      return { phase: 'waitApprovementReceipt', isLoading: true, isReady: false }
    case 'SET_WAIT_MAIN_USER_SIGN':
      return { phase: 'waitMainUserSign', isLoading: true, isReady: false }
    case 'SET_WAIT_MAIN_RECEIPT':
      return { phase: 'waitMainReceipt', isLoading: true, isReady: false }
    case 'SET_READY_MINT_POSITION':
      return { phase: 'readyMintPosition', isLoading: false, isReady: true }
    case 'SET_READY_CREATE_POSITION':
      return { phase: 'readyCreatePosition', isLoading: false, isReady: true }
    case 'SET_ERROR':
      return { phase: 'idle', error: action.error, isLoading: false, isReady: false }
    default:
      return state
  }
}

interface StatusDependencies {
  token0: boolean
  token1: boolean
  isCheckingPool: boolean
  isGettingPoolData: boolean
  isCheckingToken0Allowance: boolean
  isCheckingToken1Allowance: boolean
  poolAlreadyExist: boolean
  hasPosition: boolean
  initialPrice: bigint
  token0NeedApproval: boolean
  token1NeedApproval: boolean
  needsWBERAWrapping: boolean
  isApprovingToken0: boolean
  isApprovingToken1: boolean
  waitingT0ApproveReceipt: boolean
  waitingT1ApproveReceipt: boolean
  waitCreatePool: boolean
  waitMintPosition: boolean
  waitWrap: boolean
  waitingCreatePoolReceipt: boolean
  waitingMintPositionReceipt: boolean
  waitingWrapReceipt: boolean
}

export const usePoolManagerStatus = (deps: StatusDependencies) => {
  const [state, dispatch] = useReducer(statusReducer, {
    phase: 'idle',
    isLoading: false,
    isReady: false
  })

  const calculatedStatus = useMemo(() => {
    // États de chargement
    if (deps.isCheckingPool || deps.isGettingPoolData) {
      return 'fetchPool'
    }
    if (deps.isCheckingToken0Allowance || deps.isCheckingToken1Allowance) {
      return 'fetchAllowance'
    }

    // États d'approbation
    if (deps.isApprovingToken0 || deps.isApprovingToken1) {
      return 'waitUserApprovement'
    }
    if (deps.waitingT0ApproveReceipt || deps.waitingT1ApproveReceipt) {
      return 'waitApprovementReceipt'
    }

    // États de transaction principale
    if (deps.waitCreatePool || deps.waitMintPosition || deps.waitWrap) {
      return 'waitMainUserSign'
    }
    if (deps.waitingCreatePoolReceipt || deps.waitingMintPositionReceipt || deps.waitingWrapReceipt) {
      return 'waitMainReceipt'
    }

    // États d'attente
    if (!deps.token0 || !deps.token1) {
      return 'idle'
    }
    if (!deps.poolAlreadyExist && deps.initialPrice === 0n) {
      return 'waitInitialAmount'
    }
    if (!deps.hasPosition) {
      return 'waitAmount'
    }

    // États d'approbation nécessaires
    if (deps.token0NeedApproval) {
      return 'needT0Approve'
    }
    if (deps.token1NeedApproval) {
      return 'needT1Approve'
    }
    if (deps.needsWBERAWrapping) {
      return 'needWrap'
    }

    // États prêts
    return deps.poolAlreadyExist ? 'readyMintPosition' : 'readyCreatePosition'
  }, [deps])

  // Mettre à jour le state quand le status calculé change
  const statusState = useMemo(() => {
    const isLoading = [
      'fetchPool',
      'fetchAllowance',
      'waitUserApprovement',
      'waitApprovementReceipt',
      'waitMainUserSign',
      'waitMainReceipt'
    ].includes(calculatedStatus)

    const isReady = [
      'needT0Approve',
      'needT1Approve',
      'needWrap',
      'readyMintPosition',
      'readyCreatePosition'
    ].includes(calculatedStatus)

    return {
      phase: calculatedStatus,
      isLoading,
      isReady,
      error: state.error
    }
  }, [calculatedStatus, state.error])

  return {
    ...statusState,
    dispatch
  }
}