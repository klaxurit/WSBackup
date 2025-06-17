import { Log } from 'viem';

export class EventUtil {
  static deduplicateEvents<
    T extends { transactionHash: string; logIndex: number },
  >(events: T[]): T[] {
    const seen = new Set<string>();

    return events.filter((event) => {
      const key = `${event.transactionHash}-${event.logIndex}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  static sortEventsByBlock<T extends { blockNumber: bigint; logIndex: number }>(
    events: T[],
  ): T[] {
    return events.sort((a, b) => {
      const blockDiff = Number(a.blockNumber - b.blockNumber);
      if (blockDiff !== 0) return blockDiff;
      return a.logIndex - b.logIndex;
    });
  }

  static groupEventsByPool<T extends { poolAddress: string }>(
    events: T[],
  ): Record<string, T[]> {
    return events.reduce(
      (acc, event) => {
        if (!acc[event.poolAddress]) {
          acc[event.poolAddress] = [];
        }
        acc[event.poolAddress].push(event);
        return acc;
      },
      {} as Record<string, T[]>,
    );
  }

  static validateSwapEvent(event: Log): boolean {
    return (
      !!event.transactionHash &&
      !!event.address &&
      event.blockNumber! > 0n &&
      event.logIndex! >= 0 &&
      Array.isArray(event.topics) &&
      event.topics.length > 0
    );
  }
}
