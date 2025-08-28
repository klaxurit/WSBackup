import { formatUnits, parseUnits } from 'viem'

// ============ CONSTANTS ============

export const ZERO = 0n
export const ONE = 1n
export const TWO = 2n

// 18 decimales pour normaliser tous les ratios/prix
export const PRECISION_18 = parseUnits("1", 18) // 1e18
export const PRECISION_6 = parseUnits("1", 6)   // 1e6

// Q192 pour les calculs sqrtPrice d'Uniswap V3
export const Q192 = 2n ** 192n

// Limites sécurisées pour éviter overflow
export const MAX_SAFE_VALUE = 2n ** 200n

// ============ MATH HELPERS ============

/**
 * Division sécurisée avec protection contre division par zéro
 */
export function safeDiv(a: bigint, b: bigint): bigint {
  if (b === 0n) return 0n
  return a / b
}

/**
 * Multiplication sécurisée avec protection overflow
 */
export function safeMul(a: bigint, b: bigint): bigint {
  // Protection basique contre overflow extrême
  if (a === 0n || b === 0n) return 0n
  
  const result = a * b
  
  // Vérification simple d'overflow (approximative)
  // if (result < 0n && a > 0n && b > 0n) {
  //   console.warn(`Multiplication overflow detected: ${a} * ${b}`)
  //   return MAX_SAFE_VALUE
  // }
  
  // if (result > MAX_SAFE_VALUE) {
  //   console.warn(`Result too large: ${a} * ${b} = ${result}, capping`)
  //   throw new Error("NTM")
  //   return MAX_SAFE_VALUE
  // }
  
  return result
}

/**
 * Calcul de valeur absolue
 */
export function abs(value: bigint): bigint {
  return value < 0n ? -value : value
}

/**
 * Puissance avec protection
 */
export function safePow(base: bigint, exp: number): bigint {
  if (exp === 0) return 1n
  if (exp === 1) return base
  if (base === 0n) return 0n
  if (base === 1n) return 1n
  
  // Protection contre exposants dangereux
  if (exp > 100) {
    console.warn(`Exponent too large: ${base}^${exp}, returning max value`)
    return MAX_SAFE_VALUE
  }
  
  let result = 1n
  for (let i = 0; i < exp; i++) {
    result = safeMul(result, base)
    if (result >= MAX_SAFE_VALUE) break
  }
  
  return result
}

// ============ CONVERSION HELPERS ============

/**
 * Convertit un montant token (wei) vers un ratio normalisé (18 decimales)
 * Ex: 1000000000000000000n (1 BERA) → 1000000000000000000n (ratio 1.0)
 */
export function tokenToRatio(amount: bigint, decimals: number): bigint {
  if (decimals === 18) return amount
  if (decimals > 18) {
    // Token avec plus de 18 decimales → diviser
    const diff = decimals - 18
    return safeDiv(amount, safePow(10n, diff))
  } else {
    // Token avec moins de 18 decimales → multiplier
    const diff = 18 - decimals
    return safeMul(amount, safePow(10n, diff))
  }
}

/**
 * Convertit un ratio normalisé vers un montant token (wei)
 */
export function ratioToToken(ratio: bigint, decimals: number): bigint {
  if (decimals === 18) return ratio
  if (decimals > 18) {
    // Plus de decimales → multiplier
    const diff = decimals - 18
    return safeMul(ratio, safePow(10n, diff))
  } else {
    // Moins de decimales → diviser
    const diff = 18 - decimals
    return safeDiv(ratio, safePow(10n, diff))
  }
}

/**
 * Formatage pour affichage (utilise viem)
 */
export function formatToken(amount: bigint, decimals: number): string {
  return formatUnits(amount, decimals)
}

/**
 * Parsing depuis string (utilise viem)
 */
export function parseToken(amount: string, decimals: number): bigint {
  return parseUnits(amount, decimals)
}

// ============ PRICE CALCULATIONS ============

/**
 * Calcule le prix à partir de sqrtPriceX96 (Uniswap V3)
 * Retourne [price0, price1] en format 18 decimales
 */
