export const PoolABI = [
  {
    name: 'slot0',
    type: 'function',
    inputs: [],
    outputs: [
      { name: 'sqrtPriceX96', type: 'uint160' },
      { name: 'tick', type: 'int24' },
      { name: 'observationIndex', type: 'uint16' },
      { name: 'observationCardinality', type: 'uint16' },
      { name: 'observationCardinalityNext', type: 'uint16' },
      { name: 'feeProtocol', type: 'uint8' },

      { name: 'unlocked', type: 'bool' },
    ],

    stateMutability: 'view',

  },

  {
    name: 'liquidity',
    type: 'function',

    inputs: [],
    outputs: [{ name: '', type: 'uint128' }],
    stateMutability: 'view',
  },
  {
    name: 'token0',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
  {

    name: 'token1',
    type: 'function',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
  },
]
