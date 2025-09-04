import fs from 'fs'
import readline from 'readline'

interface FilterOptions {
  event?: string
  pool?: string
  token?: string
  dateFrom?: string
  dateTo?: string
  txHash?: string
  blockNumber?: number
}

export async function filterLogs(logFile: string, filters: FilterOptions): Promise<any[]> {
  if (!fs.existsSync(logFile)) {
    throw new Error(`Log file not found: ${logFile}`)
  }

  const fileStream = fs.createReadStream(logFile)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  const results: any[] = []
  
  for await (const line of rl) {
    try {
      const log = JSON.parse(line)
      
      // Filtres
      if (filters.event && log.event !== filters.event) continue
      if (filters.pool && log.pool !== filters.pool) continue
      if (filters.token && 
          !log.token0?.toLowerCase().includes(filters.token.toLowerCase()) && 
          !log.token1?.toLowerCase().includes(filters.token.toLowerCase())) continue
      if (filters.txHash && log.txHash !== filters.txHash) continue
      if (filters.dateFrom && log.timestamp < filters.dateFrom) continue
      if (filters.dateTo && log.timestamp > filters.dateTo) continue
      if (filters.blockNumber && log.blockNumber !== filters.blockNumber) continue
      
      results.push(log)
    } catch (e) {
      // Skip malformed lines
      continue
    }
  }
  
  return results
}

export async function getAvailableLogFiles(): Promise<string[]> {
  const logsDir = 'logs'
  if (!fs.existsSync(logsDir)) {
    return []
  }
  
  return fs.readdirSync(logsDir)
    .filter(file => file.endsWith('.log'))
    .map(file => `${logsDir}/${file}`)
}