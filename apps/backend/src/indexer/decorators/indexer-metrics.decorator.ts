import { SetMetadata } from '@nestjs/common';

export const INDEXER_METRICS_KEY = 'indexer_metrics';

export const IndexerMetrics = (metricName: string) =>
  SetMetadata(INDEXER_METRICS_KEY, metricName);
