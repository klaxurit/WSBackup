# Frontend Integration - Guide développeur

## Vue d'ensemble

Ce guide fournit les patterns, hooks et composants nécessaires pour construire une interface moderne pour le DEX Winnie. Il couvre l'intégration avec tous les systèmes : trading, liquidité, vaults et NFT positions.

## Configuration de base

### Setup providers et contracts

```typescript
// config/contracts.ts
export const CONTRACTS = {
  FACTORY: '0x76fD9D07d5e4D889CAbED96884F15f7ebdcd6B63',
  SWAP_ROUTER: '0x86e02f3D4Cb55974B7EE7E7c98c199e65F9023a4',
  POSITION_MANAGER: '0xEf089afF769bC068520a1A90f0773037eF31fbBC',
  QUOTER_V2: '0x35E02133b7Ee5E4cDE7cb7FF278a19c35d4cd965',
  STICKY_VAULT_FACTORY: '0x18B9ABf2E821E2fE7A08Dc255d5a7e77fFc0b844',
  STICKY_VAULT_ROUTER: '0xbb962d8805e2B4AF087C4702F088Cf9BE9862F30',
  TICK_LENS: '0x455CeAc9D0F4c4d1c38e5236FD4115F13409476e',
  WBERA: '0x6969696969696969696969696969696969696969'
}

// config/providers.ts
export const getProvider = () => {
  return new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_RPC_URL || 'https://bartio.rpc.berachain.com/'
  )
}

export const getContract = (address: string, abi: any, signerOrProvider?: any) => {
  return new ethers.Contract(address, abi, signerOrProvider || getProvider())
}
```

### Context global état

```typescript
// context/DexContext.tsx
interface DexState {
  pools: Pool[]
  positions: Position[]
  vaults: StickyVault[]
  userAddress: string | null
  beraPrice: number
  loading: boolean
}

export const DexContext = createContext<{
  state: DexState
  actions: DexActions
}>()

export const DexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DexState>(initialState)
  
  const actions = {
    refreshPools: async () => {
      // Query subgraph pour pools actifs
      const pools = await fetchPoolsFromSubgraph()
      setState(prev => ({ ...prev, pools }))
    },
    
    refreshUserData: async (userAddress: string) => {
      // Fetch positions utilisateur
      const [positions, vaultBalances] = await Promise.all([
        fetchUserPositions(userAddress),
        fetchUserVaultBalances(userAddress)
      ])
      setState(prev => ({ ...prev, positions, vaultBalances }))
    }
  }
  
  return (
    <DexContext.Provider value={{ state, actions }}>
      {children}
    </DexContext.Provider>
  )
}
```

## Hooks utilitaires

### Hook quotes en temps réel

```typescript
// hooks/useQuotes.ts
export const useSwapQuote = (tokenIn: string, tokenOut: string, amountIn: string, fee: number = 3000) => {
  const [quote, setQuote] = useState<SwapQuote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const debouncedAmountIn = useDebounce(amountIn, 500)
  
  useEffect(() => {
    if (!tokenIn || !tokenOut || !debouncedAmountIn || parseFloat(debouncedAmountIn) === 0) {
      setQuote(null)
      return
    }
    
    const fetchQuote = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const quoter = getContract(CONTRACTS.QUOTER_V2, QuoterV2ABI)
        const amountInWei = parseUnits(debouncedAmountIn, 18) // Adapter selon token
        
        const [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate] = 
          await quoter.callStatic.quoteExactInputSingle({
            tokenIn,
            tokenOut,
            fee,
            amountIn: amountInWei,
            sqrtPriceLimitX96: 0
          })
        
        const priceImpact = calculatePriceImpact(amountInWei, amountOut, tokenIn, tokenOut)
        
        setQuote({
          amountOut: formatUnits(amountOut, 18),
          amountOutWei: amountOut,
          priceImpact,
          gasEstimate: gasEstimate.toNumber(),
          route: [{ tokenIn, tokenOut, fee }]
        })
      } catch (err) {
        console.error('Quote error:', err)
        setError('Unable to get quote')
      } finally {
        setLoading(false)
      }
    }
    
    fetchQuote()
  }, [tokenIn, tokenOut, debouncedAmountIn, fee])
  
  return { quote, loading, error }
}
```

### Hook gestion des positions

