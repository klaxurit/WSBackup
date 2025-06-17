export class BlockUtil {
  static formatBlockNumber(blockNumber: bigint): string {
    return `#${blockNumber.toString()}`;
  }

  static calculateBlocksPerSecond(
    blocksProcessed: number,
    timeElapsedMs: number,
  ): number {
    return blocksProcessed / (timeElapsedMs / 1000);
  }

  static estimateTimeToSync(
    currentBlock: bigint,
    targetBlock: bigint,

    blocksPerSecond: number,
  ): number {
    const remainingBlocks = Number(targetBlock - currentBlock);
    return remainingBlocks / blocksPerSecond;
  }

  static isValidBlockNumber(blockNumber: any): blockNumber is bigint {
    try {
      const bn = BigInt(blockNumber);
      return bn >= 0n;
    } catch {
      return false;
    }
  }
}
