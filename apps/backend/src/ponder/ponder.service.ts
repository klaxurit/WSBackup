import { Injectable } from '@nestjs/common';
import { Client, createClient } from '@ponder/client';

import * as schema from '../../../indexer/ponder.schema';

@Injectable()
export class PonderService {
  private ponder: Client<typeof schema>;

  constructor() {
    this.ponder = createClient(
      process.env.PONSER_API_URL || 'http://localhost:42069',
      { schema },
    );
  }

  async getPools() {
    return await this.ponder.db.select().from(schema.pools);
  }
}
