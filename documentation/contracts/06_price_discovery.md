# Price Discovery - QuoterV2 & TickLens

## Vue d'ensemble

Les mécanismes de découverte de prix permettent d'obtenir des informations sur les prix et la liquidité **sans exécuter de transactions on-chain**. Ces contrats sont essentiels pour les interfaces utilisateur et les systèmes de routing.

### Contrats principaux
- **QuoterV2** (`0x35E02133b7Ee5E4cDE7cb7FF278a19c35d4cd965`) : Quotes de prix pour swaps
- **TickLens** (`0x455CeAc9D0F4c4d1c38e5236FD4115F13409476e`) : Information sur distribution de liquidité

## QuoterV2 - Simulation de swaps

### Principe de fonctionnement

QuoterV2 utilise une technique ingénieuse : il **exécute réellement les swaps** mais **revert avec les résultats**. Cela permet d'obtenir des prix exactes sans modifier l'état.

#### Mécanisme revert-with-data
```solidity
function uniswapV3SwapCallback(
    int256 amount0Delta,
    int256 amount1Delta,
    bytes memory path
) external view override {
    // Calcul des résultats
    (uint256 amountReceived, uint160 sqrtPriceX96After, int24 tickAfter) = ...;
    
    // Revert avec les données encodées
    assembly {
        let ptr := mload(0x40)
        mstore(ptr, amountReceived)
        mstore(add(ptr, 0x20), sqrtPriceX96After) 
        mstore(add(ptr, 0x40), tickAfter)
        revert(ptr, 96)
    }
}
```

### Types de quotes supportées

#### 1. Exact Input Single
```solidity
struct QuoteExactInputSingleParams {
    address tokenIn;
    address tokenOut;
    uint24 fee;
    uint256 amountIn;
    uint160 sqrtPriceLimitX96;
}

function quoteExactInputSingle(QuoteExactInputSingleParams memory params)
    returns (
        uint256 amountOut,
        uint160 sqrtPriceX96After,
        uint32 initializedTicksCrossed,
        uint256 gasEstimate
    )
```

**Usage** : "Si je vends 100 USDC, combien de WETH j'obtiens ?"

#### 2. Exact Output Single  
```solidity
struct QuoteExactOutputSingleParams {
    address tokenIn;
    address tokenOut;
    uint24 fee;
    uint256 amount;           // Amount OUT désiré
    uint160 sqrtPriceLimitX96;
}

function quoteExactOutputSingle(QuoteExactOutputSingleParams memory params)
    returns (
        uint256 amountIn,     // Montant IN requis
        uint160 sqrtPriceX96After,
        uint32 initializedTicksCrossed,
        uint256 gasEstimate
    )
```

**Usage** : "Pour obtenir exactement 1 WETH, combien d'USDC dois-je payer ?"

#### 3. Multi-hop quotes
```solidity
function quoteExactInput(bytes memory path, uint256 amountIn)
    returns (
        uint256 amountOut,
        uint160[] memory sqrtPriceX96AfterList,
        uint32[] memory initializedTicksCrossedList,
        uint256 gasEstimate
    )
```

**Usage** : Routes complexes comme USDC → WETH → DAI

### Informations retournées

#### sqrtPriceX96After
- Prix du pool **après** le swap hypothétique
- Format : `sqrt(price) * 2^96`
- Utile pour visualiser l'impact du swap

#### initializedTicksCrossed
- Nombre de ticks initialisés traversés
- **Estimation du coût gas** : Plus de ticks = plus de gas
- Calculé par `PoolTicksCounter.countInitializedTicksCrossed()`

#### gasEstimate
- Estimation précise du coût gas pour le swap réel
- Calculé en mesurant : `gasBefore - gasAfter` 
- Inclut le gas de tous les hops pour multi-hop

## TickLens - Distribution de liquidité

### Fonctionnalité principale
```solidity
struct PopulatedTick {
    int24 tick;
    int128 liquidityNet;   // Liquidité nette qui s'ajoute/retire
    uint128 liquidityGross; // Liquidité totale à ce tick
}

function getPopulatedTicksInWord(address pool, int16 tickBitmapIndex)
    public view 
    returns (PopulatedTick[] memory populatedTicks)
```

### Compréhension des tick bitmaps

#### Structure des ticks
- Chaque **word** (uint256) couvre 256 ticks consécutifs
- `tickBitmapIndex` détermine quelle range de 256 ticks
- Bit à 1 = tick initialisé (a de la liquidité)

#### Calcul des tick ranges
```solidity
// Pour tickBitmapIndex = 0 :
// Couvre ticks de 0 à 255*tickSpacing

// Pour tickBitmapIndex = -1 :  
// Couvre ticks de -256*tickSpacing à -1*tickSpacing

int24 tickStart = tickBitmapIndex * 256 * tickSpacing;
int24 tickEnd = (tickBitmapIndex + 1) * 256 * tickSpacing - 1;
```

