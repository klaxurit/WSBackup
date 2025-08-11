import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ClientDb, LiveSubscription, Status } from './ponder.type';
import { PgDialect } from 'drizzle-orm/pg-core';
import { ConfigService } from '@nestjs/config';
import { QueryWithTypings, SQLWrapper } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pg-proxy';
import { EventSource } from 'eventsource';
import { liquidityEvent, pools, positions, swaps } from './ponder.schema';

@Injectable()
export class PonderService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PonderService.name);
  private baseUrl: string;
  private db: ClientDb<any>;
  private sse: EventSource | undefined;
  private liveCount = 0;
  private schema: any;
  private dialect: PgDialect;
  private superjson: any;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.baseUrl =
      this.configService.get<string>('PONDER_SQL_URL') ||
      'http://localhost:42069/sql';

    this.logger.log(`Ponder SQL client initialized with URL: ${this.baseUrl}`);
    this.superjson = await eval('import("superjson")');
    this.schema = { pools, swaps, positions, liquidityEvent };
    this.setupDatabase();
  }
  onModuleDestroy() {
    this.cleanup();
  }

  private setupDatabase(): void {
    this.db = drizzle(
      async (sql, params, _, typings) => {
        const builtQuery = { sql, params, typings };
        const response = await fetch(this.getUrl('db', builtQuery), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();

          const error = new Error(`Ponder SQL Error: ${errorText}`);
          error.stack = undefined;

          this.logger.error('SQL query failed:', errorText);
          throw error;
        }

        const result = await response.json();

        return {
          ...result,
          rows: result.rows.map((row: object) => Object.values(row)),
        };
      },
      { schema: this.schema, casing: 'snake_case' },
    );

    const noopDatabase = drizzle(() => Promise.resolve({ rows: [] }), {
      casing: 'snake_case',
    });
    // @ts-expect-error Unsaf assignment
    this.dialect = noopDatabase.dialect;
  }

  private getUrl(method: 'live' | 'db', query?: QueryWithTypings): string {
    const url = new URL(this.baseUrl);

    url.pathname = `${url.pathname}/${method}`;
    if (query) {
      url.searchParams.set('sql', this.superjson.stringify(query));
    }
    return url.toString();
  }

  get database(): ClientDb<any> {
    return this.db;
  }

  compileQuery(query: SQLWrapper): { sql: string; params: any[] } {
    return this.dialect.sqlToQuery(query.getSQL());
  }

  live<TResult>(
    queryFn: (db: ClientDb<any>) => Promise<TResult>,
    onData: (result: TResult) => void,
    onError?: (error: Error) => void,
  ): LiveSubscription {
    if (this.sse === undefined) {
      this.sse = new EventSource(this.getUrl('live'));
      this.logger.log('SSE connection established for live updates');
    }

    const onDataListener = async (_event: MessageEvent) => {
      try {
        const result = await queryFn(this.db);
        onData(result);
      } catch (error) {
        this.logger.error('Live query failed:', error);
        onError?.(error as Error);
      }
    };

    const onErrorListener = (_event: MessageEvent) => {
      this.logger.error('SSE connection error');
      onError?.(new Error('Server disconnected'));
    };

    this.sse?.addEventListener('message', onDataListener);
    this.sse?.addEventListener('error', onErrorListener);
    this.liveCount += 1;

    this.logger.log(`Live subscription added (total: ${this.liveCount})`);

    return {
      unsubscribe: () => {
        this.sse?.removeEventListener('message', onDataListener);
        this.sse?.removeEventListener('error', onErrorListener);

        this.liveCount -= 1;

        this.logger.log(
          `Live subscription removed (remaining: ${this.liveCount})`,
        );

        if (this.liveCount === 0) {
          this.sse?.close();
          this.sse = undefined;
          this.logger.log('SSE connection closed');
        }
      },
    };
  }

  async getStatus(): Promise<Status> {
    try {
      const response = await fetch(`${new URL(this.baseUrl).origin}/status`);

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.statusText}`);
      }

      const status = await response.json();
      this.logger.log('Status fetched successfully');
      return status;
    } catch (error) {
      this.logger.error('Error fetching status:', error);
      throw new Error(`Failed to fetch Ponder status: ${error.message}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.getStatus();
      return true;
    } catch (error) {
      this.logger.error('Health check failed:', error);
      return false;
    }
  }

  private cleanup(): void {
    if (this.sse) {
      this.sse.close();
      this.sse = undefined;
      this.liveCount = 0;
      this.logger.log('SSE connection closed during cleanup');
    }
  }
}
