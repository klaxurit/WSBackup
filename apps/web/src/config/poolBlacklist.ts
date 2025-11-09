/**
 * Centralized pool blacklist configuration
 * These pools are excluded from various parts of the application
 */
export const POOL_BLACKLIST = [
  "0xc06aD7fF55D1d53Ed9371C17eDC557C9E1A06B2E".toLowerCase(), // WETH-USDC.e 0.05%
  "0xb27ab73220602b7dcd7daeba83f64659e747aca4".toLowerCase(), // brBTC/WBTC - BUGGY POOL
  "0x01716554a6125db2e140e01a4dc6412813aaf048".toLowerCase(), // Request: hide pool from UI
];

/**
 * Check if a pool address is blacklisted
 * @param poolAddress The pool address to check
 * @returns true if the pool is blacklisted, false otherwise
 */
export const isPoolBlacklisted = (poolAddress: string): boolean => {
  return POOL_BLACKLIST.includes(poolAddress.toLowerCase());
};