### LiquidityNet vs LiquidityGross

#### LiquidityNet (int128)
- **Positif** : Liquidité ajoutée quand prix traverse ce tick vers la droite
- **Négatif** : Liquidité retirée quand prix traverse ce tick vers la droite
- **Utilisation** : Calcul de la liquidité active à un prix donné

#### LiquidityGross (uint128)  
- **Toujours positif** : Quantité totale de liquidité à ce tick
- **Utilisation** : Estimation des fees de swap (plus de liquidité = moins de slippage)

## Patterns d'utilisation

### 1. Interface de trading - Quote en temps réel
```typescript
async function getSwapQuote(
  tokenIn: string, 
  tokenOut: string,
  amountIn: BigNumber,
  fee: number = 3000
): Promise<SwapQuote> {
  const quoter = new ethers.Contract(QUOTER_V2_ADDRESS, QUOTER_ABI);
  
  try {
    const [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate] = 
      await quoter.callStatic.quoteExactInputSingle({
        tokenIn,
        tokenOut, 
        fee,
        amountIn,
        sqrtPriceLimitX96: 0
      });
    
    return {
      amountOut,
      priceAfter: sqrtPriceX96ToPrice(sqrtPriceX96After, tokenIn, tokenOut),
      gasEstimate,
      priceImpact: calculatePriceImpact(amountIn, amountOut),
      slippage: initializedTicksCrossed * 0.1 // Rough estimation
    };
  } catch (error) {
    throw new Error(`Quote failed: ${error.message}`);
  }
}
```

### 2. Router automatique - Meilleure route
```typescript
async function findBestRoute(
  tokenIn: string,
  tokenOut: string, 
  amountIn: BigNumber
): Promise<Route> {
  const quoter = new ethers.Contract(QUOTER_V2_ADDRESS, QUOTER_ABI);
  
  // Routes possibles
  const routes = [
    encodePath([tokenIn, tokenOut], [500]),   // Direct 0.05%
    encodePath([tokenIn, tokenOut], [3000]),  // Direct 0.3%
    encodePath([tokenIn, WETH, tokenOut], [3000, 3000]), // Via WETH
    encodePath([tokenIn, USDC, tokenOut], [500, 3000]),  // Via USDC
  ];
  
  const quotes = await Promise.allSettled(
    routes.map(async (path) => {
      const [amountOut,, initializedTicksCrossed, gasEstimate] = 
        await quoter.callStatic.quoteExactInput(path, amountIn);
      
      return {
        path,
        amountOut,
        gasEstimate,
        ticksCrossed: initializedTicksCrossed.reduce((a, b) => a + b, 0)
      };
    })
  );
  
  // Sélection de la meilleure route (plus d'output - coût gas)
  return quotes
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value)
    .sort((a, b) => {
      const netA = a.amountOut.sub(a.gasEstimate.mul(gasPrice));
      const netB = b.amountOut.sub(b.gasEstimate.mul(gasPrice));
      return netB.gt(netA) ? 1 : -1;
    })[0];
}
```

### 3. Visualisation de liquidité
```typescript
async function getLiquidityDistribution(
  poolAddress: string,
  currentTick: number,
  range: number = 5000
): Promise<LiquidityChart> {
  const tickLens = new ethers.Contract(TICK_LENS_ADDRESS, TICK_LENS_ABI);
  const pool = new ethers.Contract(poolAddress, POOL_ABI);
  
  const tickSpacing = await pool.tickSpacing();
  
  // Calcul des word indices à requêter
  const startWord = Math.floor((currentTick - range) / (256 * tickSpacing));
  const endWord = Math.ceil((currentTick + range) / (256 * tickSpacing));
  
  const liquidityData = [];
  
  for (let wordIndex = startWord; wordIndex <= endWord; wordIndex++) {
    try {
      const populatedTicks = await tickLens.getPopulatedTicksInWord(
        poolAddress, 
        wordIndex
      );
      
      for (const tickData of populatedTicks) {
        const price = tickToPrice(tickData.tick, token0Decimals, token1Decimals);
        liquidityData.push({
          tick: tickData.tick,
          price,
          liquidityNet: tickData.liquidityNet,
          liquidityGross: tickData.liquidityGross,
          active: tickData.tick <= currentTick
        });
      }
    } catch (error) {
      // Word vide, continuer
      continue;
    }
  }
  
  return {
    currentTick,
    currentPrice: tickToPrice(currentTick, token0Decimals, token1Decimals),
    liquidity: liquidityData.sort((a, b) => a.tick - b.tick)
  };
}
```

