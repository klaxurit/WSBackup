#!/usr/bin/env node

import { filterLogs, getAvailableLogFiles } from '../src/utils/log-filter'

async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/filter-logs.ts [options]

Options:
  --event <event>        Filter by event type (factory, swap, mint, etc.)
  --pool <address>       Filter by pool address
  --token <symbol>       Filter by token symbol (searches in token0 and token1)
  --tx <hash>           Filter by transaction hash
  --block <number>      Filter by block number
  --date-from <date>    Filter from date (ISO format)
  --date-to <date>      Filter to date (ISO format)
  --file <path>         Specific log file to search (default: latest indexer log)
  --list-files          List available log files
  --format <format>     Output format: table, json, detailed (default: table)

Examples:
  pnpm filter-logs --event factory --token BERA
  pnpm filter-logs --event swap --pool 0x123... --format json  
  pnpm filter-logs --event swap --format detailed
  pnpm filter-logs --event mint --token USDC --format detailed
  pnpm filter-logs --list-files
    `)
    return
  }

  if (args.includes('--list-files')) {
    const files = await getAvailableLogFiles()
    console.log('Available log files:')
    files.forEach(file => console.log(`  ${file}`))
    return
  }

  const filters: any = {}
  const formatIndex = args.indexOf('--format')
  const format = formatIndex !== -1 && args[formatIndex + 1] 
    ? args[formatIndex + 1] 
    : 'table'

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
      case '--tx':
        filters.txHash = value
        break
      case '--block':
        filters.blockNumber = parseInt(value || '0')
        break
      case '--date-from':
        filters.dateFrom = value
        break
      case '--date-to':
        filters.dateTo = value
        break
    }
  }

  // Determine log file
  const fileIndex = args.indexOf('--file')
  let logFile = fileIndex !== -1 && args[fileIndex + 1] 
    ? args[fileIndex + 1]
    : null

  if (!logFile) {
    const files = await getAvailableLogFiles()
    const indexerFiles = files.filter(f => f.includes('indexer'))
    if (indexerFiles.length === 0) {
      console.log('No log files found. Run the indexer first to generate logs.')
      return
    }
    logFile = indexerFiles.sort().reverse()[0] // Latest file
  }

  try {
    const results = await filterLogs(logFile!, filters)
    
    console.log(`\nSearching in: ${logFile}`)
    console.log(`Filters applied:`, JSON.stringify(filters, null, 2))
    console.log(`Found ${results.length} matching entries\n`)

    if (results.length === 0) {
      console.log('No matching log entries found.')
      return
    }

    if (format === 'json') {
      console.log(JSON.stringify(results, null, 2))
    } else if (format === 'detailed') {
      // Format détaillé avec toutes les données
      results.forEach((log, index) => {
        console.log(`\n--- Log ${index + 1} ---`)
        console.log(`Time: ${log.timestamp}`)
        console.log(`Event: ${log.event}`)
        console.log(`Pool: ${log.pool}`)
        console.log(`Tokens: ${log.token0} / ${log.token1}`)
        console.log(`TX: ${log.txHash}`)
        console.log(`Block: ${log.blockNumber}`)
        
        // Affichage spécifique selon le type d'événement
        if (log.event === 'swap' && log.amounts) {
          console.log(`\nAmounts:`)
          console.log(`  Amount0: ${log.amounts.amount0}`)
          console.log(`  Amount1: ${log.amounts.amount1}`) 
          console.log(`  AmountUSD: ${log.amounts.amountUSD}`)
          
          if (log.prices) {
            console.log(`\nPrices:`)
            console.log(`  BERA Price USD: ${log.prices.beraPriceUSD}`)
            console.log(`  Token0 Price: ${log.prices.token0Price}`)
            console.log(`  Token1 Price: ${log.prices.token1Price}`)
            console.log(`  Sqrt Price: ${log.prices.sqrtPriceX96}`)
          }
          
          if (log.fees) {
            console.log(`\nFees:`)
            console.log(`  Fee BERA: ${log.fees.feeBera}`)
            console.log(`  Fee USD: ${log.fees.feeUSD}`)
            console.log(`  Fee Tier: ${log.fees.feeTier}`)
          }
          
          if (log.volume) {
            console.log(`\nVolume:`)
            console.log(`  USD Tracked: ${log.volume.totalUSDTracked}`)
            console.log(`  BERA Tracked: ${log.volume.totalBeraTracked}`)
            console.log(`  USD Untracked: ${log.volume.totalUSDUntracked}`)
          }
          
          if (log.participants) {
            console.log(`\nParticipants:`)
            console.log(`  Sender: ${log.participants.sender}`)
            console.log(`  Recipient: ${log.participants.recipient}`)
            console.log(`  Origin: ${log.participants.origin}`)
          }
        }
        
        if (log.event === 'mint' && log.amounts) {
          console.log(`\nMint Amounts:`)
          console.log(`  Amount0: ${log.amounts.amount0}`)
          console.log(`  Amount1: ${log.amounts.amount1}`)
          console.log(`  Liquidity: ${log.amounts.liquidity}`)
          console.log(`  AmountUSD: ${log.amounts.amountUSD}`)
          
          if (log.ticks) {
            console.log(`\nTicks:`)
            console.log(`  Lower: ${log.ticks.tickLower}`)
            console.log(`  Upper: ${log.ticks.tickUpper}`)
          }
          
          if (log.tvl) {
            console.log(`\nTVL:`)
            console.log(`  Token0: ${log.tvl.token0}`)
            console.log(`  Token1: ${log.tvl.token1}`)
            console.log(`  Total BERA: ${log.tvl.totalBERA}`)
            console.log(`  Total USD: ${log.tvl.totalUSD}`)
          }
        }
        
        if (log.event === 'factory') {
          console.log(`\nFactory Data:`)
          console.log(`  Pool Address: ${log.poolAddress}`)
          console.log(`  Token0 Symbol: ${log.token0Symbol}`)
          console.log(`  Token1 Symbol: ${log.token1Symbol}`)
          console.log(`  Fee: ${log.fee}`)
          console.log(`  Tick Spacing: ${log.tickSpacing}`)
          console.log(`  Pool Counts - Factory: ${log.factoryPoolCount}, Token0: ${log.token0PoolCount}, Token1: ${log.token1PoolCount}`)
        }
        
        console.log('─'.repeat(50))
      })
    } else {
      // Table format (simplifié)
      const simplified = results.map(log => ({
        timestamp: log.timestamp?.slice(0, 19) || 'N/A',
        event: log.event || 'N/A',
        pool: log.pool?.slice(-8) || 'N/A',
        token0: log.token0Symbol || log.token0?.slice(-8) || 'N/A',
        token1: log.token1Symbol || log.token1?.slice(-8) || 'N/A',
        blockNumber: log.blockNumber || 'N/A'
      }))
      console.table(simplified)
    }
  } catch (error) {
    console.error('Error filtering logs:', error instanceof Error ? error.message : String(error))
  }
}

main().catch(console.error)