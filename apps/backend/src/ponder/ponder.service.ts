import { Injectable } from '@nestjs/common';
import { Client, createClient } from '@ponder/client';

import * as schema from '../../../indexer/ponder.schema';

@Injectable()
export class PonderService {
  private ponder: Client<typeof schema>;
  private subscriptions: Map<string, () => void>;

  constructor() {
    this.ponder = createClient(
      process.env.PONSER_API_URL || 'http://localhost:42069',
      { schema },
    );
  }

  async getPools() {
    return await this.ponder.db.select().from(schema.pools);
  }

  subscribe(
    key: string,
    schemaName: string,
    cb: (result: any[]) => void,
    errCb: (error: Error) => void,
  ) {
    if (!schema[schemaName]) {
      throw new Error(`cannot subscribe to ${schemaName} events.`);
    }

    const { unsubscribe } = this.ponder.live(
      (db) => db.select().from(schema[schemaName]),
      (result) => {
        cb(result);
      },
      (error) => {
        errCb(error);
      },
    );

    this.subscriptions.set(key, unsubscribe);
  }

  unsubscribe(key: string) {
    this.subscriptions.get(key)?.();
  }
}