### 4. Vault rebalancing - Prix impact check
```typescript
async function checkRebalanceImpact(
  vaultAddress: string,
  newLowerTick: number,
  newUpperTick: number
): Promise<RebalanceAnalysis> {
  const vault = new ethers.Contract(vaultAddress, VAULT_ABI);
  const quoter = new ethers.Contract(QUOTER_V2_ADDRESS, QUOTER_ABI);
  
  // État actuel
  const [amount0, amount1] = await vault.getUnderlyingBalances();
  const currentTick = await vault.pool().then(pool => 
    new ethers.Contract(pool, POOL_ABI).slot0().then(s => s.tick)
  );
  
  // Simulation nouveau dépôt
  const newLiquidity = calculateLiquidityForAmounts(
    currentTick, newLowerTick, newUpperTick, amount0, amount1
  );
  
  const [newAmount0, newAmount1] = calculateAmountsForLiquidity(
    currentTick, newLowerTick, newUpperTick, newLiquidity
  );
  
  // Calcul swap nécessaire
  const excessAmount0 = amount0.sub(newAmount0);
  const excessAmount1 = amount1.sub(newAmount1);
  
  let swapQuote = null;
  if (excessAmount0.gt(0)) {
    // Swap token0 → token1
    [amountOut,, ticks, gas] = await quoter.callStatic.quoteExactInputSingle({
      tokenIn: await vault.token0(),
      tokenOut: await vault.token1(),
      fee: await vault.pool().then(p => new ethers.Contract(p, POOL_ABI).fee()),
      amountIn: excessAmount0,
      sqrtPriceLimitX96: 0
    });
    swapQuote = { direction: 'token0->token1', amountIn: excessAmount0, amountOut, gas };
  }
  
  return {
    currentPosition: { lowerTick: await vault.lowerTick(), upperTick: await vault.upperTick() },
    newPosition: { lowerTick: newLowerTick, upperTick: newUpperTick },
    swapRequired: swapQuote,
    priceImpact: swapQuote ? calculatePriceImpact(swapQuote.amountIn, swapQuote.amountOut) : 0,
    gasCost: swapQuote ? swapQuote.gas : 0
  };
}
```

## Optimisations et bonnes pratiques

### 1. Gestion des erreurs
```typescript
// Les quotes peuvent échouer pour plusieurs raisons
async function safeQuote(params: QuoteParams): Promise<QuoteResult | null> {
  try {
    return await quoter.callStatic.quoteExactInputSingle(params);
  } catch (error) {
    if (error.message.includes('STF')) {
      return null; // Swap To Foundation (pas assez de liquidité)
    }
    if (error.message.includes('TLU')) {
      return null; // Tick Liquidity Underflow  
    }
    throw error; // Autre erreur inattendue
  }
}
```

### 2. Cache intelligent
```typescript
class QuoteCache {
  private cache = new Map<string, CachedQuote>();
  private readonly TTL = 10000; // 10 secondes
  
  async getQuote(tokenIn: string, tokenOut: string, amountIn: BigNumber): Promise<QuoteResult> {
    const key = `${tokenIn}-${tokenOut}-${amountIn.toString()}`;
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.quote;
    }
    
    const quote = await this.fetchQuote(tokenIn, tokenOut, amountIn);
    this.cache.set(key, { quote, timestamp: Date.now() });
    return quote;
  }
}
```

### 3. Estimation gas précise
```typescript
// Le quoter donne une estimation, mais pour le gas réel :
async function getAccurateGasEstimate(swapParams: ExactInputSingleParams): Promise<BigNumber> {
  const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI);
  
  try {
    // Simulation avec estimation gas
    const gasEstimate = await router.estimateGas.exactInputSingle(swapParams);
    
    // Ajout buffer 20% pour fluctuations
    return gasEstimate.mul(120).div(100);
  } catch (error) {
    // Fallback sur quoter si simulation échoue
    const [,,,gasFromQuoter] = await quoter.callStatic.quoteExactInputSingle({
      tokenIn: swapParams.tokenIn,
      tokenOut: swapParams.tokenOut,
      fee: swapParams.fee,
      amountIn: swapParams.amountIn,
      sqrtPriceLimitX96: 0
    });
    return BigNumber.from(gasFromQuoter).mul(130).div(100); // +30% buffer
  }
}
```

## Limitations importantes

### QuoterV2
- **Pas de simulation de liquidité future** : Basé sur l'état actuel
- **Coût gas élevé** : Ne pas utiliser on-chain
- **Paths limités** : Maximum 3-4 hops pratique

### TickLens  
- **Word par word** : Nécessite plusieurs calls pour larges ranges
- **Pas de liquidité active** : Juste positions, pas liquidité réelle
- **Static snapshot** : État au moment de l'appel

Ces outils sont essentiels pour construire des interfaces utilisateur sophistiquées et des systèmes de routing intelligent sur le DEX Winnie.