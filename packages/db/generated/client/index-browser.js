
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.TokenScalarFieldEnum = {
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

exports.Prisma.TokenPriceScalarFieldEnum = {
  tokenAddress: 'tokenAddress',
  price: 'price',
  priceSource: 'priceSource',
  confidence: 'confidence',
  volumeUSD: 'volumeUSD',
  createdAt: 'createdAt'
};

exports.Prisma.TokenDailyStatsScalarFieldEnum = {
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

exports.Prisma.PoolStatsScalarFieldEnum = {
  address: 'address',
  tickSpacing: 'tickSpacing',
  fee: 'fee',
  createdAt: 'createdAt',
  createdAtBlock: 'createdAtBlock',
  token0Address: 'token0Address',
  token1Address: 'token1Address',
  token0Symbol: 'token0Symbol',
  token1Symbol: 'token1Symbol',
  token0LogoUri: 'token0LogoUri',
  token1LogoUri: 'token1LogoUri',
  sqrtPriceX96: 'sqrtPriceX96',
  liquidity: 'liquidity',
  isValid: 'isValid',
  dayVolumeUSD: 'dayVolumeUSD',
  monthVolumeUSD: 'monthVolumeUSD',
  apr: 'apr',
  tvlUSD: 'tvlUSD'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.TokenState = exports.$Enums.TokenState = {
  DISCOVERED: 'DISCOVERED',
  ENRICHING: 'ENRICHING',
  IN_POOL: 'IN_POOL',
  VERIFIED: 'VERIFIED',
  DEPRECATED: 'DEPRECATED'
};

exports.PriceSource = exports.$Enums.PriceSource = {
  POOL_CALCULATION: 'POOL_CALCULATION',
  COINGECKO_FALLBACK: 'COINGECKO_FALLBACK',
  MANUAL_OVERRIDE: 'MANUAL_OVERRIDE'
};

exports.Prisma.ModelName = {
  Token: 'Token',
  TokenPrice: 'TokenPrice',
  TokenDailyStats: 'TokenDailyStats',
  PoolStats: 'PoolStats'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