```typescript
// hooks/usePositions.ts
export const useUserPositions = (userAddress: string) => {
  const [positions, setPositions] = useState<Position[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (!userAddress) return
    
    const fetchPositions = async () => {
      setLoading(true)
      
      const positionManager = getContract(CONTRACTS.POSITION_MANAGER, PositionManagerABI)
      const balance = await positionManager.balanceOf(userAddress)
      
      const positions: Position[] = []
      
      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await positionManager.tokenOfOwnerByIndex(userAddress, i)
        const position = await positionManager.positions(tokenId)
        
        // Calculer valeur actuelle
        const pool = getContract(position.pool, UniswapV3PoolABI)
        const [slot0] = await pool.slot0()
        
        const currentValueUSD = await calculatePositionValue(
          position,
          slot0.sqrtPriceX96,
          slot0.tick
        )
        
        positions.push({
          tokenId: tokenId.toString(),
          owner: userAddress,
          pool: position.pool,
          token0: position.token0,
          token1: position.token1,
          fee: position.fee,
          tickLower: position.tickLower,
          tickUpper: position.tickUpper,
          liquidity: position.liquidity,
          currentValueUSD,
          inRange: slot0.tick >= position.tickLower && slot0.tick <= position.tickUpper,
          tokensOwed0: position.tokensOwed0,
          tokensOwed1: position.tokensOwed1
        })
      }
      
      setPositions(positions)
      setLoading(false)
    }
    
    fetchPositions()
  }, [userAddress])
  
  return { positions, loading, refreshPositions: () => fetchPositions() }
}
```

### Hook opérations vault

```typescript
// hooks/useVaultOperations.ts
export const useVaultOperations = (vaultAddress: string) => {
  const { library, account } = useWeb3React()
  
  const deposit = async (amount0: string, amount1: string) => {
    if (!library || !account) throw new Error('Wallet not connected')
    
    const router = getContract(CONTRACTS.STICKY_VAULT_ROUTER, StickyVaultRouterABI, library.getSigner())
    const vault = getContract(vaultAddress, StickyVaultABI)
    
    // Get mint amounts
    const [amount0Needed, amount1Needed, mintAmount] = await vault.getMintAmounts(
      parseUnits(amount0, 18),
      parseUnits(amount1, 18)
    )
    
    // Approve tokens if needed
    await ensureApproval(vault.token0(), router.address, amount0Needed, library.getSigner())
    await ensureApproval(vault.token1(), router.address, amount1Needed, library.getSigner())
    
    // Execute deposit
    const tx = await router.addLiquidity(
      vaultAddress,
      parseUnits(amount0, 18),
      parseUnits(amount1, 18),
      amount0Needed.mul(95).div(100), // 5% slippage
      amount1Needed.mul(95).div(100),
      mintAmount.mul(95).div(100),
      account,
      { gasLimit: 500000 }
    )
    
    return tx.wait()
  }
  
  const withdraw = async (shareAmount: string) => {
    if (!library || !account) throw new Error('Wallet not connected')
    
    const router = getContract(CONTRACTS.STICKY_VAULT_ROUTER, StickyVaultRouterABI, library.getSigner())
    const vault = getContract(vaultAddress, StickyVaultABI)
    const shareAmountWei = parseUnits(shareAmount, 18)
    
    // Approve vault tokens to router
    await ensureApproval(vaultAddress, router.address, shareAmountWei, library.getSigner())
    
    // Calculate expected amounts out
    const [amount0, amount1] = await vault.getUnderlyingBalances()
    const totalSupply = await vault.totalSupply()
    const expectedAmount0 = amount0.mul(shareAmountWei).div(totalSupply)
    const expectedAmount1 = amount1.mul(shareAmountWei).div(totalSupply)
    
    const tx = await router.removeLiquidity(
      vaultAddress,
      shareAmountWei,
      expectedAmount0.mul(95).div(100), // 5% slippage
      expectedAmount1.mul(95).div(100),
      account,
      { gasLimit: 300000 }
    )
    
    return tx.wait()
  }
  
  return { deposit, withdraw }
}
```

## Composants UI

### SwapInterface

