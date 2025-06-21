export const PositionManagerABI = [
  {
    name: 'balanceOf',
    type: 'function',
    inputs: [{ type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'tokenOfOwnerByIndex',
    type: 'function',
    inputs: [{ type: 'address' }, { type: 'uint256' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'positions',
    type: 'function',
    inputs: [{ type: 'uint256' }],
    outputs: [
      { name: 'nonce', type: 'uint96' },
      { name: 'operator', type: 'address' },
      { name: 'token0', type: 'address' },
      { name: 'token1', type: 'address' },
      { name: 'fee', type: 'uint24' },
      { name: 'tickLower', type: 'int24' },
      { name: 'tickUpper', type: 'int24' },
      { name: 'liquidity', type: 'uint128' },
      { name: 'feeGrowthInside0LastX128', type: 'uint256' },
      { name: 'feeGrowthInside1LastX128', type: 'uint256' },
      { name: 'tokensOwed0', type: 'uint128' },
      { name: 'tokensOwed1', type: 'uint128' }
    ]
  }
] as const
