import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

interface LogContext {
  event: string
  pool?: string
  token0?: string
  token1?: string
  txHash?: string
  blockNumber?: number | bigint
  [key: string]: any
}

// Singleton pattern pour éviter la duplication des transports
let logger: winston.Logger | null = null

const createLogger = () => {
  if (logger) {
    return logger
  }

  logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    transports: [
      // Logs généraux
      new DailyRotateFile({
        filename: 'logs/indexer-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d'
      }),
      // Logs spécifiques aux événements factory
      new DailyRotateFile({
        filename: 'logs/events/factory-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '7d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format((info) => info.event === 'factory' ? info : false)()
        )
      }),
      // Logs spécifiques aux swaps
      new DailyRotateFile({
        filename: 'logs/events/swap-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '7d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format((info) => info.event === 'swap' ? info : false)()
        )
      }),
      // Logs spécifiques aux mints
      new DailyRotateFile({
        filename: 'logs/events/mint-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '7d',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format((info) => info.event === 'mint' ? info : false)()
        )
      }),
      // Logs debug séparés
      new DailyRotateFile({
        filename: 'logs/debug-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxSize: '10m',
        maxFiles: '3d',
        level: 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          winston.format((info) => info.level === 'debug' ? info : false)()
        )
      })
    ]
  })

  return logger
}

const getLogger = () => createLogger()

export const logFactory = (context: LogContext, data: any) => {
  const loggerInstance = getLogger()
  loggerInstance.info('Factory event processed', {
    event: 'factory',
    pool: context.pool,
    token0: context.token0,
    token1: context.token1,
    txHash: context.txHash,
    blockNumber: context.blockNumber,
    timestamp: new Date().toISOString(),
    ...data
  })
}

export const logSwap = (context: LogContext, data: any) => {
  const loggerInstance = getLogger()
  loggerInstance.info('Swap event processed', {
    event: 'swap',
    pool: context.pool,
    token0: context.token0,
    token1: context.token1,
    txHash: context.txHash,
    blockNumber: context.blockNumber,
    timestamp: new Date().toISOString(),
    ...data
  })
}

export const logMint = (context: LogContext, data: any) => {
  const loggerInstance = getLogger()
  loggerInstance.info('Mint event processed', {
    event: 'mint',
    pool: context.pool,
    token0: context.token0,
    token1: context.token1,
    txHash: context.txHash,
    blockNumber: context.blockNumber,
    timestamp: new Date().toISOString(),
    ...data
  })
}

export const logError = (context: LogContext, error: any, data?: any) => {
  const loggerInstance = getLogger()
  loggerInstance.error('Error occurred', {
    event: context.event,
    pool: context.pool,
    token0: context.token0,
    token1: context.token1,
    txHash: context.txHash,
    blockNumber: context.blockNumber,
    timestamp: new Date().toISOString(),
    error: error.message || error,
    stack: error.stack,
    ...data
  })
}

export const logDebug = (context: LogContext, message: string, data?: any) => {
  const loggerInstance = getLogger()
  loggerInstance.debug(message, {
    event: context.event,
    pool: context.pool,
    token0: context.token0,
    token1: context.token1,
    txHash: context.txHash,
    blockNumber: context.blockNumber,
    timestamp: new Date().toISOString(),
    ...data
  })
}

export default getLogger