import { useState, useEffect, useCallback } from 'react'
import { VaultModalStep, type DepositMode } from '../../types/vaultModal'

interface UseDoubleDepositHook {
  t0Allowance: { isNeed: boolean; isApprove: boolean; hash?: string }
  t1Allowance: { isNeed: boolean; isApprove: boolean; hash?: string }
  deposite: { isPending: boolean; isLoading: boolean; isSuccess: boolean; hash?: string }
}

interface UseSingleDepositHook {
  allowance: { isNeed: boolean; isApprove: boolean; hash?: string }
  deposit: { isPending: boolean; isLoading: boolean; isSuccess: boolean; hash?: string }
}

interface UseVaultWithdrawHook {
  allowance: { isNeed: boolean; isLoading: boolean; hash?: string }
  withdraw: { isPending: boolean; isLoading: boolean; isSuccess: boolean; hash?: string }
}

interface UseVaultDepositModalStateParams {
  mode: DepositMode
  depositHook: UseDoubleDepositHook | UseSingleDepositHook | null
  vaultAddress: string
}

interface UseVaultWithdrawModalStateParams {
  withdrawHook: UseVaultWithdrawHook | null
  vaultAddress: string
}

/**
 * Hook pour gérer l'état de la modal de dépôt
 * Observe les états des hooks existants pour déterminer automatiquement l'étape actuelle
 */
export const useVaultDepositModalState = ({
  mode,
  depositHook,
  vaultAddress
}: UseVaultDepositModalStateParams) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<VaultModalStep>(VaultModalStep.APPROVE_TOKEN0)

  // Clé pour le localStorage (spécifique au vault et à l'utilisateur)
  const storageKey = `vault_deposit_modal_${vaultAddress}`

  // Déterminer automatiquement l'étape actuelle en fonction du mode et des états
  useEffect(() => {
    if (!depositHook || !isOpen) return

    if (mode === 'deposit-only' || mode === 'with-staking') {
      const hook = depositHook as UseDoubleDepositHook

      // Étape 1 : Approve Token0 si nécessaire
      if (hook.t0Allowance.isNeed) {
        if (hook.t0Allowance.hash) {
          setCurrentStep(VaultModalStep.WAITING_APPROVE_TOKEN0)
        } else {
          setCurrentStep(VaultModalStep.APPROVE_TOKEN0)
        }
        return
      }

      // Étape 2 : Approve Token1 si nécessaire
      if (hook.t1Allowance.isNeed) {
        if (hook.t1Allowance.hash) {
          setCurrentStep(VaultModalStep.WAITING_APPROVE_TOKEN1)
        } else {
          setCurrentStep(VaultModalStep.APPROVE_TOKEN1)
        }
        return
      }

      // Étape 3 : Dépôt en cours (seulement si hash existe = tx envoyée)
      if (hook.deposite.hash && (hook.deposite.isPending || hook.deposite.isLoading)) {
        setCurrentStep(VaultModalStep.WAITING_DEPOSIT)
        return
      }

      // Étape 4 : Succès du dépôt
      if (hook.deposite.isSuccess) {
        if (process.env.NODE_ENV === 'development') {
          console.log('useVaultModalState: Deposit success detected, setting SUCCESS step');
        }
        if (mode === 'with-staking') {
          // TODO: Gérer les étapes de staking
          setCurrentStep(VaultModalStep.APPROVE_VAULT_TOKEN)
        } else {
          setCurrentStep(VaultModalStep.SUCCESS)
        }
        return
      }

      // Fallback: Si on a un hash mais pas encore isSuccess, rester en WAITING_DEPOSIT
      if (hook.deposite.hash && !hook.deposite.isPending && !hook.deposite.isLoading && !hook.deposite.isSuccess) {
        if (process.env.NODE_ENV === 'development') {
          console.log('useVaultModalState: Transaction hash exists but not yet successful, staying in WAITING_DEPOSIT');
        }
        setCurrentStep(VaultModalStep.WAITING_DEPOSIT)
        return
      }

      // Par défaut : Confirm Deposit
      setCurrentStep(VaultModalStep.CONFIRM_DEPOSIT)
    } else if (mode === 'single-sided') {
      const hook = depositHook as UseSingleDepositHook

      // Étape 1 : Approve Token
      if (hook.allowance.isNeed) {
        // Si hash existe, l'utilisateur a signé et la tx est en cours
        if (hook.allowance.hash) {
          setCurrentStep(VaultModalStep.WAITING_DEPOSIT)
        } else {
          setCurrentStep(VaultModalStep.APPROVE_SINGLE_TOKEN)
        }
        return
      }

      // Étape 2 : Dépôt en cours (seulement si hash existe = tx envoyée)
      if (hook.deposit.hash && (hook.deposit.isPending || hook.deposit.isLoading)) {
        setCurrentStep(VaultModalStep.WAITING_DEPOSIT)
        return
      }

      // Étape 3 : Succès
      if (hook.deposit.isSuccess) {
        setCurrentStep(VaultModalStep.SUCCESS)
        return
      }

      // Par défaut : Confirm Deposit
      setCurrentStep(VaultModalStep.CONFIRM_DEPOSIT)
    }
  }, [depositHook, mode, isOpen])

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(storageKey, JSON.stringify({
        currentStep,
        mode,
        timestamp: Date.now()
      }))
    }
  }, [isOpen, currentStep, mode, storageKey])

  // Restaurer l'état depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const { currentStep: savedStep, timestamp } = JSON.parse(saved)
        // Ne pas restaurer si c'est l'étape SUCCESS (pour éviter de rester bloqué sur le succès)
        if (savedStep === VaultModalStep.SUCCESS) {
          localStorage.removeItem(storageKey)
          return
        }
        // Restaurer seulement si moins de 30 minutes
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          setCurrentStep(savedStep)
        } else {
          localStorage.removeItem(storageKey)
        }
      } catch (e) {
        console.error('Error restoring modal state:', e)
      }
    }
  }, [storageKey])

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const resetModal = useCallback(() => {
    setCurrentStep(VaultModalStep.APPROVE_TOKEN0)
    localStorage.removeItem(storageKey)
    setIsOpen(false)
  }, [storageKey])

  // Calculer le numéro d'étape et le total pour la timeline
  const getStepNumbers = (): { current: number; total: number } => {
    if (mode === 'single-sided') {
      const stepMap: Record<string, number> = {
        [VaultModalStep.APPROVE_SINGLE_TOKEN]: 1,
        [VaultModalStep.CONFIRM_DEPOSIT]: 2,
        [VaultModalStep.WAITING_DEPOSIT]: 2,
        [VaultModalStep.SUCCESS]: 2
      }
      return { current: stepMap[currentStep] || 1, total: 2 }
    }

    if (mode === 'with-staking') {
      const stepMap: Record<string, number> = {
        [VaultModalStep.APPROVE_TOKEN0]: 1,
        [VaultModalStep.APPROVE_TOKEN1]: 2,
        [VaultModalStep.CONFIRM_DEPOSIT]: 3,
        [VaultModalStep.WAITING_DEPOSIT]: 3,
        [VaultModalStep.APPROVE_VAULT_TOKEN]: 4,
        [VaultModalStep.CONFIRM_STAKE]: 5,
        [VaultModalStep.WAITING_STAKE]: 5,
        [VaultModalStep.SUCCESS]: 5
      }
      return { current: stepMap[currentStep] || 1, total: 5 }
    }

    // deposit-only
    const stepMap: Record<string, number> = {
      [VaultModalStep.APPROVE_TOKEN0]: 1,
      [VaultModalStep.WAITING_APPROVE_TOKEN0]: 1,
      [VaultModalStep.APPROVE_TOKEN1]: 2,
      [VaultModalStep.WAITING_APPROVE_TOKEN1]: 2,
      [VaultModalStep.CONFIRM_DEPOSIT]: 3,
      [VaultModalStep.WAITING_DEPOSIT]: 3,
      [VaultModalStep.SUCCESS]: 3
    }
    return { current: stepMap[currentStep] || 1, total: 3 }
  }

  return {
    isOpen,
    currentStep,
    openModal,
    closeModal,
    resetModal,
    getStepNumbers
  }
}