```typescript
// components/SwapInterface.tsx
export const SwapInterface: React.FC = () => {
  const [tokenIn, setTokenIn] = useState<Token | null>(null)
  const [tokenOut, setTokenOut] = useState<Token | null>(null)
  const [amountIn, setAmountIn] = useState('')
  const [slippage, setSlippage] = useState(0.5)
  
  const { quote, loading } = useSwapQuote(
    tokenIn?.address || '',
    tokenOut?.address || '',
    amountIn
  )
  
  const executeSwap = async () => {
    if (!tokenIn || !tokenOut || !quote) return
    
    const router = getContract(CONTRACTS.SWAP_ROUTER, SwapRouter02ABI, library.getSigner())
    const amountInWei = parseUnits(amountIn, tokenIn.decimals)
    const amountOutMin = quote.amountOutWei.mul(10000 - slippage * 100).div(10000)
    
    const swapParams = {
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      fee: 3000,
      recipient: account,
      amountIn: amountInWei,
      amountOutMinimum: amountOutMin,
      sqrtPriceLimitX96: 0
    }
    
    const tx = await router.exactInputSingle(swapParams, {
      gasLimit: quote.gasEstimate * 1.2
    })
    
    await tx.wait()
    // Refresh balances, etc.
  }
  
  return (
    <div className="swap-interface">
      <TokenSelector 
        token={tokenIn} 
        onSelect={setTokenIn}
        label="From"
      />
      
      <div className="swap-arrow" onClick={() => {
        setTokenIn(tokenOut)
        setTokenOut(tokenIn)
      }}>
        ↓
      </div>
      
      <TokenSelector 
        token={tokenOut}
        onSelect={setTokenOut}
        label="To"
      />
      
      <input
        type="number"
        value={amountIn}
        onChange={e => setAmountIn(e.target.value)}
        placeholder="0.0"
      />
      
      {quote && (
        <div className="quote-info">
          <div>Output: {quote.amountOut}</div>
          <div>Price Impact: {quote.priceImpact}%</div>
          <div>Gas: ~{quote.gasEstimate}</div>
        </div>
      )}
      
      <button 
        onClick={executeSwap}
        disabled={!quote || loading}
      >
        {loading ? 'Getting Quote...' : 'Swap'}
      </button>
    </div>
  )
}
```

### PositionCard

```typescript
// components/PositionCard.tsx
export const PositionCard: React.FC<{ position: Position }> = ({ position }) => {
  const [showDetails, setShowDetails] = useState(false)
  const { collectFees, removeLiquidity } = usePositionOperations(position.tokenId)
  
  const priceRange = useMemo(() => {
    const lowerPrice = tickToPrice(position.tickLower, position.token0, position.token1)
    const upperPrice = tickToPrice(position.tickUpper, position.token0, position.token1)
    return { lowerPrice, upperPrice }
  }, [position])
  
  return (
    <div className={`position-card ${position.inRange ? 'in-range' : 'out-of-range'}`}>
      <div className="position-header">
        <div className="token-pair">
          <TokenIcon token={position.token0} />
          <TokenIcon token={position.token1} />
          <span>{position.token0.symbol}/{position.token1.symbol}</span>
          <span className="fee-tier">{position.fee / 10000}%</span>
        </div>
        
        <div className="range-indicator">
          {position.inRange ? (
            <span className="in-range">● In Range</span>
          ) : (
            <span className="out-of-range">● Out of Range</span>
          )}
        </div>
      </div>
      
      <div className="position-stats">
        <div className="stat">
          <label>Current Value</label>
          <value>${position.currentValueUSD.toFixed(2)}</value>
        </div>
        
        <div className="stat">
          <label>Uncollected Fees</label>
          <value>
            {formatUnits(position.tokensOwed0, position.token0.decimals)} {position.token0.symbol} + 
            {formatUnits(position.tokensOwed1, position.token1.decimals)} {position.token1.symbol}
          </value>
        </div>
      </div>
      
      <div className="price-range">
        <div>Min Price: {priceRange.lowerPrice.toFixed(4)}</div>
        <div>Max Price: {priceRange.upperPrice.toFixed(4)}</div>
      </div>
      
      <div className="position-actions">
        <button 
          onClick={() => collectFees()}
          disabled={position.tokensOwed0.eq(0) && position.tokensOwed1.eq(0)}
        >
          Collect Fees
        </button>
        
        <button onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
        
        <button 
          onClick={() => removeLiquidity(position.liquidity.toString())}
          className="danger"
        >
          Remove Liquidity
        </button>
      </div>
      
      {showDetails && (
        <PositionDetails position={position} />
      )}
    </div>
  )
}
```

### VaultCard

