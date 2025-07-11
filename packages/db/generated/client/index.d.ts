
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Pool
 * 
 */
export type Pool = $Result.DefaultSelection<Prisma.$PoolPayload>
/**
 * Model Swap
 * 
 */
export type Swap = $Result.DefaultSelection<Prisma.$SwapPayload>
/**
 * Model IndexerState
 * 
 */
export type IndexerState = $Result.DefaultSelection<Prisma.$IndexerStatePayload>
/**
 * Model Token
 * 
 */
export type Token = $Result.DefaultSelection<Prisma.$TokenPayload>
/**
 * Model TokenStatistic
 * 
 */
export type TokenStatistic = $Result.DefaultSelection<Prisma.$TokenStatisticPayload>
/**
 * Model PoolStatistic
 * 
 */
export type PoolStatistic = $Result.DefaultSelection<Prisma.$PoolStatisticPayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Pools
 * const pools = await prisma.pool.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Pools
   * const pools = await prisma.pool.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.pool`: Exposes CRUD operations for the **Pool** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pools
    * const pools = await prisma.pool.findMany()
    * ```
    */
  get pool(): Prisma.PoolDelegate<ExtArgs>;

  /**
   * `prisma.swap`: Exposes CRUD operations for the **Swap** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Swaps
    * const swaps = await prisma.swap.findMany()
    * ```
    */
  get swap(): Prisma.SwapDelegate<ExtArgs>;

  /**
   * `prisma.indexerState`: Exposes CRUD operations for the **IndexerState** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more IndexerStates
    * const indexerStates = await prisma.indexerState.findMany()
    * ```
    */
  get indexerState(): Prisma.IndexerStateDelegate<ExtArgs>;

  /**
   * `prisma.token`: Exposes CRUD operations for the **Token** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tokens
    * const tokens = await prisma.token.findMany()
    * ```
    */
  get token(): Prisma.TokenDelegate<ExtArgs>;

  /**
   * `prisma.tokenStatistic`: Exposes CRUD operations for the **TokenStatistic** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TokenStatistics
    * const tokenStatistics = await prisma.tokenStatistic.findMany()
    * ```
    */
  get tokenStatistic(): Prisma.TokenStatisticDelegate<ExtArgs>;

  /**
   * `prisma.poolStatistic`: Exposes CRUD operations for the **PoolStatistic** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more PoolStatistics
    * const poolStatistics = await prisma.poolStatistic.findMany()
    * ```
    */
  get poolStatistic(): Prisma.PoolStatisticDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Pool: 'Pool',
    Swap: 'Swap',
    IndexerState: 'IndexerState',
    Token: 'Token',
    TokenStatistic: 'TokenStatistic',
    PoolStatistic: 'PoolStatistic'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "pool" | "swap" | "indexerState" | "token" | "tokenStatistic" | "poolStatistic"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Pool: {
        payload: Prisma.$PoolPayload<ExtArgs>
        fields: Prisma.PoolFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PoolFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PoolFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          findFirst: {
            args: Prisma.PoolFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PoolFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          findMany: {
            args: Prisma.PoolFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>[]
          }
          create: {
            args: Prisma.PoolCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          createMany: {
            args: Prisma.PoolCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PoolCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>[]
          }
          delete: {
            args: Prisma.PoolDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          update: {
            args: Prisma.PoolUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          deleteMany: {
            args: Prisma.PoolDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PoolUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PoolUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolPayload>
          }
          aggregate: {
            args: Prisma.PoolAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePool>
          }
          groupBy: {
            args: Prisma.PoolGroupByArgs<ExtArgs>
            result: $Utils.Optional<PoolGroupByOutputType>[]
          }
          count: {
            args: Prisma.PoolCountArgs<ExtArgs>
            result: $Utils.Optional<PoolCountAggregateOutputType> | number
          }
        }
      }
      Swap: {
        payload: Prisma.$SwapPayload<ExtArgs>
        fields: Prisma.SwapFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SwapFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SwapFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload>
          }
          findFirst: {
            args: Prisma.SwapFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SwapFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload>
          }
          findMany: {
            args: Prisma.SwapFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload>[]
          }
          create: {
            args: Prisma.SwapCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload>
          }
          createMany: {
            args: Prisma.SwapCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SwapCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload>[]
          }
          delete: {
            args: Prisma.SwapDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload>
          }
          update: {
            args: Prisma.SwapUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload>
          }
          deleteMany: {
            args: Prisma.SwapDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SwapUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SwapUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SwapPayload>
          }
          aggregate: {
            args: Prisma.SwapAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSwap>
          }
          groupBy: {
            args: Prisma.SwapGroupByArgs<ExtArgs>
            result: $Utils.Optional<SwapGroupByOutputType>[]
          }
          count: {
            args: Prisma.SwapCountArgs<ExtArgs>
            result: $Utils.Optional<SwapCountAggregateOutputType> | number
          }
        }
      }
      IndexerState: {
        payload: Prisma.$IndexerStatePayload<ExtArgs>
        fields: Prisma.IndexerStateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.IndexerStateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.IndexerStateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload>
          }
          findFirst: {
            args: Prisma.IndexerStateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.IndexerStateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload>
          }
          findMany: {
            args: Prisma.IndexerStateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload>[]
          }
          create: {
            args: Prisma.IndexerStateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload>
          }
          createMany: {
            args: Prisma.IndexerStateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.IndexerStateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload>[]
          }
          delete: {
            args: Prisma.IndexerStateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload>
          }
          update: {
            args: Prisma.IndexerStateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload>
          }
          deleteMany: {
            args: Prisma.IndexerStateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.IndexerStateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.IndexerStateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$IndexerStatePayload>
          }
          aggregate: {
            args: Prisma.IndexerStateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateIndexerState>
          }
          groupBy: {
            args: Prisma.IndexerStateGroupByArgs<ExtArgs>
            result: $Utils.Optional<IndexerStateGroupByOutputType>[]
          }
          count: {
            args: Prisma.IndexerStateCountArgs<ExtArgs>
            result: $Utils.Optional<IndexerStateCountAggregateOutputType> | number
          }
        }
      }
      Token: {
        payload: Prisma.$TokenPayload<ExtArgs>
        fields: Prisma.TokenFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TokenFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TokenFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload>
          }
          findFirst: {
            args: Prisma.TokenFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TokenFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload>
          }
          findMany: {
            args: Prisma.TokenFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload>[]
          }
          create: {
            args: Prisma.TokenCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload>
          }
          createMany: {
            args: Prisma.TokenCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TokenCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload>[]
          }
          delete: {
            args: Prisma.TokenDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload>
          }
          update: {
            args: Prisma.TokenUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload>
          }
          deleteMany: {
            args: Prisma.TokenDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TokenUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TokenUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPayload>
          }
          aggregate: {
            args: Prisma.TokenAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateToken>
          }
          groupBy: {
            args: Prisma.TokenGroupByArgs<ExtArgs>
            result: $Utils.Optional<TokenGroupByOutputType>[]
          }
          count: {
            args: Prisma.TokenCountArgs<ExtArgs>
            result: $Utils.Optional<TokenCountAggregateOutputType> | number
          }
        }
      }
      TokenStatistic: {
        payload: Prisma.$TokenStatisticPayload<ExtArgs>
        fields: Prisma.TokenStatisticFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TokenStatisticFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TokenStatisticFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload>
          }
          findFirst: {
            args: Prisma.TokenStatisticFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TokenStatisticFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload>
          }
          findMany: {
            args: Prisma.TokenStatisticFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload>[]
          }
          create: {
            args: Prisma.TokenStatisticCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload>
          }
          createMany: {
            args: Prisma.TokenStatisticCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TokenStatisticCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload>[]
          }
          delete: {
            args: Prisma.TokenStatisticDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload>
          }
          update: {
            args: Prisma.TokenStatisticUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload>
          }
          deleteMany: {
            args: Prisma.TokenStatisticDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TokenStatisticUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TokenStatisticUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenStatisticPayload>
          }
          aggregate: {
            args: Prisma.TokenStatisticAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTokenStatistic>
          }
          groupBy: {
            args: Prisma.TokenStatisticGroupByArgs<ExtArgs>
            result: $Utils.Optional<TokenStatisticGroupByOutputType>[]
          }
          count: {
            args: Prisma.TokenStatisticCountArgs<ExtArgs>
            result: $Utils.Optional<TokenStatisticCountAggregateOutputType> | number
          }
        }
      }
      PoolStatistic: {
        payload: Prisma.$PoolStatisticPayload<ExtArgs>
        fields: Prisma.PoolStatisticFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PoolStatisticFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PoolStatisticFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload>
          }
          findFirst: {
            args: Prisma.PoolStatisticFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PoolStatisticFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload>
          }
          findMany: {
            args: Prisma.PoolStatisticFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload>[]
          }
          create: {
            args: Prisma.PoolStatisticCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload>
          }
          createMany: {
            args: Prisma.PoolStatisticCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PoolStatisticCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload>[]
          }
          delete: {
            args: Prisma.PoolStatisticDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload>
          }
          update: {
            args: Prisma.PoolStatisticUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload>
          }
          deleteMany: {
            args: Prisma.PoolStatisticDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PoolStatisticUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.PoolStatisticUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PoolStatisticPayload>
          }
          aggregate: {
            args: Prisma.PoolStatisticAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePoolStatistic>
          }
          groupBy: {
            args: Prisma.PoolStatisticGroupByArgs<ExtArgs>
            result: $Utils.Optional<PoolStatisticGroupByOutputType>[]
          }
          count: {
            args: Prisma.PoolStatisticCountArgs<ExtArgs>
            result: $Utils.Optional<PoolStatisticCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type PoolCountOutputType
   */

  export type PoolCountOutputType = {
    swaps: number
    PoolStatistic: number
  }

  export type PoolCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    swaps?: boolean | PoolCountOutputTypeCountSwapsArgs
    PoolStatistic?: boolean | PoolCountOutputTypeCountPoolStatisticArgs
  }

  // Custom InputTypes
  /**
   * PoolCountOutputType without action
   */
  export type PoolCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolCountOutputType
     */
    select?: PoolCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * PoolCountOutputType without action
   */
  export type PoolCountOutputTypeCountSwapsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SwapWhereInput
  }

  /**
   * PoolCountOutputType without action
   */
  export type PoolCountOutputTypeCountPoolStatisticArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PoolStatisticWhereInput
  }


  /**
   * Count Type TokenCountOutputType
   */

  export type TokenCountOutputType = {
    poolsAsToken0: number
    poolsAsToken1: number
    Statistic: number
  }

  export type TokenCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    poolsAsToken0?: boolean | TokenCountOutputTypeCountPoolsAsToken0Args
    poolsAsToken1?: boolean | TokenCountOutputTypeCountPoolsAsToken1Args
    Statistic?: boolean | TokenCountOutputTypeCountStatisticArgs
  }

  // Custom InputTypes
  /**
   * TokenCountOutputType without action
   */
  export type TokenCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenCountOutputType
     */
    select?: TokenCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TokenCountOutputType without action
   */
  export type TokenCountOutputTypeCountPoolsAsToken0Args<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PoolWhereInput
  }

  /**
   * TokenCountOutputType without action
   */
  export type TokenCountOutputTypeCountPoolsAsToken1Args<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PoolWhereInput
  }

  /**
   * TokenCountOutputType without action
   */
  export type TokenCountOutputTypeCountStatisticArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TokenStatisticWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Pool
   */

  export type AggregatePool = {
    _count: PoolCountAggregateOutputType | null
    _avg: PoolAvgAggregateOutputType | null
    _sum: PoolSumAggregateOutputType | null
    _min: PoolMinAggregateOutputType | null
    _max: PoolMaxAggregateOutputType | null
  }

  export type PoolAvgAggregateOutputType = {
    fee: number | null
    tick: number | null
  }

  export type PoolSumAggregateOutputType = {
    fee: number | null
    tick: number | null
  }

  export type PoolMinAggregateOutputType = {
    id: string | null
    address: string | null
    token0Id: string | null
    token1Id: string | null
    fee: number | null
    liquidity: string | null
    tick: number | null
    sqrtPriceX96: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PoolMaxAggregateOutputType = {
    id: string | null
    address: string | null
    token0Id: string | null
    token1Id: string | null
    fee: number | null
    liquidity: string | null
    tick: number | null
    sqrtPriceX96: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PoolCountAggregateOutputType = {
    id: number
    address: number
    token0Id: number
    token1Id: number
    fee: number
    liquidity: number
    tick: number
    sqrtPriceX96: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PoolAvgAggregateInputType = {
    fee?: true
    tick?: true
  }

  export type PoolSumAggregateInputType = {
    fee?: true
    tick?: true
  }

  export type PoolMinAggregateInputType = {
    id?: true
    address?: true
    token0Id?: true
    token1Id?: true
    fee?: true
    liquidity?: true
    tick?: true
    sqrtPriceX96?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PoolMaxAggregateInputType = {
    id?: true
    address?: true
    token0Id?: true
    token1Id?: true
    fee?: true
    liquidity?: true
    tick?: true
    sqrtPriceX96?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PoolCountAggregateInputType = {
    id?: true
    address?: true
    token0Id?: true
    token1Id?: true
    fee?: true
    liquidity?: true
    tick?: true
    sqrtPriceX96?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PoolAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pool to aggregate.
     */
    where?: PoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pools to fetch.
     */
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Pools
    **/
    _count?: true | PoolCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PoolAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PoolSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PoolMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PoolMaxAggregateInputType
  }

  export type GetPoolAggregateType<T extends PoolAggregateArgs> = {
        [P in keyof T & keyof AggregatePool]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePool[P]>
      : GetScalarType<T[P], AggregatePool[P]>
  }




  export type PoolGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PoolWhereInput
    orderBy?: PoolOrderByWithAggregationInput | PoolOrderByWithAggregationInput[]
    by: PoolScalarFieldEnum[] | PoolScalarFieldEnum
    having?: PoolScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PoolCountAggregateInputType | true
    _avg?: PoolAvgAggregateInputType
    _sum?: PoolSumAggregateInputType
    _min?: PoolMinAggregateInputType
    _max?: PoolMaxAggregateInputType
  }

  export type PoolGroupByOutputType = {
    id: string
    address: string
    token0Id: string
    token1Id: string
    fee: number
    liquidity: string | null
    tick: number | null
    sqrtPriceX96: string | null
    createdAt: Date
    updatedAt: Date
    _count: PoolCountAggregateOutputType | null
    _avg: PoolAvgAggregateOutputType | null
    _sum: PoolSumAggregateOutputType | null
    _min: PoolMinAggregateOutputType | null
    _max: PoolMaxAggregateOutputType | null
  }

  type GetPoolGroupByPayload<T extends PoolGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PoolGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PoolGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PoolGroupByOutputType[P]>
            : GetScalarType<T[P], PoolGroupByOutputType[P]>
        }
      >
    >


  export type PoolSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    token0Id?: boolean
    token1Id?: boolean
    fee?: boolean
    liquidity?: boolean
    tick?: boolean
    sqrtPriceX96?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    token0?: boolean | TokenDefaultArgs<ExtArgs>
    token1?: boolean | TokenDefaultArgs<ExtArgs>
    swaps?: boolean | Pool$swapsArgs<ExtArgs>
    PoolStatistic?: boolean | Pool$PoolStatisticArgs<ExtArgs>
    _count?: boolean | PoolCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pool"]>

  export type PoolSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    token0Id?: boolean
    token1Id?: boolean
    fee?: boolean
    liquidity?: boolean
    tick?: boolean
    sqrtPriceX96?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    token0?: boolean | TokenDefaultArgs<ExtArgs>
    token1?: boolean | TokenDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["pool"]>

  export type PoolSelectScalar = {
    id?: boolean
    address?: boolean
    token0Id?: boolean
    token1Id?: boolean
    fee?: boolean
    liquidity?: boolean
    tick?: boolean
    sqrtPriceX96?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type PoolInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    token0?: boolean | TokenDefaultArgs<ExtArgs>
    token1?: boolean | TokenDefaultArgs<ExtArgs>
    swaps?: boolean | Pool$swapsArgs<ExtArgs>
    PoolStatistic?: boolean | Pool$PoolStatisticArgs<ExtArgs>
    _count?: boolean | PoolCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type PoolIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    token0?: boolean | TokenDefaultArgs<ExtArgs>
    token1?: boolean | TokenDefaultArgs<ExtArgs>
  }

  export type $PoolPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Pool"
    objects: {
      token0: Prisma.$TokenPayload<ExtArgs>
      token1: Prisma.$TokenPayload<ExtArgs>
      swaps: Prisma.$SwapPayload<ExtArgs>[]
      PoolStatistic: Prisma.$PoolStatisticPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      address: string
      token0Id: string
      token1Id: string
      fee: number
      liquidity: string | null
      tick: number | null
      sqrtPriceX96: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["pool"]>
    composites: {}
  }

  type PoolGetPayload<S extends boolean | null | undefined | PoolDefaultArgs> = $Result.GetResult<Prisma.$PoolPayload, S>

  type PoolCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PoolFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PoolCountAggregateInputType | true
    }

  export interface PoolDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Pool'], meta: { name: 'Pool' } }
    /**
     * Find zero or one Pool that matches the filter.
     * @param {PoolFindUniqueArgs} args - Arguments to find a Pool
     * @example
     * // Get one Pool
     * const pool = await prisma.pool.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PoolFindUniqueArgs>(args: SelectSubset<T, PoolFindUniqueArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Pool that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PoolFindUniqueOrThrowArgs} args - Arguments to find a Pool
     * @example
     * // Get one Pool
     * const pool = await prisma.pool.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PoolFindUniqueOrThrowArgs>(args: SelectSubset<T, PoolFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Pool that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolFindFirstArgs} args - Arguments to find a Pool
     * @example
     * // Get one Pool
     * const pool = await prisma.pool.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PoolFindFirstArgs>(args?: SelectSubset<T, PoolFindFirstArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Pool that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolFindFirstOrThrowArgs} args - Arguments to find a Pool
     * @example
     * // Get one Pool
     * const pool = await prisma.pool.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PoolFindFirstOrThrowArgs>(args?: SelectSubset<T, PoolFindFirstOrThrowArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Pools that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pools
     * const pools = await prisma.pool.findMany()
     * 
     * // Get first 10 Pools
     * const pools = await prisma.pool.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const poolWithIdOnly = await prisma.pool.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PoolFindManyArgs>(args?: SelectSubset<T, PoolFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Pool.
     * @param {PoolCreateArgs} args - Arguments to create a Pool.
     * @example
     * // Create one Pool
     * const Pool = await prisma.pool.create({
     *   data: {
     *     // ... data to create a Pool
     *   }
     * })
     * 
     */
    create<T extends PoolCreateArgs>(args: SelectSubset<T, PoolCreateArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Pools.
     * @param {PoolCreateManyArgs} args - Arguments to create many Pools.
     * @example
     * // Create many Pools
     * const pool = await prisma.pool.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PoolCreateManyArgs>(args?: SelectSubset<T, PoolCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pools and returns the data saved in the database.
     * @param {PoolCreateManyAndReturnArgs} args - Arguments to create many Pools.
     * @example
     * // Create many Pools
     * const pool = await prisma.pool.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pools and only return the `id`
     * const poolWithIdOnly = await prisma.pool.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PoolCreateManyAndReturnArgs>(args?: SelectSubset<T, PoolCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Pool.
     * @param {PoolDeleteArgs} args - Arguments to delete one Pool.
     * @example
     * // Delete one Pool
     * const Pool = await prisma.pool.delete({
     *   where: {
     *     // ... filter to delete one Pool
     *   }
     * })
     * 
     */
    delete<T extends PoolDeleteArgs>(args: SelectSubset<T, PoolDeleteArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Pool.
     * @param {PoolUpdateArgs} args - Arguments to update one Pool.
     * @example
     * // Update one Pool
     * const pool = await prisma.pool.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PoolUpdateArgs>(args: SelectSubset<T, PoolUpdateArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Pools.
     * @param {PoolDeleteManyArgs} args - Arguments to filter Pools to delete.
     * @example
     * // Delete a few Pools
     * const { count } = await prisma.pool.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PoolDeleteManyArgs>(args?: SelectSubset<T, PoolDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pools.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pools
     * const pool = await prisma.pool.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PoolUpdateManyArgs>(args: SelectSubset<T, PoolUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Pool.
     * @param {PoolUpsertArgs} args - Arguments to update or create a Pool.
     * @example
     * // Update or create a Pool
     * const pool = await prisma.pool.upsert({
     *   create: {
     *     // ... data to create a Pool
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pool we want to update
     *   }
     * })
     */
    upsert<T extends PoolUpsertArgs>(args: SelectSubset<T, PoolUpsertArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Pools.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolCountArgs} args - Arguments to filter Pools to count.
     * @example
     * // Count the number of Pools
     * const count = await prisma.pool.count({
     *   where: {
     *     // ... the filter for the Pools we want to count
     *   }
     * })
    **/
    count<T extends PoolCountArgs>(
      args?: Subset<T, PoolCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PoolCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Pool.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PoolAggregateArgs>(args: Subset<T, PoolAggregateArgs>): Prisma.PrismaPromise<GetPoolAggregateType<T>>

    /**
     * Group by Pool.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PoolGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PoolGroupByArgs['orderBy'] }
        : { orderBy?: PoolGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PoolGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPoolGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Pool model
   */
  readonly fields: PoolFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Pool.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PoolClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    token0<T extends TokenDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TokenDefaultArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    token1<T extends TokenDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TokenDefaultArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    swaps<T extends Pool$swapsArgs<ExtArgs> = {}>(args?: Subset<T, Pool$swapsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "findMany"> | Null>
    PoolStatistic<T extends Pool$PoolStatisticArgs<ExtArgs> = {}>(args?: Subset<T, Pool$PoolStatisticArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Pool model
   */ 
  interface PoolFieldRefs {
    readonly id: FieldRef<"Pool", 'String'>
    readonly address: FieldRef<"Pool", 'String'>
    readonly token0Id: FieldRef<"Pool", 'String'>
    readonly token1Id: FieldRef<"Pool", 'String'>
    readonly fee: FieldRef<"Pool", 'Int'>
    readonly liquidity: FieldRef<"Pool", 'String'>
    readonly tick: FieldRef<"Pool", 'Int'>
    readonly sqrtPriceX96: FieldRef<"Pool", 'String'>
    readonly createdAt: FieldRef<"Pool", 'DateTime'>
    readonly updatedAt: FieldRef<"Pool", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Pool findUnique
   */
  export type PoolFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pool to fetch.
     */
    where: PoolWhereUniqueInput
  }

  /**
   * Pool findUniqueOrThrow
   */
  export type PoolFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pool to fetch.
     */
    where: PoolWhereUniqueInput
  }

  /**
   * Pool findFirst
   */
  export type PoolFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pool to fetch.
     */
    where?: PoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pools to fetch.
     */
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pools.
     */
    cursor?: PoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pools.
     */
    distinct?: PoolScalarFieldEnum | PoolScalarFieldEnum[]
  }

  /**
   * Pool findFirstOrThrow
   */
  export type PoolFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pool to fetch.
     */
    where?: PoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pools to fetch.
     */
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pools.
     */
    cursor?: PoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pools.
     */
    distinct?: PoolScalarFieldEnum | PoolScalarFieldEnum[]
  }

  /**
   * Pool findMany
   */
  export type PoolFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter, which Pools to fetch.
     */
    where?: PoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pools to fetch.
     */
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Pools.
     */
    cursor?: PoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pools.
     */
    skip?: number
    distinct?: PoolScalarFieldEnum | PoolScalarFieldEnum[]
  }

  /**
   * Pool create
   */
  export type PoolCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * The data needed to create a Pool.
     */
    data: XOR<PoolCreateInput, PoolUncheckedCreateInput>
  }

  /**
   * Pool createMany
   */
  export type PoolCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pools.
     */
    data: PoolCreateManyInput | PoolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Pool createManyAndReturn
   */
  export type PoolCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Pools.
     */
    data: PoolCreateManyInput | PoolCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Pool update
   */
  export type PoolUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * The data needed to update a Pool.
     */
    data: XOR<PoolUpdateInput, PoolUncheckedUpdateInput>
    /**
     * Choose, which Pool to update.
     */
    where: PoolWhereUniqueInput
  }

  /**
   * Pool updateMany
   */
  export type PoolUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Pools.
     */
    data: XOR<PoolUpdateManyMutationInput, PoolUncheckedUpdateManyInput>
    /**
     * Filter which Pools to update
     */
    where?: PoolWhereInput
  }

  /**
   * Pool upsert
   */
  export type PoolUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * The filter to search for the Pool to update in case it exists.
     */
    where: PoolWhereUniqueInput
    /**
     * In case the Pool found by the `where` argument doesn't exist, create a new Pool with this data.
     */
    create: XOR<PoolCreateInput, PoolUncheckedCreateInput>
    /**
     * In case the Pool was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PoolUpdateInput, PoolUncheckedUpdateInput>
  }

  /**
   * Pool delete
   */
  export type PoolDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    /**
     * Filter which Pool to delete.
     */
    where: PoolWhereUniqueInput
  }

  /**
   * Pool deleteMany
   */
  export type PoolDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pools to delete
     */
    where?: PoolWhereInput
  }

  /**
   * Pool.swaps
   */
  export type Pool$swapsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    where?: SwapWhereInput
    orderBy?: SwapOrderByWithRelationInput | SwapOrderByWithRelationInput[]
    cursor?: SwapWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SwapScalarFieldEnum | SwapScalarFieldEnum[]
  }

  /**
   * Pool.PoolStatistic
   */
  export type Pool$PoolStatisticArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    where?: PoolStatisticWhereInput
    orderBy?: PoolStatisticOrderByWithRelationInput | PoolStatisticOrderByWithRelationInput[]
    cursor?: PoolStatisticWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PoolStatisticScalarFieldEnum | PoolStatisticScalarFieldEnum[]
  }

  /**
   * Pool without action
   */
  export type PoolDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
  }


  /**
   * Model Swap
   */

  export type AggregateSwap = {
    _count: SwapCountAggregateOutputType | null
    _avg: SwapAvgAggregateOutputType | null
    _sum: SwapSumAggregateOutputType | null
    _min: SwapMinAggregateOutputType | null
    _max: SwapMaxAggregateOutputType | null
  }

  export type SwapAvgAggregateOutputType = {
    tick: number | null
    logIndex: number | null
    gasUsed: number | null
  }

  export type SwapSumAggregateOutputType = {
    tick: number | null
    logIndex: number | null
    gasUsed: number | null
  }

  export type SwapMinAggregateOutputType = {
    id: string | null
    sender: string | null
    recipient: string | null
    amount0: string | null
    amount1: string | null
    sqrtPriceX96: string | null
    tick: number | null
    transactionHash: string | null
    logIndex: number | null
    poolAddress: string | null
    poolId: string | null
    gasUsed: number | null
    gasPrice: string | null
    createdAt: Date | null
  }

  export type SwapMaxAggregateOutputType = {
    id: string | null
    sender: string | null
    recipient: string | null
    amount0: string | null
    amount1: string | null
    sqrtPriceX96: string | null
    tick: number | null
    transactionHash: string | null
    logIndex: number | null
    poolAddress: string | null
    poolId: string | null
    gasUsed: number | null
    gasPrice: string | null
    createdAt: Date | null
  }

  export type SwapCountAggregateOutputType = {
    id: number
    sender: number
    recipient: number
    amount0: number
    amount1: number
    sqrtPriceX96: number
    tick: number
    transactionHash: number
    logIndex: number
    poolAddress: number
    poolId: number
    gasUsed: number
    gasPrice: number
    createdAt: number
    _all: number
  }


  export type SwapAvgAggregateInputType = {
    tick?: true
    logIndex?: true
    gasUsed?: true
  }

  export type SwapSumAggregateInputType = {
    tick?: true
    logIndex?: true
    gasUsed?: true
  }

  export type SwapMinAggregateInputType = {
    id?: true
    sender?: true
    recipient?: true
    amount0?: true
    amount1?: true
    sqrtPriceX96?: true
    tick?: true
    transactionHash?: true
    logIndex?: true
    poolAddress?: true
    poolId?: true
    gasUsed?: true
    gasPrice?: true
    createdAt?: true
  }

  export type SwapMaxAggregateInputType = {
    id?: true
    sender?: true
    recipient?: true
    amount0?: true
    amount1?: true
    sqrtPriceX96?: true
    tick?: true
    transactionHash?: true
    logIndex?: true
    poolAddress?: true
    poolId?: true
    gasUsed?: true
    gasPrice?: true
    createdAt?: true
  }

  export type SwapCountAggregateInputType = {
    id?: true
    sender?: true
    recipient?: true
    amount0?: true
    amount1?: true
    sqrtPriceX96?: true
    tick?: true
    transactionHash?: true
    logIndex?: true
    poolAddress?: true
    poolId?: true
    gasUsed?: true
    gasPrice?: true
    createdAt?: true
    _all?: true
  }

  export type SwapAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Swap to aggregate.
     */
    where?: SwapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Swaps to fetch.
     */
    orderBy?: SwapOrderByWithRelationInput | SwapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SwapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Swaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Swaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Swaps
    **/
    _count?: true | SwapCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SwapAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SwapSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SwapMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SwapMaxAggregateInputType
  }

  export type GetSwapAggregateType<T extends SwapAggregateArgs> = {
        [P in keyof T & keyof AggregateSwap]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSwap[P]>
      : GetScalarType<T[P], AggregateSwap[P]>
  }




  export type SwapGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SwapWhereInput
    orderBy?: SwapOrderByWithAggregationInput | SwapOrderByWithAggregationInput[]
    by: SwapScalarFieldEnum[] | SwapScalarFieldEnum
    having?: SwapScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SwapCountAggregateInputType | true
    _avg?: SwapAvgAggregateInputType
    _sum?: SwapSumAggregateInputType
    _min?: SwapMinAggregateInputType
    _max?: SwapMaxAggregateInputType
  }

  export type SwapGroupByOutputType = {
    id: string
    sender: string
    recipient: string
    amount0: string
    amount1: string
    sqrtPriceX96: string
    tick: number
    transactionHash: string
    logIndex: number
    poolAddress: string
    poolId: string
    gasUsed: number
    gasPrice: string
    createdAt: Date
    _count: SwapCountAggregateOutputType | null
    _avg: SwapAvgAggregateOutputType | null
    _sum: SwapSumAggregateOutputType | null
    _min: SwapMinAggregateOutputType | null
    _max: SwapMaxAggregateOutputType | null
  }

  type GetSwapGroupByPayload<T extends SwapGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SwapGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SwapGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SwapGroupByOutputType[P]>
            : GetScalarType<T[P], SwapGroupByOutputType[P]>
        }
      >
    >


  export type SwapSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sender?: boolean
    recipient?: boolean
    amount0?: boolean
    amount1?: boolean
    sqrtPriceX96?: boolean
    tick?: boolean
    transactionHash?: boolean
    logIndex?: boolean
    poolAddress?: boolean
    poolId?: boolean
    gasUsed?: boolean
    gasPrice?: boolean
    createdAt?: boolean
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["swap"]>

  export type SwapSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sender?: boolean
    recipient?: boolean
    amount0?: boolean
    amount1?: boolean
    sqrtPriceX96?: boolean
    tick?: boolean
    transactionHash?: boolean
    logIndex?: boolean
    poolAddress?: boolean
    poolId?: boolean
    gasUsed?: boolean
    gasPrice?: boolean
    createdAt?: boolean
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["swap"]>

  export type SwapSelectScalar = {
    id?: boolean
    sender?: boolean
    recipient?: boolean
    amount0?: boolean
    amount1?: boolean
    sqrtPriceX96?: boolean
    tick?: boolean
    transactionHash?: boolean
    logIndex?: boolean
    poolAddress?: boolean
    poolId?: boolean
    gasUsed?: boolean
    gasPrice?: boolean
    createdAt?: boolean
  }

  export type SwapInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }
  export type SwapIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }

  export type $SwapPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Swap"
    objects: {
      pool: Prisma.$PoolPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sender: string
      recipient: string
      amount0: string
      amount1: string
      sqrtPriceX96: string
      tick: number
      transactionHash: string
      logIndex: number
      poolAddress: string
      poolId: string
      gasUsed: number
      gasPrice: string
      createdAt: Date
    }, ExtArgs["result"]["swap"]>
    composites: {}
  }

  type SwapGetPayload<S extends boolean | null | undefined | SwapDefaultArgs> = $Result.GetResult<Prisma.$SwapPayload, S>

  type SwapCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SwapFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SwapCountAggregateInputType | true
    }

  export interface SwapDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Swap'], meta: { name: 'Swap' } }
    /**
     * Find zero or one Swap that matches the filter.
     * @param {SwapFindUniqueArgs} args - Arguments to find a Swap
     * @example
     * // Get one Swap
     * const swap = await prisma.swap.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SwapFindUniqueArgs>(args: SelectSubset<T, SwapFindUniqueArgs<ExtArgs>>): Prisma__SwapClient<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Swap that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SwapFindUniqueOrThrowArgs} args - Arguments to find a Swap
     * @example
     * // Get one Swap
     * const swap = await prisma.swap.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SwapFindUniqueOrThrowArgs>(args: SelectSubset<T, SwapFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SwapClient<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Swap that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SwapFindFirstArgs} args - Arguments to find a Swap
     * @example
     * // Get one Swap
     * const swap = await prisma.swap.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SwapFindFirstArgs>(args?: SelectSubset<T, SwapFindFirstArgs<ExtArgs>>): Prisma__SwapClient<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Swap that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SwapFindFirstOrThrowArgs} args - Arguments to find a Swap
     * @example
     * // Get one Swap
     * const swap = await prisma.swap.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SwapFindFirstOrThrowArgs>(args?: SelectSubset<T, SwapFindFirstOrThrowArgs<ExtArgs>>): Prisma__SwapClient<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Swaps that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SwapFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Swaps
     * const swaps = await prisma.swap.findMany()
     * 
     * // Get first 10 Swaps
     * const swaps = await prisma.swap.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const swapWithIdOnly = await prisma.swap.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SwapFindManyArgs>(args?: SelectSubset<T, SwapFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Swap.
     * @param {SwapCreateArgs} args - Arguments to create a Swap.
     * @example
     * // Create one Swap
     * const Swap = await prisma.swap.create({
     *   data: {
     *     // ... data to create a Swap
     *   }
     * })
     * 
     */
    create<T extends SwapCreateArgs>(args: SelectSubset<T, SwapCreateArgs<ExtArgs>>): Prisma__SwapClient<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Swaps.
     * @param {SwapCreateManyArgs} args - Arguments to create many Swaps.
     * @example
     * // Create many Swaps
     * const swap = await prisma.swap.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SwapCreateManyArgs>(args?: SelectSubset<T, SwapCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Swaps and returns the data saved in the database.
     * @param {SwapCreateManyAndReturnArgs} args - Arguments to create many Swaps.
     * @example
     * // Create many Swaps
     * const swap = await prisma.swap.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Swaps and only return the `id`
     * const swapWithIdOnly = await prisma.swap.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SwapCreateManyAndReturnArgs>(args?: SelectSubset<T, SwapCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Swap.
     * @param {SwapDeleteArgs} args - Arguments to delete one Swap.
     * @example
     * // Delete one Swap
     * const Swap = await prisma.swap.delete({
     *   where: {
     *     // ... filter to delete one Swap
     *   }
     * })
     * 
     */
    delete<T extends SwapDeleteArgs>(args: SelectSubset<T, SwapDeleteArgs<ExtArgs>>): Prisma__SwapClient<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Swap.
     * @param {SwapUpdateArgs} args - Arguments to update one Swap.
     * @example
     * // Update one Swap
     * const swap = await prisma.swap.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SwapUpdateArgs>(args: SelectSubset<T, SwapUpdateArgs<ExtArgs>>): Prisma__SwapClient<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Swaps.
     * @param {SwapDeleteManyArgs} args - Arguments to filter Swaps to delete.
     * @example
     * // Delete a few Swaps
     * const { count } = await prisma.swap.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SwapDeleteManyArgs>(args?: SelectSubset<T, SwapDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Swaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SwapUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Swaps
     * const swap = await prisma.swap.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SwapUpdateManyArgs>(args: SelectSubset<T, SwapUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Swap.
     * @param {SwapUpsertArgs} args - Arguments to update or create a Swap.
     * @example
     * // Update or create a Swap
     * const swap = await prisma.swap.upsert({
     *   create: {
     *     // ... data to create a Swap
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Swap we want to update
     *   }
     * })
     */
    upsert<T extends SwapUpsertArgs>(args: SelectSubset<T, SwapUpsertArgs<ExtArgs>>): Prisma__SwapClient<$Result.GetResult<Prisma.$SwapPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Swaps.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SwapCountArgs} args - Arguments to filter Swaps to count.
     * @example
     * // Count the number of Swaps
     * const count = await prisma.swap.count({
     *   where: {
     *     // ... the filter for the Swaps we want to count
     *   }
     * })
    **/
    count<T extends SwapCountArgs>(
      args?: Subset<T, SwapCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SwapCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Swap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SwapAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SwapAggregateArgs>(args: Subset<T, SwapAggregateArgs>): Prisma.PrismaPromise<GetSwapAggregateType<T>>

    /**
     * Group by Swap.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SwapGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SwapGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SwapGroupByArgs['orderBy'] }
        : { orderBy?: SwapGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SwapGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSwapGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Swap model
   */
  readonly fields: SwapFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Swap.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SwapClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pool<T extends PoolDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PoolDefaultArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Swap model
   */ 
  interface SwapFieldRefs {
    readonly id: FieldRef<"Swap", 'String'>
    readonly sender: FieldRef<"Swap", 'String'>
    readonly recipient: FieldRef<"Swap", 'String'>
    readonly amount0: FieldRef<"Swap", 'String'>
    readonly amount1: FieldRef<"Swap", 'String'>
    readonly sqrtPriceX96: FieldRef<"Swap", 'String'>
    readonly tick: FieldRef<"Swap", 'Int'>
    readonly transactionHash: FieldRef<"Swap", 'String'>
    readonly logIndex: FieldRef<"Swap", 'Int'>
    readonly poolAddress: FieldRef<"Swap", 'String'>
    readonly poolId: FieldRef<"Swap", 'String'>
    readonly gasUsed: FieldRef<"Swap", 'Int'>
    readonly gasPrice: FieldRef<"Swap", 'String'>
    readonly createdAt: FieldRef<"Swap", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Swap findUnique
   */
  export type SwapFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    /**
     * Filter, which Swap to fetch.
     */
    where: SwapWhereUniqueInput
  }

  /**
   * Swap findUniqueOrThrow
   */
  export type SwapFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    /**
     * Filter, which Swap to fetch.
     */
    where: SwapWhereUniqueInput
  }

  /**
   * Swap findFirst
   */
  export type SwapFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    /**
     * Filter, which Swap to fetch.
     */
    where?: SwapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Swaps to fetch.
     */
    orderBy?: SwapOrderByWithRelationInput | SwapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Swaps.
     */
    cursor?: SwapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Swaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Swaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Swaps.
     */
    distinct?: SwapScalarFieldEnum | SwapScalarFieldEnum[]
  }

  /**
   * Swap findFirstOrThrow
   */
  export type SwapFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    /**
     * Filter, which Swap to fetch.
     */
    where?: SwapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Swaps to fetch.
     */
    orderBy?: SwapOrderByWithRelationInput | SwapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Swaps.
     */
    cursor?: SwapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Swaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Swaps.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Swaps.
     */
    distinct?: SwapScalarFieldEnum | SwapScalarFieldEnum[]
  }

  /**
   * Swap findMany
   */
  export type SwapFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    /**
     * Filter, which Swaps to fetch.
     */
    where?: SwapWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Swaps to fetch.
     */
    orderBy?: SwapOrderByWithRelationInput | SwapOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Swaps.
     */
    cursor?: SwapWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Swaps from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Swaps.
     */
    skip?: number
    distinct?: SwapScalarFieldEnum | SwapScalarFieldEnum[]
  }

  /**
   * Swap create
   */
  export type SwapCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    /**
     * The data needed to create a Swap.
     */
    data: XOR<SwapCreateInput, SwapUncheckedCreateInput>
  }

  /**
   * Swap createMany
   */
  export type SwapCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Swaps.
     */
    data: SwapCreateManyInput | SwapCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Swap createManyAndReturn
   */
  export type SwapCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Swaps.
     */
    data: SwapCreateManyInput | SwapCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Swap update
   */
  export type SwapUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    /**
     * The data needed to update a Swap.
     */
    data: XOR<SwapUpdateInput, SwapUncheckedUpdateInput>
    /**
     * Choose, which Swap to update.
     */
    where: SwapWhereUniqueInput
  }

  /**
   * Swap updateMany
   */
  export type SwapUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Swaps.
     */
    data: XOR<SwapUpdateManyMutationInput, SwapUncheckedUpdateManyInput>
    /**
     * Filter which Swaps to update
     */
    where?: SwapWhereInput
  }

  /**
   * Swap upsert
   */
  export type SwapUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    /**
     * The filter to search for the Swap to update in case it exists.
     */
    where: SwapWhereUniqueInput
    /**
     * In case the Swap found by the `where` argument doesn't exist, create a new Swap with this data.
     */
    create: XOR<SwapCreateInput, SwapUncheckedCreateInput>
    /**
     * In case the Swap was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SwapUpdateInput, SwapUncheckedUpdateInput>
  }

  /**
   * Swap delete
   */
  export type SwapDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
    /**
     * Filter which Swap to delete.
     */
    where: SwapWhereUniqueInput
  }

  /**
   * Swap deleteMany
   */
  export type SwapDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Swaps to delete
     */
    where?: SwapWhereInput
  }

  /**
   * Swap without action
   */
  export type SwapDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Swap
     */
    select?: SwapSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SwapInclude<ExtArgs> | null
  }


  /**
   * Model IndexerState
   */

  export type AggregateIndexerState = {
    _count: IndexerStateCountAggregateOutputType | null
    _avg: IndexerStateAvgAggregateOutputType | null
    _sum: IndexerStateSumAggregateOutputType | null
    _min: IndexerStateMinAggregateOutputType | null
    _max: IndexerStateMaxAggregateOutputType | null
  }

  export type IndexerStateAvgAggregateOutputType = {
    lastBlock: number | null
  }

  export type IndexerStateSumAggregateOutputType = {
    lastBlock: bigint | null
  }

  export type IndexerStateMinAggregateOutputType = {
    id: string | null
    lastBlock: bigint | null
    lastUpdate: Date | null
  }

  export type IndexerStateMaxAggregateOutputType = {
    id: string | null
    lastBlock: bigint | null
    lastUpdate: Date | null
  }

  export type IndexerStateCountAggregateOutputType = {
    id: number
    lastBlock: number
    lastUpdate: number
    _all: number
  }


  export type IndexerStateAvgAggregateInputType = {
    lastBlock?: true
  }

  export type IndexerStateSumAggregateInputType = {
    lastBlock?: true
  }

  export type IndexerStateMinAggregateInputType = {
    id?: true
    lastBlock?: true
    lastUpdate?: true
  }

  export type IndexerStateMaxAggregateInputType = {
    id?: true
    lastBlock?: true
    lastUpdate?: true
  }

  export type IndexerStateCountAggregateInputType = {
    id?: true
    lastBlock?: true
    lastUpdate?: true
    _all?: true
  }

  export type IndexerStateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IndexerState to aggregate.
     */
    where?: IndexerStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IndexerStates to fetch.
     */
    orderBy?: IndexerStateOrderByWithRelationInput | IndexerStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: IndexerStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IndexerStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IndexerStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned IndexerStates
    **/
    _count?: true | IndexerStateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: IndexerStateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: IndexerStateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: IndexerStateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: IndexerStateMaxAggregateInputType
  }

  export type GetIndexerStateAggregateType<T extends IndexerStateAggregateArgs> = {
        [P in keyof T & keyof AggregateIndexerState]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateIndexerState[P]>
      : GetScalarType<T[P], AggregateIndexerState[P]>
  }




  export type IndexerStateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: IndexerStateWhereInput
    orderBy?: IndexerStateOrderByWithAggregationInput | IndexerStateOrderByWithAggregationInput[]
    by: IndexerStateScalarFieldEnum[] | IndexerStateScalarFieldEnum
    having?: IndexerStateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: IndexerStateCountAggregateInputType | true
    _avg?: IndexerStateAvgAggregateInputType
    _sum?: IndexerStateSumAggregateInputType
    _min?: IndexerStateMinAggregateInputType
    _max?: IndexerStateMaxAggregateInputType
  }

  export type IndexerStateGroupByOutputType = {
    id: string
    lastBlock: bigint
    lastUpdate: Date
    _count: IndexerStateCountAggregateOutputType | null
    _avg: IndexerStateAvgAggregateOutputType | null
    _sum: IndexerStateSumAggregateOutputType | null
    _min: IndexerStateMinAggregateOutputType | null
    _max: IndexerStateMaxAggregateOutputType | null
  }

  type GetIndexerStateGroupByPayload<T extends IndexerStateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<IndexerStateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof IndexerStateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], IndexerStateGroupByOutputType[P]>
            : GetScalarType<T[P], IndexerStateGroupByOutputType[P]>
        }
      >
    >


  export type IndexerStateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lastBlock?: boolean
    lastUpdate?: boolean
  }, ExtArgs["result"]["indexerState"]>

  export type IndexerStateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    lastBlock?: boolean
    lastUpdate?: boolean
  }, ExtArgs["result"]["indexerState"]>

  export type IndexerStateSelectScalar = {
    id?: boolean
    lastBlock?: boolean
    lastUpdate?: boolean
  }


  export type $IndexerStatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "IndexerState"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      lastBlock: bigint
      lastUpdate: Date
    }, ExtArgs["result"]["indexerState"]>
    composites: {}
  }

  type IndexerStateGetPayload<S extends boolean | null | undefined | IndexerStateDefaultArgs> = $Result.GetResult<Prisma.$IndexerStatePayload, S>

  type IndexerStateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<IndexerStateFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: IndexerStateCountAggregateInputType | true
    }

  export interface IndexerStateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['IndexerState'], meta: { name: 'IndexerState' } }
    /**
     * Find zero or one IndexerState that matches the filter.
     * @param {IndexerStateFindUniqueArgs} args - Arguments to find a IndexerState
     * @example
     * // Get one IndexerState
     * const indexerState = await prisma.indexerState.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends IndexerStateFindUniqueArgs>(args: SelectSubset<T, IndexerStateFindUniqueArgs<ExtArgs>>): Prisma__IndexerStateClient<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one IndexerState that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {IndexerStateFindUniqueOrThrowArgs} args - Arguments to find a IndexerState
     * @example
     * // Get one IndexerState
     * const indexerState = await prisma.indexerState.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends IndexerStateFindUniqueOrThrowArgs>(args: SelectSubset<T, IndexerStateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__IndexerStateClient<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first IndexerState that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerStateFindFirstArgs} args - Arguments to find a IndexerState
     * @example
     * // Get one IndexerState
     * const indexerState = await prisma.indexerState.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends IndexerStateFindFirstArgs>(args?: SelectSubset<T, IndexerStateFindFirstArgs<ExtArgs>>): Prisma__IndexerStateClient<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first IndexerState that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerStateFindFirstOrThrowArgs} args - Arguments to find a IndexerState
     * @example
     * // Get one IndexerState
     * const indexerState = await prisma.indexerState.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends IndexerStateFindFirstOrThrowArgs>(args?: SelectSubset<T, IndexerStateFindFirstOrThrowArgs<ExtArgs>>): Prisma__IndexerStateClient<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more IndexerStates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerStateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all IndexerStates
     * const indexerStates = await prisma.indexerState.findMany()
     * 
     * // Get first 10 IndexerStates
     * const indexerStates = await prisma.indexerState.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const indexerStateWithIdOnly = await prisma.indexerState.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends IndexerStateFindManyArgs>(args?: SelectSubset<T, IndexerStateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a IndexerState.
     * @param {IndexerStateCreateArgs} args - Arguments to create a IndexerState.
     * @example
     * // Create one IndexerState
     * const IndexerState = await prisma.indexerState.create({
     *   data: {
     *     // ... data to create a IndexerState
     *   }
     * })
     * 
     */
    create<T extends IndexerStateCreateArgs>(args: SelectSubset<T, IndexerStateCreateArgs<ExtArgs>>): Prisma__IndexerStateClient<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many IndexerStates.
     * @param {IndexerStateCreateManyArgs} args - Arguments to create many IndexerStates.
     * @example
     * // Create many IndexerStates
     * const indexerState = await prisma.indexerState.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends IndexerStateCreateManyArgs>(args?: SelectSubset<T, IndexerStateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many IndexerStates and returns the data saved in the database.
     * @param {IndexerStateCreateManyAndReturnArgs} args - Arguments to create many IndexerStates.
     * @example
     * // Create many IndexerStates
     * const indexerState = await prisma.indexerState.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many IndexerStates and only return the `id`
     * const indexerStateWithIdOnly = await prisma.indexerState.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends IndexerStateCreateManyAndReturnArgs>(args?: SelectSubset<T, IndexerStateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a IndexerState.
     * @param {IndexerStateDeleteArgs} args - Arguments to delete one IndexerState.
     * @example
     * // Delete one IndexerState
     * const IndexerState = await prisma.indexerState.delete({
     *   where: {
     *     // ... filter to delete one IndexerState
     *   }
     * })
     * 
     */
    delete<T extends IndexerStateDeleteArgs>(args: SelectSubset<T, IndexerStateDeleteArgs<ExtArgs>>): Prisma__IndexerStateClient<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one IndexerState.
     * @param {IndexerStateUpdateArgs} args - Arguments to update one IndexerState.
     * @example
     * // Update one IndexerState
     * const indexerState = await prisma.indexerState.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends IndexerStateUpdateArgs>(args: SelectSubset<T, IndexerStateUpdateArgs<ExtArgs>>): Prisma__IndexerStateClient<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more IndexerStates.
     * @param {IndexerStateDeleteManyArgs} args - Arguments to filter IndexerStates to delete.
     * @example
     * // Delete a few IndexerStates
     * const { count } = await prisma.indexerState.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends IndexerStateDeleteManyArgs>(args?: SelectSubset<T, IndexerStateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more IndexerStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerStateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many IndexerStates
     * const indexerState = await prisma.indexerState.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends IndexerStateUpdateManyArgs>(args: SelectSubset<T, IndexerStateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one IndexerState.
     * @param {IndexerStateUpsertArgs} args - Arguments to update or create a IndexerState.
     * @example
     * // Update or create a IndexerState
     * const indexerState = await prisma.indexerState.upsert({
     *   create: {
     *     // ... data to create a IndexerState
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the IndexerState we want to update
     *   }
     * })
     */
    upsert<T extends IndexerStateUpsertArgs>(args: SelectSubset<T, IndexerStateUpsertArgs<ExtArgs>>): Prisma__IndexerStateClient<$Result.GetResult<Prisma.$IndexerStatePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of IndexerStates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerStateCountArgs} args - Arguments to filter IndexerStates to count.
     * @example
     * // Count the number of IndexerStates
     * const count = await prisma.indexerState.count({
     *   where: {
     *     // ... the filter for the IndexerStates we want to count
     *   }
     * })
    **/
    count<T extends IndexerStateCountArgs>(
      args?: Subset<T, IndexerStateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], IndexerStateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a IndexerState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerStateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends IndexerStateAggregateArgs>(args: Subset<T, IndexerStateAggregateArgs>): Prisma.PrismaPromise<GetIndexerStateAggregateType<T>>

    /**
     * Group by IndexerState.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {IndexerStateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends IndexerStateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: IndexerStateGroupByArgs['orderBy'] }
        : { orderBy?: IndexerStateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, IndexerStateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetIndexerStateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the IndexerState model
   */
  readonly fields: IndexerStateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for IndexerState.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__IndexerStateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the IndexerState model
   */ 
  interface IndexerStateFieldRefs {
    readonly id: FieldRef<"IndexerState", 'String'>
    readonly lastBlock: FieldRef<"IndexerState", 'BigInt'>
    readonly lastUpdate: FieldRef<"IndexerState", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * IndexerState findUnique
   */
  export type IndexerStateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
    /**
     * Filter, which IndexerState to fetch.
     */
    where: IndexerStateWhereUniqueInput
  }

  /**
   * IndexerState findUniqueOrThrow
   */
  export type IndexerStateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
    /**
     * Filter, which IndexerState to fetch.
     */
    where: IndexerStateWhereUniqueInput
  }

  /**
   * IndexerState findFirst
   */
  export type IndexerStateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
    /**
     * Filter, which IndexerState to fetch.
     */
    where?: IndexerStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IndexerStates to fetch.
     */
    orderBy?: IndexerStateOrderByWithRelationInput | IndexerStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IndexerStates.
     */
    cursor?: IndexerStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IndexerStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IndexerStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IndexerStates.
     */
    distinct?: IndexerStateScalarFieldEnum | IndexerStateScalarFieldEnum[]
  }

  /**
   * IndexerState findFirstOrThrow
   */
  export type IndexerStateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
    /**
     * Filter, which IndexerState to fetch.
     */
    where?: IndexerStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IndexerStates to fetch.
     */
    orderBy?: IndexerStateOrderByWithRelationInput | IndexerStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for IndexerStates.
     */
    cursor?: IndexerStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IndexerStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IndexerStates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of IndexerStates.
     */
    distinct?: IndexerStateScalarFieldEnum | IndexerStateScalarFieldEnum[]
  }

  /**
   * IndexerState findMany
   */
  export type IndexerStateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
    /**
     * Filter, which IndexerStates to fetch.
     */
    where?: IndexerStateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of IndexerStates to fetch.
     */
    orderBy?: IndexerStateOrderByWithRelationInput | IndexerStateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing IndexerStates.
     */
    cursor?: IndexerStateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` IndexerStates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` IndexerStates.
     */
    skip?: number
    distinct?: IndexerStateScalarFieldEnum | IndexerStateScalarFieldEnum[]
  }

  /**
   * IndexerState create
   */
  export type IndexerStateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
    /**
     * The data needed to create a IndexerState.
     */
    data?: XOR<IndexerStateCreateInput, IndexerStateUncheckedCreateInput>
  }

  /**
   * IndexerState createMany
   */
  export type IndexerStateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many IndexerStates.
     */
    data: IndexerStateCreateManyInput | IndexerStateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IndexerState createManyAndReturn
   */
  export type IndexerStateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many IndexerStates.
     */
    data: IndexerStateCreateManyInput | IndexerStateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * IndexerState update
   */
  export type IndexerStateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
    /**
     * The data needed to update a IndexerState.
     */
    data: XOR<IndexerStateUpdateInput, IndexerStateUncheckedUpdateInput>
    /**
     * Choose, which IndexerState to update.
     */
    where: IndexerStateWhereUniqueInput
  }

  /**
   * IndexerState updateMany
   */
  export type IndexerStateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update IndexerStates.
     */
    data: XOR<IndexerStateUpdateManyMutationInput, IndexerStateUncheckedUpdateManyInput>
    /**
     * Filter which IndexerStates to update
     */
    where?: IndexerStateWhereInput
  }

  /**
   * IndexerState upsert
   */
  export type IndexerStateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
    /**
     * The filter to search for the IndexerState to update in case it exists.
     */
    where: IndexerStateWhereUniqueInput
    /**
     * In case the IndexerState found by the `where` argument doesn't exist, create a new IndexerState with this data.
     */
    create: XOR<IndexerStateCreateInput, IndexerStateUncheckedCreateInput>
    /**
     * In case the IndexerState was found with the provided `where` argument, update it with this data.
     */
    update: XOR<IndexerStateUpdateInput, IndexerStateUncheckedUpdateInput>
  }

  /**
   * IndexerState delete
   */
  export type IndexerStateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
    /**
     * Filter which IndexerState to delete.
     */
    where: IndexerStateWhereUniqueInput
  }

  /**
   * IndexerState deleteMany
   */
  export type IndexerStateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which IndexerStates to delete
     */
    where?: IndexerStateWhereInput
  }

  /**
   * IndexerState without action
   */
  export type IndexerStateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the IndexerState
     */
    select?: IndexerStateSelect<ExtArgs> | null
  }


  /**
   * Model Token
   */

  export type AggregateToken = {
    _count: TokenCountAggregateOutputType | null
    _avg: TokenAvgAggregateOutputType | null
    _sum: TokenSumAggregateOutputType | null
    _min: TokenMinAggregateOutputType | null
    _max: TokenMaxAggregateOutputType | null
  }

  export type TokenAvgAggregateOutputType = {
    decimals: number | null
  }

  export type TokenSumAggregateOutputType = {
    decimals: number | null
  }

  export type TokenMinAggregateOutputType = {
    id: string | null
    address: string | null
    symbol: string | null
    name: string | null
    decimals: number | null
    logoUri: string | null
    coingeckoId: string | null
  }

  export type TokenMaxAggregateOutputType = {
    id: string | null
    address: string | null
    symbol: string | null
    name: string | null
    decimals: number | null
    logoUri: string | null
    coingeckoId: string | null
  }

  export type TokenCountAggregateOutputType = {
    id: number
    address: number
    symbol: number
    name: number
    decimals: number
    logoUri: number
    coingeckoId: number
    tags: number
    _all: number
  }


  export type TokenAvgAggregateInputType = {
    decimals?: true
  }

  export type TokenSumAggregateInputType = {
    decimals?: true
  }

  export type TokenMinAggregateInputType = {
    id?: true
    address?: true
    symbol?: true
    name?: true
    decimals?: true
    logoUri?: true
    coingeckoId?: true
  }

  export type TokenMaxAggregateInputType = {
    id?: true
    address?: true
    symbol?: true
    name?: true
    decimals?: true
    logoUri?: true
    coingeckoId?: true
  }

  export type TokenCountAggregateInputType = {
    id?: true
    address?: true
    symbol?: true
    name?: true
    decimals?: true
    logoUri?: true
    coingeckoId?: true
    tags?: true
    _all?: true
  }

  export type TokenAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Token to aggregate.
     */
    where?: TokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tokens to fetch.
     */
    orderBy?: TokenOrderByWithRelationInput | TokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tokens
    **/
    _count?: true | TokenCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TokenAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TokenSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TokenMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TokenMaxAggregateInputType
  }

  export type GetTokenAggregateType<T extends TokenAggregateArgs> = {
        [P in keyof T & keyof AggregateToken]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateToken[P]>
      : GetScalarType<T[P], AggregateToken[P]>
  }




  export type TokenGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TokenWhereInput
    orderBy?: TokenOrderByWithAggregationInput | TokenOrderByWithAggregationInput[]
    by: TokenScalarFieldEnum[] | TokenScalarFieldEnum
    having?: TokenScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TokenCountAggregateInputType | true
    _avg?: TokenAvgAggregateInputType
    _sum?: TokenSumAggregateInputType
    _min?: TokenMinAggregateInputType
    _max?: TokenMaxAggregateInputType
  }

  export type TokenGroupByOutputType = {
    id: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri: string | null
    coingeckoId: string | null
    tags: string[]
    _count: TokenCountAggregateOutputType | null
    _avg: TokenAvgAggregateOutputType | null
    _sum: TokenSumAggregateOutputType | null
    _min: TokenMinAggregateOutputType | null
    _max: TokenMaxAggregateOutputType | null
  }

  type GetTokenGroupByPayload<T extends TokenGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TokenGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TokenGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TokenGroupByOutputType[P]>
            : GetScalarType<T[P], TokenGroupByOutputType[P]>
        }
      >
    >


  export type TokenSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    symbol?: boolean
    name?: boolean
    decimals?: boolean
    logoUri?: boolean
    coingeckoId?: boolean
    tags?: boolean
    poolsAsToken0?: boolean | Token$poolsAsToken0Args<ExtArgs>
    poolsAsToken1?: boolean | Token$poolsAsToken1Args<ExtArgs>
    Statistic?: boolean | Token$StatisticArgs<ExtArgs>
    _count?: boolean | TokenCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["token"]>

  export type TokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    address?: boolean
    symbol?: boolean
    name?: boolean
    decimals?: boolean
    logoUri?: boolean
    coingeckoId?: boolean
    tags?: boolean
  }, ExtArgs["result"]["token"]>

  export type TokenSelectScalar = {
    id?: boolean
    address?: boolean
    symbol?: boolean
    name?: boolean
    decimals?: boolean
    logoUri?: boolean
    coingeckoId?: boolean
    tags?: boolean
  }

  export type TokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    poolsAsToken0?: boolean | Token$poolsAsToken0Args<ExtArgs>
    poolsAsToken1?: boolean | Token$poolsAsToken1Args<ExtArgs>
    Statistic?: boolean | Token$StatisticArgs<ExtArgs>
    _count?: boolean | TokenCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Token"
    objects: {
      poolsAsToken0: Prisma.$PoolPayload<ExtArgs>[]
      poolsAsToken1: Prisma.$PoolPayload<ExtArgs>[]
      Statistic: Prisma.$TokenStatisticPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      address: string
      symbol: string
      name: string
      decimals: number
      logoUri: string | null
      coingeckoId: string | null
      tags: string[]
    }, ExtArgs["result"]["token"]>
    composites: {}
  }

  type TokenGetPayload<S extends boolean | null | undefined | TokenDefaultArgs> = $Result.GetResult<Prisma.$TokenPayload, S>

  type TokenCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TokenFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TokenCountAggregateInputType | true
    }

  export interface TokenDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Token'], meta: { name: 'Token' } }
    /**
     * Find zero or one Token that matches the filter.
     * @param {TokenFindUniqueArgs} args - Arguments to find a Token
     * @example
     * // Get one Token
     * const token = await prisma.token.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TokenFindUniqueArgs>(args: SelectSubset<T, TokenFindUniqueArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Token that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TokenFindUniqueOrThrowArgs} args - Arguments to find a Token
     * @example
     * // Get one Token
     * const token = await prisma.token.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TokenFindUniqueOrThrowArgs>(args: SelectSubset<T, TokenFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Token that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenFindFirstArgs} args - Arguments to find a Token
     * @example
     * // Get one Token
     * const token = await prisma.token.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TokenFindFirstArgs>(args?: SelectSubset<T, TokenFindFirstArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Token that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenFindFirstOrThrowArgs} args - Arguments to find a Token
     * @example
     * // Get one Token
     * const token = await prisma.token.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TokenFindFirstOrThrowArgs>(args?: SelectSubset<T, TokenFindFirstOrThrowArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Tokens that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tokens
     * const tokens = await prisma.token.findMany()
     * 
     * // Get first 10 Tokens
     * const tokens = await prisma.token.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tokenWithIdOnly = await prisma.token.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TokenFindManyArgs>(args?: SelectSubset<T, TokenFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Token.
     * @param {TokenCreateArgs} args - Arguments to create a Token.
     * @example
     * // Create one Token
     * const Token = await prisma.token.create({
     *   data: {
     *     // ... data to create a Token
     *   }
     * })
     * 
     */
    create<T extends TokenCreateArgs>(args: SelectSubset<T, TokenCreateArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Tokens.
     * @param {TokenCreateManyArgs} args - Arguments to create many Tokens.
     * @example
     * // Create many Tokens
     * const token = await prisma.token.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TokenCreateManyArgs>(args?: SelectSubset<T, TokenCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tokens and returns the data saved in the database.
     * @param {TokenCreateManyAndReturnArgs} args - Arguments to create many Tokens.
     * @example
     * // Create many Tokens
     * const token = await prisma.token.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tokens and only return the `id`
     * const tokenWithIdOnly = await prisma.token.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TokenCreateManyAndReturnArgs>(args?: SelectSubset<T, TokenCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Token.
     * @param {TokenDeleteArgs} args - Arguments to delete one Token.
     * @example
     * // Delete one Token
     * const Token = await prisma.token.delete({
     *   where: {
     *     // ... filter to delete one Token
     *   }
     * })
     * 
     */
    delete<T extends TokenDeleteArgs>(args: SelectSubset<T, TokenDeleteArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Token.
     * @param {TokenUpdateArgs} args - Arguments to update one Token.
     * @example
     * // Update one Token
     * const token = await prisma.token.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TokenUpdateArgs>(args: SelectSubset<T, TokenUpdateArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Tokens.
     * @param {TokenDeleteManyArgs} args - Arguments to filter Tokens to delete.
     * @example
     * // Delete a few Tokens
     * const { count } = await prisma.token.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TokenDeleteManyArgs>(args?: SelectSubset<T, TokenDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tokens
     * const token = await prisma.token.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TokenUpdateManyArgs>(args: SelectSubset<T, TokenUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Token.
     * @param {TokenUpsertArgs} args - Arguments to update or create a Token.
     * @example
     * // Update or create a Token
     * const token = await prisma.token.upsert({
     *   create: {
     *     // ... data to create a Token
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Token we want to update
     *   }
     * })
     */
    upsert<T extends TokenUpsertArgs>(args: SelectSubset<T, TokenUpsertArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Tokens.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenCountArgs} args - Arguments to filter Tokens to count.
     * @example
     * // Count the number of Tokens
     * const count = await prisma.token.count({
     *   where: {
     *     // ... the filter for the Tokens we want to count
     *   }
     * })
    **/
    count<T extends TokenCountArgs>(
      args?: Subset<T, TokenCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TokenCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Token.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TokenAggregateArgs>(args: Subset<T, TokenAggregateArgs>): Prisma.PrismaPromise<GetTokenAggregateType<T>>

    /**
     * Group by Token.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TokenGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TokenGroupByArgs['orderBy'] }
        : { orderBy?: TokenGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TokenGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTokenGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Token model
   */
  readonly fields: TokenFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Token.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TokenClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    poolsAsToken0<T extends Token$poolsAsToken0Args<ExtArgs> = {}>(args?: Subset<T, Token$poolsAsToken0Args<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findMany"> | Null>
    poolsAsToken1<T extends Token$poolsAsToken1Args<ExtArgs> = {}>(args?: Subset<T, Token$poolsAsToken1Args<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findMany"> | Null>
    Statistic<T extends Token$StatisticArgs<ExtArgs> = {}>(args?: Subset<T, Token$StatisticArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Token model
   */ 
  interface TokenFieldRefs {
    readonly id: FieldRef<"Token", 'String'>
    readonly address: FieldRef<"Token", 'String'>
    readonly symbol: FieldRef<"Token", 'String'>
    readonly name: FieldRef<"Token", 'String'>
    readonly decimals: FieldRef<"Token", 'Int'>
    readonly logoUri: FieldRef<"Token", 'String'>
    readonly coingeckoId: FieldRef<"Token", 'String'>
    readonly tags: FieldRef<"Token", 'String[]'>
  }
    

  // Custom InputTypes
  /**
   * Token findUnique
   */
  export type TokenFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
    /**
     * Filter, which Token to fetch.
     */
    where: TokenWhereUniqueInput
  }

  /**
   * Token findUniqueOrThrow
   */
  export type TokenFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
    /**
     * Filter, which Token to fetch.
     */
    where: TokenWhereUniqueInput
  }

  /**
   * Token findFirst
   */
  export type TokenFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
    /**
     * Filter, which Token to fetch.
     */
    where?: TokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tokens to fetch.
     */
    orderBy?: TokenOrderByWithRelationInput | TokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tokens.
     */
    cursor?: TokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tokens.
     */
    distinct?: TokenScalarFieldEnum | TokenScalarFieldEnum[]
  }

  /**
   * Token findFirstOrThrow
   */
  export type TokenFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
    /**
     * Filter, which Token to fetch.
     */
    where?: TokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tokens to fetch.
     */
    orderBy?: TokenOrderByWithRelationInput | TokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tokens.
     */
    cursor?: TokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tokens.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tokens.
     */
    distinct?: TokenScalarFieldEnum | TokenScalarFieldEnum[]
  }

  /**
   * Token findMany
   */
  export type TokenFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
    /**
     * Filter, which Tokens to fetch.
     */
    where?: TokenWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tokens to fetch.
     */
    orderBy?: TokenOrderByWithRelationInput | TokenOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tokens.
     */
    cursor?: TokenWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tokens from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tokens.
     */
    skip?: number
    distinct?: TokenScalarFieldEnum | TokenScalarFieldEnum[]
  }

  /**
   * Token create
   */
  export type TokenCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
    /**
     * The data needed to create a Token.
     */
    data: XOR<TokenCreateInput, TokenUncheckedCreateInput>
  }

  /**
   * Token createMany
   */
  export type TokenCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Tokens.
     */
    data: TokenCreateManyInput | TokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Token createManyAndReturn
   */
  export type TokenCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Tokens.
     */
    data: TokenCreateManyInput | TokenCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Token update
   */
  export type TokenUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
    /**
     * The data needed to update a Token.
     */
    data: XOR<TokenUpdateInput, TokenUncheckedUpdateInput>
    /**
     * Choose, which Token to update.
     */
    where: TokenWhereUniqueInput
  }

  /**
   * Token updateMany
   */
  export type TokenUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Tokens.
     */
    data: XOR<TokenUpdateManyMutationInput, TokenUncheckedUpdateManyInput>
    /**
     * Filter which Tokens to update
     */
    where?: TokenWhereInput
  }

  /**
   * Token upsert
   */
  export type TokenUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
    /**
     * The filter to search for the Token to update in case it exists.
     */
    where: TokenWhereUniqueInput
    /**
     * In case the Token found by the `where` argument doesn't exist, create a new Token with this data.
     */
    create: XOR<TokenCreateInput, TokenUncheckedCreateInput>
    /**
     * In case the Token was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TokenUpdateInput, TokenUncheckedUpdateInput>
  }

  /**
   * Token delete
   */
  export type TokenDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
    /**
     * Filter which Token to delete.
     */
    where: TokenWhereUniqueInput
  }

  /**
   * Token deleteMany
   */
  export type TokenDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Tokens to delete
     */
    where?: TokenWhereInput
  }

  /**
   * Token.poolsAsToken0
   */
  export type Token$poolsAsToken0Args<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    where?: PoolWhereInput
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    cursor?: PoolWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PoolScalarFieldEnum | PoolScalarFieldEnum[]
  }

  /**
   * Token.poolsAsToken1
   */
  export type Token$poolsAsToken1Args<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pool
     */
    select?: PoolSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolInclude<ExtArgs> | null
    where?: PoolWhereInput
    orderBy?: PoolOrderByWithRelationInput | PoolOrderByWithRelationInput[]
    cursor?: PoolWhereUniqueInput
    take?: number
    skip?: number
    distinct?: PoolScalarFieldEnum | PoolScalarFieldEnum[]
  }

  /**
   * Token.Statistic
   */
  export type Token$StatisticArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    where?: TokenStatisticWhereInput
    orderBy?: TokenStatisticOrderByWithRelationInput | TokenStatisticOrderByWithRelationInput[]
    cursor?: TokenStatisticWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TokenStatisticScalarFieldEnum | TokenStatisticScalarFieldEnum[]
  }

  /**
   * Token without action
   */
  export type TokenDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Token
     */
    select?: TokenSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenInclude<ExtArgs> | null
  }


  /**
   * Model TokenStatistic
   */

  export type AggregateTokenStatistic = {
    _count: TokenStatisticCountAggregateOutputType | null
    _avg: TokenStatisticAvgAggregateOutputType | null
    _sum: TokenStatisticSumAggregateOutputType | null
    _min: TokenStatisticMinAggregateOutputType | null
    _max: TokenStatisticMaxAggregateOutputType | null
  }

  export type TokenStatisticAvgAggregateOutputType = {
    price: number | null
    oneHourEvolution: number | null
    oneDayEvolution: number | null
    volume: number | null
  }

  export type TokenStatisticSumAggregateOutputType = {
    price: number | null
    oneHourEvolution: number | null
    oneDayEvolution: number | null
    volume: number | null
  }

  export type TokenStatisticMinAggregateOutputType = {
    id: string | null
    tokenId: string | null
    price: number | null
    oneHourEvolution: number | null
    oneDayEvolution: number | null
    volume: number | null
    createdAt: Date | null
  }

  export type TokenStatisticMaxAggregateOutputType = {
    id: string | null
    tokenId: string | null
    price: number | null
    oneHourEvolution: number | null
    oneDayEvolution: number | null
    volume: number | null
    createdAt: Date | null
  }

  export type TokenStatisticCountAggregateOutputType = {
    id: number
    tokenId: number
    price: number
    oneHourEvolution: number
    oneDayEvolution: number
    volume: number
    createdAt: number
    _all: number
  }


  export type TokenStatisticAvgAggregateInputType = {
    price?: true
    oneHourEvolution?: true
    oneDayEvolution?: true
    volume?: true
  }

  export type TokenStatisticSumAggregateInputType = {
    price?: true
    oneHourEvolution?: true
    oneDayEvolution?: true
    volume?: true
  }

  export type TokenStatisticMinAggregateInputType = {
    id?: true
    tokenId?: true
    price?: true
    oneHourEvolution?: true
    oneDayEvolution?: true
    volume?: true
    createdAt?: true
  }

  export type TokenStatisticMaxAggregateInputType = {
    id?: true
    tokenId?: true
    price?: true
    oneHourEvolution?: true
    oneDayEvolution?: true
    volume?: true
    createdAt?: true
  }

  export type TokenStatisticCountAggregateInputType = {
    id?: true
    tokenId?: true
    price?: true
    oneHourEvolution?: true
    oneDayEvolution?: true
    volume?: true
    createdAt?: true
    _all?: true
  }

  export type TokenStatisticAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TokenStatistic to aggregate.
     */
    where?: TokenStatisticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenStatistics to fetch.
     */
    orderBy?: TokenStatisticOrderByWithRelationInput | TokenStatisticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TokenStatisticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenStatistics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenStatistics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TokenStatistics
    **/
    _count?: true | TokenStatisticCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TokenStatisticAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TokenStatisticSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TokenStatisticMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TokenStatisticMaxAggregateInputType
  }

  export type GetTokenStatisticAggregateType<T extends TokenStatisticAggregateArgs> = {
        [P in keyof T & keyof AggregateTokenStatistic]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTokenStatistic[P]>
      : GetScalarType<T[P], AggregateTokenStatistic[P]>
  }




  export type TokenStatisticGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TokenStatisticWhereInput
    orderBy?: TokenStatisticOrderByWithAggregationInput | TokenStatisticOrderByWithAggregationInput[]
    by: TokenStatisticScalarFieldEnum[] | TokenStatisticScalarFieldEnum
    having?: TokenStatisticScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TokenStatisticCountAggregateInputType | true
    _avg?: TokenStatisticAvgAggregateInputType
    _sum?: TokenStatisticSumAggregateInputType
    _min?: TokenStatisticMinAggregateInputType
    _max?: TokenStatisticMaxAggregateInputType
  }

  export type TokenStatisticGroupByOutputType = {
    id: string
    tokenId: string
    price: number
    oneHourEvolution: number
    oneDayEvolution: number
    volume: number
    createdAt: Date
    _count: TokenStatisticCountAggregateOutputType | null
    _avg: TokenStatisticAvgAggregateOutputType | null
    _sum: TokenStatisticSumAggregateOutputType | null
    _min: TokenStatisticMinAggregateOutputType | null
    _max: TokenStatisticMaxAggregateOutputType | null
  }

  type GetTokenStatisticGroupByPayload<T extends TokenStatisticGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TokenStatisticGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TokenStatisticGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TokenStatisticGroupByOutputType[P]>
            : GetScalarType<T[P], TokenStatisticGroupByOutputType[P]>
        }
      >
    >


  export type TokenStatisticSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tokenId?: boolean
    price?: boolean
    oneHourEvolution?: boolean
    oneDayEvolution?: boolean
    volume?: boolean
    createdAt?: boolean
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tokenStatistic"]>

  export type TokenStatisticSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tokenId?: boolean
    price?: boolean
    oneHourEvolution?: boolean
    oneDayEvolution?: boolean
    volume?: boolean
    createdAt?: boolean
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tokenStatistic"]>

  export type TokenStatisticSelectScalar = {
    id?: boolean
    tokenId?: boolean
    price?: boolean
    oneHourEvolution?: boolean
    oneDayEvolution?: boolean
    volume?: boolean
    createdAt?: boolean
  }

  export type TokenStatisticInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }
  export type TokenStatisticIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }

  export type $TokenStatisticPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TokenStatistic"
    objects: {
      token: Prisma.$TokenPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tokenId: string
      price: number
      oneHourEvolution: number
      oneDayEvolution: number
      volume: number
      createdAt: Date
    }, ExtArgs["result"]["tokenStatistic"]>
    composites: {}
  }

  type TokenStatisticGetPayload<S extends boolean | null | undefined | TokenStatisticDefaultArgs> = $Result.GetResult<Prisma.$TokenStatisticPayload, S>

  type TokenStatisticCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TokenStatisticFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TokenStatisticCountAggregateInputType | true
    }

  export interface TokenStatisticDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TokenStatistic'], meta: { name: 'TokenStatistic' } }
    /**
     * Find zero or one TokenStatistic that matches the filter.
     * @param {TokenStatisticFindUniqueArgs} args - Arguments to find a TokenStatistic
     * @example
     * // Get one TokenStatistic
     * const tokenStatistic = await prisma.tokenStatistic.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TokenStatisticFindUniqueArgs>(args: SelectSubset<T, TokenStatisticFindUniqueArgs<ExtArgs>>): Prisma__TokenStatisticClient<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TokenStatistic that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TokenStatisticFindUniqueOrThrowArgs} args - Arguments to find a TokenStatistic
     * @example
     * // Get one TokenStatistic
     * const tokenStatistic = await prisma.tokenStatistic.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TokenStatisticFindUniqueOrThrowArgs>(args: SelectSubset<T, TokenStatisticFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TokenStatisticClient<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TokenStatistic that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenStatisticFindFirstArgs} args - Arguments to find a TokenStatistic
     * @example
     * // Get one TokenStatistic
     * const tokenStatistic = await prisma.tokenStatistic.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TokenStatisticFindFirstArgs>(args?: SelectSubset<T, TokenStatisticFindFirstArgs<ExtArgs>>): Prisma__TokenStatisticClient<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TokenStatistic that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenStatisticFindFirstOrThrowArgs} args - Arguments to find a TokenStatistic
     * @example
     * // Get one TokenStatistic
     * const tokenStatistic = await prisma.tokenStatistic.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TokenStatisticFindFirstOrThrowArgs>(args?: SelectSubset<T, TokenStatisticFindFirstOrThrowArgs<ExtArgs>>): Prisma__TokenStatisticClient<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TokenStatistics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenStatisticFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TokenStatistics
     * const tokenStatistics = await prisma.tokenStatistic.findMany()
     * 
     * // Get first 10 TokenStatistics
     * const tokenStatistics = await prisma.tokenStatistic.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tokenStatisticWithIdOnly = await prisma.tokenStatistic.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TokenStatisticFindManyArgs>(args?: SelectSubset<T, TokenStatisticFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TokenStatistic.
     * @param {TokenStatisticCreateArgs} args - Arguments to create a TokenStatistic.
     * @example
     * // Create one TokenStatistic
     * const TokenStatistic = await prisma.tokenStatistic.create({
     *   data: {
     *     // ... data to create a TokenStatistic
     *   }
     * })
     * 
     */
    create<T extends TokenStatisticCreateArgs>(args: SelectSubset<T, TokenStatisticCreateArgs<ExtArgs>>): Prisma__TokenStatisticClient<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TokenStatistics.
     * @param {TokenStatisticCreateManyArgs} args - Arguments to create many TokenStatistics.
     * @example
     * // Create many TokenStatistics
     * const tokenStatistic = await prisma.tokenStatistic.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TokenStatisticCreateManyArgs>(args?: SelectSubset<T, TokenStatisticCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TokenStatistics and returns the data saved in the database.
     * @param {TokenStatisticCreateManyAndReturnArgs} args - Arguments to create many TokenStatistics.
     * @example
     * // Create many TokenStatistics
     * const tokenStatistic = await prisma.tokenStatistic.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TokenStatistics and only return the `id`
     * const tokenStatisticWithIdOnly = await prisma.tokenStatistic.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TokenStatisticCreateManyAndReturnArgs>(args?: SelectSubset<T, TokenStatisticCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TokenStatistic.
     * @param {TokenStatisticDeleteArgs} args - Arguments to delete one TokenStatistic.
     * @example
     * // Delete one TokenStatistic
     * const TokenStatistic = await prisma.tokenStatistic.delete({
     *   where: {
     *     // ... filter to delete one TokenStatistic
     *   }
     * })
     * 
     */
    delete<T extends TokenStatisticDeleteArgs>(args: SelectSubset<T, TokenStatisticDeleteArgs<ExtArgs>>): Prisma__TokenStatisticClient<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TokenStatistic.
     * @param {TokenStatisticUpdateArgs} args - Arguments to update one TokenStatistic.
     * @example
     * // Update one TokenStatistic
     * const tokenStatistic = await prisma.tokenStatistic.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TokenStatisticUpdateArgs>(args: SelectSubset<T, TokenStatisticUpdateArgs<ExtArgs>>): Prisma__TokenStatisticClient<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TokenStatistics.
     * @param {TokenStatisticDeleteManyArgs} args - Arguments to filter TokenStatistics to delete.
     * @example
     * // Delete a few TokenStatistics
     * const { count } = await prisma.tokenStatistic.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TokenStatisticDeleteManyArgs>(args?: SelectSubset<T, TokenStatisticDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TokenStatistics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenStatisticUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TokenStatistics
     * const tokenStatistic = await prisma.tokenStatistic.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TokenStatisticUpdateManyArgs>(args: SelectSubset<T, TokenStatisticUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TokenStatistic.
     * @param {TokenStatisticUpsertArgs} args - Arguments to update or create a TokenStatistic.
     * @example
     * // Update or create a TokenStatistic
     * const tokenStatistic = await prisma.tokenStatistic.upsert({
     *   create: {
     *     // ... data to create a TokenStatistic
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TokenStatistic we want to update
     *   }
     * })
     */
    upsert<T extends TokenStatisticUpsertArgs>(args: SelectSubset<T, TokenStatisticUpsertArgs<ExtArgs>>): Prisma__TokenStatisticClient<$Result.GetResult<Prisma.$TokenStatisticPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TokenStatistics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenStatisticCountArgs} args - Arguments to filter TokenStatistics to count.
     * @example
     * // Count the number of TokenStatistics
     * const count = await prisma.tokenStatistic.count({
     *   where: {
     *     // ... the filter for the TokenStatistics we want to count
     *   }
     * })
    **/
    count<T extends TokenStatisticCountArgs>(
      args?: Subset<T, TokenStatisticCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TokenStatisticCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TokenStatistic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenStatisticAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TokenStatisticAggregateArgs>(args: Subset<T, TokenStatisticAggregateArgs>): Prisma.PrismaPromise<GetTokenStatisticAggregateType<T>>

    /**
     * Group by TokenStatistic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenStatisticGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TokenStatisticGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TokenStatisticGroupByArgs['orderBy'] }
        : { orderBy?: TokenStatisticGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TokenStatisticGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTokenStatisticGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TokenStatistic model
   */
  readonly fields: TokenStatisticFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TokenStatistic.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TokenStatisticClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    token<T extends TokenDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TokenDefaultArgs<ExtArgs>>): Prisma__TokenClient<$Result.GetResult<Prisma.$TokenPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TokenStatistic model
   */ 
  interface TokenStatisticFieldRefs {
    readonly id: FieldRef<"TokenStatistic", 'String'>
    readonly tokenId: FieldRef<"TokenStatistic", 'String'>
    readonly price: FieldRef<"TokenStatistic", 'Float'>
    readonly oneHourEvolution: FieldRef<"TokenStatistic", 'Float'>
    readonly oneDayEvolution: FieldRef<"TokenStatistic", 'Float'>
    readonly volume: FieldRef<"TokenStatistic", 'Float'>
    readonly createdAt: FieldRef<"TokenStatistic", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TokenStatistic findUnique
   */
  export type TokenStatisticFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    /**
     * Filter, which TokenStatistic to fetch.
     */
    where: TokenStatisticWhereUniqueInput
  }

  /**
   * TokenStatistic findUniqueOrThrow
   */
  export type TokenStatisticFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    /**
     * Filter, which TokenStatistic to fetch.
     */
    where: TokenStatisticWhereUniqueInput
  }

  /**
   * TokenStatistic findFirst
   */
  export type TokenStatisticFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    /**
     * Filter, which TokenStatistic to fetch.
     */
    where?: TokenStatisticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenStatistics to fetch.
     */
    orderBy?: TokenStatisticOrderByWithRelationInput | TokenStatisticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TokenStatistics.
     */
    cursor?: TokenStatisticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenStatistics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenStatistics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TokenStatistics.
     */
    distinct?: TokenStatisticScalarFieldEnum | TokenStatisticScalarFieldEnum[]
  }

  /**
   * TokenStatistic findFirstOrThrow
   */
  export type TokenStatisticFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    /**
     * Filter, which TokenStatistic to fetch.
     */
    where?: TokenStatisticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenStatistics to fetch.
     */
    orderBy?: TokenStatisticOrderByWithRelationInput | TokenStatisticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TokenStatistics.
     */
    cursor?: TokenStatisticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenStatistics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenStatistics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TokenStatistics.
     */
    distinct?: TokenStatisticScalarFieldEnum | TokenStatisticScalarFieldEnum[]
  }

  /**
   * TokenStatistic findMany
   */
  export type TokenStatisticFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    /**
     * Filter, which TokenStatistics to fetch.
     */
    where?: TokenStatisticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenStatistics to fetch.
     */
    orderBy?: TokenStatisticOrderByWithRelationInput | TokenStatisticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TokenStatistics.
     */
    cursor?: TokenStatisticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenStatistics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenStatistics.
     */
    skip?: number
    distinct?: TokenStatisticScalarFieldEnum | TokenStatisticScalarFieldEnum[]
  }

  /**
   * TokenStatistic create
   */
  export type TokenStatisticCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    /**
     * The data needed to create a TokenStatistic.
     */
    data: XOR<TokenStatisticCreateInput, TokenStatisticUncheckedCreateInput>
  }

  /**
   * TokenStatistic createMany
   */
  export type TokenStatisticCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TokenStatistics.
     */
    data: TokenStatisticCreateManyInput | TokenStatisticCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TokenStatistic createManyAndReturn
   */
  export type TokenStatisticCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TokenStatistics.
     */
    data: TokenStatisticCreateManyInput | TokenStatisticCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TokenStatistic update
   */
  export type TokenStatisticUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    /**
     * The data needed to update a TokenStatistic.
     */
    data: XOR<TokenStatisticUpdateInput, TokenStatisticUncheckedUpdateInput>
    /**
     * Choose, which TokenStatistic to update.
     */
    where: TokenStatisticWhereUniqueInput
  }

  /**
   * TokenStatistic updateMany
   */
  export type TokenStatisticUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TokenStatistics.
     */
    data: XOR<TokenStatisticUpdateManyMutationInput, TokenStatisticUncheckedUpdateManyInput>
    /**
     * Filter which TokenStatistics to update
     */
    where?: TokenStatisticWhereInput
  }

  /**
   * TokenStatistic upsert
   */
  export type TokenStatisticUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    /**
     * The filter to search for the TokenStatistic to update in case it exists.
     */
    where: TokenStatisticWhereUniqueInput
    /**
     * In case the TokenStatistic found by the `where` argument doesn't exist, create a new TokenStatistic with this data.
     */
    create: XOR<TokenStatisticCreateInput, TokenStatisticUncheckedCreateInput>
    /**
     * In case the TokenStatistic was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TokenStatisticUpdateInput, TokenStatisticUncheckedUpdateInput>
  }

  /**
   * TokenStatistic delete
   */
  export type TokenStatisticDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
    /**
     * Filter which TokenStatistic to delete.
     */
    where: TokenStatisticWhereUniqueInput
  }

  /**
   * TokenStatistic deleteMany
   */
  export type TokenStatisticDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TokenStatistics to delete
     */
    where?: TokenStatisticWhereInput
  }

  /**
   * TokenStatistic without action
   */
  export type TokenStatisticDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenStatistic
     */
    select?: TokenStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenStatisticInclude<ExtArgs> | null
  }


  /**
   * Model PoolStatistic
   */

  export type AggregatePoolStatistic = {
    _count: PoolStatisticCountAggregateOutputType | null
    _avg: PoolStatisticAvgAggregateOutputType | null
    _sum: PoolStatisticSumAggregateOutputType | null
    _min: PoolStatisticMinAggregateOutputType | null
    _max: PoolStatisticMaxAggregateOutputType | null
  }

  export type PoolStatisticAvgAggregateOutputType = {
    apr: number | null
    tvlUSD: number | null
    impermanentLoss: number | null
    healthScore: number | null
  }

  export type PoolStatisticSumAggregateOutputType = {
    apr: number | null
    tvlUSD: number | null
    impermanentLoss: number | null
    healthScore: number | null
  }

  export type PoolStatisticMinAggregateOutputType = {
    id: string | null
    poolId: string | null
    apr: number | null
    tvlUSD: number | null
    volOneDay: string | null
    volOneMonth: string | null
    impermanentLoss: number | null
    healthScore: number | null
    createdAt: Date | null
  }

  export type PoolStatisticMaxAggregateOutputType = {
    id: string | null
    poolId: string | null
    apr: number | null
    tvlUSD: number | null
    volOneDay: string | null
    volOneMonth: string | null
    impermanentLoss: number | null
    healthScore: number | null
    createdAt: Date | null
  }

  export type PoolStatisticCountAggregateOutputType = {
    id: number
    poolId: number
    apr: number
    tvlUSD: number
    volOneDay: number
    volOneMonth: number
    impermanentLoss: number
    healthScore: number
    createdAt: number
    _all: number
  }


  export type PoolStatisticAvgAggregateInputType = {
    apr?: true
    tvlUSD?: true
    impermanentLoss?: true
    healthScore?: true
  }

  export type PoolStatisticSumAggregateInputType = {
    apr?: true
    tvlUSD?: true
    impermanentLoss?: true
    healthScore?: true
  }

  export type PoolStatisticMinAggregateInputType = {
    id?: true
    poolId?: true
    apr?: true
    tvlUSD?: true
    volOneDay?: true
    volOneMonth?: true
    impermanentLoss?: true
    healthScore?: true
    createdAt?: true
  }

  export type PoolStatisticMaxAggregateInputType = {
    id?: true
    poolId?: true
    apr?: true
    tvlUSD?: true
    volOneDay?: true
    volOneMonth?: true
    impermanentLoss?: true
    healthScore?: true
    createdAt?: true
  }

  export type PoolStatisticCountAggregateInputType = {
    id?: true
    poolId?: true
    apr?: true
    tvlUSD?: true
    volOneDay?: true
    volOneMonth?: true
    impermanentLoss?: true
    healthScore?: true
    createdAt?: true
    _all?: true
  }

  export type PoolStatisticAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PoolStatistic to aggregate.
     */
    where?: PoolStatisticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PoolStatistics to fetch.
     */
    orderBy?: PoolStatisticOrderByWithRelationInput | PoolStatisticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PoolStatisticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PoolStatistics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PoolStatistics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned PoolStatistics
    **/
    _count?: true | PoolStatisticCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PoolStatisticAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PoolStatisticSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PoolStatisticMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PoolStatisticMaxAggregateInputType
  }

  export type GetPoolStatisticAggregateType<T extends PoolStatisticAggregateArgs> = {
        [P in keyof T & keyof AggregatePoolStatistic]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePoolStatistic[P]>
      : GetScalarType<T[P], AggregatePoolStatistic[P]>
  }




  export type PoolStatisticGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PoolStatisticWhereInput
    orderBy?: PoolStatisticOrderByWithAggregationInput | PoolStatisticOrderByWithAggregationInput[]
    by: PoolStatisticScalarFieldEnum[] | PoolStatisticScalarFieldEnum
    having?: PoolStatisticScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PoolStatisticCountAggregateInputType | true
    _avg?: PoolStatisticAvgAggregateInputType
    _sum?: PoolStatisticSumAggregateInputType
    _min?: PoolStatisticMinAggregateInputType
    _max?: PoolStatisticMaxAggregateInputType
  }

  export type PoolStatisticGroupByOutputType = {
    id: string
    poolId: string
    apr: number
    tvlUSD: number
    volOneDay: string
    volOneMonth: string
    impermanentLoss: number
    healthScore: number
    createdAt: Date
    _count: PoolStatisticCountAggregateOutputType | null
    _avg: PoolStatisticAvgAggregateOutputType | null
    _sum: PoolStatisticSumAggregateOutputType | null
    _min: PoolStatisticMinAggregateOutputType | null
    _max: PoolStatisticMaxAggregateOutputType | null
  }

  type GetPoolStatisticGroupByPayload<T extends PoolStatisticGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PoolStatisticGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PoolStatisticGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PoolStatisticGroupByOutputType[P]>
            : GetScalarType<T[P], PoolStatisticGroupByOutputType[P]>
        }
      >
    >


  export type PoolStatisticSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poolId?: boolean
    apr?: boolean
    tvlUSD?: boolean
    volOneDay?: boolean
    volOneMonth?: boolean
    impermanentLoss?: boolean
    healthScore?: boolean
    createdAt?: boolean
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["poolStatistic"]>

  export type PoolStatisticSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    poolId?: boolean
    apr?: boolean
    tvlUSD?: boolean
    volOneDay?: boolean
    volOneMonth?: boolean
    impermanentLoss?: boolean
    healthScore?: boolean
    createdAt?: boolean
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["poolStatistic"]>

  export type PoolStatisticSelectScalar = {
    id?: boolean
    poolId?: boolean
    apr?: boolean
    tvlUSD?: boolean
    volOneDay?: boolean
    volOneMonth?: boolean
    impermanentLoss?: boolean
    healthScore?: boolean
    createdAt?: boolean
  }

  export type PoolStatisticInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }
  export type PoolStatisticIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    pool?: boolean | PoolDefaultArgs<ExtArgs>
  }

  export type $PoolStatisticPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "PoolStatistic"
    objects: {
      pool: Prisma.$PoolPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      poolId: string
      apr: number
      tvlUSD: number
      volOneDay: string
      volOneMonth: string
      impermanentLoss: number
      healthScore: number
      createdAt: Date
    }, ExtArgs["result"]["poolStatistic"]>
    composites: {}
  }

  type PoolStatisticGetPayload<S extends boolean | null | undefined | PoolStatisticDefaultArgs> = $Result.GetResult<Prisma.$PoolStatisticPayload, S>

  type PoolStatisticCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<PoolStatisticFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: PoolStatisticCountAggregateInputType | true
    }

  export interface PoolStatisticDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['PoolStatistic'], meta: { name: 'PoolStatistic' } }
    /**
     * Find zero or one PoolStatistic that matches the filter.
     * @param {PoolStatisticFindUniqueArgs} args - Arguments to find a PoolStatistic
     * @example
     * // Get one PoolStatistic
     * const poolStatistic = await prisma.poolStatistic.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PoolStatisticFindUniqueArgs>(args: SelectSubset<T, PoolStatisticFindUniqueArgs<ExtArgs>>): Prisma__PoolStatisticClient<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one PoolStatistic that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {PoolStatisticFindUniqueOrThrowArgs} args - Arguments to find a PoolStatistic
     * @example
     * // Get one PoolStatistic
     * const poolStatistic = await prisma.poolStatistic.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PoolStatisticFindUniqueOrThrowArgs>(args: SelectSubset<T, PoolStatisticFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PoolStatisticClient<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first PoolStatistic that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolStatisticFindFirstArgs} args - Arguments to find a PoolStatistic
     * @example
     * // Get one PoolStatistic
     * const poolStatistic = await prisma.poolStatistic.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PoolStatisticFindFirstArgs>(args?: SelectSubset<T, PoolStatisticFindFirstArgs<ExtArgs>>): Prisma__PoolStatisticClient<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first PoolStatistic that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolStatisticFindFirstOrThrowArgs} args - Arguments to find a PoolStatistic
     * @example
     * // Get one PoolStatistic
     * const poolStatistic = await prisma.poolStatistic.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PoolStatisticFindFirstOrThrowArgs>(args?: SelectSubset<T, PoolStatisticFindFirstOrThrowArgs<ExtArgs>>): Prisma__PoolStatisticClient<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more PoolStatistics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolStatisticFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all PoolStatistics
     * const poolStatistics = await prisma.poolStatistic.findMany()
     * 
     * // Get first 10 PoolStatistics
     * const poolStatistics = await prisma.poolStatistic.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const poolStatisticWithIdOnly = await prisma.poolStatistic.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PoolStatisticFindManyArgs>(args?: SelectSubset<T, PoolStatisticFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a PoolStatistic.
     * @param {PoolStatisticCreateArgs} args - Arguments to create a PoolStatistic.
     * @example
     * // Create one PoolStatistic
     * const PoolStatistic = await prisma.poolStatistic.create({
     *   data: {
     *     // ... data to create a PoolStatistic
     *   }
     * })
     * 
     */
    create<T extends PoolStatisticCreateArgs>(args: SelectSubset<T, PoolStatisticCreateArgs<ExtArgs>>): Prisma__PoolStatisticClient<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many PoolStatistics.
     * @param {PoolStatisticCreateManyArgs} args - Arguments to create many PoolStatistics.
     * @example
     * // Create many PoolStatistics
     * const poolStatistic = await prisma.poolStatistic.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PoolStatisticCreateManyArgs>(args?: SelectSubset<T, PoolStatisticCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many PoolStatistics and returns the data saved in the database.
     * @param {PoolStatisticCreateManyAndReturnArgs} args - Arguments to create many PoolStatistics.
     * @example
     * // Create many PoolStatistics
     * const poolStatistic = await prisma.poolStatistic.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many PoolStatistics and only return the `id`
     * const poolStatisticWithIdOnly = await prisma.poolStatistic.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PoolStatisticCreateManyAndReturnArgs>(args?: SelectSubset<T, PoolStatisticCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a PoolStatistic.
     * @param {PoolStatisticDeleteArgs} args - Arguments to delete one PoolStatistic.
     * @example
     * // Delete one PoolStatistic
     * const PoolStatistic = await prisma.poolStatistic.delete({
     *   where: {
     *     // ... filter to delete one PoolStatistic
     *   }
     * })
     * 
     */
    delete<T extends PoolStatisticDeleteArgs>(args: SelectSubset<T, PoolStatisticDeleteArgs<ExtArgs>>): Prisma__PoolStatisticClient<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one PoolStatistic.
     * @param {PoolStatisticUpdateArgs} args - Arguments to update one PoolStatistic.
     * @example
     * // Update one PoolStatistic
     * const poolStatistic = await prisma.poolStatistic.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PoolStatisticUpdateArgs>(args: SelectSubset<T, PoolStatisticUpdateArgs<ExtArgs>>): Prisma__PoolStatisticClient<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more PoolStatistics.
     * @param {PoolStatisticDeleteManyArgs} args - Arguments to filter PoolStatistics to delete.
     * @example
     * // Delete a few PoolStatistics
     * const { count } = await prisma.poolStatistic.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PoolStatisticDeleteManyArgs>(args?: SelectSubset<T, PoolStatisticDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more PoolStatistics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolStatisticUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many PoolStatistics
     * const poolStatistic = await prisma.poolStatistic.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PoolStatisticUpdateManyArgs>(args: SelectSubset<T, PoolStatisticUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one PoolStatistic.
     * @param {PoolStatisticUpsertArgs} args - Arguments to update or create a PoolStatistic.
     * @example
     * // Update or create a PoolStatistic
     * const poolStatistic = await prisma.poolStatistic.upsert({
     *   create: {
     *     // ... data to create a PoolStatistic
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the PoolStatistic we want to update
     *   }
     * })
     */
    upsert<T extends PoolStatisticUpsertArgs>(args: SelectSubset<T, PoolStatisticUpsertArgs<ExtArgs>>): Prisma__PoolStatisticClient<$Result.GetResult<Prisma.$PoolStatisticPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of PoolStatistics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolStatisticCountArgs} args - Arguments to filter PoolStatistics to count.
     * @example
     * // Count the number of PoolStatistics
     * const count = await prisma.poolStatistic.count({
     *   where: {
     *     // ... the filter for the PoolStatistics we want to count
     *   }
     * })
    **/
    count<T extends PoolStatisticCountArgs>(
      args?: Subset<T, PoolStatisticCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PoolStatisticCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a PoolStatistic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolStatisticAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PoolStatisticAggregateArgs>(args: Subset<T, PoolStatisticAggregateArgs>): Prisma.PrismaPromise<GetPoolStatisticAggregateType<T>>

    /**
     * Group by PoolStatistic.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PoolStatisticGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PoolStatisticGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PoolStatisticGroupByArgs['orderBy'] }
        : { orderBy?: PoolStatisticGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PoolStatisticGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPoolStatisticGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the PoolStatistic model
   */
  readonly fields: PoolStatisticFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for PoolStatistic.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PoolStatisticClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    pool<T extends PoolDefaultArgs<ExtArgs> = {}>(args?: Subset<T, PoolDefaultArgs<ExtArgs>>): Prisma__PoolClient<$Result.GetResult<Prisma.$PoolPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the PoolStatistic model
   */ 
  interface PoolStatisticFieldRefs {
    readonly id: FieldRef<"PoolStatistic", 'String'>
    readonly poolId: FieldRef<"PoolStatistic", 'String'>
    readonly apr: FieldRef<"PoolStatistic", 'Float'>
    readonly tvlUSD: FieldRef<"PoolStatistic", 'Float'>
    readonly volOneDay: FieldRef<"PoolStatistic", 'String'>
    readonly volOneMonth: FieldRef<"PoolStatistic", 'String'>
    readonly impermanentLoss: FieldRef<"PoolStatistic", 'Float'>
    readonly healthScore: FieldRef<"PoolStatistic", 'Int'>
    readonly createdAt: FieldRef<"PoolStatistic", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * PoolStatistic findUnique
   */
  export type PoolStatisticFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    /**
     * Filter, which PoolStatistic to fetch.
     */
    where: PoolStatisticWhereUniqueInput
  }

  /**
   * PoolStatistic findUniqueOrThrow
   */
  export type PoolStatisticFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    /**
     * Filter, which PoolStatistic to fetch.
     */
    where: PoolStatisticWhereUniqueInput
  }

  /**
   * PoolStatistic findFirst
   */
  export type PoolStatisticFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    /**
     * Filter, which PoolStatistic to fetch.
     */
    where?: PoolStatisticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PoolStatistics to fetch.
     */
    orderBy?: PoolStatisticOrderByWithRelationInput | PoolStatisticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PoolStatistics.
     */
    cursor?: PoolStatisticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PoolStatistics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PoolStatistics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PoolStatistics.
     */
    distinct?: PoolStatisticScalarFieldEnum | PoolStatisticScalarFieldEnum[]
  }

  /**
   * PoolStatistic findFirstOrThrow
   */
  export type PoolStatisticFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    /**
     * Filter, which PoolStatistic to fetch.
     */
    where?: PoolStatisticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PoolStatistics to fetch.
     */
    orderBy?: PoolStatisticOrderByWithRelationInput | PoolStatisticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for PoolStatistics.
     */
    cursor?: PoolStatisticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PoolStatistics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PoolStatistics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of PoolStatistics.
     */
    distinct?: PoolStatisticScalarFieldEnum | PoolStatisticScalarFieldEnum[]
  }

  /**
   * PoolStatistic findMany
   */
  export type PoolStatisticFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    /**
     * Filter, which PoolStatistics to fetch.
     */
    where?: PoolStatisticWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of PoolStatistics to fetch.
     */
    orderBy?: PoolStatisticOrderByWithRelationInput | PoolStatisticOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing PoolStatistics.
     */
    cursor?: PoolStatisticWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` PoolStatistics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` PoolStatistics.
     */
    skip?: number
    distinct?: PoolStatisticScalarFieldEnum | PoolStatisticScalarFieldEnum[]
  }

  /**
   * PoolStatistic create
   */
  export type PoolStatisticCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    /**
     * The data needed to create a PoolStatistic.
     */
    data: XOR<PoolStatisticCreateInput, PoolStatisticUncheckedCreateInput>
  }

  /**
   * PoolStatistic createMany
   */
  export type PoolStatisticCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many PoolStatistics.
     */
    data: PoolStatisticCreateManyInput | PoolStatisticCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * PoolStatistic createManyAndReturn
   */
  export type PoolStatisticCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many PoolStatistics.
     */
    data: PoolStatisticCreateManyInput | PoolStatisticCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * PoolStatistic update
   */
  export type PoolStatisticUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    /**
     * The data needed to update a PoolStatistic.
     */
    data: XOR<PoolStatisticUpdateInput, PoolStatisticUncheckedUpdateInput>
    /**
     * Choose, which PoolStatistic to update.
     */
    where: PoolStatisticWhereUniqueInput
  }

  /**
   * PoolStatistic updateMany
   */
  export type PoolStatisticUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update PoolStatistics.
     */
    data: XOR<PoolStatisticUpdateManyMutationInput, PoolStatisticUncheckedUpdateManyInput>
    /**
     * Filter which PoolStatistics to update
     */
    where?: PoolStatisticWhereInput
  }

  /**
   * PoolStatistic upsert
   */
  export type PoolStatisticUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    /**
     * The filter to search for the PoolStatistic to update in case it exists.
     */
    where: PoolStatisticWhereUniqueInput
    /**
     * In case the PoolStatistic found by the `where` argument doesn't exist, create a new PoolStatistic with this data.
     */
    create: XOR<PoolStatisticCreateInput, PoolStatisticUncheckedCreateInput>
    /**
     * In case the PoolStatistic was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PoolStatisticUpdateInput, PoolStatisticUncheckedUpdateInput>
  }

  /**
   * PoolStatistic delete
   */
  export type PoolStatisticDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
    /**
     * Filter which PoolStatistic to delete.
     */
    where: PoolStatisticWhereUniqueInput
  }

  /**
   * PoolStatistic deleteMany
   */
  export type PoolStatisticDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which PoolStatistics to delete
     */
    where?: PoolStatisticWhereInput
  }

  /**
   * PoolStatistic without action
   */
  export type PoolStatisticDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PoolStatistic
     */
    select?: PoolStatisticSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: PoolStatisticInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const PoolScalarFieldEnum: {
    id: 'id',
    address: 'address',
    token0Id: 'token0Id',
    token1Id: 'token1Id',
    fee: 'fee',
    liquidity: 'liquidity',
    tick: 'tick',
    sqrtPriceX96: 'sqrtPriceX96',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PoolScalarFieldEnum = (typeof PoolScalarFieldEnum)[keyof typeof PoolScalarFieldEnum]


  export const SwapScalarFieldEnum: {
    id: 'id',
    sender: 'sender',
    recipient: 'recipient',
    amount0: 'amount0',
    amount1: 'amount1',
    sqrtPriceX96: 'sqrtPriceX96',
    tick: 'tick',
    transactionHash: 'transactionHash',
    logIndex: 'logIndex',
    poolAddress: 'poolAddress',
    poolId: 'poolId',
    gasUsed: 'gasUsed',
    gasPrice: 'gasPrice',
    createdAt: 'createdAt'
  };

  export type SwapScalarFieldEnum = (typeof SwapScalarFieldEnum)[keyof typeof SwapScalarFieldEnum]


  export const IndexerStateScalarFieldEnum: {
    id: 'id',
    lastBlock: 'lastBlock',
    lastUpdate: 'lastUpdate'
  };

  export type IndexerStateScalarFieldEnum = (typeof IndexerStateScalarFieldEnum)[keyof typeof IndexerStateScalarFieldEnum]


  export const TokenScalarFieldEnum: {
    id: 'id',
    address: 'address',
    symbol: 'symbol',
    name: 'name',
    decimals: 'decimals',
    logoUri: 'logoUri',
    coingeckoId: 'coingeckoId',
    tags: 'tags'
  };

  export type TokenScalarFieldEnum = (typeof TokenScalarFieldEnum)[keyof typeof TokenScalarFieldEnum]


  export const TokenStatisticScalarFieldEnum: {
    id: 'id',
    tokenId: 'tokenId',
    price: 'price',
    oneHourEvolution: 'oneHourEvolution',
    oneDayEvolution: 'oneDayEvolution',
    volume: 'volume',
    createdAt: 'createdAt'
  };

  export type TokenStatisticScalarFieldEnum = (typeof TokenStatisticScalarFieldEnum)[keyof typeof TokenStatisticScalarFieldEnum]


  export const PoolStatisticScalarFieldEnum: {
    id: 'id',
    poolId: 'poolId',
    apr: 'apr',
    tvlUSD: 'tvlUSD',
    volOneDay: 'volOneDay',
    volOneMonth: 'volOneMonth',
    impermanentLoss: 'impermanentLoss',
    healthScore: 'healthScore',
    createdAt: 'createdAt'
  };

  export type PoolStatisticScalarFieldEnum = (typeof PoolStatisticScalarFieldEnum)[keyof typeof PoolStatisticScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type PoolWhereInput = {
    AND?: PoolWhereInput | PoolWhereInput[]
    OR?: PoolWhereInput[]
    NOT?: PoolWhereInput | PoolWhereInput[]
    id?: StringFilter<"Pool"> | string
    address?: StringFilter<"Pool"> | string
    token0Id?: StringFilter<"Pool"> | string
    token1Id?: StringFilter<"Pool"> | string
    fee?: IntFilter<"Pool"> | number
    liquidity?: StringNullableFilter<"Pool"> | string | null
    tick?: IntNullableFilter<"Pool"> | number | null
    sqrtPriceX96?: StringNullableFilter<"Pool"> | string | null
    createdAt?: DateTimeFilter<"Pool"> | Date | string
    updatedAt?: DateTimeFilter<"Pool"> | Date | string
    token0?: XOR<TokenRelationFilter, TokenWhereInput>
    token1?: XOR<TokenRelationFilter, TokenWhereInput>
    swaps?: SwapListRelationFilter
    PoolStatistic?: PoolStatisticListRelationFilter
  }

  export type PoolOrderByWithRelationInput = {
    id?: SortOrder
    address?: SortOrder
    token0Id?: SortOrder
    token1Id?: SortOrder
    fee?: SortOrder
    liquidity?: SortOrderInput | SortOrder
    tick?: SortOrderInput | SortOrder
    sqrtPriceX96?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    token0?: TokenOrderByWithRelationInput
    token1?: TokenOrderByWithRelationInput
    swaps?: SwapOrderByRelationAggregateInput
    PoolStatistic?: PoolStatisticOrderByRelationAggregateInput
  }

  export type PoolWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    address?: string
    AND?: PoolWhereInput | PoolWhereInput[]
    OR?: PoolWhereInput[]
    NOT?: PoolWhereInput | PoolWhereInput[]
    token0Id?: StringFilter<"Pool"> | string
    token1Id?: StringFilter<"Pool"> | string
    fee?: IntFilter<"Pool"> | number
    liquidity?: StringNullableFilter<"Pool"> | string | null
    tick?: IntNullableFilter<"Pool"> | number | null
    sqrtPriceX96?: StringNullableFilter<"Pool"> | string | null
    createdAt?: DateTimeFilter<"Pool"> | Date | string
    updatedAt?: DateTimeFilter<"Pool"> | Date | string
    token0?: XOR<TokenRelationFilter, TokenWhereInput>
    token1?: XOR<TokenRelationFilter, TokenWhereInput>
    swaps?: SwapListRelationFilter
    PoolStatistic?: PoolStatisticListRelationFilter
  }, "id" | "address">

  export type PoolOrderByWithAggregationInput = {
    id?: SortOrder
    address?: SortOrder
    token0Id?: SortOrder
    token1Id?: SortOrder
    fee?: SortOrder
    liquidity?: SortOrderInput | SortOrder
    tick?: SortOrderInput | SortOrder
    sqrtPriceX96?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PoolCountOrderByAggregateInput
    _avg?: PoolAvgOrderByAggregateInput
    _max?: PoolMaxOrderByAggregateInput
    _min?: PoolMinOrderByAggregateInput
    _sum?: PoolSumOrderByAggregateInput
  }

  export type PoolScalarWhereWithAggregatesInput = {
    AND?: PoolScalarWhereWithAggregatesInput | PoolScalarWhereWithAggregatesInput[]
    OR?: PoolScalarWhereWithAggregatesInput[]
    NOT?: PoolScalarWhereWithAggregatesInput | PoolScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Pool"> | string
    address?: StringWithAggregatesFilter<"Pool"> | string
    token0Id?: StringWithAggregatesFilter<"Pool"> | string
    token1Id?: StringWithAggregatesFilter<"Pool"> | string
    fee?: IntWithAggregatesFilter<"Pool"> | number
    liquidity?: StringNullableWithAggregatesFilter<"Pool"> | string | null
    tick?: IntNullableWithAggregatesFilter<"Pool"> | number | null
    sqrtPriceX96?: StringNullableWithAggregatesFilter<"Pool"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Pool"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Pool"> | Date | string
  }

  export type SwapWhereInput = {
    AND?: SwapWhereInput | SwapWhereInput[]
    OR?: SwapWhereInput[]
    NOT?: SwapWhereInput | SwapWhereInput[]
    id?: StringFilter<"Swap"> | string
    sender?: StringFilter<"Swap"> | string
    recipient?: StringFilter<"Swap"> | string
    amount0?: StringFilter<"Swap"> | string
    amount1?: StringFilter<"Swap"> | string
    sqrtPriceX96?: StringFilter<"Swap"> | string
    tick?: IntFilter<"Swap"> | number
    transactionHash?: StringFilter<"Swap"> | string
    logIndex?: IntFilter<"Swap"> | number
    poolAddress?: StringFilter<"Swap"> | string
    poolId?: StringFilter<"Swap"> | string
    gasUsed?: IntFilter<"Swap"> | number
    gasPrice?: StringFilter<"Swap"> | string
    createdAt?: DateTimeFilter<"Swap"> | Date | string
    pool?: XOR<PoolRelationFilter, PoolWhereInput>
  }

  export type SwapOrderByWithRelationInput = {
    id?: SortOrder
    sender?: SortOrder
    recipient?: SortOrder
    amount0?: SortOrder
    amount1?: SortOrder
    sqrtPriceX96?: SortOrder
    tick?: SortOrder
    transactionHash?: SortOrder
    logIndex?: SortOrder
    poolAddress?: SortOrder
    poolId?: SortOrder
    gasUsed?: SortOrder
    gasPrice?: SortOrder
    createdAt?: SortOrder
    pool?: PoolOrderByWithRelationInput
  }

  export type SwapWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    transactionHash_logIndex?: SwapTransactionHashLogIndexCompoundUniqueInput
    AND?: SwapWhereInput | SwapWhereInput[]
    OR?: SwapWhereInput[]
    NOT?: SwapWhereInput | SwapWhereInput[]
    sender?: StringFilter<"Swap"> | string
    recipient?: StringFilter<"Swap"> | string
    amount0?: StringFilter<"Swap"> | string
    amount1?: StringFilter<"Swap"> | string
    sqrtPriceX96?: StringFilter<"Swap"> | string
    tick?: IntFilter<"Swap"> | number
    transactionHash?: StringFilter<"Swap"> | string
    logIndex?: IntFilter<"Swap"> | number
    poolAddress?: StringFilter<"Swap"> | string
    poolId?: StringFilter<"Swap"> | string
    gasUsed?: IntFilter<"Swap"> | number
    gasPrice?: StringFilter<"Swap"> | string
    createdAt?: DateTimeFilter<"Swap"> | Date | string
    pool?: XOR<PoolRelationFilter, PoolWhereInput>
  }, "id" | "transactionHash_logIndex">

  export type SwapOrderByWithAggregationInput = {
    id?: SortOrder
    sender?: SortOrder
    recipient?: SortOrder
    amount0?: SortOrder
    amount1?: SortOrder
    sqrtPriceX96?: SortOrder
    tick?: SortOrder
    transactionHash?: SortOrder
    logIndex?: SortOrder
    poolAddress?: SortOrder
    poolId?: SortOrder
    gasUsed?: SortOrder
    gasPrice?: SortOrder
    createdAt?: SortOrder
    _count?: SwapCountOrderByAggregateInput
    _avg?: SwapAvgOrderByAggregateInput
    _max?: SwapMaxOrderByAggregateInput
    _min?: SwapMinOrderByAggregateInput
    _sum?: SwapSumOrderByAggregateInput
  }

  export type SwapScalarWhereWithAggregatesInput = {
    AND?: SwapScalarWhereWithAggregatesInput | SwapScalarWhereWithAggregatesInput[]
    OR?: SwapScalarWhereWithAggregatesInput[]
    NOT?: SwapScalarWhereWithAggregatesInput | SwapScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Swap"> | string
    sender?: StringWithAggregatesFilter<"Swap"> | string
    recipient?: StringWithAggregatesFilter<"Swap"> | string
    amount0?: StringWithAggregatesFilter<"Swap"> | string
    amount1?: StringWithAggregatesFilter<"Swap"> | string
    sqrtPriceX96?: StringWithAggregatesFilter<"Swap"> | string
    tick?: IntWithAggregatesFilter<"Swap"> | number
    transactionHash?: StringWithAggregatesFilter<"Swap"> | string
    logIndex?: IntWithAggregatesFilter<"Swap"> | number
    poolAddress?: StringWithAggregatesFilter<"Swap"> | string
    poolId?: StringWithAggregatesFilter<"Swap"> | string
    gasUsed?: IntWithAggregatesFilter<"Swap"> | number
    gasPrice?: StringWithAggregatesFilter<"Swap"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Swap"> | Date | string
  }

  export type IndexerStateWhereInput = {
    AND?: IndexerStateWhereInput | IndexerStateWhereInput[]
    OR?: IndexerStateWhereInput[]
    NOT?: IndexerStateWhereInput | IndexerStateWhereInput[]
    id?: StringFilter<"IndexerState"> | string
    lastBlock?: BigIntFilter<"IndexerState"> | bigint | number
    lastUpdate?: DateTimeFilter<"IndexerState"> | Date | string
  }

  export type IndexerStateOrderByWithRelationInput = {
    id?: SortOrder
    lastBlock?: SortOrder
    lastUpdate?: SortOrder
  }

  export type IndexerStateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: IndexerStateWhereInput | IndexerStateWhereInput[]
    OR?: IndexerStateWhereInput[]
    NOT?: IndexerStateWhereInput | IndexerStateWhereInput[]
    lastBlock?: BigIntFilter<"IndexerState"> | bigint | number
    lastUpdate?: DateTimeFilter<"IndexerState"> | Date | string
  }, "id">

  export type IndexerStateOrderByWithAggregationInput = {
    id?: SortOrder
    lastBlock?: SortOrder
    lastUpdate?: SortOrder
    _count?: IndexerStateCountOrderByAggregateInput
    _avg?: IndexerStateAvgOrderByAggregateInput
    _max?: IndexerStateMaxOrderByAggregateInput
    _min?: IndexerStateMinOrderByAggregateInput
    _sum?: IndexerStateSumOrderByAggregateInput
  }

  export type IndexerStateScalarWhereWithAggregatesInput = {
    AND?: IndexerStateScalarWhereWithAggregatesInput | IndexerStateScalarWhereWithAggregatesInput[]
    OR?: IndexerStateScalarWhereWithAggregatesInput[]
    NOT?: IndexerStateScalarWhereWithAggregatesInput | IndexerStateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"IndexerState"> | string
    lastBlock?: BigIntWithAggregatesFilter<"IndexerState"> | bigint | number
    lastUpdate?: DateTimeWithAggregatesFilter<"IndexerState"> | Date | string
  }

  export type TokenWhereInput = {
    AND?: TokenWhereInput | TokenWhereInput[]
    OR?: TokenWhereInput[]
    NOT?: TokenWhereInput | TokenWhereInput[]
    id?: StringFilter<"Token"> | string
    address?: StringFilter<"Token"> | string
    symbol?: StringFilter<"Token"> | string
    name?: StringFilter<"Token"> | string
    decimals?: IntFilter<"Token"> | number
    logoUri?: StringNullableFilter<"Token"> | string | null
    coingeckoId?: StringNullableFilter<"Token"> | string | null
    tags?: StringNullableListFilter<"Token">
    poolsAsToken0?: PoolListRelationFilter
    poolsAsToken1?: PoolListRelationFilter
    Statistic?: TokenStatisticListRelationFilter
  }

  export type TokenOrderByWithRelationInput = {
    id?: SortOrder
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrderInput | SortOrder
    coingeckoId?: SortOrderInput | SortOrder
    tags?: SortOrder
    poolsAsToken0?: PoolOrderByRelationAggregateInput
    poolsAsToken1?: PoolOrderByRelationAggregateInput
    Statistic?: TokenStatisticOrderByRelationAggregateInput
  }

  export type TokenWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    address?: string
    AND?: TokenWhereInput | TokenWhereInput[]
    OR?: TokenWhereInput[]
    NOT?: TokenWhereInput | TokenWhereInput[]
    symbol?: StringFilter<"Token"> | string
    name?: StringFilter<"Token"> | string
    decimals?: IntFilter<"Token"> | number
    logoUri?: StringNullableFilter<"Token"> | string | null
    coingeckoId?: StringNullableFilter<"Token"> | string | null
    tags?: StringNullableListFilter<"Token">
    poolsAsToken0?: PoolListRelationFilter
    poolsAsToken1?: PoolListRelationFilter
    Statistic?: TokenStatisticListRelationFilter
  }, "id" | "address">

  export type TokenOrderByWithAggregationInput = {
    id?: SortOrder
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrderInput | SortOrder
    coingeckoId?: SortOrderInput | SortOrder
    tags?: SortOrder
    _count?: TokenCountOrderByAggregateInput
    _avg?: TokenAvgOrderByAggregateInput
    _max?: TokenMaxOrderByAggregateInput
    _min?: TokenMinOrderByAggregateInput
    _sum?: TokenSumOrderByAggregateInput
  }

  export type TokenScalarWhereWithAggregatesInput = {
    AND?: TokenScalarWhereWithAggregatesInput | TokenScalarWhereWithAggregatesInput[]
    OR?: TokenScalarWhereWithAggregatesInput[]
    NOT?: TokenScalarWhereWithAggregatesInput | TokenScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Token"> | string
    address?: StringWithAggregatesFilter<"Token"> | string
    symbol?: StringWithAggregatesFilter<"Token"> | string
    name?: StringWithAggregatesFilter<"Token"> | string
    decimals?: IntWithAggregatesFilter<"Token"> | number
    logoUri?: StringNullableWithAggregatesFilter<"Token"> | string | null
    coingeckoId?: StringNullableWithAggregatesFilter<"Token"> | string | null
    tags?: StringNullableListFilter<"Token">
  }

  export type TokenStatisticWhereInput = {
    AND?: TokenStatisticWhereInput | TokenStatisticWhereInput[]
    OR?: TokenStatisticWhereInput[]
    NOT?: TokenStatisticWhereInput | TokenStatisticWhereInput[]
    id?: StringFilter<"TokenStatistic"> | string
    tokenId?: StringFilter<"TokenStatistic"> | string
    price?: FloatFilter<"TokenStatistic"> | number
    oneHourEvolution?: FloatFilter<"TokenStatistic"> | number
    oneDayEvolution?: FloatFilter<"TokenStatistic"> | number
    volume?: FloatFilter<"TokenStatistic"> | number
    createdAt?: DateTimeFilter<"TokenStatistic"> | Date | string
    token?: XOR<TokenRelationFilter, TokenWhereInput>
  }

  export type TokenStatisticOrderByWithRelationInput = {
    id?: SortOrder
    tokenId?: SortOrder
    price?: SortOrder
    oneHourEvolution?: SortOrder
    oneDayEvolution?: SortOrder
    volume?: SortOrder
    createdAt?: SortOrder
    token?: TokenOrderByWithRelationInput
  }

  export type TokenStatisticWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TokenStatisticWhereInput | TokenStatisticWhereInput[]
    OR?: TokenStatisticWhereInput[]
    NOT?: TokenStatisticWhereInput | TokenStatisticWhereInput[]
    tokenId?: StringFilter<"TokenStatistic"> | string
    price?: FloatFilter<"TokenStatistic"> | number
    oneHourEvolution?: FloatFilter<"TokenStatistic"> | number
    oneDayEvolution?: FloatFilter<"TokenStatistic"> | number
    volume?: FloatFilter<"TokenStatistic"> | number
    createdAt?: DateTimeFilter<"TokenStatistic"> | Date | string
    token?: XOR<TokenRelationFilter, TokenWhereInput>
  }, "id">

  export type TokenStatisticOrderByWithAggregationInput = {
    id?: SortOrder
    tokenId?: SortOrder
    price?: SortOrder
    oneHourEvolution?: SortOrder
    oneDayEvolution?: SortOrder
    volume?: SortOrder
    createdAt?: SortOrder
    _count?: TokenStatisticCountOrderByAggregateInput
    _avg?: TokenStatisticAvgOrderByAggregateInput
    _max?: TokenStatisticMaxOrderByAggregateInput
    _min?: TokenStatisticMinOrderByAggregateInput
    _sum?: TokenStatisticSumOrderByAggregateInput
  }

  export type TokenStatisticScalarWhereWithAggregatesInput = {
    AND?: TokenStatisticScalarWhereWithAggregatesInput | TokenStatisticScalarWhereWithAggregatesInput[]
    OR?: TokenStatisticScalarWhereWithAggregatesInput[]
    NOT?: TokenStatisticScalarWhereWithAggregatesInput | TokenStatisticScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TokenStatistic"> | string
    tokenId?: StringWithAggregatesFilter<"TokenStatistic"> | string
    price?: FloatWithAggregatesFilter<"TokenStatistic"> | number
    oneHourEvolution?: FloatWithAggregatesFilter<"TokenStatistic"> | number
    oneDayEvolution?: FloatWithAggregatesFilter<"TokenStatistic"> | number
    volume?: FloatWithAggregatesFilter<"TokenStatistic"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TokenStatistic"> | Date | string
  }

  export type PoolStatisticWhereInput = {
    AND?: PoolStatisticWhereInput | PoolStatisticWhereInput[]
    OR?: PoolStatisticWhereInput[]
    NOT?: PoolStatisticWhereInput | PoolStatisticWhereInput[]
    id?: StringFilter<"PoolStatistic"> | string
    poolId?: StringFilter<"PoolStatistic"> | string
    apr?: FloatFilter<"PoolStatistic"> | number
    tvlUSD?: FloatFilter<"PoolStatistic"> | number
    volOneDay?: StringFilter<"PoolStatistic"> | string
    volOneMonth?: StringFilter<"PoolStatistic"> | string
    impermanentLoss?: FloatFilter<"PoolStatistic"> | number
    healthScore?: IntFilter<"PoolStatistic"> | number
    createdAt?: DateTimeFilter<"PoolStatistic"> | Date | string
    pool?: XOR<PoolRelationFilter, PoolWhereInput>
  }

  export type PoolStatisticOrderByWithRelationInput = {
    id?: SortOrder
    poolId?: SortOrder
    apr?: SortOrder
    tvlUSD?: SortOrder
    volOneDay?: SortOrder
    volOneMonth?: SortOrder
    impermanentLoss?: SortOrder
    healthScore?: SortOrder
    createdAt?: SortOrder
    pool?: PoolOrderByWithRelationInput
  }

  export type PoolStatisticWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: PoolStatisticWhereInput | PoolStatisticWhereInput[]
    OR?: PoolStatisticWhereInput[]
    NOT?: PoolStatisticWhereInput | PoolStatisticWhereInput[]
    poolId?: StringFilter<"PoolStatistic"> | string
    apr?: FloatFilter<"PoolStatistic"> | number
    tvlUSD?: FloatFilter<"PoolStatistic"> | number
    volOneDay?: StringFilter<"PoolStatistic"> | string
    volOneMonth?: StringFilter<"PoolStatistic"> | string
    impermanentLoss?: FloatFilter<"PoolStatistic"> | number
    healthScore?: IntFilter<"PoolStatistic"> | number
    createdAt?: DateTimeFilter<"PoolStatistic"> | Date | string
    pool?: XOR<PoolRelationFilter, PoolWhereInput>
  }, "id">

  export type PoolStatisticOrderByWithAggregationInput = {
    id?: SortOrder
    poolId?: SortOrder
    apr?: SortOrder
    tvlUSD?: SortOrder
    volOneDay?: SortOrder
    volOneMonth?: SortOrder
    impermanentLoss?: SortOrder
    healthScore?: SortOrder
    createdAt?: SortOrder
    _count?: PoolStatisticCountOrderByAggregateInput
    _avg?: PoolStatisticAvgOrderByAggregateInput
    _max?: PoolStatisticMaxOrderByAggregateInput
    _min?: PoolStatisticMinOrderByAggregateInput
    _sum?: PoolStatisticSumOrderByAggregateInput
  }

  export type PoolStatisticScalarWhereWithAggregatesInput = {
    AND?: PoolStatisticScalarWhereWithAggregatesInput | PoolStatisticScalarWhereWithAggregatesInput[]
    OR?: PoolStatisticScalarWhereWithAggregatesInput[]
    NOT?: PoolStatisticScalarWhereWithAggregatesInput | PoolStatisticScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"PoolStatistic"> | string
    poolId?: StringWithAggregatesFilter<"PoolStatistic"> | string
    apr?: FloatWithAggregatesFilter<"PoolStatistic"> | number
    tvlUSD?: FloatWithAggregatesFilter<"PoolStatistic"> | number
    volOneDay?: StringWithAggregatesFilter<"PoolStatistic"> | string
    volOneMonth?: StringWithAggregatesFilter<"PoolStatistic"> | string
    impermanentLoss?: FloatWithAggregatesFilter<"PoolStatistic"> | number
    healthScore?: IntWithAggregatesFilter<"PoolStatistic"> | number
    createdAt?: DateTimeWithAggregatesFilter<"PoolStatistic"> | Date | string
  }

  export type PoolCreateInput = {
    id?: string
    address: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    token0: TokenCreateNestedOneWithoutPoolsAsToken0Input
    token1: TokenCreateNestedOneWithoutPoolsAsToken1Input
    swaps?: SwapCreateNestedManyWithoutPoolInput
    PoolStatistic?: PoolStatisticCreateNestedManyWithoutPoolInput
  }

  export type PoolUncheckedCreateInput = {
    id?: string
    address: string
    token0Id: string
    token1Id: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    swaps?: SwapUncheckedCreateNestedManyWithoutPoolInput
    PoolStatistic?: PoolStatisticUncheckedCreateNestedManyWithoutPoolInput
  }

  export type PoolUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token0?: TokenUpdateOneRequiredWithoutPoolsAsToken0NestedInput
    token1?: TokenUpdateOneRequiredWithoutPoolsAsToken1NestedInput
    swaps?: SwapUpdateManyWithoutPoolNestedInput
    PoolStatistic?: PoolStatisticUpdateManyWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    token0Id?: StringFieldUpdateOperationsInput | string
    token1Id?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    swaps?: SwapUncheckedUpdateManyWithoutPoolNestedInput
    PoolStatistic?: PoolStatisticUncheckedUpdateManyWithoutPoolNestedInput
  }

  export type PoolCreateManyInput = {
    id?: string
    address: string
    token0Id: string
    token1Id: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PoolUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    token0Id?: StringFieldUpdateOperationsInput | string
    token1Id?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SwapCreateInput = {
    id?: string
    sender: string
    recipient: string
    amount0: string
    amount1: string
    sqrtPriceX96: string
    tick: number
    transactionHash: string
    logIndex: number
    poolAddress: string
    gasUsed: number
    gasPrice: string
    createdAt?: Date | string
    pool: PoolCreateNestedOneWithoutSwapsInput
  }

  export type SwapUncheckedCreateInput = {
    id?: string
    sender: string
    recipient: string
    amount0: string
    amount1: string
    sqrtPriceX96: string
    tick: number
    transactionHash: string
    logIndex: number
    poolAddress: string
    poolId: string
    gasUsed: number
    gasPrice: string
    createdAt?: Date | string
  }

  export type SwapUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sender?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    amount0?: StringFieldUpdateOperationsInput | string
    amount1?: StringFieldUpdateOperationsInput | string
    sqrtPriceX96?: StringFieldUpdateOperationsInput | string
    tick?: IntFieldUpdateOperationsInput | number
    transactionHash?: StringFieldUpdateOperationsInput | string
    logIndex?: IntFieldUpdateOperationsInput | number
    poolAddress?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
    gasPrice?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUpdateOneRequiredWithoutSwapsNestedInput
  }

  export type SwapUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sender?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    amount0?: StringFieldUpdateOperationsInput | string
    amount1?: StringFieldUpdateOperationsInput | string
    sqrtPriceX96?: StringFieldUpdateOperationsInput | string
    tick?: IntFieldUpdateOperationsInput | number
    transactionHash?: StringFieldUpdateOperationsInput | string
    logIndex?: IntFieldUpdateOperationsInput | number
    poolAddress?: StringFieldUpdateOperationsInput | string
    poolId?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
    gasPrice?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SwapCreateManyInput = {
    id?: string
    sender: string
    recipient: string
    amount0: string
    amount1: string
    sqrtPriceX96: string
    tick: number
    transactionHash: string
    logIndex: number
    poolAddress: string
    poolId: string
    gasUsed: number
    gasPrice: string
    createdAt?: Date | string
  }

  export type SwapUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    sender?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    amount0?: StringFieldUpdateOperationsInput | string
    amount1?: StringFieldUpdateOperationsInput | string
    sqrtPriceX96?: StringFieldUpdateOperationsInput | string
    tick?: IntFieldUpdateOperationsInput | number
    transactionHash?: StringFieldUpdateOperationsInput | string
    logIndex?: IntFieldUpdateOperationsInput | number
    poolAddress?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
    gasPrice?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SwapUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sender?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    amount0?: StringFieldUpdateOperationsInput | string
    amount1?: StringFieldUpdateOperationsInput | string
    sqrtPriceX96?: StringFieldUpdateOperationsInput | string
    tick?: IntFieldUpdateOperationsInput | number
    transactionHash?: StringFieldUpdateOperationsInput | string
    logIndex?: IntFieldUpdateOperationsInput | number
    poolAddress?: StringFieldUpdateOperationsInput | string
    poolId?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
    gasPrice?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndexerStateCreateInput = {
    id?: string
    lastBlock?: bigint | number
    lastUpdate?: Date | string
  }

  export type IndexerStateUncheckedCreateInput = {
    id?: string
    lastBlock?: bigint | number
    lastUpdate?: Date | string
  }

  export type IndexerStateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastBlock?: BigIntFieldUpdateOperationsInput | bigint | number
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndexerStateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastBlock?: BigIntFieldUpdateOperationsInput | bigint | number
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndexerStateCreateManyInput = {
    id?: string
    lastBlock?: bigint | number
    lastUpdate?: Date | string
  }

  export type IndexerStateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastBlock?: BigIntFieldUpdateOperationsInput | bigint | number
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IndexerStateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    lastBlock?: BigIntFieldUpdateOperationsInput | bigint | number
    lastUpdate?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenCreateInput = {
    id?: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    coingeckoId?: string | null
    tags?: TokenCreatetagsInput | string[]
    poolsAsToken0?: PoolCreateNestedManyWithoutToken0Input
    poolsAsToken1?: PoolCreateNestedManyWithoutToken1Input
    Statistic?: TokenStatisticCreateNestedManyWithoutTokenInput
  }

  export type TokenUncheckedCreateInput = {
    id?: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    coingeckoId?: string | null
    tags?: TokenCreatetagsInput | string[]
    poolsAsToken0?: PoolUncheckedCreateNestedManyWithoutToken0Input
    poolsAsToken1?: PoolUncheckedCreateNestedManyWithoutToken1Input
    Statistic?: TokenStatisticUncheckedCreateNestedManyWithoutTokenInput
  }

  export type TokenUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
    poolsAsToken0?: PoolUpdateManyWithoutToken0NestedInput
    poolsAsToken1?: PoolUpdateManyWithoutToken1NestedInput
    Statistic?: TokenStatisticUpdateManyWithoutTokenNestedInput
  }

  export type TokenUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
    poolsAsToken0?: PoolUncheckedUpdateManyWithoutToken0NestedInput
    poolsAsToken1?: PoolUncheckedUpdateManyWithoutToken1NestedInput
    Statistic?: TokenStatisticUncheckedUpdateManyWithoutTokenNestedInput
  }

  export type TokenCreateManyInput = {
    id?: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    coingeckoId?: string | null
    tags?: TokenCreatetagsInput | string[]
  }

  export type TokenUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
  }

  export type TokenUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
  }

  export type TokenStatisticCreateInput = {
    id?: string
    price: number
    oneHourEvolution: number
    oneDayEvolution: number
    volume?: number
    createdAt?: Date | string
    token: TokenCreateNestedOneWithoutStatisticInput
  }

  export type TokenStatisticUncheckedCreateInput = {
    id?: string
    tokenId: string
    price: number
    oneHourEvolution: number
    oneDayEvolution: number
    volume?: number
    createdAt?: Date | string
  }

  export type TokenStatisticUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    oneHourEvolution?: FloatFieldUpdateOperationsInput | number
    oneDayEvolution?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: TokenUpdateOneRequiredWithoutStatisticNestedInput
  }

  export type TokenStatisticUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    oneHourEvolution?: FloatFieldUpdateOperationsInput | number
    oneDayEvolution?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenStatisticCreateManyInput = {
    id?: string
    tokenId: string
    price: number
    oneHourEvolution: number
    oneDayEvolution: number
    volume?: number
    createdAt?: Date | string
  }

  export type TokenStatisticUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    oneHourEvolution?: FloatFieldUpdateOperationsInput | number
    oneDayEvolution?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenStatisticUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tokenId?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    oneHourEvolution?: FloatFieldUpdateOperationsInput | number
    oneDayEvolution?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolStatisticCreateInput = {
    id?: string
    apr: number
    tvlUSD: number
    volOneDay: string
    volOneMonth: string
    impermanentLoss: number
    healthScore: number
    createdAt?: Date | string
    pool: PoolCreateNestedOneWithoutPoolStatisticInput
  }

  export type PoolStatisticUncheckedCreateInput = {
    id?: string
    poolId: string
    apr: number
    tvlUSD: number
    volOneDay: string
    volOneMonth: string
    impermanentLoss: number
    healthScore: number
    createdAt?: Date | string
  }

  export type PoolStatisticUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    apr?: FloatFieldUpdateOperationsInput | number
    tvlUSD?: FloatFieldUpdateOperationsInput | number
    volOneDay?: StringFieldUpdateOperationsInput | string
    volOneMonth?: StringFieldUpdateOperationsInput | string
    impermanentLoss?: FloatFieldUpdateOperationsInput | number
    healthScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pool?: PoolUpdateOneRequiredWithoutPoolStatisticNestedInput
  }

  export type PoolStatisticUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    poolId?: StringFieldUpdateOperationsInput | string
    apr?: FloatFieldUpdateOperationsInput | number
    tvlUSD?: FloatFieldUpdateOperationsInput | number
    volOneDay?: StringFieldUpdateOperationsInput | string
    volOneMonth?: StringFieldUpdateOperationsInput | string
    impermanentLoss?: FloatFieldUpdateOperationsInput | number
    healthScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolStatisticCreateManyInput = {
    id?: string
    poolId: string
    apr: number
    tvlUSD: number
    volOneDay: string
    volOneMonth: string
    impermanentLoss: number
    healthScore: number
    createdAt?: Date | string
  }

  export type PoolStatisticUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    apr?: FloatFieldUpdateOperationsInput | number
    tvlUSD?: FloatFieldUpdateOperationsInput | number
    volOneDay?: StringFieldUpdateOperationsInput | string
    volOneMonth?: StringFieldUpdateOperationsInput | string
    impermanentLoss?: FloatFieldUpdateOperationsInput | number
    healthScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolStatisticUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    poolId?: StringFieldUpdateOperationsInput | string
    apr?: FloatFieldUpdateOperationsInput | number
    tvlUSD?: FloatFieldUpdateOperationsInput | number
    volOneDay?: StringFieldUpdateOperationsInput | string
    volOneMonth?: StringFieldUpdateOperationsInput | string
    impermanentLoss?: FloatFieldUpdateOperationsInput | number
    healthScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type TokenRelationFilter = {
    is?: TokenWhereInput
    isNot?: TokenWhereInput
  }

  export type SwapListRelationFilter = {
    every?: SwapWhereInput
    some?: SwapWhereInput
    none?: SwapWhereInput
  }

  export type PoolStatisticListRelationFilter = {
    every?: PoolStatisticWhereInput
    some?: PoolStatisticWhereInput
    none?: PoolStatisticWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type SwapOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PoolStatisticOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type PoolCountOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    token0Id?: SortOrder
    token1Id?: SortOrder
    fee?: SortOrder
    liquidity?: SortOrder
    tick?: SortOrder
    sqrtPriceX96?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PoolAvgOrderByAggregateInput = {
    fee?: SortOrder
    tick?: SortOrder
  }

  export type PoolMaxOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    token0Id?: SortOrder
    token1Id?: SortOrder
    fee?: SortOrder
    liquidity?: SortOrder
    tick?: SortOrder
    sqrtPriceX96?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PoolMinOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    token0Id?: SortOrder
    token1Id?: SortOrder
    fee?: SortOrder
    liquidity?: SortOrder
    tick?: SortOrder
    sqrtPriceX96?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PoolSumOrderByAggregateInput = {
    fee?: SortOrder
    tick?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type PoolRelationFilter = {
    is?: PoolWhereInput
    isNot?: PoolWhereInput
  }

  export type SwapTransactionHashLogIndexCompoundUniqueInput = {
    transactionHash: string
    logIndex: number
  }

  export type SwapCountOrderByAggregateInput = {
    id?: SortOrder
    sender?: SortOrder
    recipient?: SortOrder
    amount0?: SortOrder
    amount1?: SortOrder
    sqrtPriceX96?: SortOrder
    tick?: SortOrder
    transactionHash?: SortOrder
    logIndex?: SortOrder
    poolAddress?: SortOrder
    poolId?: SortOrder
    gasUsed?: SortOrder
    gasPrice?: SortOrder
    createdAt?: SortOrder
  }

  export type SwapAvgOrderByAggregateInput = {
    tick?: SortOrder
    logIndex?: SortOrder
    gasUsed?: SortOrder
  }

  export type SwapMaxOrderByAggregateInput = {
    id?: SortOrder
    sender?: SortOrder
    recipient?: SortOrder
    amount0?: SortOrder
    amount1?: SortOrder
    sqrtPriceX96?: SortOrder
    tick?: SortOrder
    transactionHash?: SortOrder
    logIndex?: SortOrder
    poolAddress?: SortOrder
    poolId?: SortOrder
    gasUsed?: SortOrder
    gasPrice?: SortOrder
    createdAt?: SortOrder
  }

  export type SwapMinOrderByAggregateInput = {
    id?: SortOrder
    sender?: SortOrder
    recipient?: SortOrder
    amount0?: SortOrder
    amount1?: SortOrder
    sqrtPriceX96?: SortOrder
    tick?: SortOrder
    transactionHash?: SortOrder
    logIndex?: SortOrder
    poolAddress?: SortOrder
    poolId?: SortOrder
    gasUsed?: SortOrder
    gasPrice?: SortOrder
    createdAt?: SortOrder
  }

  export type SwapSumOrderByAggregateInput = {
    tick?: SortOrder
    logIndex?: SortOrder
    gasUsed?: SortOrder
  }

  export type BigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type IndexerStateCountOrderByAggregateInput = {
    id?: SortOrder
    lastBlock?: SortOrder
    lastUpdate?: SortOrder
  }

  export type IndexerStateAvgOrderByAggregateInput = {
    lastBlock?: SortOrder
  }

  export type IndexerStateMaxOrderByAggregateInput = {
    id?: SortOrder
    lastBlock?: SortOrder
    lastUpdate?: SortOrder
  }

  export type IndexerStateMinOrderByAggregateInput = {
    id?: SortOrder
    lastBlock?: SortOrder
    lastUpdate?: SortOrder
  }

  export type IndexerStateSumOrderByAggregateInput = {
    lastBlock?: SortOrder
  }

  export type BigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type PoolListRelationFilter = {
    every?: PoolWhereInput
    some?: PoolWhereInput
    none?: PoolWhereInput
  }

  export type TokenStatisticListRelationFilter = {
    every?: TokenStatisticWhereInput
    some?: TokenStatisticWhereInput
    none?: TokenStatisticWhereInput
  }

  export type PoolOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TokenStatisticOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TokenCountOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrder
    coingeckoId?: SortOrder
    tags?: SortOrder
  }

  export type TokenAvgOrderByAggregateInput = {
    decimals?: SortOrder
  }

  export type TokenMaxOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrder
    coingeckoId?: SortOrder
  }

  export type TokenMinOrderByAggregateInput = {
    id?: SortOrder
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrder
    coingeckoId?: SortOrder
  }

  export type TokenSumOrderByAggregateInput = {
    decimals?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type TokenStatisticCountOrderByAggregateInput = {
    id?: SortOrder
    tokenId?: SortOrder
    price?: SortOrder
    oneHourEvolution?: SortOrder
    oneDayEvolution?: SortOrder
    volume?: SortOrder
    createdAt?: SortOrder
  }

  export type TokenStatisticAvgOrderByAggregateInput = {
    price?: SortOrder
    oneHourEvolution?: SortOrder
    oneDayEvolution?: SortOrder
    volume?: SortOrder
  }

  export type TokenStatisticMaxOrderByAggregateInput = {
    id?: SortOrder
    tokenId?: SortOrder
    price?: SortOrder
    oneHourEvolution?: SortOrder
    oneDayEvolution?: SortOrder
    volume?: SortOrder
    createdAt?: SortOrder
  }

  export type TokenStatisticMinOrderByAggregateInput = {
    id?: SortOrder
    tokenId?: SortOrder
    price?: SortOrder
    oneHourEvolution?: SortOrder
    oneDayEvolution?: SortOrder
    volume?: SortOrder
    createdAt?: SortOrder
  }

  export type TokenStatisticSumOrderByAggregateInput = {
    price?: SortOrder
    oneHourEvolution?: SortOrder
    oneDayEvolution?: SortOrder
    volume?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type PoolStatisticCountOrderByAggregateInput = {
    id?: SortOrder
    poolId?: SortOrder
    apr?: SortOrder
    tvlUSD?: SortOrder
    volOneDay?: SortOrder
    volOneMonth?: SortOrder
    impermanentLoss?: SortOrder
    healthScore?: SortOrder
    createdAt?: SortOrder
  }

  export type PoolStatisticAvgOrderByAggregateInput = {
    apr?: SortOrder
    tvlUSD?: SortOrder
    impermanentLoss?: SortOrder
    healthScore?: SortOrder
  }

  export type PoolStatisticMaxOrderByAggregateInput = {
    id?: SortOrder
    poolId?: SortOrder
    apr?: SortOrder
    tvlUSD?: SortOrder
    volOneDay?: SortOrder
    volOneMonth?: SortOrder
    impermanentLoss?: SortOrder
    healthScore?: SortOrder
    createdAt?: SortOrder
  }

  export type PoolStatisticMinOrderByAggregateInput = {
    id?: SortOrder
    poolId?: SortOrder
    apr?: SortOrder
    tvlUSD?: SortOrder
    volOneDay?: SortOrder
    volOneMonth?: SortOrder
    impermanentLoss?: SortOrder
    healthScore?: SortOrder
    createdAt?: SortOrder
  }

  export type PoolStatisticSumOrderByAggregateInput = {
    apr?: SortOrder
    tvlUSD?: SortOrder
    impermanentLoss?: SortOrder
    healthScore?: SortOrder
  }

  export type TokenCreateNestedOneWithoutPoolsAsToken0Input = {
    create?: XOR<TokenCreateWithoutPoolsAsToken0Input, TokenUncheckedCreateWithoutPoolsAsToken0Input>
    connectOrCreate?: TokenCreateOrConnectWithoutPoolsAsToken0Input
    connect?: TokenWhereUniqueInput
  }

  export type TokenCreateNestedOneWithoutPoolsAsToken1Input = {
    create?: XOR<TokenCreateWithoutPoolsAsToken1Input, TokenUncheckedCreateWithoutPoolsAsToken1Input>
    connectOrCreate?: TokenCreateOrConnectWithoutPoolsAsToken1Input
    connect?: TokenWhereUniqueInput
  }

  export type SwapCreateNestedManyWithoutPoolInput = {
    create?: XOR<SwapCreateWithoutPoolInput, SwapUncheckedCreateWithoutPoolInput> | SwapCreateWithoutPoolInput[] | SwapUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: SwapCreateOrConnectWithoutPoolInput | SwapCreateOrConnectWithoutPoolInput[]
    createMany?: SwapCreateManyPoolInputEnvelope
    connect?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
  }

  export type PoolStatisticCreateNestedManyWithoutPoolInput = {
    create?: XOR<PoolStatisticCreateWithoutPoolInput, PoolStatisticUncheckedCreateWithoutPoolInput> | PoolStatisticCreateWithoutPoolInput[] | PoolStatisticUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: PoolStatisticCreateOrConnectWithoutPoolInput | PoolStatisticCreateOrConnectWithoutPoolInput[]
    createMany?: PoolStatisticCreateManyPoolInputEnvelope
    connect?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
  }

  export type SwapUncheckedCreateNestedManyWithoutPoolInput = {
    create?: XOR<SwapCreateWithoutPoolInput, SwapUncheckedCreateWithoutPoolInput> | SwapCreateWithoutPoolInput[] | SwapUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: SwapCreateOrConnectWithoutPoolInput | SwapCreateOrConnectWithoutPoolInput[]
    createMany?: SwapCreateManyPoolInputEnvelope
    connect?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
  }

  export type PoolStatisticUncheckedCreateNestedManyWithoutPoolInput = {
    create?: XOR<PoolStatisticCreateWithoutPoolInput, PoolStatisticUncheckedCreateWithoutPoolInput> | PoolStatisticCreateWithoutPoolInput[] | PoolStatisticUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: PoolStatisticCreateOrConnectWithoutPoolInput | PoolStatisticCreateOrConnectWithoutPoolInput[]
    createMany?: PoolStatisticCreateManyPoolInputEnvelope
    connect?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TokenUpdateOneRequiredWithoutPoolsAsToken0NestedInput = {
    create?: XOR<TokenCreateWithoutPoolsAsToken0Input, TokenUncheckedCreateWithoutPoolsAsToken0Input>
    connectOrCreate?: TokenCreateOrConnectWithoutPoolsAsToken0Input
    upsert?: TokenUpsertWithoutPoolsAsToken0Input
    connect?: TokenWhereUniqueInput
    update?: XOR<XOR<TokenUpdateToOneWithWhereWithoutPoolsAsToken0Input, TokenUpdateWithoutPoolsAsToken0Input>, TokenUncheckedUpdateWithoutPoolsAsToken0Input>
  }

  export type TokenUpdateOneRequiredWithoutPoolsAsToken1NestedInput = {
    create?: XOR<TokenCreateWithoutPoolsAsToken1Input, TokenUncheckedCreateWithoutPoolsAsToken1Input>
    connectOrCreate?: TokenCreateOrConnectWithoutPoolsAsToken1Input
    upsert?: TokenUpsertWithoutPoolsAsToken1Input
    connect?: TokenWhereUniqueInput
    update?: XOR<XOR<TokenUpdateToOneWithWhereWithoutPoolsAsToken1Input, TokenUpdateWithoutPoolsAsToken1Input>, TokenUncheckedUpdateWithoutPoolsAsToken1Input>
  }

  export type SwapUpdateManyWithoutPoolNestedInput = {
    create?: XOR<SwapCreateWithoutPoolInput, SwapUncheckedCreateWithoutPoolInput> | SwapCreateWithoutPoolInput[] | SwapUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: SwapCreateOrConnectWithoutPoolInput | SwapCreateOrConnectWithoutPoolInput[]
    upsert?: SwapUpsertWithWhereUniqueWithoutPoolInput | SwapUpsertWithWhereUniqueWithoutPoolInput[]
    createMany?: SwapCreateManyPoolInputEnvelope
    set?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
    disconnect?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
    delete?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
    connect?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
    update?: SwapUpdateWithWhereUniqueWithoutPoolInput | SwapUpdateWithWhereUniqueWithoutPoolInput[]
    updateMany?: SwapUpdateManyWithWhereWithoutPoolInput | SwapUpdateManyWithWhereWithoutPoolInput[]
    deleteMany?: SwapScalarWhereInput | SwapScalarWhereInput[]
  }

  export type PoolStatisticUpdateManyWithoutPoolNestedInput = {
    create?: XOR<PoolStatisticCreateWithoutPoolInput, PoolStatisticUncheckedCreateWithoutPoolInput> | PoolStatisticCreateWithoutPoolInput[] | PoolStatisticUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: PoolStatisticCreateOrConnectWithoutPoolInput | PoolStatisticCreateOrConnectWithoutPoolInput[]
    upsert?: PoolStatisticUpsertWithWhereUniqueWithoutPoolInput | PoolStatisticUpsertWithWhereUniqueWithoutPoolInput[]
    createMany?: PoolStatisticCreateManyPoolInputEnvelope
    set?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
    disconnect?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
    delete?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
    connect?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
    update?: PoolStatisticUpdateWithWhereUniqueWithoutPoolInput | PoolStatisticUpdateWithWhereUniqueWithoutPoolInput[]
    updateMany?: PoolStatisticUpdateManyWithWhereWithoutPoolInput | PoolStatisticUpdateManyWithWhereWithoutPoolInput[]
    deleteMany?: PoolStatisticScalarWhereInput | PoolStatisticScalarWhereInput[]
  }

  export type SwapUncheckedUpdateManyWithoutPoolNestedInput = {
    create?: XOR<SwapCreateWithoutPoolInput, SwapUncheckedCreateWithoutPoolInput> | SwapCreateWithoutPoolInput[] | SwapUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: SwapCreateOrConnectWithoutPoolInput | SwapCreateOrConnectWithoutPoolInput[]
    upsert?: SwapUpsertWithWhereUniqueWithoutPoolInput | SwapUpsertWithWhereUniqueWithoutPoolInput[]
    createMany?: SwapCreateManyPoolInputEnvelope
    set?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
    disconnect?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
    delete?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
    connect?: SwapWhereUniqueInput | SwapWhereUniqueInput[]
    update?: SwapUpdateWithWhereUniqueWithoutPoolInput | SwapUpdateWithWhereUniqueWithoutPoolInput[]
    updateMany?: SwapUpdateManyWithWhereWithoutPoolInput | SwapUpdateManyWithWhereWithoutPoolInput[]
    deleteMany?: SwapScalarWhereInput | SwapScalarWhereInput[]
  }

  export type PoolStatisticUncheckedUpdateManyWithoutPoolNestedInput = {
    create?: XOR<PoolStatisticCreateWithoutPoolInput, PoolStatisticUncheckedCreateWithoutPoolInput> | PoolStatisticCreateWithoutPoolInput[] | PoolStatisticUncheckedCreateWithoutPoolInput[]
    connectOrCreate?: PoolStatisticCreateOrConnectWithoutPoolInput | PoolStatisticCreateOrConnectWithoutPoolInput[]
    upsert?: PoolStatisticUpsertWithWhereUniqueWithoutPoolInput | PoolStatisticUpsertWithWhereUniqueWithoutPoolInput[]
    createMany?: PoolStatisticCreateManyPoolInputEnvelope
    set?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
    disconnect?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
    delete?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
    connect?: PoolStatisticWhereUniqueInput | PoolStatisticWhereUniqueInput[]
    update?: PoolStatisticUpdateWithWhereUniqueWithoutPoolInput | PoolStatisticUpdateWithWhereUniqueWithoutPoolInput[]
    updateMany?: PoolStatisticUpdateManyWithWhereWithoutPoolInput | PoolStatisticUpdateManyWithWhereWithoutPoolInput[]
    deleteMany?: PoolStatisticScalarWhereInput | PoolStatisticScalarWhereInput[]
  }

  export type PoolCreateNestedOneWithoutSwapsInput = {
    create?: XOR<PoolCreateWithoutSwapsInput, PoolUncheckedCreateWithoutSwapsInput>
    connectOrCreate?: PoolCreateOrConnectWithoutSwapsInput
    connect?: PoolWhereUniqueInput
  }

  export type PoolUpdateOneRequiredWithoutSwapsNestedInput = {
    create?: XOR<PoolCreateWithoutSwapsInput, PoolUncheckedCreateWithoutSwapsInput>
    connectOrCreate?: PoolCreateOrConnectWithoutSwapsInput
    upsert?: PoolUpsertWithoutSwapsInput
    connect?: PoolWhereUniqueInput
    update?: XOR<XOR<PoolUpdateToOneWithWhereWithoutSwapsInput, PoolUpdateWithoutSwapsInput>, PoolUncheckedUpdateWithoutSwapsInput>
  }

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type TokenCreatetagsInput = {
    set: string[]
  }

  export type PoolCreateNestedManyWithoutToken0Input = {
    create?: XOR<PoolCreateWithoutToken0Input, PoolUncheckedCreateWithoutToken0Input> | PoolCreateWithoutToken0Input[] | PoolUncheckedCreateWithoutToken0Input[]
    connectOrCreate?: PoolCreateOrConnectWithoutToken0Input | PoolCreateOrConnectWithoutToken0Input[]
    createMany?: PoolCreateManyToken0InputEnvelope
    connect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
  }

  export type PoolCreateNestedManyWithoutToken1Input = {
    create?: XOR<PoolCreateWithoutToken1Input, PoolUncheckedCreateWithoutToken1Input> | PoolCreateWithoutToken1Input[] | PoolUncheckedCreateWithoutToken1Input[]
    connectOrCreate?: PoolCreateOrConnectWithoutToken1Input | PoolCreateOrConnectWithoutToken1Input[]
    createMany?: PoolCreateManyToken1InputEnvelope
    connect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
  }

  export type TokenStatisticCreateNestedManyWithoutTokenInput = {
    create?: XOR<TokenStatisticCreateWithoutTokenInput, TokenStatisticUncheckedCreateWithoutTokenInput> | TokenStatisticCreateWithoutTokenInput[] | TokenStatisticUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenStatisticCreateOrConnectWithoutTokenInput | TokenStatisticCreateOrConnectWithoutTokenInput[]
    createMany?: TokenStatisticCreateManyTokenInputEnvelope
    connect?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
  }

  export type PoolUncheckedCreateNestedManyWithoutToken0Input = {
    create?: XOR<PoolCreateWithoutToken0Input, PoolUncheckedCreateWithoutToken0Input> | PoolCreateWithoutToken0Input[] | PoolUncheckedCreateWithoutToken0Input[]
    connectOrCreate?: PoolCreateOrConnectWithoutToken0Input | PoolCreateOrConnectWithoutToken0Input[]
    createMany?: PoolCreateManyToken0InputEnvelope
    connect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
  }

  export type PoolUncheckedCreateNestedManyWithoutToken1Input = {
    create?: XOR<PoolCreateWithoutToken1Input, PoolUncheckedCreateWithoutToken1Input> | PoolCreateWithoutToken1Input[] | PoolUncheckedCreateWithoutToken1Input[]
    connectOrCreate?: PoolCreateOrConnectWithoutToken1Input | PoolCreateOrConnectWithoutToken1Input[]
    createMany?: PoolCreateManyToken1InputEnvelope
    connect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
  }

  export type TokenStatisticUncheckedCreateNestedManyWithoutTokenInput = {
    create?: XOR<TokenStatisticCreateWithoutTokenInput, TokenStatisticUncheckedCreateWithoutTokenInput> | TokenStatisticCreateWithoutTokenInput[] | TokenStatisticUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenStatisticCreateOrConnectWithoutTokenInput | TokenStatisticCreateOrConnectWithoutTokenInput[]
    createMany?: TokenStatisticCreateManyTokenInputEnvelope
    connect?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
  }

  export type TokenUpdatetagsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type PoolUpdateManyWithoutToken0NestedInput = {
    create?: XOR<PoolCreateWithoutToken0Input, PoolUncheckedCreateWithoutToken0Input> | PoolCreateWithoutToken0Input[] | PoolUncheckedCreateWithoutToken0Input[]
    connectOrCreate?: PoolCreateOrConnectWithoutToken0Input | PoolCreateOrConnectWithoutToken0Input[]
    upsert?: PoolUpsertWithWhereUniqueWithoutToken0Input | PoolUpsertWithWhereUniqueWithoutToken0Input[]
    createMany?: PoolCreateManyToken0InputEnvelope
    set?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    disconnect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    delete?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    connect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    update?: PoolUpdateWithWhereUniqueWithoutToken0Input | PoolUpdateWithWhereUniqueWithoutToken0Input[]
    updateMany?: PoolUpdateManyWithWhereWithoutToken0Input | PoolUpdateManyWithWhereWithoutToken0Input[]
    deleteMany?: PoolScalarWhereInput | PoolScalarWhereInput[]
  }

  export type PoolUpdateManyWithoutToken1NestedInput = {
    create?: XOR<PoolCreateWithoutToken1Input, PoolUncheckedCreateWithoutToken1Input> | PoolCreateWithoutToken1Input[] | PoolUncheckedCreateWithoutToken1Input[]
    connectOrCreate?: PoolCreateOrConnectWithoutToken1Input | PoolCreateOrConnectWithoutToken1Input[]
    upsert?: PoolUpsertWithWhereUniqueWithoutToken1Input | PoolUpsertWithWhereUniqueWithoutToken1Input[]
    createMany?: PoolCreateManyToken1InputEnvelope
    set?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    disconnect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    delete?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    connect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    update?: PoolUpdateWithWhereUniqueWithoutToken1Input | PoolUpdateWithWhereUniqueWithoutToken1Input[]
    updateMany?: PoolUpdateManyWithWhereWithoutToken1Input | PoolUpdateManyWithWhereWithoutToken1Input[]
    deleteMany?: PoolScalarWhereInput | PoolScalarWhereInput[]
  }

  export type TokenStatisticUpdateManyWithoutTokenNestedInput = {
    create?: XOR<TokenStatisticCreateWithoutTokenInput, TokenStatisticUncheckedCreateWithoutTokenInput> | TokenStatisticCreateWithoutTokenInput[] | TokenStatisticUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenStatisticCreateOrConnectWithoutTokenInput | TokenStatisticCreateOrConnectWithoutTokenInput[]
    upsert?: TokenStatisticUpsertWithWhereUniqueWithoutTokenInput | TokenStatisticUpsertWithWhereUniqueWithoutTokenInput[]
    createMany?: TokenStatisticCreateManyTokenInputEnvelope
    set?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
    disconnect?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
    delete?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
    connect?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
    update?: TokenStatisticUpdateWithWhereUniqueWithoutTokenInput | TokenStatisticUpdateWithWhereUniqueWithoutTokenInput[]
    updateMany?: TokenStatisticUpdateManyWithWhereWithoutTokenInput | TokenStatisticUpdateManyWithWhereWithoutTokenInput[]
    deleteMany?: TokenStatisticScalarWhereInput | TokenStatisticScalarWhereInput[]
  }

  export type PoolUncheckedUpdateManyWithoutToken0NestedInput = {
    create?: XOR<PoolCreateWithoutToken0Input, PoolUncheckedCreateWithoutToken0Input> | PoolCreateWithoutToken0Input[] | PoolUncheckedCreateWithoutToken0Input[]
    connectOrCreate?: PoolCreateOrConnectWithoutToken0Input | PoolCreateOrConnectWithoutToken0Input[]
    upsert?: PoolUpsertWithWhereUniqueWithoutToken0Input | PoolUpsertWithWhereUniqueWithoutToken0Input[]
    createMany?: PoolCreateManyToken0InputEnvelope
    set?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    disconnect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    delete?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    connect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    update?: PoolUpdateWithWhereUniqueWithoutToken0Input | PoolUpdateWithWhereUniqueWithoutToken0Input[]
    updateMany?: PoolUpdateManyWithWhereWithoutToken0Input | PoolUpdateManyWithWhereWithoutToken0Input[]
    deleteMany?: PoolScalarWhereInput | PoolScalarWhereInput[]
  }

  export type PoolUncheckedUpdateManyWithoutToken1NestedInput = {
    create?: XOR<PoolCreateWithoutToken1Input, PoolUncheckedCreateWithoutToken1Input> | PoolCreateWithoutToken1Input[] | PoolUncheckedCreateWithoutToken1Input[]
    connectOrCreate?: PoolCreateOrConnectWithoutToken1Input | PoolCreateOrConnectWithoutToken1Input[]
    upsert?: PoolUpsertWithWhereUniqueWithoutToken1Input | PoolUpsertWithWhereUniqueWithoutToken1Input[]
    createMany?: PoolCreateManyToken1InputEnvelope
    set?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    disconnect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    delete?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    connect?: PoolWhereUniqueInput | PoolWhereUniqueInput[]
    update?: PoolUpdateWithWhereUniqueWithoutToken1Input | PoolUpdateWithWhereUniqueWithoutToken1Input[]
    updateMany?: PoolUpdateManyWithWhereWithoutToken1Input | PoolUpdateManyWithWhereWithoutToken1Input[]
    deleteMany?: PoolScalarWhereInput | PoolScalarWhereInput[]
  }

  export type TokenStatisticUncheckedUpdateManyWithoutTokenNestedInput = {
    create?: XOR<TokenStatisticCreateWithoutTokenInput, TokenStatisticUncheckedCreateWithoutTokenInput> | TokenStatisticCreateWithoutTokenInput[] | TokenStatisticUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenStatisticCreateOrConnectWithoutTokenInput | TokenStatisticCreateOrConnectWithoutTokenInput[]
    upsert?: TokenStatisticUpsertWithWhereUniqueWithoutTokenInput | TokenStatisticUpsertWithWhereUniqueWithoutTokenInput[]
    createMany?: TokenStatisticCreateManyTokenInputEnvelope
    set?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
    disconnect?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
    delete?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
    connect?: TokenStatisticWhereUniqueInput | TokenStatisticWhereUniqueInput[]
    update?: TokenStatisticUpdateWithWhereUniqueWithoutTokenInput | TokenStatisticUpdateWithWhereUniqueWithoutTokenInput[]
    updateMany?: TokenStatisticUpdateManyWithWhereWithoutTokenInput | TokenStatisticUpdateManyWithWhereWithoutTokenInput[]
    deleteMany?: TokenStatisticScalarWhereInput | TokenStatisticScalarWhereInput[]
  }

  export type TokenCreateNestedOneWithoutStatisticInput = {
    create?: XOR<TokenCreateWithoutStatisticInput, TokenUncheckedCreateWithoutStatisticInput>
    connectOrCreate?: TokenCreateOrConnectWithoutStatisticInput
    connect?: TokenWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TokenUpdateOneRequiredWithoutStatisticNestedInput = {
    create?: XOR<TokenCreateWithoutStatisticInput, TokenUncheckedCreateWithoutStatisticInput>
    connectOrCreate?: TokenCreateOrConnectWithoutStatisticInput
    upsert?: TokenUpsertWithoutStatisticInput
    connect?: TokenWhereUniqueInput
    update?: XOR<XOR<TokenUpdateToOneWithWhereWithoutStatisticInput, TokenUpdateWithoutStatisticInput>, TokenUncheckedUpdateWithoutStatisticInput>
  }

  export type PoolCreateNestedOneWithoutPoolStatisticInput = {
    create?: XOR<PoolCreateWithoutPoolStatisticInput, PoolUncheckedCreateWithoutPoolStatisticInput>
    connectOrCreate?: PoolCreateOrConnectWithoutPoolStatisticInput
    connect?: PoolWhereUniqueInput
  }

  export type PoolUpdateOneRequiredWithoutPoolStatisticNestedInput = {
    create?: XOR<PoolCreateWithoutPoolStatisticInput, PoolUncheckedCreateWithoutPoolStatisticInput>
    connectOrCreate?: PoolCreateOrConnectWithoutPoolStatisticInput
    upsert?: PoolUpsertWithoutPoolStatisticInput
    connect?: PoolWhereUniqueInput
    update?: XOR<XOR<PoolUpdateToOneWithWhereWithoutPoolStatisticInput, PoolUpdateWithoutPoolStatisticInput>, PoolUncheckedUpdateWithoutPoolStatisticInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedBigIntFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntFilter<$PrismaModel> | bigint | number
  }

  export type NestedBigIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    in?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    notIn?: bigint[] | number[] | ListBigIntFieldRefInput<$PrismaModel>
    lt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    lte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gt?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    gte?: bigint | number | BigIntFieldRefInput<$PrismaModel>
    not?: NestedBigIntWithAggregatesFilter<$PrismaModel> | bigint | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedBigIntFilter<$PrismaModel>
    _min?: NestedBigIntFilter<$PrismaModel>
    _max?: NestedBigIntFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type TokenCreateWithoutPoolsAsToken0Input = {
    id?: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    coingeckoId?: string | null
    tags?: TokenCreatetagsInput | string[]
    poolsAsToken1?: PoolCreateNestedManyWithoutToken1Input
    Statistic?: TokenStatisticCreateNestedManyWithoutTokenInput
  }

  export type TokenUncheckedCreateWithoutPoolsAsToken0Input = {
    id?: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    coingeckoId?: string | null
    tags?: TokenCreatetagsInput | string[]
    poolsAsToken1?: PoolUncheckedCreateNestedManyWithoutToken1Input
    Statistic?: TokenStatisticUncheckedCreateNestedManyWithoutTokenInput
  }

  export type TokenCreateOrConnectWithoutPoolsAsToken0Input = {
    where: TokenWhereUniqueInput
    create: XOR<TokenCreateWithoutPoolsAsToken0Input, TokenUncheckedCreateWithoutPoolsAsToken0Input>
  }

  export type TokenCreateWithoutPoolsAsToken1Input = {
    id?: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    coingeckoId?: string | null
    tags?: TokenCreatetagsInput | string[]
    poolsAsToken0?: PoolCreateNestedManyWithoutToken0Input
    Statistic?: TokenStatisticCreateNestedManyWithoutTokenInput
  }

  export type TokenUncheckedCreateWithoutPoolsAsToken1Input = {
    id?: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    coingeckoId?: string | null
    tags?: TokenCreatetagsInput | string[]
    poolsAsToken0?: PoolUncheckedCreateNestedManyWithoutToken0Input
    Statistic?: TokenStatisticUncheckedCreateNestedManyWithoutTokenInput
  }

  export type TokenCreateOrConnectWithoutPoolsAsToken1Input = {
    where: TokenWhereUniqueInput
    create: XOR<TokenCreateWithoutPoolsAsToken1Input, TokenUncheckedCreateWithoutPoolsAsToken1Input>
  }

  export type SwapCreateWithoutPoolInput = {
    id?: string
    sender: string
    recipient: string
    amount0: string
    amount1: string
    sqrtPriceX96: string
    tick: number
    transactionHash: string
    logIndex: number
    poolAddress: string
    gasUsed: number
    gasPrice: string
    createdAt?: Date | string
  }

  export type SwapUncheckedCreateWithoutPoolInput = {
    id?: string
    sender: string
    recipient: string
    amount0: string
    amount1: string
    sqrtPriceX96: string
    tick: number
    transactionHash: string
    logIndex: number
    poolAddress: string
    gasUsed: number
    gasPrice: string
    createdAt?: Date | string
  }

  export type SwapCreateOrConnectWithoutPoolInput = {
    where: SwapWhereUniqueInput
    create: XOR<SwapCreateWithoutPoolInput, SwapUncheckedCreateWithoutPoolInput>
  }

  export type SwapCreateManyPoolInputEnvelope = {
    data: SwapCreateManyPoolInput | SwapCreateManyPoolInput[]
    skipDuplicates?: boolean
  }

  export type PoolStatisticCreateWithoutPoolInput = {
    id?: string
    apr: number
    tvlUSD: number
    volOneDay: string
    volOneMonth: string
    impermanentLoss: number
    healthScore: number
    createdAt?: Date | string
  }

  export type PoolStatisticUncheckedCreateWithoutPoolInput = {
    id?: string
    apr: number
    tvlUSD: number
    volOneDay: string
    volOneMonth: string
    impermanentLoss: number
    healthScore: number
    createdAt?: Date | string
  }

  export type PoolStatisticCreateOrConnectWithoutPoolInput = {
    where: PoolStatisticWhereUniqueInput
    create: XOR<PoolStatisticCreateWithoutPoolInput, PoolStatisticUncheckedCreateWithoutPoolInput>
  }

  export type PoolStatisticCreateManyPoolInputEnvelope = {
    data: PoolStatisticCreateManyPoolInput | PoolStatisticCreateManyPoolInput[]
    skipDuplicates?: boolean
  }

  export type TokenUpsertWithoutPoolsAsToken0Input = {
    update: XOR<TokenUpdateWithoutPoolsAsToken0Input, TokenUncheckedUpdateWithoutPoolsAsToken0Input>
    create: XOR<TokenCreateWithoutPoolsAsToken0Input, TokenUncheckedCreateWithoutPoolsAsToken0Input>
    where?: TokenWhereInput
  }

  export type TokenUpdateToOneWithWhereWithoutPoolsAsToken0Input = {
    where?: TokenWhereInput
    data: XOR<TokenUpdateWithoutPoolsAsToken0Input, TokenUncheckedUpdateWithoutPoolsAsToken0Input>
  }

  export type TokenUpdateWithoutPoolsAsToken0Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
    poolsAsToken1?: PoolUpdateManyWithoutToken1NestedInput
    Statistic?: TokenStatisticUpdateManyWithoutTokenNestedInput
  }

  export type TokenUncheckedUpdateWithoutPoolsAsToken0Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
    poolsAsToken1?: PoolUncheckedUpdateManyWithoutToken1NestedInput
    Statistic?: TokenStatisticUncheckedUpdateManyWithoutTokenNestedInput
  }

  export type TokenUpsertWithoutPoolsAsToken1Input = {
    update: XOR<TokenUpdateWithoutPoolsAsToken1Input, TokenUncheckedUpdateWithoutPoolsAsToken1Input>
    create: XOR<TokenCreateWithoutPoolsAsToken1Input, TokenUncheckedCreateWithoutPoolsAsToken1Input>
    where?: TokenWhereInput
  }

  export type TokenUpdateToOneWithWhereWithoutPoolsAsToken1Input = {
    where?: TokenWhereInput
    data: XOR<TokenUpdateWithoutPoolsAsToken1Input, TokenUncheckedUpdateWithoutPoolsAsToken1Input>
  }

  export type TokenUpdateWithoutPoolsAsToken1Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
    poolsAsToken0?: PoolUpdateManyWithoutToken0NestedInput
    Statistic?: TokenStatisticUpdateManyWithoutTokenNestedInput
  }

  export type TokenUncheckedUpdateWithoutPoolsAsToken1Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
    poolsAsToken0?: PoolUncheckedUpdateManyWithoutToken0NestedInput
    Statistic?: TokenStatisticUncheckedUpdateManyWithoutTokenNestedInput
  }

  export type SwapUpsertWithWhereUniqueWithoutPoolInput = {
    where: SwapWhereUniqueInput
    update: XOR<SwapUpdateWithoutPoolInput, SwapUncheckedUpdateWithoutPoolInput>
    create: XOR<SwapCreateWithoutPoolInput, SwapUncheckedCreateWithoutPoolInput>
  }

  export type SwapUpdateWithWhereUniqueWithoutPoolInput = {
    where: SwapWhereUniqueInput
    data: XOR<SwapUpdateWithoutPoolInput, SwapUncheckedUpdateWithoutPoolInput>
  }

  export type SwapUpdateManyWithWhereWithoutPoolInput = {
    where: SwapScalarWhereInput
    data: XOR<SwapUpdateManyMutationInput, SwapUncheckedUpdateManyWithoutPoolInput>
  }

  export type SwapScalarWhereInput = {
    AND?: SwapScalarWhereInput | SwapScalarWhereInput[]
    OR?: SwapScalarWhereInput[]
    NOT?: SwapScalarWhereInput | SwapScalarWhereInput[]
    id?: StringFilter<"Swap"> | string
    sender?: StringFilter<"Swap"> | string
    recipient?: StringFilter<"Swap"> | string
    amount0?: StringFilter<"Swap"> | string
    amount1?: StringFilter<"Swap"> | string
    sqrtPriceX96?: StringFilter<"Swap"> | string
    tick?: IntFilter<"Swap"> | number
    transactionHash?: StringFilter<"Swap"> | string
    logIndex?: IntFilter<"Swap"> | number
    poolAddress?: StringFilter<"Swap"> | string
    poolId?: StringFilter<"Swap"> | string
    gasUsed?: IntFilter<"Swap"> | number
    gasPrice?: StringFilter<"Swap"> | string
    createdAt?: DateTimeFilter<"Swap"> | Date | string
  }

  export type PoolStatisticUpsertWithWhereUniqueWithoutPoolInput = {
    where: PoolStatisticWhereUniqueInput
    update: XOR<PoolStatisticUpdateWithoutPoolInput, PoolStatisticUncheckedUpdateWithoutPoolInput>
    create: XOR<PoolStatisticCreateWithoutPoolInput, PoolStatisticUncheckedCreateWithoutPoolInput>
  }

  export type PoolStatisticUpdateWithWhereUniqueWithoutPoolInput = {
    where: PoolStatisticWhereUniqueInput
    data: XOR<PoolStatisticUpdateWithoutPoolInput, PoolStatisticUncheckedUpdateWithoutPoolInput>
  }

  export type PoolStatisticUpdateManyWithWhereWithoutPoolInput = {
    where: PoolStatisticScalarWhereInput
    data: XOR<PoolStatisticUpdateManyMutationInput, PoolStatisticUncheckedUpdateManyWithoutPoolInput>
  }

  export type PoolStatisticScalarWhereInput = {
    AND?: PoolStatisticScalarWhereInput | PoolStatisticScalarWhereInput[]
    OR?: PoolStatisticScalarWhereInput[]
    NOT?: PoolStatisticScalarWhereInput | PoolStatisticScalarWhereInput[]
    id?: StringFilter<"PoolStatistic"> | string
    poolId?: StringFilter<"PoolStatistic"> | string
    apr?: FloatFilter<"PoolStatistic"> | number
    tvlUSD?: FloatFilter<"PoolStatistic"> | number
    volOneDay?: StringFilter<"PoolStatistic"> | string
    volOneMonth?: StringFilter<"PoolStatistic"> | string
    impermanentLoss?: FloatFilter<"PoolStatistic"> | number
    healthScore?: IntFilter<"PoolStatistic"> | number
    createdAt?: DateTimeFilter<"PoolStatistic"> | Date | string
  }

  export type PoolCreateWithoutSwapsInput = {
    id?: string
    address: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    token0: TokenCreateNestedOneWithoutPoolsAsToken0Input
    token1: TokenCreateNestedOneWithoutPoolsAsToken1Input
    PoolStatistic?: PoolStatisticCreateNestedManyWithoutPoolInput
  }

  export type PoolUncheckedCreateWithoutSwapsInput = {
    id?: string
    address: string
    token0Id: string
    token1Id: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    PoolStatistic?: PoolStatisticUncheckedCreateNestedManyWithoutPoolInput
  }

  export type PoolCreateOrConnectWithoutSwapsInput = {
    where: PoolWhereUniqueInput
    create: XOR<PoolCreateWithoutSwapsInput, PoolUncheckedCreateWithoutSwapsInput>
  }

  export type PoolUpsertWithoutSwapsInput = {
    update: XOR<PoolUpdateWithoutSwapsInput, PoolUncheckedUpdateWithoutSwapsInput>
    create: XOR<PoolCreateWithoutSwapsInput, PoolUncheckedCreateWithoutSwapsInput>
    where?: PoolWhereInput
  }

  export type PoolUpdateToOneWithWhereWithoutSwapsInput = {
    where?: PoolWhereInput
    data: XOR<PoolUpdateWithoutSwapsInput, PoolUncheckedUpdateWithoutSwapsInput>
  }

  export type PoolUpdateWithoutSwapsInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token0?: TokenUpdateOneRequiredWithoutPoolsAsToken0NestedInput
    token1?: TokenUpdateOneRequiredWithoutPoolsAsToken1NestedInput
    PoolStatistic?: PoolStatisticUpdateManyWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateWithoutSwapsInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    token0Id?: StringFieldUpdateOperationsInput | string
    token1Id?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    PoolStatistic?: PoolStatisticUncheckedUpdateManyWithoutPoolNestedInput
  }

  export type PoolCreateWithoutToken0Input = {
    id?: string
    address: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    token1: TokenCreateNestedOneWithoutPoolsAsToken1Input
    swaps?: SwapCreateNestedManyWithoutPoolInput
    PoolStatistic?: PoolStatisticCreateNestedManyWithoutPoolInput
  }

  export type PoolUncheckedCreateWithoutToken0Input = {
    id?: string
    address: string
    token1Id: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    swaps?: SwapUncheckedCreateNestedManyWithoutPoolInput
    PoolStatistic?: PoolStatisticUncheckedCreateNestedManyWithoutPoolInput
  }

  export type PoolCreateOrConnectWithoutToken0Input = {
    where: PoolWhereUniqueInput
    create: XOR<PoolCreateWithoutToken0Input, PoolUncheckedCreateWithoutToken0Input>
  }

  export type PoolCreateManyToken0InputEnvelope = {
    data: PoolCreateManyToken0Input | PoolCreateManyToken0Input[]
    skipDuplicates?: boolean
  }

  export type PoolCreateWithoutToken1Input = {
    id?: string
    address: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    token0: TokenCreateNestedOneWithoutPoolsAsToken0Input
    swaps?: SwapCreateNestedManyWithoutPoolInput
    PoolStatistic?: PoolStatisticCreateNestedManyWithoutPoolInput
  }

  export type PoolUncheckedCreateWithoutToken1Input = {
    id?: string
    address: string
    token0Id: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    swaps?: SwapUncheckedCreateNestedManyWithoutPoolInput
    PoolStatistic?: PoolStatisticUncheckedCreateNestedManyWithoutPoolInput
  }

  export type PoolCreateOrConnectWithoutToken1Input = {
    where: PoolWhereUniqueInput
    create: XOR<PoolCreateWithoutToken1Input, PoolUncheckedCreateWithoutToken1Input>
  }

  export type PoolCreateManyToken1InputEnvelope = {
    data: PoolCreateManyToken1Input | PoolCreateManyToken1Input[]
    skipDuplicates?: boolean
  }

  export type TokenStatisticCreateWithoutTokenInput = {
    id?: string
    price: number
    oneHourEvolution: number
    oneDayEvolution: number
    volume?: number
    createdAt?: Date | string
  }

  export type TokenStatisticUncheckedCreateWithoutTokenInput = {
    id?: string
    price: number
    oneHourEvolution: number
    oneDayEvolution: number
    volume?: number
    createdAt?: Date | string
  }

  export type TokenStatisticCreateOrConnectWithoutTokenInput = {
    where: TokenStatisticWhereUniqueInput
    create: XOR<TokenStatisticCreateWithoutTokenInput, TokenStatisticUncheckedCreateWithoutTokenInput>
  }

  export type TokenStatisticCreateManyTokenInputEnvelope = {
    data: TokenStatisticCreateManyTokenInput | TokenStatisticCreateManyTokenInput[]
    skipDuplicates?: boolean
  }

  export type PoolUpsertWithWhereUniqueWithoutToken0Input = {
    where: PoolWhereUniqueInput
    update: XOR<PoolUpdateWithoutToken0Input, PoolUncheckedUpdateWithoutToken0Input>
    create: XOR<PoolCreateWithoutToken0Input, PoolUncheckedCreateWithoutToken0Input>
  }

  export type PoolUpdateWithWhereUniqueWithoutToken0Input = {
    where: PoolWhereUniqueInput
    data: XOR<PoolUpdateWithoutToken0Input, PoolUncheckedUpdateWithoutToken0Input>
  }

  export type PoolUpdateManyWithWhereWithoutToken0Input = {
    where: PoolScalarWhereInput
    data: XOR<PoolUpdateManyMutationInput, PoolUncheckedUpdateManyWithoutToken0Input>
  }

  export type PoolScalarWhereInput = {
    AND?: PoolScalarWhereInput | PoolScalarWhereInput[]
    OR?: PoolScalarWhereInput[]
    NOT?: PoolScalarWhereInput | PoolScalarWhereInput[]
    id?: StringFilter<"Pool"> | string
    address?: StringFilter<"Pool"> | string
    token0Id?: StringFilter<"Pool"> | string
    token1Id?: StringFilter<"Pool"> | string
    fee?: IntFilter<"Pool"> | number
    liquidity?: StringNullableFilter<"Pool"> | string | null
    tick?: IntNullableFilter<"Pool"> | number | null
    sqrtPriceX96?: StringNullableFilter<"Pool"> | string | null
    createdAt?: DateTimeFilter<"Pool"> | Date | string
    updatedAt?: DateTimeFilter<"Pool"> | Date | string
  }

  export type PoolUpsertWithWhereUniqueWithoutToken1Input = {
    where: PoolWhereUniqueInput
    update: XOR<PoolUpdateWithoutToken1Input, PoolUncheckedUpdateWithoutToken1Input>
    create: XOR<PoolCreateWithoutToken1Input, PoolUncheckedCreateWithoutToken1Input>
  }

  export type PoolUpdateWithWhereUniqueWithoutToken1Input = {
    where: PoolWhereUniqueInput
    data: XOR<PoolUpdateWithoutToken1Input, PoolUncheckedUpdateWithoutToken1Input>
  }

  export type PoolUpdateManyWithWhereWithoutToken1Input = {
    where: PoolScalarWhereInput
    data: XOR<PoolUpdateManyMutationInput, PoolUncheckedUpdateManyWithoutToken1Input>
  }

  export type TokenStatisticUpsertWithWhereUniqueWithoutTokenInput = {
    where: TokenStatisticWhereUniqueInput
    update: XOR<TokenStatisticUpdateWithoutTokenInput, TokenStatisticUncheckedUpdateWithoutTokenInput>
    create: XOR<TokenStatisticCreateWithoutTokenInput, TokenStatisticUncheckedCreateWithoutTokenInput>
  }

  export type TokenStatisticUpdateWithWhereUniqueWithoutTokenInput = {
    where: TokenStatisticWhereUniqueInput
    data: XOR<TokenStatisticUpdateWithoutTokenInput, TokenStatisticUncheckedUpdateWithoutTokenInput>
  }

  export type TokenStatisticUpdateManyWithWhereWithoutTokenInput = {
    where: TokenStatisticScalarWhereInput
    data: XOR<TokenStatisticUpdateManyMutationInput, TokenStatisticUncheckedUpdateManyWithoutTokenInput>
  }

  export type TokenStatisticScalarWhereInput = {
    AND?: TokenStatisticScalarWhereInput | TokenStatisticScalarWhereInput[]
    OR?: TokenStatisticScalarWhereInput[]
    NOT?: TokenStatisticScalarWhereInput | TokenStatisticScalarWhereInput[]
    id?: StringFilter<"TokenStatistic"> | string
    tokenId?: StringFilter<"TokenStatistic"> | string
    price?: FloatFilter<"TokenStatistic"> | number
    oneHourEvolution?: FloatFilter<"TokenStatistic"> | number
    oneDayEvolution?: FloatFilter<"TokenStatistic"> | number
    volume?: FloatFilter<"TokenStatistic"> | number
    createdAt?: DateTimeFilter<"TokenStatistic"> | Date | string
  }

  export type TokenCreateWithoutStatisticInput = {
    id?: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    coingeckoId?: string | null
    tags?: TokenCreatetagsInput | string[]
    poolsAsToken0?: PoolCreateNestedManyWithoutToken0Input
    poolsAsToken1?: PoolCreateNestedManyWithoutToken1Input
  }

  export type TokenUncheckedCreateWithoutStatisticInput = {
    id?: string
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    coingeckoId?: string | null
    tags?: TokenCreatetagsInput | string[]
    poolsAsToken0?: PoolUncheckedCreateNestedManyWithoutToken0Input
    poolsAsToken1?: PoolUncheckedCreateNestedManyWithoutToken1Input
  }

  export type TokenCreateOrConnectWithoutStatisticInput = {
    where: TokenWhereUniqueInput
    create: XOR<TokenCreateWithoutStatisticInput, TokenUncheckedCreateWithoutStatisticInput>
  }

  export type TokenUpsertWithoutStatisticInput = {
    update: XOR<TokenUpdateWithoutStatisticInput, TokenUncheckedUpdateWithoutStatisticInput>
    create: XOR<TokenCreateWithoutStatisticInput, TokenUncheckedCreateWithoutStatisticInput>
    where?: TokenWhereInput
  }

  export type TokenUpdateToOneWithWhereWithoutStatisticInput = {
    where?: TokenWhereInput
    data: XOR<TokenUpdateWithoutStatisticInput, TokenUncheckedUpdateWithoutStatisticInput>
  }

  export type TokenUpdateWithoutStatisticInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
    poolsAsToken0?: PoolUpdateManyWithoutToken0NestedInput
    poolsAsToken1?: PoolUpdateManyWithoutToken1NestedInput
  }

  export type TokenUncheckedUpdateWithoutStatisticInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    tags?: TokenUpdatetagsInput | string[]
    poolsAsToken0?: PoolUncheckedUpdateManyWithoutToken0NestedInput
    poolsAsToken1?: PoolUncheckedUpdateManyWithoutToken1NestedInput
  }

  export type PoolCreateWithoutPoolStatisticInput = {
    id?: string
    address: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    token0: TokenCreateNestedOneWithoutPoolsAsToken0Input
    token1: TokenCreateNestedOneWithoutPoolsAsToken1Input
    swaps?: SwapCreateNestedManyWithoutPoolInput
  }

  export type PoolUncheckedCreateWithoutPoolStatisticInput = {
    id?: string
    address: string
    token0Id: string
    token1Id: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    swaps?: SwapUncheckedCreateNestedManyWithoutPoolInput
  }

  export type PoolCreateOrConnectWithoutPoolStatisticInput = {
    where: PoolWhereUniqueInput
    create: XOR<PoolCreateWithoutPoolStatisticInput, PoolUncheckedCreateWithoutPoolStatisticInput>
  }

  export type PoolUpsertWithoutPoolStatisticInput = {
    update: XOR<PoolUpdateWithoutPoolStatisticInput, PoolUncheckedUpdateWithoutPoolStatisticInput>
    create: XOR<PoolCreateWithoutPoolStatisticInput, PoolUncheckedCreateWithoutPoolStatisticInput>
    where?: PoolWhereInput
  }

  export type PoolUpdateToOneWithWhereWithoutPoolStatisticInput = {
    where?: PoolWhereInput
    data: XOR<PoolUpdateWithoutPoolStatisticInput, PoolUncheckedUpdateWithoutPoolStatisticInput>
  }

  export type PoolUpdateWithoutPoolStatisticInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token0?: TokenUpdateOneRequiredWithoutPoolsAsToken0NestedInput
    token1?: TokenUpdateOneRequiredWithoutPoolsAsToken1NestedInput
    swaps?: SwapUpdateManyWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateWithoutPoolStatisticInput = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    token0Id?: StringFieldUpdateOperationsInput | string
    token1Id?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    swaps?: SwapUncheckedUpdateManyWithoutPoolNestedInput
  }

  export type SwapCreateManyPoolInput = {
    id?: string
    sender: string
    recipient: string
    amount0: string
    amount1: string
    sqrtPriceX96: string
    tick: number
    transactionHash: string
    logIndex: number
    poolAddress: string
    gasUsed: number
    gasPrice: string
    createdAt?: Date | string
  }

  export type PoolStatisticCreateManyPoolInput = {
    id?: string
    apr: number
    tvlUSD: number
    volOneDay: string
    volOneMonth: string
    impermanentLoss: number
    healthScore: number
    createdAt?: Date | string
  }

  export type SwapUpdateWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    sender?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    amount0?: StringFieldUpdateOperationsInput | string
    amount1?: StringFieldUpdateOperationsInput | string
    sqrtPriceX96?: StringFieldUpdateOperationsInput | string
    tick?: IntFieldUpdateOperationsInput | number
    transactionHash?: StringFieldUpdateOperationsInput | string
    logIndex?: IntFieldUpdateOperationsInput | number
    poolAddress?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
    gasPrice?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SwapUncheckedUpdateWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    sender?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    amount0?: StringFieldUpdateOperationsInput | string
    amount1?: StringFieldUpdateOperationsInput | string
    sqrtPriceX96?: StringFieldUpdateOperationsInput | string
    tick?: IntFieldUpdateOperationsInput | number
    transactionHash?: StringFieldUpdateOperationsInput | string
    logIndex?: IntFieldUpdateOperationsInput | number
    poolAddress?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
    gasPrice?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SwapUncheckedUpdateManyWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    sender?: StringFieldUpdateOperationsInput | string
    recipient?: StringFieldUpdateOperationsInput | string
    amount0?: StringFieldUpdateOperationsInput | string
    amount1?: StringFieldUpdateOperationsInput | string
    sqrtPriceX96?: StringFieldUpdateOperationsInput | string
    tick?: IntFieldUpdateOperationsInput | number
    transactionHash?: StringFieldUpdateOperationsInput | string
    logIndex?: IntFieldUpdateOperationsInput | number
    poolAddress?: StringFieldUpdateOperationsInput | string
    gasUsed?: IntFieldUpdateOperationsInput | number
    gasPrice?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolStatisticUpdateWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    apr?: FloatFieldUpdateOperationsInput | number
    tvlUSD?: FloatFieldUpdateOperationsInput | number
    volOneDay?: StringFieldUpdateOperationsInput | string
    volOneMonth?: StringFieldUpdateOperationsInput | string
    impermanentLoss?: FloatFieldUpdateOperationsInput | number
    healthScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolStatisticUncheckedUpdateWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    apr?: FloatFieldUpdateOperationsInput | number
    tvlUSD?: FloatFieldUpdateOperationsInput | number
    volOneDay?: StringFieldUpdateOperationsInput | string
    volOneMonth?: StringFieldUpdateOperationsInput | string
    impermanentLoss?: FloatFieldUpdateOperationsInput | number
    healthScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolStatisticUncheckedUpdateManyWithoutPoolInput = {
    id?: StringFieldUpdateOperationsInput | string
    apr?: FloatFieldUpdateOperationsInput | number
    tvlUSD?: FloatFieldUpdateOperationsInput | number
    volOneDay?: StringFieldUpdateOperationsInput | string
    volOneMonth?: StringFieldUpdateOperationsInput | string
    impermanentLoss?: FloatFieldUpdateOperationsInput | number
    healthScore?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolCreateManyToken0Input = {
    id?: string
    address: string
    token1Id: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PoolCreateManyToken1Input = {
    id?: string
    address: string
    token0Id: string
    fee: number
    liquidity?: string | null
    tick?: number | null
    sqrtPriceX96?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TokenStatisticCreateManyTokenInput = {
    id?: string
    price: number
    oneHourEvolution: number
    oneDayEvolution: number
    volume?: number
    createdAt?: Date | string
  }

  export type PoolUpdateWithoutToken0Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token1?: TokenUpdateOneRequiredWithoutPoolsAsToken1NestedInput
    swaps?: SwapUpdateManyWithoutPoolNestedInput
    PoolStatistic?: PoolStatisticUpdateManyWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateWithoutToken0Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    token1Id?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    swaps?: SwapUncheckedUpdateManyWithoutPoolNestedInput
    PoolStatistic?: PoolStatisticUncheckedUpdateManyWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateManyWithoutToken0Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    token1Id?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PoolUpdateWithoutToken1Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token0?: TokenUpdateOneRequiredWithoutPoolsAsToken0NestedInput
    swaps?: SwapUpdateManyWithoutPoolNestedInput
    PoolStatistic?: PoolStatisticUpdateManyWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateWithoutToken1Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    token0Id?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    swaps?: SwapUncheckedUpdateManyWithoutPoolNestedInput
    PoolStatistic?: PoolStatisticUncheckedUpdateManyWithoutPoolNestedInput
  }

  export type PoolUncheckedUpdateManyWithoutToken1Input = {
    id?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    token0Id?: StringFieldUpdateOperationsInput | string
    fee?: IntFieldUpdateOperationsInput | number
    liquidity?: NullableStringFieldUpdateOperationsInput | string | null
    tick?: NullableIntFieldUpdateOperationsInput | number | null
    sqrtPriceX96?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenStatisticUpdateWithoutTokenInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    oneHourEvolution?: FloatFieldUpdateOperationsInput | number
    oneDayEvolution?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenStatisticUncheckedUpdateWithoutTokenInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    oneHourEvolution?: FloatFieldUpdateOperationsInput | number
    oneDayEvolution?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenStatisticUncheckedUpdateManyWithoutTokenInput = {
    id?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    oneHourEvolution?: FloatFieldUpdateOperationsInput | number
    oneDayEvolution?: FloatFieldUpdateOperationsInput | number
    volume?: FloatFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use PoolCountOutputTypeDefaultArgs instead
     */
    export type PoolCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PoolCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TokenCountOutputTypeDefaultArgs instead
     */
    export type TokenCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TokenCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PoolDefaultArgs instead
     */
    export type PoolArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PoolDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SwapDefaultArgs instead
     */
    export type SwapArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SwapDefaultArgs<ExtArgs>
    /**
     * @deprecated Use IndexerStateDefaultArgs instead
     */
    export type IndexerStateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = IndexerStateDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TokenDefaultArgs instead
     */
    export type TokenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TokenDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TokenStatisticDefaultArgs instead
     */
    export type TokenStatisticArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TokenStatisticDefaultArgs<ExtArgs>
    /**
     * @deprecated Use PoolStatisticDefaultArgs instead
     */
    export type PoolStatisticArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = PoolStatisticDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}