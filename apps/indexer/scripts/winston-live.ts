#!/usr/bin/env node

import winston from 'winston'
import { EventEmitter } from 'events'

interface LiveLogFilters {
  event?: string
  pool?: string
  token?: string
  level?: 'debug' | 'info' | 'error'
  tx?: string
  block?: string
}

class WinstonLiveLogger extends EventEmitter {
  private filters: LiveLogFilters
  private logFormat: 'simple' | 'detailed' | 'json'
  private logger: winston.Logger

  constructor(filters: LiveLogFilters, format: 'simple' | 'detailed' | 'json' = 'simple') {
    super()
    this.filters = filters
    this.logFormat = format
    
    // Créer un logger qui écoute les logs de l'indexer
    this.logger = winston.createLogger({
      level: 'debug',
      format: winston.format.json(),
      transports: [
        // Transport custom qui intercepte tous les logs
        new winston.transports.Stream({
          stream: process.stdout,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.printf((info) => {
              if (this.matchesFilters(info)) {
                console.log(this.formatLog(info))
              }
              return '' // Ne rien écrire dans le stream
            })
          )
        })
      ]
    })
  }

  private matchesFilters(log: any): boolean {
    if (this.filters.event && log.event !== this.filters.event) return false
    if (this.filters.pool && log.pool !== this.filters.pool) return false
    if (this.filters.level && log.level !== this.filters.level) return false
    if (this.filters.tx && log.txHash !== this.filters.tx) return false
    if (this.filters.block && log.blockNumber?.toString() !== this.filters.block) return false
    
    if (this.filters.token) {
      const token = this.filters.token.toLowerCase()
      const token0Match = log.token0?.toLowerCase().includes(token)
      const token1Match = log.token1?.toLowerCase().includes(token)
      if (!token0Match && !token1Match) return false
    }

    return true
  }

  private formatLog(log: any): string {
    const timestamp = new Date().toLocaleTimeString()
    
    if (this.logFormat === 'json') {
      return JSON.stringify(log, null, 2)
    }
    
    if (this.logFormat === 'detailed') {
      let output = `\\n🔴 [${timestamp}] ${log.level?.toUpperCase() || 'LOG'} - ${log.message || 'Event'}\\n`
      output += `   Event: ${log.event || 'N/A'}\\n`
      output += `   Pool: ${log.pool || 'N/A'}\\n` 
      output += `   Tokens: ${log.token0 || 'N/A'} / ${log.token1 || 'N/A'}\\n`
      output += `   TX: ${log.txHash || 'N/A'}\\n`
      output += `   Block: ${log.blockNumber || 'N/A'}\\n`
      
      if (log.event === 'swap' && log.amounts) {
        output += `   💰 Amounts: ${log.amounts.amount0} | ${log.amounts.amount1} (${log.amounts.amountUSD} USD)\\n`
        if (log.prices) output += `   💲 BERA Price: ${log.prices.beraPriceUSD}\\n`
        if (log.fees) output += `   🏦 Fees: ${log.fees.feeUSD} USD\\n`
      }
      
      output += `   ──────────────────────────────────────`
      return output
    }
    
    // Format simple
    const eventIcon = log.event === 'swap' ? '🔄' : log.event === 'mint' ? '🌱' : log.event === 'factory' ? '🏭' : '📝'
    const levelColor = log.level === 'debug' ? '\\x1b[36m' : log.level === 'error' ? '\\x1b[31m' : '\\x1b[32m'
    const resetColor = '\\x1b[0m'
    
    return `${levelColor}[${timestamp}] ${eventIcon} ${log.event || 'LOG'} ${resetColor}| ${log.token0 || '?'}/${log.token1 || '?'} | ${log.pool?.slice(-8) || 'N/A'}`
  }

  public start() {
    console.log('🚀 Starting Winston live logger...')
    console.log('📋 Filters:', JSON.stringify(this.filters, null, 2))
    console.log('📄 Format:', this.logFormat)
    console.log('🎯 Listening to live logs from indexer...\\n')
    console.log('───────────────────────────────────────\\n')

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\\n\\n🛑 Arrêt du live logger...')
      process.exit(0)
    })
  }

  // Méthode pour injecter les logs depuis l'indexer
  public log(level: string, message: string, meta: any) {
    this.logger.log(level, message, meta)
  }
}

// Interface CLI (même que l'autre script)
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔴 Winston Live Logs - Alternative avec Winston natif

Usage: pnpm winston-live [options]

IMPORTANT: Cette version nécessite une intégration directe avec l'indexer.
Pour une solution immédiate, utilisez plutôt 'pnpm live-logs'

Options: (identiques à live-logs)
  --event <type>        Filtrer par type d'événement 
  --pool <address>      Filtrer par adresse de pool  
  --token <symbol>      Filtrer par token
  --format <format>    Format: simple, detailed, json
    `)
    return
  }

  const filters: LiveLogFilters = {}
  let format: 'simple' | 'detailed' | 'json' = 'simple'

  // Parse arguments (même logique)
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]
    const value = args[i + 1]
    
    switch (key) {
      case '--event': filters.event = value; break
      case '--pool': filters.pool = value; break
      case '--token': filters.token = value; break
      case '--level': filters.level = value as any; break
      case '--tx': filters.tx = value; break
      case '--block': filters.block = value; break
      case '--format': format = value as any; break
    }
  }

  console.log('⚠️ Cette version nécessite une intégration directe avec l\\'indexer.')
  console.log('💡 Utilisez plutôt: pnpm live-logs')
  console.log('\\n   OU activez la console dans logger.ts pour voir tous les logs')

  const liveLogger = new WinstonLiveLogger(filters, format)
  liveLogger.start()
}

main().catch(console.error)