/**
 * Hook pour gérer l'état de la modal de retrait
 */
export const useVaultWithdrawModalState = ({
  withdrawHook,
  vaultAddress
}: UseVaultWithdrawModalStateParams) => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<VaultModalStep>(VaultModalStep.APPROVE_WITHDRAW)

  const storageKey = `vault_withdraw_modal_${vaultAddress}`

  // Déterminer l'étape actuelle
  useEffect(() => {
    if (!withdrawHook || !isOpen) return

    // Étape 1 : Approve
    if (withdrawHook.allowance.isNeed) {
      // Si hash existe, l'utilisateur a signé et la tx est en cours
      if (withdrawHook.allowance.hash) {
        setCurrentStep(VaultModalStep.WAITING_WITHDRAW)
      } else {
        setCurrentStep(VaultModalStep.APPROVE_WITHDRAW)
      }
      return
    }

    // Étape 2 : Retrait en cours (seulement si hash existe = tx envoyée)
    if (withdrawHook.withdraw.hash && (withdrawHook.withdraw.isPending || withdrawHook.withdraw.isLoading)) {
      setCurrentStep(VaultModalStep.WAITING_WITHDRAW)
      return
    }

    // Étape 3 : Succès
    if (withdrawHook.withdraw.isSuccess) {
      setCurrentStep(VaultModalStep.SUCCESS)
      return
    }

    // Par défaut : Confirm Withdraw
    setCurrentStep(VaultModalStep.CONFIRM_WITHDRAW)
  }, [withdrawHook, isOpen])

  // Sauvegarder l'état
  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(storageKey, JSON.stringify({
        currentStep,
        timestamp: Date.now()
      }))
    }
  }, [isOpen, currentStep, storageKey])

  // Restaurer l'état
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        const { currentStep: savedStep, timestamp } = JSON.parse(saved)
        // Ne pas restaurer si c'est l'étape SUCCESS (pour éviter de rester bloqué sur le succès)
        if (savedStep === VaultModalStep.SUCCESS) {
          localStorage.removeItem(storageKey)
          return
        }
        if (Date.now() - timestamp < 30 * 60 * 1000) {
          setCurrentStep(savedStep)
        } else {
          localStorage.removeItem(storageKey)
        }
      } catch (e) {
        console.error('Error restoring modal state:', e)
      }
    }
  }, [storageKey])

  const openModal = useCallback(() => setIsOpen(true), [])
  const closeModal = useCallback(() => setIsOpen(false), [])
  const resetModal = useCallback(() => {
    setCurrentStep(VaultModalStep.APPROVE_WITHDRAW)
    localStorage.removeItem(storageKey)
    setIsOpen(false)
  }, [storageKey])

  const getStepNumbers = (): { current: number; total: number } => {
    const stepMap: Record<string, number> = {
      [VaultModalStep.APPROVE_WITHDRAW]: 1,
      [VaultModalStep.CONFIRM_WITHDRAW]: 2,
      [VaultModalStep.WAITING_WITHDRAW]: 2,
      [VaultModalStep.SUCCESS]: 3
    }
    return { current: stepMap[currentStep] || 1, total: 3 }
  }

  return {
    isOpen,
    currentStep,
    openModal,
    closeModal,
    resetModal,
    getStepNumbers
  }
}

