import { BigNumber } from 'bignumber.js';

/**
 * Calcule les montants déposés pour une position Uniswap V3.
 * @param liquidity La liquidité de la position (bigint ou string)
 * @param sqrtPriceX96 Le prix courant de la pool (string ou bigint)
 * @param sqrtPriceLowerX96 sqrt du tick inférieur (string ou bigint)
 * @param sqrtPriceUpperX96 sqrt du tick supérieur (string ou bigint)
 * @param decimals0 Décimales du token0
 * @param decimals1 Décimales du token1
 * @returns { amount0: string, amount1: string }
 */
export function getAmountsForLiquidity(
  liquidity: bigint | string,
  sqrtPriceX96: bigint | string,
  sqrtPriceLowerX96: bigint | string,
  sqrtPriceUpperX96: bigint | string,
  decimals0: number,
  decimals1: number,
): { amount0: string; amount1: string } {
  try {
    console.log('🧮 getAmountsForLiquidity input:', {
      liquidity: liquidity.toString(),
      sqrtPriceX96: sqrtPriceX96.toString(),
      sqrtPriceLowerX96: sqrtPriceLowerX96.toString().slice(0, 20) + '...',
      sqrtPriceUpperX96: sqrtPriceUpperX96.toString().slice(0, 20) + '...',
      decimals0,
      decimals1,
    });

    const Q96 = new BigNumber(2).pow(96);
    const L = new BigNumber(liquidity.toString());
    const sqrtP = new BigNumber(sqrtPriceX96.toString());
    const sqrtPL = new BigNumber(sqrtPriceLowerX96.toString());
    const sqrtPU = new BigNumber(sqrtPriceUpperX96.toString());

    console.log('🔢 BigNumber values:', {
      L: L.toString(),
      sqrtP: sqrtP.toString().slice(0, 20) + '...',
      sqrtPL: sqrtPL.toString().slice(0, 20) + '...',
      sqrtPU: sqrtPU.toString().slice(0, 20) + '...',
    });

    let amount0 = new BigNumber(0);
    let amount1 = new BigNumber(0);

    if (sqrtP.lte(sqrtPL)) {
      console.log('📍 Price below range: all token0');
      // current price below the range: all in token0
      amount0 = L.multipliedBy(sqrtPU.minus(sqrtPL))
        .dividedBy(sqrtPL.multipliedBy(sqrtPU))
        .dividedBy(Q96);
    } else if (sqrtP.lt(sqrtPU)) {
      console.log('📍 Price in range: both tokens');
      // current price within the range: both tokens
      amount0 = L.multipliedBy(sqrtPU.minus(sqrtP))
        .dividedBy(sqrtP.multipliedBy(sqrtPU))
        .dividedBy(Q96);
      amount1 = L.multipliedBy(sqrtP.minus(sqrtPL)).dividedBy(Q96);
    } else {
      console.log('📍 Price above range: all token1');
      // current price above the range: all in token1
      amount1 = L.multipliedBy(sqrtPU.minus(sqrtPL)).dividedBy(Q96);
    }

    console.log('🔢 Raw amounts before decimals:', {
      amount0: amount0.toString(),
      amount1: amount1.toString(),
    });

    // Ajuster pour les décimales
    amount0 = amount0.dividedBy(new BigNumber(10).pow(decimals0));
    amount1 = amount1.dividedBy(new BigNumber(10).pow(decimals1));

    const result = {
      amount0: amount0.toFixed(),
      amount1: amount1.toFixed(),
    };

    console.log('✅ Final amounts:', result);
    return result;
  } catch (error) {
    console.error('❌ Error in getAmountsForLiquidity:', error);
    return {
      amount0: '0',
      amount1: '0',
    };
  }
}

/**
 * Convertit un tick en sqrtPriceX96 (Uniswap V3)
 */
export function tickToSqrtPriceX96(tick: number): BigNumber {
  // sqrt(1.0001^tick) * 2^96
  const ratio = new BigNumber(1.0001).pow(tick);
  const sqrtRatio = ratio.sqrt();
  return sqrtRatio.multipliedBy(new BigNumber(2).pow(96));
}

