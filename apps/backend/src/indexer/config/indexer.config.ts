import { registerAs } from '@nestjs/config';

export default registerAs('indexer', () => ({
  // Blockchain config
  rpcUrl: process.env.BERACHAIN_RPC_URL || 'https://rpc.berachain.com',

  // Indexer settings
  startBlock: BigInt(process.env.START_BLOCK || '4709727'),
  batchSize: BigInt(process.env.INDEXER_BATCH_SIZE || '100'),
  confirmations: BigInt(process.env.INDEXER_CONFIRMATIONS || '12'),

  // Contract addresses
  factoryAddress: process.env.FACTORY_ADDRESS || '',

  // Error handling
  maxRetries: parseInt(process.env.INDEXER_MAX_RETRIES || ''),
  retryDelay: parseInt(process.env.INDEXER_RETRY_DELAY || '5000', 10),

  // Performance tuning
  enableBatching: process.env.INDEXER_ENABLE_BATCHING !== 'false',
  enableRealtime: process.env.INDEXER_ENABLE_REALTIME !== 'false',
  reorgCheckDepth: parseInt(process.env.INDEXER_REORG_CHECK_DEPTH || '20', 10),

  // Monitoring
  enableMetrics: process.env.INDEXER_ENABLE_METRICS !== 'false',
  logLevel: process.env.INDEXER_LOG_LEVEL || 'info',
}));
