/**
 * Types pour la modal de dépôt/retrait dans les vaults
 */

export type DepositMode = 'deposit-only' | 'with-staking' | 'single-sided'
export type WithdrawMode = 'withdraw'

/**
 * Étapes possibles dans le processus de dépôt/retrait
 */
export enum VaultModalStep {
  // Deposit steps
  APPROVE_TOKEN0 = 'approve_token0',
  APPROVE_TOKEN1 = 'approve_token1',
  APPROVE_SINGLE_TOKEN = 'approve_single_token',
  CONFIRM_DEPOSIT = 'confirm_deposit',
  WAITING_DEPOSIT = 'waiting_deposit',
  WAITING_APPROVE_TOKEN0 = 'waiting_approve_token0',
  WAITING_APPROVE_TOKEN1 = 'waiting_approve_token1',
  WAITING_APPROVE_SINGLE_TOKEN = 'waiting_approve_single_token',
  APPROVE_VAULT_TOKEN = 'approve_vault_token',
  CONFIRM_STAKE = 'confirm_stake',
  WAITING_STAKE = 'waiting_stake',

  // Withdraw steps
  APPROVE_WITHDRAW = 'approve_withdraw',
  CONFIRM_WITHDRAW = 'confirm_withdraw',
  WAITING_WITHDRAW = 'waiting_withdraw',
  WAITING_APPROVE_WITHDRAW = 'waiting_approve_withdraw',

  // Common steps
  SUCCESS = 'success',
  ERROR = 'error'
}

/**
 * Configuration pour une étape spécifique
 */
export interface StepConfig {
  step: VaultModalStep
  stepNumber: number // Position dans la timeline (1, 2, 3...)
  totalSteps: number // Nombre total d'étapes dans ce mode
  title: string
}

/**
 * État global de la modal de dépôt
 */
export interface VaultDepositModalState {
  isOpen: boolean
  mode: DepositMode
  currentStep: VaultModalStep

  // Données du formulaire
  token0Amount: bigint
  token1Amount: bigint
  selectedToken?: 'token0' | 'token1' // Pour single-sided

  // Hash de transaction en cours (pour persistance)
  pendingTxHash?: string

  // Erreur éventuelle
  error?: string
}

/**
 * État global de la modal de retrait
 */
export interface VaultWithdrawModalState {
  isOpen: boolean
  currentStep: VaultModalStep

  // Données du formulaire
  withdrawAmount: bigint

  // Hash de transaction en cours
  pendingTxHash?: string

  // Erreur éventuelle
  error?: string
}

