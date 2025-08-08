import { type PgRemoteDatabase } from 'drizzle-orm/pg-proxy';

export type Schema = { [name: string]: unknown };

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Status = {
  [chainName: string]: {
    id: number;
    block: { number: number; timestamp: number };
  };
};

export type ClientDb<schema extends Schema = Schema> = Prettify<
  Omit<
    PgRemoteDatabase<schema>,
    | 'insert'
    | 'update'
    | 'delete'
    | 'transaction'
    | 'refreshMaterializedView'
    | '_'
  >
>;

export type LiveSubscription = {
  unsubscribe: () => void;
};

export type BerachainMeta = {
  chainId: number;
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
  decimals: number;
  tags: string[];
  extensions?: {
    coingeckoId: string;
  };
  website: string;
  description: string;
  twitter: string;
};