```typescript
// components/VaultCard.tsx
export const VaultCard: React.FC<{ vault: StickyVault }> = ({ vault }) => {
  const [depositModal, setDepositModal] = useState(false)
  const { deposit, withdraw } = useVaultOperations(vault.address)
  
  const apy = useMemo(() => {
    // Calculate APY based on fees earned vs TVL
    return calculateVaultAPY(vault)
  }, [vault])
  
  return (
    <div className="vault-card">
      <div className="vault-header">
        <h3>{vault.name}</h3>
        <div className="vault-tokens">
          <TokenIcon token={vault.token0} />
          <TokenIcon token={vault.token1} />
          <span>{vault.token0.symbol}-{vault.token1.symbol}</span>
        </div>
      </div>
      
      <div className="vault-stats">
        <div className="stat">
          <label>TVL</label>
          <value>${vault.tvlUSD.toFixed(2)}</value>
        </div>
        
        <div className="stat">
          <label>APY</label>
          <value className="apy">{apy.toFixed(2)}%</value>
        </div>
        
        <div className="stat">
          <label>My Balance</label>
          <value>{vault.userBalance?.toFixed(4)} shares</value>
        </div>
      </div>
      
      <div className="price-range-display">
        <div>Current Range:</div>
        <div>
          {tickToPrice(vault.lowerTick, vault.token0, vault.token1).toFixed(4)} - 
          {tickToPrice(vault.upperTick, vault.token0, vault.token1).toFixed(4)}
        </div>
      </div>
      
      <div className="vault-actions">
        <button onClick={() => setDepositModal(true)}>
          Deposit
        </button>
        
        <button 
          onClick={() => withdraw(vault.userBalance?.toString() || '0')}
          disabled={!vault.userBalance || vault.userBalance === 0}
        >
          Withdraw
        </button>
      </div>
      
      {depositModal && (
        <VaultDepositModal
          vault={vault}
          onClose={() => setDepositModal(false)}
          onDeposit={deposit}
        />
      )}
    </div>
  )
}
```

## Fonctions utilitaires

### Conversions prix/ticks

```typescript
// utils/pricing.ts
export const tickToPrice = (tick: number, token0: Token, token1: Token): number => {
  const sqrtPrice = Math.pow(1.0001, tick / 2)
  const price = sqrtPrice * sqrtPrice
  
  // Adjust for token decimals
  const decimalAdjustment = Math.pow(10, token1.decimals - token0.decimals)
  return price * decimalAdjustment
}

export const priceToTick = (price: number, token0: Token, token1: Token): number => {
  const decimalAdjustment = Math.pow(10, token0.decimals - token1.decimals)
  const adjustedPrice = price * decimalAdjustment
  return Math.floor(Math.log(adjustedPrice) / Math.log(1.0001))
}

export const calculatePriceImpact = (
  amountIn: BigNumber,
  amountOut: BigNumber,
  tokenIn: Token,
  tokenOut: Token
): number => {
  // Logic pour calculer price impact basé sur pool state
  // Nécessite accès aux réserves actuelles
  return 0.1 // Placeholder
}
```

### Gestion approvals

```typescript
// utils/approvals.ts
export const ensureApproval = async (
  tokenAddress: string,
  spenderAddress: string,
  amount: BigNumber,
  signer: Signer
): Promise<void> => {
  const tokenContract = getContract(tokenAddress, ERC20ABI, signer)
  const currentAllowance = await tokenContract.allowance(
    await signer.getAddress(),
    spenderAddress
  )
  
  if (currentAllowance.lt(amount)) {
    const approveTx = await tokenContract.approve(spenderAddress, constants.MaxUint256)
    await approveTx.wait()
  }
}

export const checkNeedsApproval = async (
  tokenAddress: string,
  spenderAddress: string,
  amount: BigNumber,
  userAddress: string
): Promise<boolean> => {
  const tokenContract = getContract(tokenAddress, ERC20ABI)
  const allowance = await tokenContract.allowance(userAddress, spenderAddress)
  return allowance.lt(amount)
}
```

### Error handling

```typescript
// utils/errors.ts
export const parseContractError = (error: any): string => {
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Transaction may fail. Please check token balances and approvals.'
  }
  
  if (error.message?.includes('STF')) {
    return 'Insufficient liquidity for this trade.'
  }
  
  if (error.message?.includes('TLU')) {
    return 'Tick liquidity underflow.'
  }
  
  if (error.message?.includes('user rejected')) {
    return 'Transaction was rejected by user.'
  }
  
  return error.message || 'Unknown error occurred'
}
```

## Performance et optimisations

### Memoization des calculs

```typescript
// hooks/useCalculations.ts
export const usePoolCalculations = (pool: Pool) => {
  return useMemo(() => {
    const price = sqrtPriceX96ToPrice(pool.sqrtPrice, pool.token0, pool.token1)
    const tvl = calculatePoolTVL(pool)
    const volume24h = pool.volume24h
    const fees24h = volume24h * (pool.fee / 1000000)
    
    return { price, tvl, volume24h, fees24h }
  }, [pool.sqrtPrice, pool.liquidity, pool.volume24h])
}
```

### Cache intelligent

```typescript
// utils/cache.ts
class QueryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set<T>(key: string, data: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }
}

export const queryCache = new QueryCache()
```

Ce guide fournit une base solide pour construire une interface moderne et performante pour le DEX Winnie, avec tous les patterns nécessaires pour intégrer efficacement tous les systèmes analysés.