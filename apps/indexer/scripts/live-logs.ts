#!/usr/bin/env node

import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

interface LiveLogFilters {
  event?: string
  pool?: string
  token?: string
  level?: 'debug' | 'info' | 'error'
  tx?: string
  block?: string
}

class LiveLogWatcher {
  private filters: LiveLogFilters
  private watchedFiles: Set<string> = new Set()
  private logFormat: 'simple' | 'detailed' | 'json'

  constructor(filters: LiveLogFilters, format: 'simple' | 'detailed' | 'json' = 'simple') {
    this.filters = filters
    this.logFormat = format
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
      
      // Données spécifiques selon le type
      if (log.event === 'swap' && log.amounts) {
        output += `   💰 Amounts: ${log.amounts.amount0} | ${log.amounts.amount1} (${log.amounts.amountUSD} USD)\\n`
        if (log.prices) output += `   💲 Prices: BERA=${log.prices.beraPriceUSD} | Token0=${log.prices.token0Price}\\n`
        if (log.fees) output += `   🏦 Fees: ${log.fees.feeUSD} USD (${log.fees.feeTier} tier)\\n`
      }
      
      if (log.event === 'mint' && log.amounts) {
        output += `   🌱 Mint: ${log.amounts.amount0} | ${log.amounts.amount1} | Liquidity: ${log.amounts.liquidity}\\n`
        if (log.ticks) output += `   📊 Ticks: ${log.ticks.tickLower} → ${log.ticks.tickUpper}\\n`
      }
      
      output += `   ──────────────────────────────────────`
      return output
    }
    
    // Format simple
    const eventIcon = log.event === 'swap' ? '🔄' : log.event === 'mint' ? '🌱' : log.event === 'factory' ? '🏭' : '📝'
    const levelColor = log.level === 'debug' ? '\\x1b[36m' : log.level === 'error' ? '\\x1b[31m' : '\\x1b[32m'
    const resetColor = '\\x1b[0m'
    
