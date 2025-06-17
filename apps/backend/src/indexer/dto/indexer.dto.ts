export interface IndexerStatusDto {
  isRunning: boolean;
  currentChainBlock: bigint;
  lastIndexedBlock: bigint;
  blocksBehind: bigint;

  lastUpdate?: Date;
  isHealthy: boolean;
}

export interface PoolStatsDto {
  totalPoolsTracked: number;
  swapsLast24h: number;
}

export interface AddPoolDto {
  address: string;
}

export interface ReindexDto {
  fromBlock: number;
}
