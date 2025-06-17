import { Address, Hex, Log } from 'viem';

export interface DecodedSwapEvent {
  sender: Address;
  recipient: Address;
  amount0: bigint;
  amount1: bigint;
  sqrtPriceX96: bigint;
  liquidity: bigint;
  tick: number;
}

export interface ProcessedSwapEvent extends DecodedSwapEvent {
  transactionHash: string;
  blockNumber: bigint;
  blockHash: string;
  logIndex: number;
  poolAddress: Address;
  timestamp: Date;
  gasUsed?: string;
  gasPrice?: string;
}

export interface IndexerConfig {
  rpcUrl: string;
  startBlock: bigint;
  batchSize: number;
  confirmations: number;
  maxRetries: number;
  retryDelay: number;
}
