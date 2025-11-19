import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SwapVolumeResult {
  origin: string;
  totalVolumeUSD: string;
}

interface LiquidityVolumeResult {
  owner: string;
  totalLiquidityUSD: string;
}

interface PositionResult {
  owner: string;
  liquidity: string;
}

interface VaultPositionResult {
  user: string;
  currentValueUSD: string;
  shares: string;
}

interface AutoWinPositionResult {
  user: string;
  shares: string;
}

interface TokenPriceResult {
  id: string;
  derivedBERA: string;
  symbol: string;
}

interface BundleResult {
  beraPriceUSD: string;
}

interface VaultResult {
  id: string;
  totalValueLockedUSD: string;
  totalSupply: string;
}

interface AutoWinVaultResult {
  id: string;
  stakingToken: string;
}

@Injectable()
export class PonderGraphqlService {
  private readonly logger = new Logger(PonderGraphqlService.name);
  private readonly graphqlUrl: string;

  constructor(private configService: ConfigService) {
    const ponderUrl =
      this.configService.get<string>('PONDER_SQL_URL') ||
      'http://localhost:42069';
    this.graphqlUrl = ponderUrl.replace('/sql', '/graphql');
    this.logger.log(`Ponder GraphQL URL: ${this.graphqlUrl}`);
  }