    return `${levelColor}[${timestamp}] ${eventIcon} ${log.event || 'LOG'} ${resetColor}| ${log.token0 || '?'}/${log.token1 || '?'} | ${log.pool?.slice(-8) || 'N/A'} | Block: ${log.blockNumber || 'N/A'}`
  }

  private watchLogFile(filePath: string) {
    if (this.watchedFiles.has(filePath)) return

    this.watchedFiles.add(filePath)
    
    // Utiliser tail -f pour suivre le fichier en temps réel
    const tail = spawn('tail', ['-f', filePath], { stdio: ['pipe', 'pipe', 'pipe'] })
    
    tail.stdout.on('data', (data: Buffer) => {
      const lines = data.toString().split('\\n').filter(line => line.trim())
      
      for (const line of lines) {
        try {
          const log = JSON.parse(line)
          if (this.matchesFilters(log)) {
            console.log(this.formatLog(log))
          }
        } catch (e) {
          // Skip malformed JSON lines
        }
      }
    })

    tail.stderr.on('data', (data: Buffer) => {
      // Ignore stderr from tail
    })
  }

  public start() {
    const logsDir = 'logs'
    const eventsDir = 'logs/events'
    
    console.log('🚀 Starting live log watcher...')
    console.log('📋 Filters:', JSON.stringify(this.filters, null, 2))
    console.log('📄 Format:', this.logFormat)
    console.log('───────────────────────────────────────\\n')

    // Fonction pour trouver le fichier le plus récent
    const findLatestLogFile = (dir: string, pattern: string): string | null => {
      if (!fs.existsSync(dir)) return null
      
      const files = fs.readdirSync(dir)
        .filter(file => file.includes(pattern) && file.endsWith('.log'))
        .sort((a, b) => {
          // Trier par numéro si c'est un fichier rotaté (.1, .2, etc.)
          const aMatch = a.match(/\\.(\d+)$/)
          const bMatch = b.match(/\\.(\d+)$/)
          
          if (aMatch && bMatch) {
            return parseInt(bMatch[1]) - parseInt(aMatch[1]) // Plus grand numéro = plus récent
          } else if (aMatch && !bMatch) {
            return 1 // b est le fichier principal (plus récent)
          } else if (!aMatch && bMatch) {
            return -1 // a est le fichier principal (plus récent)
          } else {
            return b.localeCompare(a) // Tri alphabétique inverse
          }
        })
      
      return files.length > 0 ? files[0] : null
    }

    // Surveiller le fichier debug le plus récent
    const latestDebugFile = findLatestLogFile(logsDir, 'debug-')
    if (latestDebugFile) {
      console.log(`📄 Watching debug file: ${latestDebugFile}`)
      this.watchLogFile(path.join(logsDir, latestDebugFile))
    }

    // Surveiller le fichier indexer le plus récent  
    const latestIndexerFile = findLatestLogFile(logsDir, 'indexer-')
    if (latestIndexerFile) {
      console.log(`📄 Watching indexer file: ${latestIndexerFile}`)
      this.watchLogFile(path.join(logsDir, latestIndexerFile))
    }

    // Surveiller les fichiers d'événements
    if (fs.existsSync(eventsDir)) {
      const eventFiles = fs.readdirSync(eventsDir)
      eventFiles.forEach(file => {
        if (file.endsWith('.log') && !file.includes('.')) { // Éviter les fichiers rotatés
          console.log(`📄 Watching event file: ${file}`)
          this.watchLogFile(path.join(eventsDir, file))
        }
      })
    }

    // Surveiller les nouveaux fichiers (créés pendant l'exécution)
    const watcher = fs.watch(logsDir, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.log')) {
        const filePath = path.join(logsDir, filename)
        if (fs.existsSync(filePath)) {
          setTimeout(() => this.watchLogFile(filePath), 1000) // Délai pour s'assurer que le fichier est prêt
        }
      }
    })

    // Gérer l'arrêt propre
    process.on('SIGINT', () => {
      console.log('\\n\\n🛑 Arrêt du live log watcher...')
      watcher.close()
      process.exit(0)
    })
  }
}

// Interface CLI
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔴 Live Logs - Surveillance en temps réel des logs avec filtres

Usage: pnpm live-logs [options]

Options:
  --event <type>        Filtrer par type d'événement (swap, mint, factory, debug)
  --pool <address>      Filtrer par adresse de pool  
  --token <symbol>      Filtrer par token (cherche dans token0 et token1)
  --level <level>       Filtrer par niveau (debug, info, error)
  --tx <hash>          Filtrer par transaction hash
  --block <number>     Filtrer par numéro de block
  --format <format>    Format d'affichage: simple, detailed, json (défaut: simple)

Exemples:
  pnpm live-logs --event swap --pool 0x1234567890abcdef
  pnpm live-logs --event swap --token BERA --format detailed
  pnpm live-logs --level debug --format detailed
  pnpm live-logs --event mint --token USDC
  pnpm live-logs --format json

Contrôles:
  Ctrl+C - Arrêter la surveillance
    `)
    return
  }

  const filters: LiveLogFilters = {}
  let format: 'simple' | 'detailed' | 'json' = 'simple'

  // Parse arguments
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]
    const value = args[i + 1]
    
    switch (key) {
      case '--event':
        filters.event = value
        break
      case '--pool':
        filters.pool = value
        break
      case '--token':
        filters.token = value
        break
      case '--level':
        filters.level = value as 'debug' | 'info' | 'error'
        break
      case '--tx':
        filters.tx = value
        break
      case '--block':
        filters.block = value
        break
      case '--format':
        format = value as 'simple' | 'detailed' | 'json'
        break
    }
  }

  const watcher = new LiveLogWatcher(filters, format)
  watcher.start()
}

main().catch(console.error)