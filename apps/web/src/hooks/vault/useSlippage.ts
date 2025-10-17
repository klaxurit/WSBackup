import { useMemo } from "react"

interface UseSlippageReturn {
  applySlippage: (amount: bigint, slippageBps: number) => bigint
  calculateMinAmount: (amount: bigint, slippageBps: number) => bigint
  calculateMaxAmount: (amount: bigint, slippageBps: number) => bigint
}

/**
 * Hook utilitaire pour les calculs de slippage
 *
 * @param defaultSlippageBps - Slippage par défaut en basis points (100 = 1%)
 */
export const useSlippage = (defaultSlippageBps: number = 100): UseSlippageReturn => {

  /**
   * Applique un slippage négatif (réduit le montant)
   * Utilisé pour les montants minimum acceptables
   */
  const applySlippage = useMemo(() => {
    return (amount: bigint, slippageBps: number = defaultSlippageBps): bigint => {
      if (amount === 0n) return 0n
      return (amount * BigInt(10000 - slippageBps)) / 10000n
    }
  }, [defaultSlippageBps])

  /**
   * Calcule le montant minimum acceptable avec slippage
   * Alias pour applySlippage pour plus de clarté
   */
  const calculateMinAmount = useMemo(() => {
    return (amount: bigint, slippageBps: number = defaultSlippageBps): bigint => {
      return applySlippage(amount, slippageBps)
    }
  }, [applySlippage, defaultSlippageBps])

  /**
   * Calcule le montant maximum acceptable avec slippage
   * Utilisé pour les montants maximum à payer
   */
  const calculateMaxAmount = useMemo(() => {
    return (amount: bigint, slippageBps: number = defaultSlippageBps): bigint => {
      if (amount === 0n) return 0n
      return (amount * BigInt(10000 + slippageBps)) / 10000n
    }
  }, [defaultSlippageBps])

  return {
    applySlippage,
    calculateMinAmount,
    calculateMaxAmount
  }
}

/**
 * Fonction utilitaire standalone pour appliquer un slippage
 * Peut être utilisée en dehors d'un composant React
 */
export const applySlippageBps = (amount: bigint, slippageBps: number): bigint => {
  if (amount === 0n) return 0n
  return (amount * BigInt(10000 - slippageBps)) / 10000n
}