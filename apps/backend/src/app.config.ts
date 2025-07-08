import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Blockchain config
  rpcUrl: process.env.BERACHAIN_RPC_URL || 'https://rpc.berachain.com',

  // Indexer settings
  startBlock: BigInt(process.env.START_BLOCK || '4709727'),
  batchSize: BigInt(process.env.INDEXER_BATCH_SIZE || '100'),
  confirmations: BigInt(process.env.INDEXER_CONFIRMATIONS || '12'),

  // Contract addresses
  v3FactoryAddress: process.env.V3_FACTORY_ADDRESS || '',
}));