  private async query<T>(query: string): Promise<T> {
    try {
      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `GraphQL request failed: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();

      if (result.errors) {
        throw new Error(
          `GraphQL errors: ${JSON.stringify(result.errors)}`,
        );
      }

      return result.data;
    } catch (error) {
      this.logger.error('GraphQL query failed:', error);
      throw error;
    }
  }

  /**
   * Get total swap volume per wallet (origin)
   */
  async getSwapVolumeByWallet(): Promise<Map<string, number>> {
    const query = `
      query {
        swaps(limit: 100000) {
          items {
            origin
            amountUSD
          }
        }
      }
    `;

    const data = await this.query<{
      swaps: { items: Array<{ origin: string; amountUSD: string }> };
    }>(query);

    this.logger.log(`Fetched ${data.swaps.items.length} total swaps from Ponder`);

    // Aggregate volumes by wallet
    const volumeMap = new Map<string, number>();
    let totalVolume = 0;
    let swapsWithVolume = 0;

    for (const swap of data.swaps.items) {
      const wallet = swap.origin.toLowerCase();
      const volume = parseFloat(swap.amountUSD || '0');

      if (volume > 0) {
        swapsWithVolume++;
        totalVolume += volume;
      }

      volumeMap.set(wallet, (volumeMap.get(wallet) || 0) + volume);
    }

    this.logger.log(
      `Swap volume stats: ${volumeMap.size} unique wallets, ${swapsWithVolume}/${data.swaps.items.length} swaps with volume > 0, total volume: $${totalVolume.toFixed(2)}`,
    );
    return volumeMap;
  }

  /**
   * Get total liquidity deposit volume per wallet (from mint events)
   */
  async getLiquidityVolumeByWallet(): Promise<Map<string, number>> {
    const query = `
      query {
        mints(orderBy: "owner") {
          items {
            owner
            amountUSD
          }
        }
      }
    `;

    const data = await this.query<{
      mints: { items: Array<{ owner: string; amountUSD: string }> };
    }>(query);

    const volumeMap = new Map<string, number>();
    for (const mint of data.mints.items) {
      const wallet = mint.owner.toLowerCase();
      const volume = parseFloat(mint.amountUSD || '0');
      volumeMap.set(wallet, (volumeMap.get(wallet) || 0) + volume);
    }

    this.logger.log(
      `Fetched liquidity volumes for ${volumeMap.size} unique wallets`,
    );
    return volumeMap;
  }

  /**
   * Get current V3 pool positions (liquidity > 0)
   */
  async getV3PoolPositions(): Promise<Map<string, { count: number; totalUSD: number }>> {
    const query = `
      query {
        positions {
          items {
            owner
            liquidity
            depositedToken0
            depositedToken1
          }
        }
      }
    `;

    const data = await this.query<{
      positions: { items: PositionResult[] };
    }>(query);

    const positionsMap = new Map<string, { count: number; totalUSD: number }>();

    // TODO: We need token prices to calculate USD value
    // For now, we'll just count positions with liquidity > 0
    for (const position of data.positions.items) {
      const liquidity = BigInt(position.liquidity || '0');

      // Skip positions with 0 liquidity
      if (liquidity === 0n) continue;

      const wallet = position.owner.toLowerCase();
      const current = positionsMap.get(wallet) || { count: 0, totalUSD: 0 };
      positionsMap.set(wallet, {
        count: current.count + 1,
        totalUSD: current.totalUSD, // Will be calculated with token prices
      });
    }

    this.logger.log(
      `Fetched V3 positions for ${positionsMap.size} unique wallets`,
    );
    return positionsMap;
  }

  /**
   * Get Sticky Vault positions
   */
  async getStickyVaultPositions(): Promise<Map<string, { count: number; totalUSD: number }>> {
    const query = `
      query {
        vaultUserPositions(where: { shares_not: "0" }) {
          items {
            user
            currentValueUSD
            shares
          }
        }
      }
    `;

    const data = await this.query<{
      vaultUserPositions: { items: VaultPositionResult[] };
    }>(query);

    const positionsMap = new Map<string, { count: number; totalUSD: number }>();

    for (const position of data.vaultUserPositions.items) {
      const wallet = position.user.toLowerCase();
      const shares = parseFloat(position.shares || '0');

      // Skip positions with 0 shares
      if (shares === 0) continue;

      const valueUSD = parseFloat(position.currentValueUSD || '0');
      const current = positionsMap.get(wallet) || { count: 0, totalUSD: 0 };
      positionsMap.set(wallet, {
        count: current.count + 1,
        totalUSD: current.totalUSD + valueUSD,
      });
    }

    this.logger.log(
      `Fetched Sticky Vault positions for ${positionsMap.size} unique wallets`,
    );
    return positionsMap;
  }

  /**
   * Get AutoWin positions
   */
  async getAutoWinPositions(): Promise<Map<string, { count: number; totalUSD: number }>> {
    const query = `
      query {
        autoWinUserPositions(where: { shares_not: "0" }) {
          items {
            user
            shares
          }
        }
      }
    `;

    const data = await this.query<{
      autoWinUserPositions: { items: AutoWinPositionResult[] };
    }>(query);

    const positionsMap = new Map<string, { count: number; totalUSD: number }>();

    // TODO: Calculate USD value from shares * vault TVL
    for (const position of data.autoWinUserPositions.items) {
      const shares = parseFloat(position.shares || '0');

      // Skip positions with 0 shares
      if (shares === 0) continue;

      const wallet = position.user.toLowerCase();
      const current = positionsMap.get(wallet) || { count: 0, totalUSD: 0 };
      positionsMap.set(wallet, {
        count: current.count + 1,
        totalUSD: current.totalUSD, // Will be calculated with vault TVL
      });
    }

    this.logger.log(
      `Fetched AutoWin positions for ${positionsMap.size} unique wallets`,
    );
    return positionsMap;
  }

  /**
   * Get BERA price in USD from bundle
   */
  async getBeraPriceUSD(): Promise<number> {
    const query = `
      query {
        bundles(limit: 1) {
          items {
            beraPriceUSD
          }
        }
      }
    `;

    const data = await this.query<{
      bundles: { items: BundleResult[] };
    }>(query);

    const beraPriceUSD = parseFloat(data.bundles.items[0]?.beraPriceUSD || '0');
    this.logger.log(`BERA price in USD: $${beraPriceUSD}`);
    return beraPriceUSD;
  }

  /**
   * Get all token prices (derivedBERA)
   * Returns a map of token address -> price in USD
   */
  async getTokenPrices(): Promise<Map<string, number>> {
    const query = `
      query {
        tokens {
          items {
            id
            symbol
            derivedBERA
          }
        }
      }
    `;

    const data = await this.query<{
      tokens: { items: TokenPriceResult[] };
    }>(query);

    const beraPriceUSD = await this.getBeraPriceUSD();
    const priceMap = new Map<string, number>();

    for (const token of data.tokens.items) {
      const tokenAddress = token.id.toLowerCase();
      const derivedBERA = parseFloat(token.derivedBERA || '0');
      const priceUSD = derivedBERA * beraPriceUSD;
      priceMap.set(tokenAddress, priceUSD);
    }

    this.logger.log(`Fetched prices for ${priceMap.size} tokens`);
    return priceMap;
  }

  /**
   * Get V3 pool positions with token amounts
   * Now includes deposited amounts to calculate USD value
   */
  async getV3PoolPositionsWithPrices(
    tokenPrices: Map<string, number>,
  ): Promise<Map<string, { count: number; totalUSD: number }>> {
    const query = `
      query {
        positions {
          items {
            owner
            token0
            token1
            liquidity
            depositedToken0
            depositedToken1
            withdrawnToken0
            withdrawnToken1
          }
        }
      }
    `;

    const data = await this.query<{
      positions: {
        items: Array<{
          owner: string;
          token0: string;
          token1: string;
          liquidity: string;
          depositedToken0: string;
          depositedToken1: string;
          withdrawnToken0: string;
          withdrawnToken1: string;
        }>;
      };
    }>(query);

    const positionsMap = new Map<string, { count: number; totalUSD: number }>();

    for (const position of data.positions.items) {
      const liquidity = BigInt(position.liquidity || '0');

      // Skip positions with 0 liquidity
      if (liquidity === 0n) continue;

      const wallet = position.owner.toLowerCase();
      const token0Address = position.token0.toLowerCase();
      const token1Address = position.token1.toLowerCase();

      // Calculate current amounts (deposited - withdrawn)
      const currentToken0 =
        parseFloat(position.depositedToken0 || '0') -
        parseFloat(position.withdrawnToken0 || '0');
      const currentToken1 =
        parseFloat(position.depositedToken1 || '0') -
        parseFloat(position.withdrawnToken1 || '0');

      // Get token prices
      const token0Price = tokenPrices.get(token0Address) || 0;
      const token1Price = tokenPrices.get(token1Address) || 0;

      // Calculate USD value
      const valueUSD =
        currentToken0 * token0Price + currentToken1 * token1Price;

      const current = positionsMap.get(wallet) || { count: 0, totalUSD: 0 };
      positionsMap.set(wallet, {
        count: current.count + 1,
        totalUSD: current.totalUSD + valueUSD,
      });
    }

    this.logger.log(
      `Calculated V3 positions USD value for ${positionsMap.size} unique wallets`,
    );
    return positionsMap;
  }

  /**
   * Get Sticky Vault information (TVL and total supply)
   */
  async getStickyVaultInfo(): Promise<
    Map<string, { tvlUSD: number; totalSupply: number }>
  > {
    const query = `
      query {
        stickyVaults {
          items {
            id
            totalValueLockedUSD
            totalSupply
          }
        }
      }
    `;

    const data = await this.query<{
      stickyVaults: { items: VaultResult[] };
    }>(query);

    const vaultInfo = new Map<
      string,
      { tvlUSD: number; totalSupply: number }
    >();

    for (const vault of data.stickyVaults.items) {
      const vaultAddress = vault.id.toLowerCase();
      vaultInfo.set(vaultAddress, {
        tvlUSD: parseFloat(vault.totalValueLockedUSD || '0'),
        totalSupply: parseFloat(vault.totalSupply || '0'),
      });
    }

    this.logger.log(`Fetched info for ${vaultInfo.size} Sticky Vaults`);
    return vaultInfo;
  }

  /**
   * Get AutoWin vault to Sticky Vault mapping
   */
  async getAutoWinToStickyMapping(): Promise<Map<string, string>> {
    const query = `
      query {
        autoWinVaults {
          items {
            id
            stakingToken
          }
        }
      }
    `;

    const data = await this.query<{
      autoWinVaults: { items: AutoWinVaultResult[] };
    }>(query);

    const mapping = new Map<string, string>();

    for (const autoWin of data.autoWinVaults.items) {
      mapping.set(
        autoWin.id.toLowerCase(),
        autoWin.stakingToken.toLowerCase(),
      );
    }

    this.logger.log(`Mapped ${mapping.size} AutoWin vaults to Sticky Vaults`);
    return mapping;
  }

  /**
   * Get AutoWin positions with USD value calculated from vault TVL
   */
  async getAutoWinPositionsWithPrices(
    stickyVaultInfo: Map<string, { tvlUSD: number; totalSupply: number }>,
    autoWinToSticky: Map<string, string>,
  ): Promise<Map<string, { count: number; totalUSD: number }>> {
    const query = `
      query {
        autoWinUserPositions(where: { shares_not: "0" }) {
          items {
            user
            shares
            autoWinVault {
              id
            }
          }
        }
      }
    `;

    const data = await this.query<{
      autoWinUserPositions: {
        items: Array<{
          user: string;
          shares: string;
          autoWinVault: { id: string };
        }>;
      };
    }>(query);

    const positionsMap = new Map<string, { count: number; totalUSD: number }>();

    for (const position of data.autoWinUserPositions.items) {
      const shares = parseFloat(position.shares || '0');

      // Skip positions with 0 shares
      if (shares === 0) continue;

      const wallet = position.user.toLowerCase();
      const autoWinVault = position.autoWinVault.id.toLowerCase();

      // Get underlying Sticky Vault
      const stickyVault = autoWinToSticky.get(autoWinVault);
      if (!stickyVault) {
        this.logger.warn(
          `No Sticky Vault found for AutoWin vault ${autoWinVault}`,
        );
        continue;
      }

      // Get vault info
      const vaultInfo = stickyVaultInfo.get(stickyVault);
      if (!vaultInfo || vaultInfo.totalSupply === 0) {
        continue;
      }

      // Calculate USD value: shares × (vault TVL / totalSupply)
      const valueUSD = (shares * vaultInfo.tvlUSD) / vaultInfo.totalSupply;

      const current = positionsMap.get(wallet) || { count: 0, totalUSD: 0 };
      positionsMap.set(wallet, {
        count: current.count + 1,
        totalUSD: current.totalUSD + valueUSD,
      });
    }

    this.logger.log(
      `Calculated AutoWin positions USD value for ${positionsMap.size} unique wallets`,
    );
    return positionsMap;
  }

  /**
   * Get all unique wallet addresses that have any activity
   */
  async getAllActiveWallets(): Promise<Set<string>> {
    const wallets = new Set<string>();

    // Get wallets from swaps
    const swapVolumes = await this.getSwapVolumeByWallet();
    swapVolumes.forEach((_, wallet) => wallets.add(wallet));

    // Get wallets from mints
    const liquidityVolumes = await this.getLiquidityVolumeByWallet();
    liquidityVolumes.forEach((_, wallet) => wallets.add(wallet));

    // Get wallets from positions
    const v3Positions = await this.getV3PoolPositions();
    v3Positions.forEach((_, wallet) => wallets.add(wallet));

    const vaultPositions = await this.getStickyVaultPositions();
    vaultPositions.forEach((_, wallet) => wallets.add(wallet));

    const autoWinPositions = await this.getAutoWinPositions();
    autoWinPositions.forEach((_, wallet) => wallets.add(wallet));

    this.logger.log(`Found ${wallets.size} unique active wallets`);
    return wallets;
  }
}