export function sqrtPriceX96ToTokenPrices(
  sqrtPriceX96: bigint, 
  decimals0: number, 
  decimals1: number
): [bigint, bigint] {
  if (sqrtPriceX96 === 0n) return [0n, 0n]
  
  // price = (sqrtPriceX96)² / 2^192
  const numerator = safeMul(sqrtPriceX96, sqrtPriceX96)
  const rawPrice = safeDiv(numerator, Q192)
  
  // Ajustement pour les decimales des tokens
  const token0Multiplier = safePow(10n, decimals0)
  const token1Multiplier = safePow(10n, decimals1)
  
  // price1 = rawPrice * 10^decimals0 / 10^decimals1
  const price1Numerator = safeMul(rawPrice, token0Multiplier)
  const price1 = safeDiv(price1Numerator, token1Multiplier)
  
  // price0 = 1/price1 (avec precision)
  const price0 = price1 > 0n ? safeDiv(safeMul(PRECISION_18, PRECISION_18), price1) : 0n
  
  return [price0, price1]
}

/**
 * Calcule ratio derivedBERA d'un token basé sur les prix des pools
 * Utilise la pool avec la plus grande liquidité BERA
 */
export function calculateDerivedBERA(
  tokenPools: Array<{
    totalValueLockedToken0: bigint
    totalValueLockedToken1: bigint
    token0Price: string
    token1Price: string
    token0: string
    token1: string
    tokenDecimals: number
    otherTokenDerivedBERA: bigint
  }>,
  targetTokenId: string,
  referenceTokenId: string
): bigint {
  if (targetTokenId === referenceTokenId) return PRECISION_18
  
  let largestLiquidityBERA = 0n
  let bestRatio = 0n
  
  for (const pool of tokenPools) {
    const isToken0 = pool.token0 === targetTokenId
    const isToken1 = pool.token1 === targetTokenId
    
    if (!isToken0 && !isToken1) continue
    
    // Calculer la liquidité BERA de l'autre token
    let otherTokenLiquidity: bigint
    let tokenPrice: bigint
    let otherTokenDerivedBERA: bigint
    
    if (isToken0) {
      otherTokenLiquidity = pool.totalValueLockedToken1
      tokenPrice = parseToken(pool.token1Price || "0", 18)
      otherTokenDerivedBERA = pool.otherTokenDerivedBERA
    } else {
      otherTokenLiquidity = pool.totalValueLockedToken0
      tokenPrice = parseToken(pool.token0Price || "0", 18)
      otherTokenDerivedBERA = pool.otherTokenDerivedBERA
    }
    
    const beraLocked = safeMul(otherTokenLiquidity, otherTokenDerivedBERA)
    
    if (beraLocked > largestLiquidityBERA && beraLocked > PRECISION_18) {
      largestLiquidityBERA = beraLocked
      bestRatio = safeMul(tokenPrice, otherTokenDerivedBERA)
    }
  }
  
  // Limiter le ratio pour éviter les valeurs extrêmes
  const MAX_RATIO = safeMul(PRECISION_18, parseUnits("1000000", 18)) // 1M max
  if (bestRatio > MAX_RATIO) {
    console.warn(`derivedBERA too high: ${formatUnits(bestRatio, 18)}, capping`)
    return MAX_RATIO
  }
  
  return bestRatio
}

/**
 * Helper pour calculer les volumes trackés USD selon whitelist
 * (version simplifiée pour migration BigInt)
 */
export function getTrackedVolumeUSD(
  amount0: bigint,
  token0DerivedBERA: bigint,
  amount1: bigint, 
  token1DerivedBERA: bigint,
  beraPriceUSD: string,
  isToken0Whitelisted: boolean,
  isToken1Whitelisted: boolean
): bigint {
  const beraPrice = parseToken(beraPriceUSD, 18)
  
  const amount0Bera = safeMul(amount0, token0DerivedBERA)
  const amount1Bera = safeMul(amount1, token1DerivedBERA) 
  
  // both are whitelist tokens, return sum of both amounts
  if (isToken0Whitelisted && isToken1Whitelisted) {
    return safeMul(amount0Bera + amount1Bera, beraPrice)
  }
  
  // take double value of the whitelisted token amount
  if (isToken0Whitelisted && !isToken1Whitelisted) {
    return safeMul(safeMul(amount0Bera, 2n), beraPrice)
  }
  
  if (!isToken0Whitelisted && isToken1Whitelisted) {
    return safeMul(safeMul(amount1Bera, 2n), beraPrice)
  }
  
  // neither token is on white list, tracked amount is 0
  return 0n
}