
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
 * Model Token
 * 
 */
export type Token = $Result.DefaultSelection<Prisma.$TokenPayload>
/**
 * Model TokenPrice
 * 
 */
export type TokenPrice = $Result.DefaultSelection<Prisma.$TokenPricePayload>
/**
 * Model TokenDailyStats
 * 
 */
export type TokenDailyStats = $Result.DefaultSelection<Prisma.$TokenDailyStatsPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const TokenState: {
  DISCOVERED: 'DISCOVERED',
  ENRICHING: 'ENRICHING',
  IN_POOL: 'IN_POOL',
  VERIFIED: 'VERIFIED',
  DEPRECATED: 'DEPRECATED'
};

export type TokenState = (typeof TokenState)[keyof typeof TokenState]


export const PriceSource: {
  POOL_CALCULATION: 'POOL_CALCULATION',
  COINGECKO_FALLBACK: 'COINGECKO_FALLBACK',
  MANUAL_OVERRIDE: 'MANUAL_OVERRIDE'
};

export type PriceSource = (typeof PriceSource)[keyof typeof PriceSource]

}

export type TokenState = $Enums.TokenState

export const TokenState: typeof $Enums.TokenState

export type PriceSource = $Enums.PriceSource

export const PriceSource: typeof $Enums.PriceSource

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Tokens
 * const tokens = await prisma.token.findMany()
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
   * // Fetch zero or more Tokens
   * const tokens = await prisma.token.findMany()
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
   * `prisma.token`: Exposes CRUD operations for the **Token** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tokens
    * const tokens = await prisma.token.findMany()
    * ```
    */
  get token(): Prisma.TokenDelegate<ExtArgs>;

  /**
   * `prisma.tokenPrice`: Exposes CRUD operations for the **TokenPrice** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TokenPrices
    * const tokenPrices = await prisma.tokenPrice.findMany()
    * ```
    */
  get tokenPrice(): Prisma.TokenPriceDelegate<ExtArgs>;

  /**
   * `prisma.tokenDailyStats`: Exposes CRUD operations for the **TokenDailyStats** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TokenDailyStats
    * const tokenDailyStats = await prisma.tokenDailyStats.findMany()
    * ```
    */
  get tokenDailyStats(): Prisma.TokenDailyStatsDelegate<ExtArgs>;
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
   * Query Engine version: acc0b9dd43eb689cbd20c9470515d719db10d0b0
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
    Token: 'Token',
    TokenPrice: 'TokenPrice',
    TokenDailyStats: 'TokenDailyStats'
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
      modelProps: "token" | "tokenPrice" | "tokenDailyStats"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
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
      TokenPrice: {
        payload: Prisma.$TokenPricePayload<ExtArgs>
        fields: Prisma.TokenPriceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TokenPriceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TokenPriceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload>
          }
          findFirst: {
            args: Prisma.TokenPriceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TokenPriceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload>
          }
          findMany: {
            args: Prisma.TokenPriceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload>[]
          }
          create: {
            args: Prisma.TokenPriceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload>
          }
          createMany: {
            args: Prisma.TokenPriceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TokenPriceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload>[]
          }
          delete: {
            args: Prisma.TokenPriceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload>
          }
          update: {
            args: Prisma.TokenPriceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload>
          }
          deleteMany: {
            args: Prisma.TokenPriceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TokenPriceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TokenPriceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenPricePayload>
          }
          aggregate: {
            args: Prisma.TokenPriceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTokenPrice>
          }
          groupBy: {
            args: Prisma.TokenPriceGroupByArgs<ExtArgs>
            result: $Utils.Optional<TokenPriceGroupByOutputType>[]
          }
          count: {
            args: Prisma.TokenPriceCountArgs<ExtArgs>
            result: $Utils.Optional<TokenPriceCountAggregateOutputType> | number
          }
        }
      }
      TokenDailyStats: {
        payload: Prisma.$TokenDailyStatsPayload<ExtArgs>
        fields: Prisma.TokenDailyStatsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TokenDailyStatsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TokenDailyStatsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload>
          }
          findFirst: {
            args: Prisma.TokenDailyStatsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TokenDailyStatsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload>
          }
          findMany: {
            args: Prisma.TokenDailyStatsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload>[]
          }
          create: {
            args: Prisma.TokenDailyStatsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload>
          }
          createMany: {
            args: Prisma.TokenDailyStatsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TokenDailyStatsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload>[]
          }
          delete: {
            args: Prisma.TokenDailyStatsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload>
          }
          update: {
            args: Prisma.TokenDailyStatsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload>
          }
          deleteMany: {
            args: Prisma.TokenDailyStatsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TokenDailyStatsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TokenDailyStatsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TokenDailyStatsPayload>
          }
          aggregate: {
            args: Prisma.TokenDailyStatsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTokenDailyStats>
          }
          groupBy: {
            args: Prisma.TokenDailyStatsGroupByArgs<ExtArgs>
            result: $Utils.Optional<TokenDailyStatsGroupByOutputType>[]
          }
          count: {
            args: Prisma.TokenDailyStatsCountArgs<ExtArgs>
            result: $Utils.Optional<TokenDailyStatsCountAggregateOutputType> | number
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
   * Count Type TokenCountOutputType
   */

  export type TokenCountOutputType = {
    TokenPrice: number
    TokenDailyStats: number
  }

  export type TokenCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    TokenPrice?: boolean | TokenCountOutputTypeCountTokenPriceArgs
    TokenDailyStats?: boolean | TokenCountOutputTypeCountTokenDailyStatsArgs
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
  export type TokenCountOutputTypeCountTokenPriceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TokenPriceWhereInput
  }

  /**
   * TokenCountOutputType without action
   */
  export type TokenCountOutputTypeCountTokenDailyStatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TokenDailyStatsWhereInput
  }


  /**
   * Models
   */

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
    totalSupply: number | null
  }

  export type TokenSumAggregateOutputType = {
    decimals: number | null
    totalSupply: bigint | null
  }

  export type TokenMinAggregateOutputType = {
    address: string | null
    symbol: string | null
    name: string | null
    decimals: number | null
    logoUri: string | null
    website: string | null
    twitter: string | null
    description: string | null
    coingeckoId: string | null
    totalSupply: bigint | null
    status: $Enums.TokenState | null
    discoveredAt: Date | null
    lastEnrichmentAt: Date | null
    lastActivityAt: Date | null
    isStableCoin: boolean | null
    isVerifiedManually: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TokenMaxAggregateOutputType = {
    address: string | null
    symbol: string | null
    name: string | null
    decimals: number | null
    logoUri: string | null
    website: string | null
    twitter: string | null
    description: string | null
    coingeckoId: string | null
    totalSupply: bigint | null
    status: $Enums.TokenState | null
    discoveredAt: Date | null
    lastEnrichmentAt: Date | null
    lastActivityAt: Date | null
    isStableCoin: boolean | null
    isVerifiedManually: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TokenCountAggregateOutputType = {
    address: number
    symbol: number
    name: number
    decimals: number
    logoUri: number
    website: number
    twitter: number
    description: number
    coingeckoId: number
    totalSupply: number
    status: number
    discoveredAt: number
    lastEnrichmentAt: number
    lastActivityAt: number
    isStableCoin: number
    isVerifiedManually: number
    metadata: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TokenAvgAggregateInputType = {
    decimals?: true
    totalSupply?: true
  }

  export type TokenSumAggregateInputType = {
    decimals?: true
    totalSupply?: true
  }

  export type TokenMinAggregateInputType = {
    address?: true
    symbol?: true
    name?: true
    decimals?: true
    logoUri?: true
    website?: true
    twitter?: true
    description?: true
    coingeckoId?: true
    totalSupply?: true
    status?: true
    discoveredAt?: true
    lastEnrichmentAt?: true
    lastActivityAt?: true
    isStableCoin?: true
    isVerifiedManually?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TokenMaxAggregateInputType = {
    address?: true
    symbol?: true
    name?: true
    decimals?: true
    logoUri?: true
    website?: true
    twitter?: true
    description?: true
    coingeckoId?: true
    totalSupply?: true
    status?: true
    discoveredAt?: true
    lastEnrichmentAt?: true
    lastActivityAt?: true
    isStableCoin?: true
    isVerifiedManually?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TokenCountAggregateInputType = {
    address?: true
    symbol?: true
    name?: true
    decimals?: true
    logoUri?: true
    website?: true
    twitter?: true
    description?: true
    coingeckoId?: true
    totalSupply?: true
    status?: true
    discoveredAt?: true
    lastEnrichmentAt?: true
    lastActivityAt?: true
    isStableCoin?: true
    isVerifiedManually?: true
    metadata?: true
    createdAt?: true
    updatedAt?: true
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
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri: string | null
    website: string | null
    twitter: string | null
    description: string | null
    coingeckoId: string | null
    totalSupply: bigint
    status: $Enums.TokenState
    discoveredAt: Date
    lastEnrichmentAt: Date | null
    lastActivityAt: Date | null
    isStableCoin: boolean
    isVerifiedManually: boolean
    metadata: JsonValue | null
    createdAt: Date
    updatedAt: Date
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
    address?: boolean
    symbol?: boolean
    name?: boolean
    decimals?: boolean
    logoUri?: boolean
    website?: boolean
    twitter?: boolean
    description?: boolean
    coingeckoId?: boolean
    totalSupply?: boolean
    status?: boolean
    discoveredAt?: boolean
    lastEnrichmentAt?: boolean
    lastActivityAt?: boolean
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    TokenPrice?: boolean | Token$TokenPriceArgs<ExtArgs>
    TokenDailyStats?: boolean | Token$TokenDailyStatsArgs<ExtArgs>
    _count?: boolean | TokenCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["token"]>

  export type TokenSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    address?: boolean
    symbol?: boolean
    name?: boolean
    decimals?: boolean
    logoUri?: boolean
    website?: boolean
    twitter?: boolean
    description?: boolean
    coingeckoId?: boolean
    totalSupply?: boolean
    status?: boolean
    discoveredAt?: boolean
    lastEnrichmentAt?: boolean
    lastActivityAt?: boolean
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["token"]>

  export type TokenSelectScalar = {
    address?: boolean
    symbol?: boolean
    name?: boolean
    decimals?: boolean
    logoUri?: boolean
    website?: boolean
    twitter?: boolean
    description?: boolean
    coingeckoId?: boolean
    totalSupply?: boolean
    status?: boolean
    discoveredAt?: boolean
    lastEnrichmentAt?: boolean
    lastActivityAt?: boolean
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TokenInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    TokenPrice?: boolean | Token$TokenPriceArgs<ExtArgs>
    TokenDailyStats?: boolean | Token$TokenDailyStatsArgs<ExtArgs>
    _count?: boolean | TokenCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TokenIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TokenPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Token"
    objects: {
      TokenPrice: Prisma.$TokenPricePayload<ExtArgs>[]
      TokenDailyStats: Prisma.$TokenDailyStatsPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      address: string
      symbol: string
      name: string
      decimals: number
      logoUri: string | null
      website: string | null
      twitter: string | null
      description: string | null
      coingeckoId: string | null
      totalSupply: bigint
      status: $Enums.TokenState
      discoveredAt: Date
      lastEnrichmentAt: Date | null
      lastActivityAt: Date | null
      isStableCoin: boolean
      isVerifiedManually: boolean
      metadata: Prisma.JsonValue | null
      createdAt: Date
      updatedAt: Date
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
     * // Only select the `address`
     * const tokenWithAddressOnly = await prisma.token.findMany({ select: { address: true } })
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
     * // Create many Tokens and only return the `address`
     * const tokenWithAddressOnly = await prisma.token.createManyAndReturn({ 
     *   select: { address: true },
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
    TokenPrice<T extends Token$TokenPriceArgs<ExtArgs> = {}>(args?: Subset<T, Token$TokenPriceArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "findMany"> | Null>
    TokenDailyStats<T extends Token$TokenDailyStatsArgs<ExtArgs> = {}>(args?: Subset<T, Token$TokenDailyStatsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "findMany"> | Null>
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
    readonly address: FieldRef<"Token", 'String'>
    readonly symbol: FieldRef<"Token", 'String'>
    readonly name: FieldRef<"Token", 'String'>
    readonly decimals: FieldRef<"Token", 'Int'>
    readonly logoUri: FieldRef<"Token", 'String'>
    readonly website: FieldRef<"Token", 'String'>
    readonly twitter: FieldRef<"Token", 'String'>
    readonly description: FieldRef<"Token", 'String'>
    readonly coingeckoId: FieldRef<"Token", 'String'>
    readonly totalSupply: FieldRef<"Token", 'BigInt'>
    readonly status: FieldRef<"Token", 'TokenState'>
    readonly discoveredAt: FieldRef<"Token", 'DateTime'>
    readonly lastEnrichmentAt: FieldRef<"Token", 'DateTime'>
    readonly lastActivityAt: FieldRef<"Token", 'DateTime'>
    readonly isStableCoin: FieldRef<"Token", 'Boolean'>
    readonly isVerifiedManually: FieldRef<"Token", 'Boolean'>
    readonly metadata: FieldRef<"Token", 'Json'>
    readonly createdAt: FieldRef<"Token", 'DateTime'>
    readonly updatedAt: FieldRef<"Token", 'DateTime'>
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
    limit?: number
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
    limit?: number
  }

  /**
   * Token.TokenPrice
   */
  export type Token$TokenPriceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    where?: TokenPriceWhereInput
    orderBy?: TokenPriceOrderByWithRelationInput | TokenPriceOrderByWithRelationInput[]
    cursor?: TokenPriceWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TokenPriceScalarFieldEnum | TokenPriceScalarFieldEnum[]
  }

  /**
   * Token.TokenDailyStats
   */
  export type Token$TokenDailyStatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    where?: TokenDailyStatsWhereInput
    orderBy?: TokenDailyStatsOrderByWithRelationInput | TokenDailyStatsOrderByWithRelationInput[]
    cursor?: TokenDailyStatsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TokenDailyStatsScalarFieldEnum | TokenDailyStatsScalarFieldEnum[]
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
   * Model TokenPrice
   */

  export type AggregateTokenPrice = {
    _count: TokenPriceCountAggregateOutputType | null
    _avg: TokenPriceAvgAggregateOutputType | null
    _sum: TokenPriceSumAggregateOutputType | null
    _min: TokenPriceMinAggregateOutputType | null
    _max: TokenPriceMaxAggregateOutputType | null
  }

  export type TokenPriceAvgAggregateOutputType = {
    price: number | null
    confidence: number | null
    volumeUSD: number | null
  }

  export type TokenPriceSumAggregateOutputType = {
    price: number | null
    confidence: number | null
    volumeUSD: number | null
  }

  export type TokenPriceMinAggregateOutputType = {
    tokenAddress: string | null
    timestamp: Date | null
    price: number | null
    priceSource: $Enums.PriceSource | null
    confidence: number | null
    volumeUSD: number | null
    createdAt: Date | null
  }

  export type TokenPriceMaxAggregateOutputType = {
    tokenAddress: string | null
    timestamp: Date | null
    price: number | null
    priceSource: $Enums.PriceSource | null
    confidence: number | null
    volumeUSD: number | null
    createdAt: Date | null
  }

  export type TokenPriceCountAggregateOutputType = {
    tokenAddress: number
    timestamp: number
    price: number
    priceSource: number
    confidence: number
    volumeUSD: number
    liquidityPath: number
    poolsInvolved: number
    createdAt: number
    _all: number
  }


  export type TokenPriceAvgAggregateInputType = {
    price?: true
    confidence?: true
    volumeUSD?: true
  }

  export type TokenPriceSumAggregateInputType = {
    price?: true
    confidence?: true
    volumeUSD?: true
  }

  export type TokenPriceMinAggregateInputType = {
    tokenAddress?: true
    timestamp?: true
    price?: true
    priceSource?: true
    confidence?: true
    volumeUSD?: true
    createdAt?: true
  }

  export type TokenPriceMaxAggregateInputType = {
    tokenAddress?: true
    timestamp?: true
    price?: true
    priceSource?: true
    confidence?: true
    volumeUSD?: true
    createdAt?: true
  }

  export type TokenPriceCountAggregateInputType = {
    tokenAddress?: true
    timestamp?: true
    price?: true
    priceSource?: true
    confidence?: true
    volumeUSD?: true
    liquidityPath?: true
    poolsInvolved?: true
    createdAt?: true
    _all?: true
  }

  export type TokenPriceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TokenPrice to aggregate.
     */
    where?: TokenPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenPrices to fetch.
     */
    orderBy?: TokenPriceOrderByWithRelationInput | TokenPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TokenPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TokenPrices
    **/
    _count?: true | TokenPriceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TokenPriceAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TokenPriceSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TokenPriceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TokenPriceMaxAggregateInputType
  }

  export type GetTokenPriceAggregateType<T extends TokenPriceAggregateArgs> = {
        [P in keyof T & keyof AggregateTokenPrice]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTokenPrice[P]>
      : GetScalarType<T[P], AggregateTokenPrice[P]>
  }




  export type TokenPriceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TokenPriceWhereInput
    orderBy?: TokenPriceOrderByWithAggregationInput | TokenPriceOrderByWithAggregationInput[]
    by: TokenPriceScalarFieldEnum[] | TokenPriceScalarFieldEnum
    having?: TokenPriceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TokenPriceCountAggregateInputType | true
    _avg?: TokenPriceAvgAggregateInputType
    _sum?: TokenPriceSumAggregateInputType
    _min?: TokenPriceMinAggregateInputType
    _max?: TokenPriceMaxAggregateInputType
  }

  export type TokenPriceGroupByOutputType = {
    tokenAddress: string
    timestamp: Date
    price: number
    priceSource: $Enums.PriceSource
    confidence: number
    volumeUSD: number
    liquidityPath: JsonValue | null
    poolsInvolved: string[]
    createdAt: Date
    _count: TokenPriceCountAggregateOutputType | null
    _avg: TokenPriceAvgAggregateOutputType | null
    _sum: TokenPriceSumAggregateOutputType | null
    _min: TokenPriceMinAggregateOutputType | null
    _max: TokenPriceMaxAggregateOutputType | null
  }

  type GetTokenPriceGroupByPayload<T extends TokenPriceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TokenPriceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TokenPriceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TokenPriceGroupByOutputType[P]>
            : GetScalarType<T[P], TokenPriceGroupByOutputType[P]>
        }
      >
    >


  export type TokenPriceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tokenAddress?: boolean
    timestamp?: boolean
    price?: boolean
    priceSource?: boolean
    confidence?: boolean
    volumeUSD?: boolean
    liquidityPath?: boolean
    poolsInvolved?: boolean
    createdAt?: boolean
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tokenPrice"]>

  export type TokenPriceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tokenAddress?: boolean
    timestamp?: boolean
    price?: boolean
    priceSource?: boolean
    confidence?: boolean
    volumeUSD?: boolean
    liquidityPath?: boolean
    poolsInvolved?: boolean
    createdAt?: boolean
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tokenPrice"]>

  export type TokenPriceSelectScalar = {
    tokenAddress?: boolean
    timestamp?: boolean
    price?: boolean
    priceSource?: boolean
    confidence?: boolean
    volumeUSD?: boolean
    liquidityPath?: boolean
    poolsInvolved?: boolean
    createdAt?: boolean
  }

  export type TokenPriceInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }
  export type TokenPriceIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }

  export type $TokenPricePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TokenPrice"
    objects: {
      token: Prisma.$TokenPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      tokenAddress: string
      timestamp: Date
      price: number
      priceSource: $Enums.PriceSource
      confidence: number
      volumeUSD: number
      liquidityPath: Prisma.JsonValue | null
      poolsInvolved: string[]
      createdAt: Date
    }, ExtArgs["result"]["tokenPrice"]>
    composites: {}
  }

  type TokenPriceGetPayload<S extends boolean | null | undefined | TokenPriceDefaultArgs> = $Result.GetResult<Prisma.$TokenPricePayload, S>

  type TokenPriceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TokenPriceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TokenPriceCountAggregateInputType | true
    }

  export interface TokenPriceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TokenPrice'], meta: { name: 'TokenPrice' } }
    /**
     * Find zero or one TokenPrice that matches the filter.
     * @param {TokenPriceFindUniqueArgs} args - Arguments to find a TokenPrice
     * @example
     * // Get one TokenPrice
     * const tokenPrice = await prisma.tokenPrice.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TokenPriceFindUniqueArgs>(args: SelectSubset<T, TokenPriceFindUniqueArgs<ExtArgs>>): Prisma__TokenPriceClient<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TokenPrice that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TokenPriceFindUniqueOrThrowArgs} args - Arguments to find a TokenPrice
     * @example
     * // Get one TokenPrice
     * const tokenPrice = await prisma.tokenPrice.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TokenPriceFindUniqueOrThrowArgs>(args: SelectSubset<T, TokenPriceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TokenPriceClient<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TokenPrice that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenPriceFindFirstArgs} args - Arguments to find a TokenPrice
     * @example
     * // Get one TokenPrice
     * const tokenPrice = await prisma.tokenPrice.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TokenPriceFindFirstArgs>(args?: SelectSubset<T, TokenPriceFindFirstArgs<ExtArgs>>): Prisma__TokenPriceClient<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TokenPrice that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenPriceFindFirstOrThrowArgs} args - Arguments to find a TokenPrice
     * @example
     * // Get one TokenPrice
     * const tokenPrice = await prisma.tokenPrice.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TokenPriceFindFirstOrThrowArgs>(args?: SelectSubset<T, TokenPriceFindFirstOrThrowArgs<ExtArgs>>): Prisma__TokenPriceClient<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TokenPrices that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenPriceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TokenPrices
     * const tokenPrices = await prisma.tokenPrice.findMany()
     * 
     * // Get first 10 TokenPrices
     * const tokenPrices = await prisma.tokenPrice.findMany({ take: 10 })
     * 
     * // Only select the `tokenAddress`
     * const tokenPriceWithTokenAddressOnly = await prisma.tokenPrice.findMany({ select: { tokenAddress: true } })
     * 
     */
    findMany<T extends TokenPriceFindManyArgs>(args?: SelectSubset<T, TokenPriceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TokenPrice.
     * @param {TokenPriceCreateArgs} args - Arguments to create a TokenPrice.
     * @example
     * // Create one TokenPrice
     * const TokenPrice = await prisma.tokenPrice.create({
     *   data: {
     *     // ... data to create a TokenPrice
     *   }
     * })
     * 
     */
    create<T extends TokenPriceCreateArgs>(args: SelectSubset<T, TokenPriceCreateArgs<ExtArgs>>): Prisma__TokenPriceClient<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TokenPrices.
     * @param {TokenPriceCreateManyArgs} args - Arguments to create many TokenPrices.
     * @example
     * // Create many TokenPrices
     * const tokenPrice = await prisma.tokenPrice.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TokenPriceCreateManyArgs>(args?: SelectSubset<T, TokenPriceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TokenPrices and returns the data saved in the database.
     * @param {TokenPriceCreateManyAndReturnArgs} args - Arguments to create many TokenPrices.
     * @example
     * // Create many TokenPrices
     * const tokenPrice = await prisma.tokenPrice.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TokenPrices and only return the `tokenAddress`
     * const tokenPriceWithTokenAddressOnly = await prisma.tokenPrice.createManyAndReturn({ 
     *   select: { tokenAddress: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TokenPriceCreateManyAndReturnArgs>(args?: SelectSubset<T, TokenPriceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TokenPrice.
     * @param {TokenPriceDeleteArgs} args - Arguments to delete one TokenPrice.
     * @example
     * // Delete one TokenPrice
     * const TokenPrice = await prisma.tokenPrice.delete({
     *   where: {
     *     // ... filter to delete one TokenPrice
     *   }
     * })
     * 
     */
    delete<T extends TokenPriceDeleteArgs>(args: SelectSubset<T, TokenPriceDeleteArgs<ExtArgs>>): Prisma__TokenPriceClient<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TokenPrice.
     * @param {TokenPriceUpdateArgs} args - Arguments to update one TokenPrice.
     * @example
     * // Update one TokenPrice
     * const tokenPrice = await prisma.tokenPrice.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TokenPriceUpdateArgs>(args: SelectSubset<T, TokenPriceUpdateArgs<ExtArgs>>): Prisma__TokenPriceClient<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TokenPrices.
     * @param {TokenPriceDeleteManyArgs} args - Arguments to filter TokenPrices to delete.
     * @example
     * // Delete a few TokenPrices
     * const { count } = await prisma.tokenPrice.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TokenPriceDeleteManyArgs>(args?: SelectSubset<T, TokenPriceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TokenPrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenPriceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TokenPrices
     * const tokenPrice = await prisma.tokenPrice.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TokenPriceUpdateManyArgs>(args: SelectSubset<T, TokenPriceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TokenPrice.
     * @param {TokenPriceUpsertArgs} args - Arguments to update or create a TokenPrice.
     * @example
     * // Update or create a TokenPrice
     * const tokenPrice = await prisma.tokenPrice.upsert({
     *   create: {
     *     // ... data to create a TokenPrice
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TokenPrice we want to update
     *   }
     * })
     */
    upsert<T extends TokenPriceUpsertArgs>(args: SelectSubset<T, TokenPriceUpsertArgs<ExtArgs>>): Prisma__TokenPriceClient<$Result.GetResult<Prisma.$TokenPricePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TokenPrices.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenPriceCountArgs} args - Arguments to filter TokenPrices to count.
     * @example
     * // Count the number of TokenPrices
     * const count = await prisma.tokenPrice.count({
     *   where: {
     *     // ... the filter for the TokenPrices we want to count
     *   }
     * })
    **/
    count<T extends TokenPriceCountArgs>(
      args?: Subset<T, TokenPriceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TokenPriceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TokenPrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenPriceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TokenPriceAggregateArgs>(args: Subset<T, TokenPriceAggregateArgs>): Prisma.PrismaPromise<GetTokenPriceAggregateType<T>>

    /**
     * Group by TokenPrice.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenPriceGroupByArgs} args - Group by arguments.
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
      T extends TokenPriceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TokenPriceGroupByArgs['orderBy'] }
        : { orderBy?: TokenPriceGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TokenPriceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTokenPriceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TokenPrice model
   */
  readonly fields: TokenPriceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TokenPrice.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TokenPriceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TokenPrice model
   */ 
  interface TokenPriceFieldRefs {
    readonly tokenAddress: FieldRef<"TokenPrice", 'String'>
    readonly timestamp: FieldRef<"TokenPrice", 'DateTime'>
    readonly price: FieldRef<"TokenPrice", 'Float'>
    readonly priceSource: FieldRef<"TokenPrice", 'PriceSource'>
    readonly confidence: FieldRef<"TokenPrice", 'Float'>
    readonly volumeUSD: FieldRef<"TokenPrice", 'Float'>
    readonly liquidityPath: FieldRef<"TokenPrice", 'Json'>
    readonly poolsInvolved: FieldRef<"TokenPrice", 'String[]'>
    readonly createdAt: FieldRef<"TokenPrice", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TokenPrice findUnique
   */
  export type TokenPriceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    /**
     * Filter, which TokenPrice to fetch.
     */
    where: TokenPriceWhereUniqueInput
  }

  /**
   * TokenPrice findUniqueOrThrow
   */
  export type TokenPriceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    /**
     * Filter, which TokenPrice to fetch.
     */
    where: TokenPriceWhereUniqueInput
  }

  /**
   * TokenPrice findFirst
   */
  export type TokenPriceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    /**
     * Filter, which TokenPrice to fetch.
     */
    where?: TokenPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenPrices to fetch.
     */
    orderBy?: TokenPriceOrderByWithRelationInput | TokenPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TokenPrices.
     */
    cursor?: TokenPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TokenPrices.
     */
    distinct?: TokenPriceScalarFieldEnum | TokenPriceScalarFieldEnum[]
  }

  /**
   * TokenPrice findFirstOrThrow
   */
  export type TokenPriceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    /**
     * Filter, which TokenPrice to fetch.
     */
    where?: TokenPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenPrices to fetch.
     */
    orderBy?: TokenPriceOrderByWithRelationInput | TokenPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TokenPrices.
     */
    cursor?: TokenPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenPrices.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TokenPrices.
     */
    distinct?: TokenPriceScalarFieldEnum | TokenPriceScalarFieldEnum[]
  }

  /**
   * TokenPrice findMany
   */
  export type TokenPriceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    /**
     * Filter, which TokenPrices to fetch.
     */
    where?: TokenPriceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenPrices to fetch.
     */
    orderBy?: TokenPriceOrderByWithRelationInput | TokenPriceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TokenPrices.
     */
    cursor?: TokenPriceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenPrices from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenPrices.
     */
    skip?: number
    distinct?: TokenPriceScalarFieldEnum | TokenPriceScalarFieldEnum[]
  }

  /**
   * TokenPrice create
   */
  export type TokenPriceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    /**
     * The data needed to create a TokenPrice.
     */
    data: XOR<TokenPriceCreateInput, TokenPriceUncheckedCreateInput>
  }

  /**
   * TokenPrice createMany
   */
  export type TokenPriceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TokenPrices.
     */
    data: TokenPriceCreateManyInput | TokenPriceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TokenPrice createManyAndReturn
   */
  export type TokenPriceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TokenPrices.
     */
    data: TokenPriceCreateManyInput | TokenPriceCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TokenPrice update
   */
  export type TokenPriceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    /**
     * The data needed to update a TokenPrice.
     */
    data: XOR<TokenPriceUpdateInput, TokenPriceUncheckedUpdateInput>
    /**
     * Choose, which TokenPrice to update.
     */
    where: TokenPriceWhereUniqueInput
  }

  /**
   * TokenPrice updateMany
   */
  export type TokenPriceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TokenPrices.
     */
    data: XOR<TokenPriceUpdateManyMutationInput, TokenPriceUncheckedUpdateManyInput>
    /**
     * Filter which TokenPrices to update
     */
    where?: TokenPriceWhereInput
    limit?: number
  }

  /**
   * TokenPrice upsert
   */
  export type TokenPriceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    /**
     * The filter to search for the TokenPrice to update in case it exists.
     */
    where: TokenPriceWhereUniqueInput
    /**
     * In case the TokenPrice found by the `where` argument doesn't exist, create a new TokenPrice with this data.
     */
    create: XOR<TokenPriceCreateInput, TokenPriceUncheckedCreateInput>
    /**
     * In case the TokenPrice was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TokenPriceUpdateInput, TokenPriceUncheckedUpdateInput>
  }

  /**
   * TokenPrice delete
   */
  export type TokenPriceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
    /**
     * Filter which TokenPrice to delete.
     */
    where: TokenPriceWhereUniqueInput
  }

  /**
   * TokenPrice deleteMany
   */
  export type TokenPriceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TokenPrices to delete
     */
    where?: TokenPriceWhereInput
    limit?: number
  }

  /**
   * TokenPrice without action
   */
  export type TokenPriceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenPrice
     */
    select?: TokenPriceSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenPriceInclude<ExtArgs> | null
  }


  /**
   * Model TokenDailyStats
   */

  export type AggregateTokenDailyStats = {
    _count: TokenDailyStatsCountAggregateOutputType | null
    _avg: TokenDailyStatsAvgAggregateOutputType | null
    _sum: TokenDailyStatsSumAggregateOutputType | null
    _min: TokenDailyStatsMinAggregateOutputType | null
    _max: TokenDailyStatsMaxAggregateOutputType | null
  }

  export type TokenDailyStatsAvgAggregateOutputType = {
    price: number | null
    priceChange1h: number | null
    priceChange24h: number | null
    volume24h: number | null
    volumeUSD24h: number | null
    tvlInPools: number | null
    marketCap: number | null
    fdv: number | null
    rankByTvl: number | null
    rankByVolume: number | null
    rankByMarketCap: number | null
    swapCount24h: number | null
    uniqueTraders24h: number | null
  }

  export type TokenDailyStatsSumAggregateOutputType = {
    price: number | null
    priceChange1h: number | null
    priceChange24h: number | null
    volume24h: number | null
    volumeUSD24h: number | null
    tvlInPools: number | null
    marketCap: number | null
    fdv: number | null
    rankByTvl: number | null
    rankByVolume: number | null
    rankByMarketCap: number | null
    swapCount24h: number | null
    uniqueTraders24h: number | null
  }

  export type TokenDailyStatsMinAggregateOutputType = {
    tokenAddress: string | null
    date: string | null
    price: number | null
    priceChange1h: number | null
    priceChange24h: number | null
    volume24h: number | null
    volumeUSD24h: number | null
    tvlInPools: number | null
    marketCap: number | null
    fdv: number | null
    rankByTvl: number | null
    rankByVolume: number | null
    rankByMarketCap: number | null
    swapCount24h: number | null
    uniqueTraders24h: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TokenDailyStatsMaxAggregateOutputType = {
    tokenAddress: string | null
    date: string | null
    price: number | null
    priceChange1h: number | null
    priceChange24h: number | null
    volume24h: number | null
    volumeUSD24h: number | null
    tvlInPools: number | null
    marketCap: number | null
    fdv: number | null
    rankByTvl: number | null
    rankByVolume: number | null
    rankByMarketCap: number | null
    swapCount24h: number | null
    uniqueTraders24h: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TokenDailyStatsCountAggregateOutputType = {
    tokenAddress: number
    date: number
    price: number
    priceChange1h: number
    priceChange24h: number
    volume24h: number
    volumeUSD24h: number
    tvlInPools: number
    marketCap: number
    fdv: number
    rankByTvl: number
    rankByVolume: number
    rankByMarketCap: number
    swapCount24h: number
    uniqueTraders24h: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TokenDailyStatsAvgAggregateInputType = {
    price?: true
    priceChange1h?: true
    priceChange24h?: true
    volume24h?: true
    volumeUSD24h?: true
    tvlInPools?: true
    marketCap?: true
    fdv?: true
    rankByTvl?: true
    rankByVolume?: true
    rankByMarketCap?: true
    swapCount24h?: true
    uniqueTraders24h?: true
  }

  export type TokenDailyStatsSumAggregateInputType = {
    price?: true
    priceChange1h?: true
    priceChange24h?: true
    volume24h?: true
    volumeUSD24h?: true
    tvlInPools?: true
    marketCap?: true
    fdv?: true
    rankByTvl?: true
    rankByVolume?: true
    rankByMarketCap?: true
    swapCount24h?: true
    uniqueTraders24h?: true
  }

  export type TokenDailyStatsMinAggregateInputType = {
    tokenAddress?: true
    date?: true
    price?: true
    priceChange1h?: true
    priceChange24h?: true
    volume24h?: true
    volumeUSD24h?: true
    tvlInPools?: true
    marketCap?: true
    fdv?: true
    rankByTvl?: true
    rankByVolume?: true
    rankByMarketCap?: true
    swapCount24h?: true
    uniqueTraders24h?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TokenDailyStatsMaxAggregateInputType = {
    tokenAddress?: true
    date?: true
    price?: true
    priceChange1h?: true
    priceChange24h?: true
    volume24h?: true
    volumeUSD24h?: true
    tvlInPools?: true
    marketCap?: true
    fdv?: true
    rankByTvl?: true
    rankByVolume?: true
    rankByMarketCap?: true
    swapCount24h?: true
    uniqueTraders24h?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TokenDailyStatsCountAggregateInputType = {
    tokenAddress?: true
    date?: true
    price?: true
    priceChange1h?: true
    priceChange24h?: true
    volume24h?: true
    volumeUSD24h?: true
    tvlInPools?: true
    marketCap?: true
    fdv?: true
    rankByTvl?: true
    rankByVolume?: true
    rankByMarketCap?: true
    swapCount24h?: true
    uniqueTraders24h?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TokenDailyStatsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TokenDailyStats to aggregate.
     */
    where?: TokenDailyStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenDailyStats to fetch.
     */
    orderBy?: TokenDailyStatsOrderByWithRelationInput | TokenDailyStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TokenDailyStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenDailyStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenDailyStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TokenDailyStats
    **/
    _count?: true | TokenDailyStatsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TokenDailyStatsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TokenDailyStatsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TokenDailyStatsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TokenDailyStatsMaxAggregateInputType
  }

  export type GetTokenDailyStatsAggregateType<T extends TokenDailyStatsAggregateArgs> = {
        [P in keyof T & keyof AggregateTokenDailyStats]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTokenDailyStats[P]>
      : GetScalarType<T[P], AggregateTokenDailyStats[P]>
  }




  export type TokenDailyStatsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TokenDailyStatsWhereInput
    orderBy?: TokenDailyStatsOrderByWithAggregationInput | TokenDailyStatsOrderByWithAggregationInput[]
    by: TokenDailyStatsScalarFieldEnum[] | TokenDailyStatsScalarFieldEnum
    having?: TokenDailyStatsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TokenDailyStatsCountAggregateInputType | true
    _avg?: TokenDailyStatsAvgAggregateInputType
    _sum?: TokenDailyStatsSumAggregateInputType
    _min?: TokenDailyStatsMinAggregateInputType
    _max?: TokenDailyStatsMaxAggregateInputType
  }

  export type TokenDailyStatsGroupByOutputType = {
    tokenAddress: string
    date: string
    price: number
    priceChange1h: number | null
    priceChange24h: number | null
    volume24h: number
    volumeUSD24h: number
    tvlInPools: number
    marketCap: number | null
    fdv: number | null
    rankByTvl: number | null
    rankByVolume: number | null
    rankByMarketCap: number | null
    swapCount24h: number
    uniqueTraders24h: number
    createdAt: Date
    updatedAt: Date
    _count: TokenDailyStatsCountAggregateOutputType | null
    _avg: TokenDailyStatsAvgAggregateOutputType | null
    _sum: TokenDailyStatsSumAggregateOutputType | null
    _min: TokenDailyStatsMinAggregateOutputType | null
    _max: TokenDailyStatsMaxAggregateOutputType | null
  }

  type GetTokenDailyStatsGroupByPayload<T extends TokenDailyStatsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TokenDailyStatsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TokenDailyStatsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TokenDailyStatsGroupByOutputType[P]>
            : GetScalarType<T[P], TokenDailyStatsGroupByOutputType[P]>
        }
      >
    >


  export type TokenDailyStatsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tokenAddress?: boolean
    date?: boolean
    price?: boolean
    priceChange1h?: boolean
    priceChange24h?: boolean
    volume24h?: boolean
    volumeUSD24h?: boolean
    tvlInPools?: boolean
    marketCap?: boolean
    fdv?: boolean
    rankByTvl?: boolean
    rankByVolume?: boolean
    rankByMarketCap?: boolean
    swapCount24h?: boolean
    uniqueTraders24h?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tokenDailyStats"]>

  export type TokenDailyStatsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    tokenAddress?: boolean
    date?: boolean
    price?: boolean
    priceChange1h?: boolean
    priceChange24h?: boolean
    volume24h?: boolean
    volumeUSD24h?: boolean
    tvlInPools?: boolean
    marketCap?: boolean
    fdv?: boolean
    rankByTvl?: boolean
    rankByVolume?: boolean
    rankByMarketCap?: boolean
    swapCount24h?: boolean
    uniqueTraders24h?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tokenDailyStats"]>

  export type TokenDailyStatsSelectScalar = {
    tokenAddress?: boolean
    date?: boolean
    price?: boolean
    priceChange1h?: boolean
    priceChange24h?: boolean
    volume24h?: boolean
    volumeUSD24h?: boolean
    tvlInPools?: boolean
    marketCap?: boolean
    fdv?: boolean
    rankByTvl?: boolean
    rankByVolume?: boolean
    rankByMarketCap?: boolean
    swapCount24h?: boolean
    uniqueTraders24h?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type TokenDailyStatsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }
  export type TokenDailyStatsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    token?: boolean | TokenDefaultArgs<ExtArgs>
  }

  export type $TokenDailyStatsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TokenDailyStats"
    objects: {
      token: Prisma.$TokenPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      tokenAddress: string
      date: string
      price: number
      priceChange1h: number | null
      priceChange24h: number | null
      volume24h: number
      volumeUSD24h: number
      tvlInPools: number
      marketCap: number | null
      fdv: number | null
      rankByTvl: number | null
      rankByVolume: number | null
      rankByMarketCap: number | null
      swapCount24h: number
      uniqueTraders24h: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tokenDailyStats"]>
    composites: {}
  }

  type TokenDailyStatsGetPayload<S extends boolean | null | undefined | TokenDailyStatsDefaultArgs> = $Result.GetResult<Prisma.$TokenDailyStatsPayload, S>

  type TokenDailyStatsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TokenDailyStatsFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TokenDailyStatsCountAggregateInputType | true
    }

  export interface TokenDailyStatsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TokenDailyStats'], meta: { name: 'TokenDailyStats' } }
    /**
     * Find zero or one TokenDailyStats that matches the filter.
     * @param {TokenDailyStatsFindUniqueArgs} args - Arguments to find a TokenDailyStats
     * @example
     * // Get one TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TokenDailyStatsFindUniqueArgs>(args: SelectSubset<T, TokenDailyStatsFindUniqueArgs<ExtArgs>>): Prisma__TokenDailyStatsClient<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TokenDailyStats that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TokenDailyStatsFindUniqueOrThrowArgs} args - Arguments to find a TokenDailyStats
     * @example
     * // Get one TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TokenDailyStatsFindUniqueOrThrowArgs>(args: SelectSubset<T, TokenDailyStatsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TokenDailyStatsClient<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TokenDailyStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenDailyStatsFindFirstArgs} args - Arguments to find a TokenDailyStats
     * @example
     * // Get one TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TokenDailyStatsFindFirstArgs>(args?: SelectSubset<T, TokenDailyStatsFindFirstArgs<ExtArgs>>): Prisma__TokenDailyStatsClient<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TokenDailyStats that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenDailyStatsFindFirstOrThrowArgs} args - Arguments to find a TokenDailyStats
     * @example
     * // Get one TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TokenDailyStatsFindFirstOrThrowArgs>(args?: SelectSubset<T, TokenDailyStatsFindFirstOrThrowArgs<ExtArgs>>): Prisma__TokenDailyStatsClient<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TokenDailyStats that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenDailyStatsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.findMany()
     * 
     * // Get first 10 TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.findMany({ take: 10 })
     * 
     * // Only select the `tokenAddress`
     * const tokenDailyStatsWithTokenAddressOnly = await prisma.tokenDailyStats.findMany({ select: { tokenAddress: true } })
     * 
     */
    findMany<T extends TokenDailyStatsFindManyArgs>(args?: SelectSubset<T, TokenDailyStatsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TokenDailyStats.
     * @param {TokenDailyStatsCreateArgs} args - Arguments to create a TokenDailyStats.
     * @example
     * // Create one TokenDailyStats
     * const TokenDailyStats = await prisma.tokenDailyStats.create({
     *   data: {
     *     // ... data to create a TokenDailyStats
     *   }
     * })
     * 
     */
    create<T extends TokenDailyStatsCreateArgs>(args: SelectSubset<T, TokenDailyStatsCreateArgs<ExtArgs>>): Prisma__TokenDailyStatsClient<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TokenDailyStats.
     * @param {TokenDailyStatsCreateManyArgs} args - Arguments to create many TokenDailyStats.
     * @example
     * // Create many TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TokenDailyStatsCreateManyArgs>(args?: SelectSubset<T, TokenDailyStatsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TokenDailyStats and returns the data saved in the database.
     * @param {TokenDailyStatsCreateManyAndReturnArgs} args - Arguments to create many TokenDailyStats.
     * @example
     * // Create many TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TokenDailyStats and only return the `tokenAddress`
     * const tokenDailyStatsWithTokenAddressOnly = await prisma.tokenDailyStats.createManyAndReturn({ 
     *   select: { tokenAddress: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TokenDailyStatsCreateManyAndReturnArgs>(args?: SelectSubset<T, TokenDailyStatsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TokenDailyStats.
     * @param {TokenDailyStatsDeleteArgs} args - Arguments to delete one TokenDailyStats.
     * @example
     * // Delete one TokenDailyStats
     * const TokenDailyStats = await prisma.tokenDailyStats.delete({
     *   where: {
     *     // ... filter to delete one TokenDailyStats
     *   }
     * })
     * 
     */
    delete<T extends TokenDailyStatsDeleteArgs>(args: SelectSubset<T, TokenDailyStatsDeleteArgs<ExtArgs>>): Prisma__TokenDailyStatsClient<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TokenDailyStats.
     * @param {TokenDailyStatsUpdateArgs} args - Arguments to update one TokenDailyStats.
     * @example
     * // Update one TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TokenDailyStatsUpdateArgs>(args: SelectSubset<T, TokenDailyStatsUpdateArgs<ExtArgs>>): Prisma__TokenDailyStatsClient<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TokenDailyStats.
     * @param {TokenDailyStatsDeleteManyArgs} args - Arguments to filter TokenDailyStats to delete.
     * @example
     * // Delete a few TokenDailyStats
     * const { count } = await prisma.tokenDailyStats.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TokenDailyStatsDeleteManyArgs>(args?: SelectSubset<T, TokenDailyStatsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TokenDailyStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenDailyStatsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TokenDailyStatsUpdateManyArgs>(args: SelectSubset<T, TokenDailyStatsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TokenDailyStats.
     * @param {TokenDailyStatsUpsertArgs} args - Arguments to update or create a TokenDailyStats.
     * @example
     * // Update or create a TokenDailyStats
     * const tokenDailyStats = await prisma.tokenDailyStats.upsert({
     *   create: {
     *     // ... data to create a TokenDailyStats
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TokenDailyStats we want to update
     *   }
     * })
     */
    upsert<T extends TokenDailyStatsUpsertArgs>(args: SelectSubset<T, TokenDailyStatsUpsertArgs<ExtArgs>>): Prisma__TokenDailyStatsClient<$Result.GetResult<Prisma.$TokenDailyStatsPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TokenDailyStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenDailyStatsCountArgs} args - Arguments to filter TokenDailyStats to count.
     * @example
     * // Count the number of TokenDailyStats
     * const count = await prisma.tokenDailyStats.count({
     *   where: {
     *     // ... the filter for the TokenDailyStats we want to count
     *   }
     * })
    **/
    count<T extends TokenDailyStatsCountArgs>(
      args?: Subset<T, TokenDailyStatsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TokenDailyStatsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TokenDailyStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenDailyStatsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TokenDailyStatsAggregateArgs>(args: Subset<T, TokenDailyStatsAggregateArgs>): Prisma.PrismaPromise<GetTokenDailyStatsAggregateType<T>>

    /**
     * Group by TokenDailyStats.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TokenDailyStatsGroupByArgs} args - Group by arguments.
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
      T extends TokenDailyStatsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TokenDailyStatsGroupByArgs['orderBy'] }
        : { orderBy?: TokenDailyStatsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TokenDailyStatsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTokenDailyStatsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TokenDailyStats model
   */
  readonly fields: TokenDailyStatsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TokenDailyStats.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TokenDailyStatsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
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
   * Fields of the TokenDailyStats model
   */ 
  interface TokenDailyStatsFieldRefs {
    readonly tokenAddress: FieldRef<"TokenDailyStats", 'String'>
    readonly date: FieldRef<"TokenDailyStats", 'String'>
    readonly price: FieldRef<"TokenDailyStats", 'Float'>
    readonly priceChange1h: FieldRef<"TokenDailyStats", 'Float'>
    readonly priceChange24h: FieldRef<"TokenDailyStats", 'Float'>
    readonly volume24h: FieldRef<"TokenDailyStats", 'Float'>
    readonly volumeUSD24h: FieldRef<"TokenDailyStats", 'Float'>
    readonly tvlInPools: FieldRef<"TokenDailyStats", 'Float'>
    readonly marketCap: FieldRef<"TokenDailyStats", 'Float'>
    readonly fdv: FieldRef<"TokenDailyStats", 'Float'>
    readonly rankByTvl: FieldRef<"TokenDailyStats", 'Int'>
    readonly rankByVolume: FieldRef<"TokenDailyStats", 'Int'>
    readonly rankByMarketCap: FieldRef<"TokenDailyStats", 'Int'>
    readonly swapCount24h: FieldRef<"TokenDailyStats", 'Int'>
    readonly uniqueTraders24h: FieldRef<"TokenDailyStats", 'Int'>
    readonly createdAt: FieldRef<"TokenDailyStats", 'DateTime'>
    readonly updatedAt: FieldRef<"TokenDailyStats", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TokenDailyStats findUnique
   */
  export type TokenDailyStatsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    /**
     * Filter, which TokenDailyStats to fetch.
     */
    where: TokenDailyStatsWhereUniqueInput
  }

  /**
   * TokenDailyStats findUniqueOrThrow
   */
  export type TokenDailyStatsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    /**
     * Filter, which TokenDailyStats to fetch.
     */
    where: TokenDailyStatsWhereUniqueInput
  }

  /**
   * TokenDailyStats findFirst
   */
  export type TokenDailyStatsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    /**
     * Filter, which TokenDailyStats to fetch.
     */
    where?: TokenDailyStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenDailyStats to fetch.
     */
    orderBy?: TokenDailyStatsOrderByWithRelationInput | TokenDailyStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TokenDailyStats.
     */
    cursor?: TokenDailyStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenDailyStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenDailyStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TokenDailyStats.
     */
    distinct?: TokenDailyStatsScalarFieldEnum | TokenDailyStatsScalarFieldEnum[]
  }

  /**
   * TokenDailyStats findFirstOrThrow
   */
  export type TokenDailyStatsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    /**
     * Filter, which TokenDailyStats to fetch.
     */
    where?: TokenDailyStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenDailyStats to fetch.
     */
    orderBy?: TokenDailyStatsOrderByWithRelationInput | TokenDailyStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TokenDailyStats.
     */
    cursor?: TokenDailyStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenDailyStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenDailyStats.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TokenDailyStats.
     */
    distinct?: TokenDailyStatsScalarFieldEnum | TokenDailyStatsScalarFieldEnum[]
  }

  /**
   * TokenDailyStats findMany
   */
  export type TokenDailyStatsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    /**
     * Filter, which TokenDailyStats to fetch.
     */
    where?: TokenDailyStatsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TokenDailyStats to fetch.
     */
    orderBy?: TokenDailyStatsOrderByWithRelationInput | TokenDailyStatsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TokenDailyStats.
     */
    cursor?: TokenDailyStatsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TokenDailyStats from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TokenDailyStats.
     */
    skip?: number
    distinct?: TokenDailyStatsScalarFieldEnum | TokenDailyStatsScalarFieldEnum[]
  }

  /**
   * TokenDailyStats create
   */
  export type TokenDailyStatsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    /**
     * The data needed to create a TokenDailyStats.
     */
    data: XOR<TokenDailyStatsCreateInput, TokenDailyStatsUncheckedCreateInput>
  }

  /**
   * TokenDailyStats createMany
   */
  export type TokenDailyStatsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TokenDailyStats.
     */
    data: TokenDailyStatsCreateManyInput | TokenDailyStatsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TokenDailyStats createManyAndReturn
   */
  export type TokenDailyStatsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TokenDailyStats.
     */
    data: TokenDailyStatsCreateManyInput | TokenDailyStatsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TokenDailyStats update
   */
  export type TokenDailyStatsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    /**
     * The data needed to update a TokenDailyStats.
     */
    data: XOR<TokenDailyStatsUpdateInput, TokenDailyStatsUncheckedUpdateInput>
    /**
     * Choose, which TokenDailyStats to update.
     */
    where: TokenDailyStatsWhereUniqueInput
  }

  /**
   * TokenDailyStats updateMany
   */
  export type TokenDailyStatsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TokenDailyStats.
     */
    data: XOR<TokenDailyStatsUpdateManyMutationInput, TokenDailyStatsUncheckedUpdateManyInput>
    /**
     * Filter which TokenDailyStats to update
     */
    where?: TokenDailyStatsWhereInput
    limit?: number
  }

  /**
   * TokenDailyStats upsert
   */
  export type TokenDailyStatsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    /**
     * The filter to search for the TokenDailyStats to update in case it exists.
     */
    where: TokenDailyStatsWhereUniqueInput
    /**
     * In case the TokenDailyStats found by the `where` argument doesn't exist, create a new TokenDailyStats with this data.
     */
    create: XOR<TokenDailyStatsCreateInput, TokenDailyStatsUncheckedCreateInput>
    /**
     * In case the TokenDailyStats was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TokenDailyStatsUpdateInput, TokenDailyStatsUncheckedUpdateInput>
  }

  /**
   * TokenDailyStats delete
   */
  export type TokenDailyStatsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
    /**
     * Filter which TokenDailyStats to delete.
     */
    where: TokenDailyStatsWhereUniqueInput
  }

  /**
   * TokenDailyStats deleteMany
   */
  export type TokenDailyStatsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TokenDailyStats to delete
     */
    where?: TokenDailyStatsWhereInput
    limit?: number
  }

  /**
   * TokenDailyStats without action
   */
  export type TokenDailyStatsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TokenDailyStats
     */
    select?: TokenDailyStatsSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TokenDailyStatsInclude<ExtArgs> | null
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


  export const TokenScalarFieldEnum: {
    address: 'address',
    symbol: 'symbol',
    name: 'name',
    decimals: 'decimals',
    logoUri: 'logoUri',
    website: 'website',
    twitter: 'twitter',
    description: 'description',
    coingeckoId: 'coingeckoId',
    totalSupply: 'totalSupply',
    status: 'status',
    discoveredAt: 'discoveredAt',
    lastEnrichmentAt: 'lastEnrichmentAt',
    lastActivityAt: 'lastActivityAt',
    isStableCoin: 'isStableCoin',
    isVerifiedManually: 'isVerifiedManually',
    metadata: 'metadata',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TokenScalarFieldEnum = (typeof TokenScalarFieldEnum)[keyof typeof TokenScalarFieldEnum]


  export const TokenPriceScalarFieldEnum: {
    tokenAddress: 'tokenAddress',
    timestamp: 'timestamp',
    price: 'price',
    priceSource: 'priceSource',
    confidence: 'confidence',
    volumeUSD: 'volumeUSD',
    liquidityPath: 'liquidityPath',
    poolsInvolved: 'poolsInvolved',
    createdAt: 'createdAt'
  };

  export type TokenPriceScalarFieldEnum = (typeof TokenPriceScalarFieldEnum)[keyof typeof TokenPriceScalarFieldEnum]


  export const TokenDailyStatsScalarFieldEnum: {
    tokenAddress: 'tokenAddress',
    date: 'date',
    price: 'price',
    priceChange1h: 'priceChange1h',
    priceChange24h: 'priceChange24h',
    volume24h: 'volume24h',
    volumeUSD24h: 'volumeUSD24h',
    tvlInPools: 'tvlInPools',
    marketCap: 'marketCap',
    fdv: 'fdv',
    rankByTvl: 'rankByTvl',
    rankByVolume: 'rankByVolume',
    rankByMarketCap: 'rankByMarketCap',
    swapCount24h: 'swapCount24h',
    uniqueTraders24h: 'uniqueTraders24h',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TokenDailyStatsScalarFieldEnum = (typeof TokenDailyStatsScalarFieldEnum)[keyof typeof TokenDailyStatsScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


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
   * Reference to a field of type 'BigInt'
   */
  export type BigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt'>
    


  /**
   * Reference to a field of type 'BigInt[]'
   */
  export type ListBigIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BigInt[]'>
    


  /**
   * Reference to a field of type 'TokenState'
   */
  export type EnumTokenStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TokenState'>
    


  /**
   * Reference to a field of type 'TokenState[]'
   */
  export type ListEnumTokenStateFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TokenState[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'PriceSource'
   */
  export type EnumPriceSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PriceSource'>
    


  /**
   * Reference to a field of type 'PriceSource[]'
   */
  export type ListEnumPriceSourceFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'PriceSource[]'>
    
  /**
   * Deep Input Types
   */


  export type TokenWhereInput = {
    AND?: TokenWhereInput | TokenWhereInput[]
    OR?: TokenWhereInput[]
    NOT?: TokenWhereInput | TokenWhereInput[]
    address?: StringFilter<"Token"> | string
    symbol?: StringFilter<"Token"> | string
    name?: StringFilter<"Token"> | string
    decimals?: IntFilter<"Token"> | number
    logoUri?: StringNullableFilter<"Token"> | string | null
    website?: StringNullableFilter<"Token"> | string | null
    twitter?: StringNullableFilter<"Token"> | string | null
    description?: StringNullableFilter<"Token"> | string | null
    coingeckoId?: StringNullableFilter<"Token"> | string | null
    totalSupply?: BigIntFilter<"Token"> | bigint | number
    status?: EnumTokenStateFilter<"Token"> | $Enums.TokenState
    discoveredAt?: DateTimeFilter<"Token"> | Date | string
    lastEnrichmentAt?: DateTimeNullableFilter<"Token"> | Date | string | null
    lastActivityAt?: DateTimeNullableFilter<"Token"> | Date | string | null
    isStableCoin?: BoolFilter<"Token"> | boolean
    isVerifiedManually?: BoolFilter<"Token"> | boolean
    metadata?: JsonNullableFilter<"Token">
    createdAt?: DateTimeFilter<"Token"> | Date | string
    updatedAt?: DateTimeFilter<"Token"> | Date | string
    TokenPrice?: TokenPriceListRelationFilter
    TokenDailyStats?: TokenDailyStatsListRelationFilter
  }

  export type TokenOrderByWithRelationInput = {
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    twitter?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    coingeckoId?: SortOrderInput | SortOrder
    totalSupply?: SortOrder
    status?: SortOrder
    discoveredAt?: SortOrder
    lastEnrichmentAt?: SortOrderInput | SortOrder
    lastActivityAt?: SortOrderInput | SortOrder
    isStableCoin?: SortOrder
    isVerifiedManually?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    TokenPrice?: TokenPriceOrderByRelationAggregateInput
    TokenDailyStats?: TokenDailyStatsOrderByRelationAggregateInput
  }

  export type TokenWhereUniqueInput = Prisma.AtLeast<{
    address?: string
    AND?: TokenWhereInput | TokenWhereInput[]
    OR?: TokenWhereInput[]
    NOT?: TokenWhereInput | TokenWhereInput[]
    symbol?: StringFilter<"Token"> | string
    name?: StringFilter<"Token"> | string
    decimals?: IntFilter<"Token"> | number
    logoUri?: StringNullableFilter<"Token"> | string | null
    website?: StringNullableFilter<"Token"> | string | null
    twitter?: StringNullableFilter<"Token"> | string | null
    description?: StringNullableFilter<"Token"> | string | null
    coingeckoId?: StringNullableFilter<"Token"> | string | null
    totalSupply?: BigIntFilter<"Token"> | bigint | number
    status?: EnumTokenStateFilter<"Token"> | $Enums.TokenState
    discoveredAt?: DateTimeFilter<"Token"> | Date | string
    lastEnrichmentAt?: DateTimeNullableFilter<"Token"> | Date | string | null
    lastActivityAt?: DateTimeNullableFilter<"Token"> | Date | string | null
    isStableCoin?: BoolFilter<"Token"> | boolean
    isVerifiedManually?: BoolFilter<"Token"> | boolean
    metadata?: JsonNullableFilter<"Token">
    createdAt?: DateTimeFilter<"Token"> | Date | string
    updatedAt?: DateTimeFilter<"Token"> | Date | string
    TokenPrice?: TokenPriceListRelationFilter
    TokenDailyStats?: TokenDailyStatsListRelationFilter
  }, "address">

  export type TokenOrderByWithAggregationInput = {
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrderInput | SortOrder
    website?: SortOrderInput | SortOrder
    twitter?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    coingeckoId?: SortOrderInput | SortOrder
    totalSupply?: SortOrder
    status?: SortOrder
    discoveredAt?: SortOrder
    lastEnrichmentAt?: SortOrderInput | SortOrder
    lastActivityAt?: SortOrderInput | SortOrder
    isStableCoin?: SortOrder
    isVerifiedManually?: SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
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
    address?: StringWithAggregatesFilter<"Token"> | string
    symbol?: StringWithAggregatesFilter<"Token"> | string
    name?: StringWithAggregatesFilter<"Token"> | string
    decimals?: IntWithAggregatesFilter<"Token"> | number
    logoUri?: StringNullableWithAggregatesFilter<"Token"> | string | null
    website?: StringNullableWithAggregatesFilter<"Token"> | string | null
    twitter?: StringNullableWithAggregatesFilter<"Token"> | string | null
    description?: StringNullableWithAggregatesFilter<"Token"> | string | null
    coingeckoId?: StringNullableWithAggregatesFilter<"Token"> | string | null
    totalSupply?: BigIntWithAggregatesFilter<"Token"> | bigint | number
    status?: EnumTokenStateWithAggregatesFilter<"Token"> | $Enums.TokenState
    discoveredAt?: DateTimeWithAggregatesFilter<"Token"> | Date | string
    lastEnrichmentAt?: DateTimeNullableWithAggregatesFilter<"Token"> | Date | string | null
    lastActivityAt?: DateTimeNullableWithAggregatesFilter<"Token"> | Date | string | null
    isStableCoin?: BoolWithAggregatesFilter<"Token"> | boolean
    isVerifiedManually?: BoolWithAggregatesFilter<"Token"> | boolean
    metadata?: JsonNullableWithAggregatesFilter<"Token">
    createdAt?: DateTimeWithAggregatesFilter<"Token"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Token"> | Date | string
  }

  export type TokenPriceWhereInput = {
    AND?: TokenPriceWhereInput | TokenPriceWhereInput[]
    OR?: TokenPriceWhereInput[]
    NOT?: TokenPriceWhereInput | TokenPriceWhereInput[]
    tokenAddress?: StringFilter<"TokenPrice"> | string
    timestamp?: DateTimeFilter<"TokenPrice"> | Date | string
    price?: FloatFilter<"TokenPrice"> | number
    priceSource?: EnumPriceSourceFilter<"TokenPrice"> | $Enums.PriceSource
    confidence?: FloatFilter<"TokenPrice"> | number
    volumeUSD?: FloatFilter<"TokenPrice"> | number
    liquidityPath?: JsonNullableFilter<"TokenPrice">
    poolsInvolved?: StringNullableListFilter<"TokenPrice">
    createdAt?: DateTimeFilter<"TokenPrice"> | Date | string
    token?: XOR<TokenScalarRelationFilter, TokenWhereInput>
  }

  export type TokenPriceOrderByWithRelationInput = {
    tokenAddress?: SortOrder
    timestamp?: SortOrder
    price?: SortOrder
    priceSource?: SortOrder
    confidence?: SortOrder
    volumeUSD?: SortOrder
    liquidityPath?: SortOrderInput | SortOrder
    poolsInvolved?: SortOrder
    createdAt?: SortOrder
    token?: TokenOrderByWithRelationInput
  }

  export type TokenPriceWhereUniqueInput = Prisma.AtLeast<{
    tokenAddress_timestamp?: TokenPriceTokenAddressTimestampCompoundUniqueInput
    AND?: TokenPriceWhereInput | TokenPriceWhereInput[]
    OR?: TokenPriceWhereInput[]
    NOT?: TokenPriceWhereInput | TokenPriceWhereInput[]
    tokenAddress?: StringFilter<"TokenPrice"> | string
    timestamp?: DateTimeFilter<"TokenPrice"> | Date | string
    price?: FloatFilter<"TokenPrice"> | number
    priceSource?: EnumPriceSourceFilter<"TokenPrice"> | $Enums.PriceSource
    confidence?: FloatFilter<"TokenPrice"> | number
    volumeUSD?: FloatFilter<"TokenPrice"> | number
    liquidityPath?: JsonNullableFilter<"TokenPrice">
    poolsInvolved?: StringNullableListFilter<"TokenPrice">
    createdAt?: DateTimeFilter<"TokenPrice"> | Date | string
    token?: XOR<TokenScalarRelationFilter, TokenWhereInput>
  }, "tokenAddress_timestamp">

  export type TokenPriceOrderByWithAggregationInput = {
    tokenAddress?: SortOrder
    timestamp?: SortOrder
    price?: SortOrder
    priceSource?: SortOrder
    confidence?: SortOrder
    volumeUSD?: SortOrder
    liquidityPath?: SortOrderInput | SortOrder
    poolsInvolved?: SortOrder
    createdAt?: SortOrder
    _count?: TokenPriceCountOrderByAggregateInput
    _avg?: TokenPriceAvgOrderByAggregateInput
    _max?: TokenPriceMaxOrderByAggregateInput
    _min?: TokenPriceMinOrderByAggregateInput
    _sum?: TokenPriceSumOrderByAggregateInput
  }

  export type TokenPriceScalarWhereWithAggregatesInput = {
    AND?: TokenPriceScalarWhereWithAggregatesInput | TokenPriceScalarWhereWithAggregatesInput[]
    OR?: TokenPriceScalarWhereWithAggregatesInput[]
    NOT?: TokenPriceScalarWhereWithAggregatesInput | TokenPriceScalarWhereWithAggregatesInput[]
    tokenAddress?: StringWithAggregatesFilter<"TokenPrice"> | string
    timestamp?: DateTimeWithAggregatesFilter<"TokenPrice"> | Date | string
    price?: FloatWithAggregatesFilter<"TokenPrice"> | number
    priceSource?: EnumPriceSourceWithAggregatesFilter<"TokenPrice"> | $Enums.PriceSource
    confidence?: FloatWithAggregatesFilter<"TokenPrice"> | number
    volumeUSD?: FloatWithAggregatesFilter<"TokenPrice"> | number
    liquidityPath?: JsonNullableWithAggregatesFilter<"TokenPrice">
    poolsInvolved?: StringNullableListFilter<"TokenPrice">
    createdAt?: DateTimeWithAggregatesFilter<"TokenPrice"> | Date | string
  }

  export type TokenDailyStatsWhereInput = {
    AND?: TokenDailyStatsWhereInput | TokenDailyStatsWhereInput[]
    OR?: TokenDailyStatsWhereInput[]
    NOT?: TokenDailyStatsWhereInput | TokenDailyStatsWhereInput[]
    tokenAddress?: StringFilter<"TokenDailyStats"> | string
    date?: StringFilter<"TokenDailyStats"> | string
    price?: FloatFilter<"TokenDailyStats"> | number
    priceChange1h?: FloatNullableFilter<"TokenDailyStats"> | number | null
    priceChange24h?: FloatNullableFilter<"TokenDailyStats"> | number | null
    volume24h?: FloatFilter<"TokenDailyStats"> | number
    volumeUSD24h?: FloatFilter<"TokenDailyStats"> | number
    tvlInPools?: FloatFilter<"TokenDailyStats"> | number
    marketCap?: FloatNullableFilter<"TokenDailyStats"> | number | null
    fdv?: FloatNullableFilter<"TokenDailyStats"> | number | null
    rankByTvl?: IntNullableFilter<"TokenDailyStats"> | number | null
    rankByVolume?: IntNullableFilter<"TokenDailyStats"> | number | null
    rankByMarketCap?: IntNullableFilter<"TokenDailyStats"> | number | null
    swapCount24h?: IntFilter<"TokenDailyStats"> | number
    uniqueTraders24h?: IntFilter<"TokenDailyStats"> | number
    createdAt?: DateTimeFilter<"TokenDailyStats"> | Date | string
    updatedAt?: DateTimeFilter<"TokenDailyStats"> | Date | string
    token?: XOR<TokenScalarRelationFilter, TokenWhereInput>
  }

  export type TokenDailyStatsOrderByWithRelationInput = {
    tokenAddress?: SortOrder
    date?: SortOrder
    price?: SortOrder
    priceChange1h?: SortOrderInput | SortOrder
    priceChange24h?: SortOrderInput | SortOrder
    volume24h?: SortOrder
    volumeUSD24h?: SortOrder
    tvlInPools?: SortOrder
    marketCap?: SortOrderInput | SortOrder
    fdv?: SortOrderInput | SortOrder
    rankByTvl?: SortOrderInput | SortOrder
    rankByVolume?: SortOrderInput | SortOrder
    rankByMarketCap?: SortOrderInput | SortOrder
    swapCount24h?: SortOrder
    uniqueTraders24h?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    token?: TokenOrderByWithRelationInput
  }

  export type TokenDailyStatsWhereUniqueInput = Prisma.AtLeast<{
    tokenAddress_date?: TokenDailyStatsTokenAddressDateCompoundUniqueInput
    AND?: TokenDailyStatsWhereInput | TokenDailyStatsWhereInput[]
    OR?: TokenDailyStatsWhereInput[]
    NOT?: TokenDailyStatsWhereInput | TokenDailyStatsWhereInput[]
    tokenAddress?: StringFilter<"TokenDailyStats"> | string
    date?: StringFilter<"TokenDailyStats"> | string
    price?: FloatFilter<"TokenDailyStats"> | number
    priceChange1h?: FloatNullableFilter<"TokenDailyStats"> | number | null
    priceChange24h?: FloatNullableFilter<"TokenDailyStats"> | number | null
    volume24h?: FloatFilter<"TokenDailyStats"> | number
    volumeUSD24h?: FloatFilter<"TokenDailyStats"> | number
    tvlInPools?: FloatFilter<"TokenDailyStats"> | number
    marketCap?: FloatNullableFilter<"TokenDailyStats"> | number | null
    fdv?: FloatNullableFilter<"TokenDailyStats"> | number | null
    rankByTvl?: IntNullableFilter<"TokenDailyStats"> | number | null
    rankByVolume?: IntNullableFilter<"TokenDailyStats"> | number | null
    rankByMarketCap?: IntNullableFilter<"TokenDailyStats"> | number | null
    swapCount24h?: IntFilter<"TokenDailyStats"> | number
    uniqueTraders24h?: IntFilter<"TokenDailyStats"> | number
    createdAt?: DateTimeFilter<"TokenDailyStats"> | Date | string
    updatedAt?: DateTimeFilter<"TokenDailyStats"> | Date | string
    token?: XOR<TokenScalarRelationFilter, TokenWhereInput>
  }, "tokenAddress_date">

  export type TokenDailyStatsOrderByWithAggregationInput = {
    tokenAddress?: SortOrder
    date?: SortOrder
    price?: SortOrder
    priceChange1h?: SortOrderInput | SortOrder
    priceChange24h?: SortOrderInput | SortOrder
    volume24h?: SortOrder
    volumeUSD24h?: SortOrder
    tvlInPools?: SortOrder
    marketCap?: SortOrderInput | SortOrder
    fdv?: SortOrderInput | SortOrder
    rankByTvl?: SortOrderInput | SortOrder
    rankByVolume?: SortOrderInput | SortOrder
    rankByMarketCap?: SortOrderInput | SortOrder
    swapCount24h?: SortOrder
    uniqueTraders24h?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TokenDailyStatsCountOrderByAggregateInput
    _avg?: TokenDailyStatsAvgOrderByAggregateInput
    _max?: TokenDailyStatsMaxOrderByAggregateInput
    _min?: TokenDailyStatsMinOrderByAggregateInput
    _sum?: TokenDailyStatsSumOrderByAggregateInput
  }

  export type TokenDailyStatsScalarWhereWithAggregatesInput = {
    AND?: TokenDailyStatsScalarWhereWithAggregatesInput | TokenDailyStatsScalarWhereWithAggregatesInput[]
    OR?: TokenDailyStatsScalarWhereWithAggregatesInput[]
    NOT?: TokenDailyStatsScalarWhereWithAggregatesInput | TokenDailyStatsScalarWhereWithAggregatesInput[]
    tokenAddress?: StringWithAggregatesFilter<"TokenDailyStats"> | string
    date?: StringWithAggregatesFilter<"TokenDailyStats"> | string
    price?: FloatWithAggregatesFilter<"TokenDailyStats"> | number
    priceChange1h?: FloatNullableWithAggregatesFilter<"TokenDailyStats"> | number | null
    priceChange24h?: FloatNullableWithAggregatesFilter<"TokenDailyStats"> | number | null
    volume24h?: FloatWithAggregatesFilter<"TokenDailyStats"> | number
    volumeUSD24h?: FloatWithAggregatesFilter<"TokenDailyStats"> | number
    tvlInPools?: FloatWithAggregatesFilter<"TokenDailyStats"> | number
    marketCap?: FloatNullableWithAggregatesFilter<"TokenDailyStats"> | number | null
    fdv?: FloatNullableWithAggregatesFilter<"TokenDailyStats"> | number | null
    rankByTvl?: IntNullableWithAggregatesFilter<"TokenDailyStats"> | number | null
    rankByVolume?: IntNullableWithAggregatesFilter<"TokenDailyStats"> | number | null
    rankByMarketCap?: IntNullableWithAggregatesFilter<"TokenDailyStats"> | number | null
    swapCount24h?: IntWithAggregatesFilter<"TokenDailyStats"> | number
    uniqueTraders24h?: IntWithAggregatesFilter<"TokenDailyStats"> | number
    createdAt?: DateTimeWithAggregatesFilter<"TokenDailyStats"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"TokenDailyStats"> | Date | string
  }

  export type TokenCreateInput = {
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    website?: string | null
    twitter?: string | null
    description?: string | null
    coingeckoId?: string | null
    totalSupply: bigint | number
    status?: $Enums.TokenState
    discoveredAt?: Date | string
    lastEnrichmentAt?: Date | string | null
    lastActivityAt?: Date | string | null
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    TokenPrice?: TokenPriceCreateNestedManyWithoutTokenInput
    TokenDailyStats?: TokenDailyStatsCreateNestedManyWithoutTokenInput
  }

  export type TokenUncheckedCreateInput = {
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    website?: string | null
    twitter?: string | null
    description?: string | null
    coingeckoId?: string | null
    totalSupply: bigint | number
    status?: $Enums.TokenState
    discoveredAt?: Date | string
    lastEnrichmentAt?: Date | string | null
    lastActivityAt?: Date | string | null
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    TokenPrice?: TokenPriceUncheckedCreateNestedManyWithoutTokenInput
    TokenDailyStats?: TokenDailyStatsUncheckedCreateNestedManyWithoutTokenInput
  }

  export type TokenUpdateInput = {
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    twitter?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    totalSupply?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTokenStateFieldUpdateOperationsInput | $Enums.TokenState
    discoveredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEnrichmentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActivityAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isStableCoin?: BoolFieldUpdateOperationsInput | boolean
    isVerifiedManually?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    TokenPrice?: TokenPriceUpdateManyWithoutTokenNestedInput
    TokenDailyStats?: TokenDailyStatsUpdateManyWithoutTokenNestedInput
  }

  export type TokenUncheckedUpdateInput = {
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    twitter?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    totalSupply?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTokenStateFieldUpdateOperationsInput | $Enums.TokenState
    discoveredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEnrichmentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActivityAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isStableCoin?: BoolFieldUpdateOperationsInput | boolean
    isVerifiedManually?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    TokenPrice?: TokenPriceUncheckedUpdateManyWithoutTokenNestedInput
    TokenDailyStats?: TokenDailyStatsUncheckedUpdateManyWithoutTokenNestedInput
  }

  export type TokenCreateManyInput = {
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    website?: string | null
    twitter?: string | null
    description?: string | null
    coingeckoId?: string | null
    totalSupply: bigint | number
    status?: $Enums.TokenState
    discoveredAt?: Date | string
    lastEnrichmentAt?: Date | string | null
    lastActivityAt?: Date | string | null
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TokenUpdateManyMutationInput = {
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    twitter?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    totalSupply?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTokenStateFieldUpdateOperationsInput | $Enums.TokenState
    discoveredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEnrichmentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActivityAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isStableCoin?: BoolFieldUpdateOperationsInput | boolean
    isVerifiedManually?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenUncheckedUpdateManyInput = {
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    twitter?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    totalSupply?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTokenStateFieldUpdateOperationsInput | $Enums.TokenState
    discoveredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEnrichmentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActivityAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isStableCoin?: BoolFieldUpdateOperationsInput | boolean
    isVerifiedManually?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenPriceCreateInput = {
    timestamp: Date | string
    price: number
    priceSource?: $Enums.PriceSource
    confidence?: number
    volumeUSD?: number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceCreatepoolsInvolvedInput | string[]
    createdAt?: Date | string
    token: TokenCreateNestedOneWithoutTokenPriceInput
  }

  export type TokenPriceUncheckedCreateInput = {
    tokenAddress: string
    timestamp: Date | string
    price: number
    priceSource?: $Enums.PriceSource
    confidence?: number
    volumeUSD?: number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceCreatepoolsInvolvedInput | string[]
    createdAt?: Date | string
  }

  export type TokenPriceUpdateInput = {
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    price?: FloatFieldUpdateOperationsInput | number
    priceSource?: EnumPriceSourceFieldUpdateOperationsInput | $Enums.PriceSource
    confidence?: FloatFieldUpdateOperationsInput | number
    volumeUSD?: FloatFieldUpdateOperationsInput | number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceUpdatepoolsInvolvedInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: TokenUpdateOneRequiredWithoutTokenPriceNestedInput
  }

  export type TokenPriceUncheckedUpdateInput = {
    tokenAddress?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    price?: FloatFieldUpdateOperationsInput | number
    priceSource?: EnumPriceSourceFieldUpdateOperationsInput | $Enums.PriceSource
    confidence?: FloatFieldUpdateOperationsInput | number
    volumeUSD?: FloatFieldUpdateOperationsInput | number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceUpdatepoolsInvolvedInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenPriceCreateManyInput = {
    tokenAddress: string
    timestamp: Date | string
    price: number
    priceSource?: $Enums.PriceSource
    confidence?: number
    volumeUSD?: number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceCreatepoolsInvolvedInput | string[]
    createdAt?: Date | string
  }

  export type TokenPriceUpdateManyMutationInput = {
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    price?: FloatFieldUpdateOperationsInput | number
    priceSource?: EnumPriceSourceFieldUpdateOperationsInput | $Enums.PriceSource
    confidence?: FloatFieldUpdateOperationsInput | number
    volumeUSD?: FloatFieldUpdateOperationsInput | number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceUpdatepoolsInvolvedInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenPriceUncheckedUpdateManyInput = {
    tokenAddress?: StringFieldUpdateOperationsInput | string
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    price?: FloatFieldUpdateOperationsInput | number
    priceSource?: EnumPriceSourceFieldUpdateOperationsInput | $Enums.PriceSource
    confidence?: FloatFieldUpdateOperationsInput | number
    volumeUSD?: FloatFieldUpdateOperationsInput | number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceUpdatepoolsInvolvedInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenDailyStatsCreateInput = {
    date: string
    price: number
    priceChange1h?: number | null
    priceChange24h?: number | null
    volume24h?: number
    volumeUSD24h?: number
    tvlInPools?: number
    marketCap?: number | null
    fdv?: number | null
    rankByTvl?: number | null
    rankByVolume?: number | null
    rankByMarketCap?: number | null
    swapCount24h?: number
    uniqueTraders24h?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    token: TokenCreateNestedOneWithoutTokenDailyStatsInput
  }

  export type TokenDailyStatsUncheckedCreateInput = {
    tokenAddress: string
    date: string
    price: number
    priceChange1h?: number | null
    priceChange24h?: number | null
    volume24h?: number
    volumeUSD24h?: number
    tvlInPools?: number
    marketCap?: number | null
    fdv?: number | null
    rankByTvl?: number | null
    rankByVolume?: number | null
    rankByMarketCap?: number | null
    swapCount24h?: number
    uniqueTraders24h?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TokenDailyStatsUpdateInput = {
    date?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    priceChange1h?: NullableFloatFieldUpdateOperationsInput | number | null
    priceChange24h?: NullableFloatFieldUpdateOperationsInput | number | null
    volume24h?: FloatFieldUpdateOperationsInput | number
    volumeUSD24h?: FloatFieldUpdateOperationsInput | number
    tvlInPools?: FloatFieldUpdateOperationsInput | number
    marketCap?: NullableFloatFieldUpdateOperationsInput | number | null
    fdv?: NullableFloatFieldUpdateOperationsInput | number | null
    rankByTvl?: NullableIntFieldUpdateOperationsInput | number | null
    rankByVolume?: NullableIntFieldUpdateOperationsInput | number | null
    rankByMarketCap?: NullableIntFieldUpdateOperationsInput | number | null
    swapCount24h?: IntFieldUpdateOperationsInput | number
    uniqueTraders24h?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    token?: TokenUpdateOneRequiredWithoutTokenDailyStatsNestedInput
  }

  export type TokenDailyStatsUncheckedUpdateInput = {
    tokenAddress?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    priceChange1h?: NullableFloatFieldUpdateOperationsInput | number | null
    priceChange24h?: NullableFloatFieldUpdateOperationsInput | number | null
    volume24h?: FloatFieldUpdateOperationsInput | number
    volumeUSD24h?: FloatFieldUpdateOperationsInput | number
    tvlInPools?: FloatFieldUpdateOperationsInput | number
    marketCap?: NullableFloatFieldUpdateOperationsInput | number | null
    fdv?: NullableFloatFieldUpdateOperationsInput | number | null
    rankByTvl?: NullableIntFieldUpdateOperationsInput | number | null
    rankByVolume?: NullableIntFieldUpdateOperationsInput | number | null
    rankByMarketCap?: NullableIntFieldUpdateOperationsInput | number | null
    swapCount24h?: IntFieldUpdateOperationsInput | number
    uniqueTraders24h?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenDailyStatsCreateManyInput = {
    tokenAddress: string
    date: string
    price: number
    priceChange1h?: number | null
    priceChange24h?: number | null
    volume24h?: number
    volumeUSD24h?: number
    tvlInPools?: number
    marketCap?: number | null
    fdv?: number | null
    rankByTvl?: number | null
    rankByVolume?: number | null
    rankByMarketCap?: number | null
    swapCount24h?: number
    uniqueTraders24h?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TokenDailyStatsUpdateManyMutationInput = {
    date?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    priceChange1h?: NullableFloatFieldUpdateOperationsInput | number | null
    priceChange24h?: NullableFloatFieldUpdateOperationsInput | number | null
    volume24h?: FloatFieldUpdateOperationsInput | number
    volumeUSD24h?: FloatFieldUpdateOperationsInput | number
    tvlInPools?: FloatFieldUpdateOperationsInput | number
    marketCap?: NullableFloatFieldUpdateOperationsInput | number | null
    fdv?: NullableFloatFieldUpdateOperationsInput | number | null
    rankByTvl?: NullableIntFieldUpdateOperationsInput | number | null
    rankByVolume?: NullableIntFieldUpdateOperationsInput | number | null
    rankByMarketCap?: NullableIntFieldUpdateOperationsInput | number | null
    swapCount24h?: IntFieldUpdateOperationsInput | number
    uniqueTraders24h?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenDailyStatsUncheckedUpdateManyInput = {
    tokenAddress?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    priceChange1h?: NullableFloatFieldUpdateOperationsInput | number | null
    priceChange24h?: NullableFloatFieldUpdateOperationsInput | number | null
    volume24h?: FloatFieldUpdateOperationsInput | number
    volumeUSD24h?: FloatFieldUpdateOperationsInput | number
    tvlInPools?: FloatFieldUpdateOperationsInput | number
    marketCap?: NullableFloatFieldUpdateOperationsInput | number | null
    fdv?: NullableFloatFieldUpdateOperationsInput | number | null
    rankByTvl?: NullableIntFieldUpdateOperationsInput | number | null
    rankByVolume?: NullableIntFieldUpdateOperationsInput | number | null
    rankByMarketCap?: NullableIntFieldUpdateOperationsInput | number | null
    swapCount24h?: IntFieldUpdateOperationsInput | number
    uniqueTraders24h?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type EnumTokenStateFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenState | EnumTokenStateFieldRefInput<$PrismaModel>
    in?: $Enums.TokenState[] | ListEnumTokenStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenState[] | ListEnumTokenStateFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenStateFilter<$PrismaModel> | $Enums.TokenState
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

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }
  export type JsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type TokenPriceListRelationFilter = {
    every?: TokenPriceWhereInput
    some?: TokenPriceWhereInput
    none?: TokenPriceWhereInput
  }

  export type TokenDailyStatsListRelationFilter = {
    every?: TokenDailyStatsWhereInput
    some?: TokenDailyStatsWhereInput
    none?: TokenDailyStatsWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type TokenPriceOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TokenDailyStatsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TokenCountOrderByAggregateInput = {
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrder
    website?: SortOrder
    twitter?: SortOrder
    description?: SortOrder
    coingeckoId?: SortOrder
    totalSupply?: SortOrder
    status?: SortOrder
    discoveredAt?: SortOrder
    lastEnrichmentAt?: SortOrder
    lastActivityAt?: SortOrder
    isStableCoin?: SortOrder
    isVerifiedManually?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TokenAvgOrderByAggregateInput = {
    decimals?: SortOrder
    totalSupply?: SortOrder
  }

  export type TokenMaxOrderByAggregateInput = {
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrder
    website?: SortOrder
    twitter?: SortOrder
    description?: SortOrder
    coingeckoId?: SortOrder
    totalSupply?: SortOrder
    status?: SortOrder
    discoveredAt?: SortOrder
    lastEnrichmentAt?: SortOrder
    lastActivityAt?: SortOrder
    isStableCoin?: SortOrder
    isVerifiedManually?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TokenMinOrderByAggregateInput = {
    address?: SortOrder
    symbol?: SortOrder
    name?: SortOrder
    decimals?: SortOrder
    logoUri?: SortOrder
    website?: SortOrder
    twitter?: SortOrder
    description?: SortOrder
    coingeckoId?: SortOrder
    totalSupply?: SortOrder
    status?: SortOrder
    discoveredAt?: SortOrder
    lastEnrichmentAt?: SortOrder
    lastActivityAt?: SortOrder
    isStableCoin?: SortOrder
    isVerifiedManually?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TokenSumOrderByAggregateInput = {
    decimals?: SortOrder
    totalSupply?: SortOrder
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

  export type EnumTokenStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenState | EnumTokenStateFieldRefInput<$PrismaModel>
    in?: $Enums.TokenState[] | ListEnumTokenStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenState[] | ListEnumTokenStateFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenStateWithAggregatesFilter<$PrismaModel> | $Enums.TokenState
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTokenStateFilter<$PrismaModel>
    _max?: NestedEnumTokenStateFilter<$PrismaModel>
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

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
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

  export type EnumPriceSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.PriceSource | EnumPriceSourceFieldRefInput<$PrismaModel>
    in?: $Enums.PriceSource[] | ListEnumPriceSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriceSource[] | ListEnumPriceSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumPriceSourceFilter<$PrismaModel> | $Enums.PriceSource
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type TokenScalarRelationFilter = {
    is?: TokenWhereInput
    isNot?: TokenWhereInput
  }

  export type TokenPriceTokenAddressTimestampCompoundUniqueInput = {
    tokenAddress: string
    timestamp: Date | string
  }

  export type TokenPriceCountOrderByAggregateInput = {
    tokenAddress?: SortOrder
    timestamp?: SortOrder
    price?: SortOrder
    priceSource?: SortOrder
    confidence?: SortOrder
    volumeUSD?: SortOrder
    liquidityPath?: SortOrder
    poolsInvolved?: SortOrder
    createdAt?: SortOrder
  }

  export type TokenPriceAvgOrderByAggregateInput = {
    price?: SortOrder
    confidence?: SortOrder
    volumeUSD?: SortOrder
  }

  export type TokenPriceMaxOrderByAggregateInput = {
    tokenAddress?: SortOrder
    timestamp?: SortOrder
    price?: SortOrder
    priceSource?: SortOrder
    confidence?: SortOrder
    volumeUSD?: SortOrder
    createdAt?: SortOrder
  }

  export type TokenPriceMinOrderByAggregateInput = {
    tokenAddress?: SortOrder
    timestamp?: SortOrder
    price?: SortOrder
    priceSource?: SortOrder
    confidence?: SortOrder
    volumeUSD?: SortOrder
    createdAt?: SortOrder
  }

  export type TokenPriceSumOrderByAggregateInput = {
    price?: SortOrder
    confidence?: SortOrder
    volumeUSD?: SortOrder
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

  export type EnumPriceSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PriceSource | EnumPriceSourceFieldRefInput<$PrismaModel>
    in?: $Enums.PriceSource[] | ListEnumPriceSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriceSource[] | ListEnumPriceSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumPriceSourceWithAggregatesFilter<$PrismaModel> | $Enums.PriceSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPriceSourceFilter<$PrismaModel>
    _max?: NestedEnumPriceSourceFilter<$PrismaModel>
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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

  export type TokenDailyStatsTokenAddressDateCompoundUniqueInput = {
    tokenAddress: string
    date: string
  }

  export type TokenDailyStatsCountOrderByAggregateInput = {
    tokenAddress?: SortOrder
    date?: SortOrder
    price?: SortOrder
    priceChange1h?: SortOrder
    priceChange24h?: SortOrder
    volume24h?: SortOrder
    volumeUSD24h?: SortOrder
    tvlInPools?: SortOrder
    marketCap?: SortOrder
    fdv?: SortOrder
    rankByTvl?: SortOrder
    rankByVolume?: SortOrder
    rankByMarketCap?: SortOrder
    swapCount24h?: SortOrder
    uniqueTraders24h?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TokenDailyStatsAvgOrderByAggregateInput = {
    price?: SortOrder
    priceChange1h?: SortOrder
    priceChange24h?: SortOrder
    volume24h?: SortOrder
    volumeUSD24h?: SortOrder
    tvlInPools?: SortOrder
    marketCap?: SortOrder
    fdv?: SortOrder
    rankByTvl?: SortOrder
    rankByVolume?: SortOrder
    rankByMarketCap?: SortOrder
    swapCount24h?: SortOrder
    uniqueTraders24h?: SortOrder
  }

  export type TokenDailyStatsMaxOrderByAggregateInput = {
    tokenAddress?: SortOrder
    date?: SortOrder
    price?: SortOrder
    priceChange1h?: SortOrder
    priceChange24h?: SortOrder
    volume24h?: SortOrder
    volumeUSD24h?: SortOrder
    tvlInPools?: SortOrder
    marketCap?: SortOrder
    fdv?: SortOrder
    rankByTvl?: SortOrder
    rankByVolume?: SortOrder
    rankByMarketCap?: SortOrder
    swapCount24h?: SortOrder
    uniqueTraders24h?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TokenDailyStatsMinOrderByAggregateInput = {
    tokenAddress?: SortOrder
    date?: SortOrder
    price?: SortOrder
    priceChange1h?: SortOrder
    priceChange24h?: SortOrder
    volume24h?: SortOrder
    volumeUSD24h?: SortOrder
    tvlInPools?: SortOrder
    marketCap?: SortOrder
    fdv?: SortOrder
    rankByTvl?: SortOrder
    rankByVolume?: SortOrder
    rankByMarketCap?: SortOrder
    swapCount24h?: SortOrder
    uniqueTraders24h?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TokenDailyStatsSumOrderByAggregateInput = {
    price?: SortOrder
    priceChange1h?: SortOrder
    priceChange24h?: SortOrder
    volume24h?: SortOrder
    volumeUSD24h?: SortOrder
    tvlInPools?: SortOrder
    marketCap?: SortOrder
    fdv?: SortOrder
    rankByTvl?: SortOrder
    rankByVolume?: SortOrder
    rankByMarketCap?: SortOrder
    swapCount24h?: SortOrder
    uniqueTraders24h?: SortOrder
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
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

  export type TokenPriceCreateNestedManyWithoutTokenInput = {
    create?: XOR<TokenPriceCreateWithoutTokenInput, TokenPriceUncheckedCreateWithoutTokenInput> | TokenPriceCreateWithoutTokenInput[] | TokenPriceUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenPriceCreateOrConnectWithoutTokenInput | TokenPriceCreateOrConnectWithoutTokenInput[]
    createMany?: TokenPriceCreateManyTokenInputEnvelope
    connect?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
  }

  export type TokenDailyStatsCreateNestedManyWithoutTokenInput = {
    create?: XOR<TokenDailyStatsCreateWithoutTokenInput, TokenDailyStatsUncheckedCreateWithoutTokenInput> | TokenDailyStatsCreateWithoutTokenInput[] | TokenDailyStatsUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenDailyStatsCreateOrConnectWithoutTokenInput | TokenDailyStatsCreateOrConnectWithoutTokenInput[]
    createMany?: TokenDailyStatsCreateManyTokenInputEnvelope
    connect?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
  }

  export type TokenPriceUncheckedCreateNestedManyWithoutTokenInput = {
    create?: XOR<TokenPriceCreateWithoutTokenInput, TokenPriceUncheckedCreateWithoutTokenInput> | TokenPriceCreateWithoutTokenInput[] | TokenPriceUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenPriceCreateOrConnectWithoutTokenInput | TokenPriceCreateOrConnectWithoutTokenInput[]
    createMany?: TokenPriceCreateManyTokenInputEnvelope
    connect?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
  }

  export type TokenDailyStatsUncheckedCreateNestedManyWithoutTokenInput = {
    create?: XOR<TokenDailyStatsCreateWithoutTokenInput, TokenDailyStatsUncheckedCreateWithoutTokenInput> | TokenDailyStatsCreateWithoutTokenInput[] | TokenDailyStatsUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenDailyStatsCreateOrConnectWithoutTokenInput | TokenDailyStatsCreateOrConnectWithoutTokenInput[]
    createMany?: TokenDailyStatsCreateManyTokenInputEnvelope
    connect?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
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

  export type BigIntFieldUpdateOperationsInput = {
    set?: bigint | number
    increment?: bigint | number
    decrement?: bigint | number
    multiply?: bigint | number
    divide?: bigint | number
  }

  export type EnumTokenStateFieldUpdateOperationsInput = {
    set?: $Enums.TokenState
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type TokenPriceUpdateManyWithoutTokenNestedInput = {
    create?: XOR<TokenPriceCreateWithoutTokenInput, TokenPriceUncheckedCreateWithoutTokenInput> | TokenPriceCreateWithoutTokenInput[] | TokenPriceUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenPriceCreateOrConnectWithoutTokenInput | TokenPriceCreateOrConnectWithoutTokenInput[]
    upsert?: TokenPriceUpsertWithWhereUniqueWithoutTokenInput | TokenPriceUpsertWithWhereUniqueWithoutTokenInput[]
    createMany?: TokenPriceCreateManyTokenInputEnvelope
    set?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
    disconnect?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
    delete?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
    connect?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
    update?: TokenPriceUpdateWithWhereUniqueWithoutTokenInput | TokenPriceUpdateWithWhereUniqueWithoutTokenInput[]
    updateMany?: TokenPriceUpdateManyWithWhereWithoutTokenInput | TokenPriceUpdateManyWithWhereWithoutTokenInput[]
    deleteMany?: TokenPriceScalarWhereInput | TokenPriceScalarWhereInput[]
  }

  export type TokenDailyStatsUpdateManyWithoutTokenNestedInput = {
    create?: XOR<TokenDailyStatsCreateWithoutTokenInput, TokenDailyStatsUncheckedCreateWithoutTokenInput> | TokenDailyStatsCreateWithoutTokenInput[] | TokenDailyStatsUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenDailyStatsCreateOrConnectWithoutTokenInput | TokenDailyStatsCreateOrConnectWithoutTokenInput[]
    upsert?: TokenDailyStatsUpsertWithWhereUniqueWithoutTokenInput | TokenDailyStatsUpsertWithWhereUniqueWithoutTokenInput[]
    createMany?: TokenDailyStatsCreateManyTokenInputEnvelope
    set?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
    disconnect?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
    delete?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
    connect?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
    update?: TokenDailyStatsUpdateWithWhereUniqueWithoutTokenInput | TokenDailyStatsUpdateWithWhereUniqueWithoutTokenInput[]
    updateMany?: TokenDailyStatsUpdateManyWithWhereWithoutTokenInput | TokenDailyStatsUpdateManyWithWhereWithoutTokenInput[]
    deleteMany?: TokenDailyStatsScalarWhereInput | TokenDailyStatsScalarWhereInput[]
  }

  export type TokenPriceUncheckedUpdateManyWithoutTokenNestedInput = {
    create?: XOR<TokenPriceCreateWithoutTokenInput, TokenPriceUncheckedCreateWithoutTokenInput> | TokenPriceCreateWithoutTokenInput[] | TokenPriceUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenPriceCreateOrConnectWithoutTokenInput | TokenPriceCreateOrConnectWithoutTokenInput[]
    upsert?: TokenPriceUpsertWithWhereUniqueWithoutTokenInput | TokenPriceUpsertWithWhereUniqueWithoutTokenInput[]
    createMany?: TokenPriceCreateManyTokenInputEnvelope
    set?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
    disconnect?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
    delete?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
    connect?: TokenPriceWhereUniqueInput | TokenPriceWhereUniqueInput[]
    update?: TokenPriceUpdateWithWhereUniqueWithoutTokenInput | TokenPriceUpdateWithWhereUniqueWithoutTokenInput[]
    updateMany?: TokenPriceUpdateManyWithWhereWithoutTokenInput | TokenPriceUpdateManyWithWhereWithoutTokenInput[]
    deleteMany?: TokenPriceScalarWhereInput | TokenPriceScalarWhereInput[]
  }

  export type TokenDailyStatsUncheckedUpdateManyWithoutTokenNestedInput = {
    create?: XOR<TokenDailyStatsCreateWithoutTokenInput, TokenDailyStatsUncheckedCreateWithoutTokenInput> | TokenDailyStatsCreateWithoutTokenInput[] | TokenDailyStatsUncheckedCreateWithoutTokenInput[]
    connectOrCreate?: TokenDailyStatsCreateOrConnectWithoutTokenInput | TokenDailyStatsCreateOrConnectWithoutTokenInput[]
    upsert?: TokenDailyStatsUpsertWithWhereUniqueWithoutTokenInput | TokenDailyStatsUpsertWithWhereUniqueWithoutTokenInput[]
    createMany?: TokenDailyStatsCreateManyTokenInputEnvelope
    set?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
    disconnect?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
    delete?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
    connect?: TokenDailyStatsWhereUniqueInput | TokenDailyStatsWhereUniqueInput[]
    update?: TokenDailyStatsUpdateWithWhereUniqueWithoutTokenInput | TokenDailyStatsUpdateWithWhereUniqueWithoutTokenInput[]
    updateMany?: TokenDailyStatsUpdateManyWithWhereWithoutTokenInput | TokenDailyStatsUpdateManyWithWhereWithoutTokenInput[]
    deleteMany?: TokenDailyStatsScalarWhereInput | TokenDailyStatsScalarWhereInput[]
  }

  export type TokenPriceCreatepoolsInvolvedInput = {
    set: string[]
  }

  export type TokenCreateNestedOneWithoutTokenPriceInput = {
    create?: XOR<TokenCreateWithoutTokenPriceInput, TokenUncheckedCreateWithoutTokenPriceInput>
    connectOrCreate?: TokenCreateOrConnectWithoutTokenPriceInput
    connect?: TokenWhereUniqueInput
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type EnumPriceSourceFieldUpdateOperationsInput = {
    set?: $Enums.PriceSource
  }

  export type TokenPriceUpdatepoolsInvolvedInput = {
    set?: string[]
    push?: string | string[]
  }

  export type TokenUpdateOneRequiredWithoutTokenPriceNestedInput = {
    create?: XOR<TokenCreateWithoutTokenPriceInput, TokenUncheckedCreateWithoutTokenPriceInput>
    connectOrCreate?: TokenCreateOrConnectWithoutTokenPriceInput
    upsert?: TokenUpsertWithoutTokenPriceInput
    connect?: TokenWhereUniqueInput
    update?: XOR<XOR<TokenUpdateToOneWithWhereWithoutTokenPriceInput, TokenUpdateWithoutTokenPriceInput>, TokenUncheckedUpdateWithoutTokenPriceInput>
  }

  export type TokenCreateNestedOneWithoutTokenDailyStatsInput = {
    create?: XOR<TokenCreateWithoutTokenDailyStatsInput, TokenUncheckedCreateWithoutTokenDailyStatsInput>
    connectOrCreate?: TokenCreateOrConnectWithoutTokenDailyStatsInput
    connect?: TokenWhereUniqueInput
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TokenUpdateOneRequiredWithoutTokenDailyStatsNestedInput = {
    create?: XOR<TokenCreateWithoutTokenDailyStatsInput, TokenUncheckedCreateWithoutTokenDailyStatsInput>
    connectOrCreate?: TokenCreateOrConnectWithoutTokenDailyStatsInput
    upsert?: TokenUpsertWithoutTokenDailyStatsInput
    connect?: TokenWhereUniqueInput
    update?: XOR<XOR<TokenUpdateToOneWithWhereWithoutTokenDailyStatsInput, TokenUpdateWithoutTokenDailyStatsInput>, TokenUncheckedUpdateWithoutTokenDailyStatsInput>
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

  export type NestedEnumTokenStateFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenState | EnumTokenStateFieldRefInput<$PrismaModel>
    in?: $Enums.TokenState[] | ListEnumTokenStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenState[] | ListEnumTokenStateFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenStateFilter<$PrismaModel> | $Enums.TokenState
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

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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

  export type NestedEnumTokenStateWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TokenState | EnumTokenStateFieldRefInput<$PrismaModel>
    in?: $Enums.TokenState[] | ListEnumTokenStateFieldRefInput<$PrismaModel>
    notIn?: $Enums.TokenState[] | ListEnumTokenStateFieldRefInput<$PrismaModel>
    not?: NestedEnumTokenStateWithAggregatesFilter<$PrismaModel> | $Enums.TokenState
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTokenStateFilter<$PrismaModel>
    _max?: NestedEnumTokenStateFilter<$PrismaModel>
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

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> = 
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedEnumPriceSourceFilter<$PrismaModel = never> = {
    equals?: $Enums.PriceSource | EnumPriceSourceFieldRefInput<$PrismaModel>
    in?: $Enums.PriceSource[] | ListEnumPriceSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriceSource[] | ListEnumPriceSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumPriceSourceFilter<$PrismaModel> | $Enums.PriceSource
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

  export type NestedEnumPriceSourceWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.PriceSource | EnumPriceSourceFieldRefInput<$PrismaModel>
    in?: $Enums.PriceSource[] | ListEnumPriceSourceFieldRefInput<$PrismaModel>
    notIn?: $Enums.PriceSource[] | ListEnumPriceSourceFieldRefInput<$PrismaModel>
    not?: NestedEnumPriceSourceWithAggregatesFilter<$PrismaModel> | $Enums.PriceSource
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumPriceSourceFilter<$PrismaModel>
    _max?: NestedEnumPriceSourceFilter<$PrismaModel>
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

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
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

  export type TokenPriceCreateWithoutTokenInput = {
    timestamp: Date | string
    price: number
    priceSource?: $Enums.PriceSource
    confidence?: number
    volumeUSD?: number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceCreatepoolsInvolvedInput | string[]
    createdAt?: Date | string
  }

  export type TokenPriceUncheckedCreateWithoutTokenInput = {
    timestamp: Date | string
    price: number
    priceSource?: $Enums.PriceSource
    confidence?: number
    volumeUSD?: number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceCreatepoolsInvolvedInput | string[]
    createdAt?: Date | string
  }

  export type TokenPriceCreateOrConnectWithoutTokenInput = {
    where: TokenPriceWhereUniqueInput
    create: XOR<TokenPriceCreateWithoutTokenInput, TokenPriceUncheckedCreateWithoutTokenInput>
  }

  export type TokenPriceCreateManyTokenInputEnvelope = {
    data: TokenPriceCreateManyTokenInput | TokenPriceCreateManyTokenInput[]
    skipDuplicates?: boolean
  }

  export type TokenDailyStatsCreateWithoutTokenInput = {
    date: string
    price: number
    priceChange1h?: number | null
    priceChange24h?: number | null
    volume24h?: number
    volumeUSD24h?: number
    tvlInPools?: number
    marketCap?: number | null
    fdv?: number | null
    rankByTvl?: number | null
    rankByVolume?: number | null
    rankByMarketCap?: number | null
    swapCount24h?: number
    uniqueTraders24h?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TokenDailyStatsUncheckedCreateWithoutTokenInput = {
    date: string
    price: number
    priceChange1h?: number | null
    priceChange24h?: number | null
    volume24h?: number
    volumeUSD24h?: number
    tvlInPools?: number
    marketCap?: number | null
    fdv?: number | null
    rankByTvl?: number | null
    rankByVolume?: number | null
    rankByMarketCap?: number | null
    swapCount24h?: number
    uniqueTraders24h?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TokenDailyStatsCreateOrConnectWithoutTokenInput = {
    where: TokenDailyStatsWhereUniqueInput
    create: XOR<TokenDailyStatsCreateWithoutTokenInput, TokenDailyStatsUncheckedCreateWithoutTokenInput>
  }

  export type TokenDailyStatsCreateManyTokenInputEnvelope = {
    data: TokenDailyStatsCreateManyTokenInput | TokenDailyStatsCreateManyTokenInput[]
    skipDuplicates?: boolean
  }

  export type TokenPriceUpsertWithWhereUniqueWithoutTokenInput = {
    where: TokenPriceWhereUniqueInput
    update: XOR<TokenPriceUpdateWithoutTokenInput, TokenPriceUncheckedUpdateWithoutTokenInput>
    create: XOR<TokenPriceCreateWithoutTokenInput, TokenPriceUncheckedCreateWithoutTokenInput>
  }

  export type TokenPriceUpdateWithWhereUniqueWithoutTokenInput = {
    where: TokenPriceWhereUniqueInput
    data: XOR<TokenPriceUpdateWithoutTokenInput, TokenPriceUncheckedUpdateWithoutTokenInput>
  }

  export type TokenPriceUpdateManyWithWhereWithoutTokenInput = {
    where: TokenPriceScalarWhereInput
    data: XOR<TokenPriceUpdateManyMutationInput, TokenPriceUncheckedUpdateManyWithoutTokenInput>
  }

  export type TokenPriceScalarWhereInput = {
    AND?: TokenPriceScalarWhereInput | TokenPriceScalarWhereInput[]
    OR?: TokenPriceScalarWhereInput[]
    NOT?: TokenPriceScalarWhereInput | TokenPriceScalarWhereInput[]
    tokenAddress?: StringFilter<"TokenPrice"> | string
    timestamp?: DateTimeFilter<"TokenPrice"> | Date | string
    price?: FloatFilter<"TokenPrice"> | number
    priceSource?: EnumPriceSourceFilter<"TokenPrice"> | $Enums.PriceSource
    confidence?: FloatFilter<"TokenPrice"> | number
    volumeUSD?: FloatFilter<"TokenPrice"> | number
    liquidityPath?: JsonNullableFilter<"TokenPrice">
    poolsInvolved?: StringNullableListFilter<"TokenPrice">
    createdAt?: DateTimeFilter<"TokenPrice"> | Date | string
  }

  export type TokenDailyStatsUpsertWithWhereUniqueWithoutTokenInput = {
    where: TokenDailyStatsWhereUniqueInput
    update: XOR<TokenDailyStatsUpdateWithoutTokenInput, TokenDailyStatsUncheckedUpdateWithoutTokenInput>
    create: XOR<TokenDailyStatsCreateWithoutTokenInput, TokenDailyStatsUncheckedCreateWithoutTokenInput>
  }

  export type TokenDailyStatsUpdateWithWhereUniqueWithoutTokenInput = {
    where: TokenDailyStatsWhereUniqueInput
    data: XOR<TokenDailyStatsUpdateWithoutTokenInput, TokenDailyStatsUncheckedUpdateWithoutTokenInput>
  }

  export type TokenDailyStatsUpdateManyWithWhereWithoutTokenInput = {
    where: TokenDailyStatsScalarWhereInput
    data: XOR<TokenDailyStatsUpdateManyMutationInput, TokenDailyStatsUncheckedUpdateManyWithoutTokenInput>
  }

  export type TokenDailyStatsScalarWhereInput = {
    AND?: TokenDailyStatsScalarWhereInput | TokenDailyStatsScalarWhereInput[]
    OR?: TokenDailyStatsScalarWhereInput[]
    NOT?: TokenDailyStatsScalarWhereInput | TokenDailyStatsScalarWhereInput[]
    tokenAddress?: StringFilter<"TokenDailyStats"> | string
    date?: StringFilter<"TokenDailyStats"> | string
    price?: FloatFilter<"TokenDailyStats"> | number
    priceChange1h?: FloatNullableFilter<"TokenDailyStats"> | number | null
    priceChange24h?: FloatNullableFilter<"TokenDailyStats"> | number | null
    volume24h?: FloatFilter<"TokenDailyStats"> | number
    volumeUSD24h?: FloatFilter<"TokenDailyStats"> | number
    tvlInPools?: FloatFilter<"TokenDailyStats"> | number
    marketCap?: FloatNullableFilter<"TokenDailyStats"> | number | null
    fdv?: FloatNullableFilter<"TokenDailyStats"> | number | null
    rankByTvl?: IntNullableFilter<"TokenDailyStats"> | number | null
    rankByVolume?: IntNullableFilter<"TokenDailyStats"> | number | null
    rankByMarketCap?: IntNullableFilter<"TokenDailyStats"> | number | null
    swapCount24h?: IntFilter<"TokenDailyStats"> | number
    uniqueTraders24h?: IntFilter<"TokenDailyStats"> | number
    createdAt?: DateTimeFilter<"TokenDailyStats"> | Date | string
    updatedAt?: DateTimeFilter<"TokenDailyStats"> | Date | string
  }

  export type TokenCreateWithoutTokenPriceInput = {
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    website?: string | null
    twitter?: string | null
    description?: string | null
    coingeckoId?: string | null
    totalSupply: bigint | number
    status?: $Enums.TokenState
    discoveredAt?: Date | string
    lastEnrichmentAt?: Date | string | null
    lastActivityAt?: Date | string | null
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    TokenDailyStats?: TokenDailyStatsCreateNestedManyWithoutTokenInput
  }

  export type TokenUncheckedCreateWithoutTokenPriceInput = {
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    website?: string | null
    twitter?: string | null
    description?: string | null
    coingeckoId?: string | null
    totalSupply: bigint | number
    status?: $Enums.TokenState
    discoveredAt?: Date | string
    lastEnrichmentAt?: Date | string | null
    lastActivityAt?: Date | string | null
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    TokenDailyStats?: TokenDailyStatsUncheckedCreateNestedManyWithoutTokenInput
  }

  export type TokenCreateOrConnectWithoutTokenPriceInput = {
    where: TokenWhereUniqueInput
    create: XOR<TokenCreateWithoutTokenPriceInput, TokenUncheckedCreateWithoutTokenPriceInput>
  }

  export type TokenUpsertWithoutTokenPriceInput = {
    update: XOR<TokenUpdateWithoutTokenPriceInput, TokenUncheckedUpdateWithoutTokenPriceInput>
    create: XOR<TokenCreateWithoutTokenPriceInput, TokenUncheckedCreateWithoutTokenPriceInput>
    where?: TokenWhereInput
  }

  export type TokenUpdateToOneWithWhereWithoutTokenPriceInput = {
    where?: TokenWhereInput
    data: XOR<TokenUpdateWithoutTokenPriceInput, TokenUncheckedUpdateWithoutTokenPriceInput>
  }

  export type TokenUpdateWithoutTokenPriceInput = {
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    twitter?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    totalSupply?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTokenStateFieldUpdateOperationsInput | $Enums.TokenState
    discoveredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEnrichmentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActivityAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isStableCoin?: BoolFieldUpdateOperationsInput | boolean
    isVerifiedManually?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    TokenDailyStats?: TokenDailyStatsUpdateManyWithoutTokenNestedInput
  }

  export type TokenUncheckedUpdateWithoutTokenPriceInput = {
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    twitter?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    totalSupply?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTokenStateFieldUpdateOperationsInput | $Enums.TokenState
    discoveredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEnrichmentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActivityAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isStableCoin?: BoolFieldUpdateOperationsInput | boolean
    isVerifiedManually?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    TokenDailyStats?: TokenDailyStatsUncheckedUpdateManyWithoutTokenNestedInput
  }

  export type TokenCreateWithoutTokenDailyStatsInput = {
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    website?: string | null
    twitter?: string | null
    description?: string | null
    coingeckoId?: string | null
    totalSupply: bigint | number
    status?: $Enums.TokenState
    discoveredAt?: Date | string
    lastEnrichmentAt?: Date | string | null
    lastActivityAt?: Date | string | null
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    TokenPrice?: TokenPriceCreateNestedManyWithoutTokenInput
  }

  export type TokenUncheckedCreateWithoutTokenDailyStatsInput = {
    address: string
    symbol: string
    name: string
    decimals: number
    logoUri?: string | null
    website?: string | null
    twitter?: string | null
    description?: string | null
    coingeckoId?: string | null
    totalSupply: bigint | number
    status?: $Enums.TokenState
    discoveredAt?: Date | string
    lastEnrichmentAt?: Date | string | null
    lastActivityAt?: Date | string | null
    isStableCoin?: boolean
    isVerifiedManually?: boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
    updatedAt?: Date | string
    TokenPrice?: TokenPriceUncheckedCreateNestedManyWithoutTokenInput
  }

  export type TokenCreateOrConnectWithoutTokenDailyStatsInput = {
    where: TokenWhereUniqueInput
    create: XOR<TokenCreateWithoutTokenDailyStatsInput, TokenUncheckedCreateWithoutTokenDailyStatsInput>
  }

  export type TokenUpsertWithoutTokenDailyStatsInput = {
    update: XOR<TokenUpdateWithoutTokenDailyStatsInput, TokenUncheckedUpdateWithoutTokenDailyStatsInput>
    create: XOR<TokenCreateWithoutTokenDailyStatsInput, TokenUncheckedCreateWithoutTokenDailyStatsInput>
    where?: TokenWhereInput
  }

  export type TokenUpdateToOneWithWhereWithoutTokenDailyStatsInput = {
    where?: TokenWhereInput
    data: XOR<TokenUpdateWithoutTokenDailyStatsInput, TokenUncheckedUpdateWithoutTokenDailyStatsInput>
  }

  export type TokenUpdateWithoutTokenDailyStatsInput = {
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    twitter?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    totalSupply?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTokenStateFieldUpdateOperationsInput | $Enums.TokenState
    discoveredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEnrichmentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActivityAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isStableCoin?: BoolFieldUpdateOperationsInput | boolean
    isVerifiedManually?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    TokenPrice?: TokenPriceUpdateManyWithoutTokenNestedInput
  }

  export type TokenUncheckedUpdateWithoutTokenDailyStatsInput = {
    address?: StringFieldUpdateOperationsInput | string
    symbol?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    decimals?: IntFieldUpdateOperationsInput | number
    logoUri?: NullableStringFieldUpdateOperationsInput | string | null
    website?: NullableStringFieldUpdateOperationsInput | string | null
    twitter?: NullableStringFieldUpdateOperationsInput | string | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    coingeckoId?: NullableStringFieldUpdateOperationsInput | string | null
    totalSupply?: BigIntFieldUpdateOperationsInput | bigint | number
    status?: EnumTokenStateFieldUpdateOperationsInput | $Enums.TokenState
    discoveredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    lastEnrichmentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastActivityAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    isStableCoin?: BoolFieldUpdateOperationsInput | boolean
    isVerifiedManually?: BoolFieldUpdateOperationsInput | boolean
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    TokenPrice?: TokenPriceUncheckedUpdateManyWithoutTokenNestedInput
  }

  export type TokenPriceCreateManyTokenInput = {
    timestamp: Date | string
    price: number
    priceSource?: $Enums.PriceSource
    confidence?: number
    volumeUSD?: number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceCreatepoolsInvolvedInput | string[]
    createdAt?: Date | string
  }

  export type TokenDailyStatsCreateManyTokenInput = {
    date: string
    price: number
    priceChange1h?: number | null
    priceChange24h?: number | null
    volume24h?: number
    volumeUSD24h?: number
    tvlInPools?: number
    marketCap?: number | null
    fdv?: number | null
    rankByTvl?: number | null
    rankByVolume?: number | null
    rankByMarketCap?: number | null
    swapCount24h?: number
    uniqueTraders24h?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TokenPriceUpdateWithoutTokenInput = {
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    price?: FloatFieldUpdateOperationsInput | number
    priceSource?: EnumPriceSourceFieldUpdateOperationsInput | $Enums.PriceSource
    confidence?: FloatFieldUpdateOperationsInput | number
    volumeUSD?: FloatFieldUpdateOperationsInput | number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceUpdatepoolsInvolvedInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenPriceUncheckedUpdateWithoutTokenInput = {
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    price?: FloatFieldUpdateOperationsInput | number
    priceSource?: EnumPriceSourceFieldUpdateOperationsInput | $Enums.PriceSource
    confidence?: FloatFieldUpdateOperationsInput | number
    volumeUSD?: FloatFieldUpdateOperationsInput | number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceUpdatepoolsInvolvedInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenPriceUncheckedUpdateManyWithoutTokenInput = {
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    price?: FloatFieldUpdateOperationsInput | number
    priceSource?: EnumPriceSourceFieldUpdateOperationsInput | $Enums.PriceSource
    confidence?: FloatFieldUpdateOperationsInput | number
    volumeUSD?: FloatFieldUpdateOperationsInput | number
    liquidityPath?: NullableJsonNullValueInput | InputJsonValue
    poolsInvolved?: TokenPriceUpdatepoolsInvolvedInput | string[]
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenDailyStatsUpdateWithoutTokenInput = {
    date?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    priceChange1h?: NullableFloatFieldUpdateOperationsInput | number | null
    priceChange24h?: NullableFloatFieldUpdateOperationsInput | number | null
    volume24h?: FloatFieldUpdateOperationsInput | number
    volumeUSD24h?: FloatFieldUpdateOperationsInput | number
    tvlInPools?: FloatFieldUpdateOperationsInput | number
    marketCap?: NullableFloatFieldUpdateOperationsInput | number | null
    fdv?: NullableFloatFieldUpdateOperationsInput | number | null
    rankByTvl?: NullableIntFieldUpdateOperationsInput | number | null
    rankByVolume?: NullableIntFieldUpdateOperationsInput | number | null
    rankByMarketCap?: NullableIntFieldUpdateOperationsInput | number | null
    swapCount24h?: IntFieldUpdateOperationsInput | number
    uniqueTraders24h?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenDailyStatsUncheckedUpdateWithoutTokenInput = {
    date?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    priceChange1h?: NullableFloatFieldUpdateOperationsInput | number | null
    priceChange24h?: NullableFloatFieldUpdateOperationsInput | number | null
    volume24h?: FloatFieldUpdateOperationsInput | number
    volumeUSD24h?: FloatFieldUpdateOperationsInput | number
    tvlInPools?: FloatFieldUpdateOperationsInput | number
    marketCap?: NullableFloatFieldUpdateOperationsInput | number | null
    fdv?: NullableFloatFieldUpdateOperationsInput | number | null
    rankByTvl?: NullableIntFieldUpdateOperationsInput | number | null
    rankByVolume?: NullableIntFieldUpdateOperationsInput | number | null
    rankByMarketCap?: NullableIntFieldUpdateOperationsInput | number | null
    swapCount24h?: IntFieldUpdateOperationsInput | number
    uniqueTraders24h?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TokenDailyStatsUncheckedUpdateManyWithoutTokenInput = {
    date?: StringFieldUpdateOperationsInput | string
    price?: FloatFieldUpdateOperationsInput | number
    priceChange1h?: NullableFloatFieldUpdateOperationsInput | number | null
    priceChange24h?: NullableFloatFieldUpdateOperationsInput | number | null
    volume24h?: FloatFieldUpdateOperationsInput | number
    volumeUSD24h?: FloatFieldUpdateOperationsInput | number
    tvlInPools?: FloatFieldUpdateOperationsInput | number
    marketCap?: NullableFloatFieldUpdateOperationsInput | number | null
    fdv?: NullableFloatFieldUpdateOperationsInput | number | null
    rankByTvl?: NullableIntFieldUpdateOperationsInput | number | null
    rankByVolume?: NullableIntFieldUpdateOperationsInput | number | null
    rankByMarketCap?: NullableIntFieldUpdateOperationsInput | number | null
    swapCount24h?: IntFieldUpdateOperationsInput | number
    uniqueTraders24h?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use TokenCountOutputTypeDefaultArgs instead
     */
    export type TokenCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TokenCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TokenDefaultArgs instead
     */
    export type TokenArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TokenDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TokenPriceDefaultArgs instead
     */
    export type TokenPriceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TokenPriceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TokenDailyStatsDefaultArgs instead
     */
    export type TokenDailyStatsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TokenDailyStatsDefaultArgs<ExtArgs>

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