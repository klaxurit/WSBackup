import { Injectable, Logger } from '@nestjs/common';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { DatabaseService } from 'src/database/database.service';
import { TokenPriceService } from './price.service';
import { zeroAddress, formatUnits } from 'viem';

export interface TokenBalance {
  tokenAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  balanceUSD: number;
  priceUSD: number;
}

export interface UserBalancesResponse {
  walletAddress: string;
  tokens: TokenBalance[];
  totalBalanceUSD: number;
}

@Injectable()
export class TokenBalanceService {
  private readonly logger = new Logger(TokenBalanceService.name);

  constructor(
    private readonly bc: BlockchainService,
    private readonly db: DatabaseService,
    private readonly tokenPriceService: TokenPriceService,
  ) { }

  /**
   * Récupère les balances de tous les tokens IN_POOL pour un utilisateur
   * Utilise Promise.all() pour les appels parallèles
   */
  async getUserTokenBalances(walletAddress: string): Promise<UserBalancesResponse> {
    try {
      this.logger.log(`Fetching balances for wallet: ${walletAddress}`);

      // 1. Récupérer tous les tokens IN_POOL
      const tokensInPool = await this.db.token.findMany({
        where: {
          status: 'IN_POOL',
        },
        select: {
          address: true,
          symbol: true,
          name: true,
          decimals: true,
        },
      });

      // Ajouter BERA natif manuellement (car il n'existe pas dans les pools)
      const beraNative = {
        address: '0x0000000000000000000000000000000000000000',
        symbol: 'BERA',
        name: 'Berachain Token',
        decimals: 18,
      };
      tokensInPool.unshift(beraNative);

      if (tokensInPool.length === 0) {
        this.logger.warn('No tokens IN_POOL found');
        return {
          walletAddress,
          tokens: [],
          totalBalanceUSD: 0,
        };
      }

      this.logger.log(`Found ${tokensInPool.length} tokens IN_POOL to check`);

      // 2. Récupérer les prix des tokens en batch
      const tokenAddresses = tokensInPool.map(token => token.address);
      const tokenPrices = await this.tokenPriceService.getLatestTokenPrices(tokenAddresses);

      // 3. Préparer les appels de balance en parallèle
      const balancePromises = tokensInPool.map(async (token) => {
        try {
          let balance: bigint;

          if (token.address === zeroAddress) {
            // BERA natif
            balance = await this.bc.client.getBalance({
              address: walletAddress as `0x${string}`,
            });
          } else {
            // Token ERC20
            balance = await this.bc.client.readContract({
              address: token.address as `0x${string}`,
              abi: [
                {
                  inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
                  name: 'balanceOf',
                  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
                  stateMutability: 'view',
                  type: 'function',
                },
              ],
              functionName: 'balanceOf',
              args: [walletAddress as `0x${string}`],
            });
          }

          // Convertir la balance en string avec les bonnes décimales
          const balanceString = formatUnits(balance, token.decimals);
          const balanceNumber = parseFloat(balanceString);

          // Récupérer le prix USD
          const priceUSD = tokenPrices[token.address.toLowerCase()] || 0;
          const balanceUSD = balanceNumber * priceUSD;

          return {
            tokenAddress: token.address,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            balance: balanceString,
            balanceUSD,
            priceUSD,
          } as TokenBalance;
        } catch (error) {
          this.logger.warn(`Failed to get balance for token ${token.symbol}:`, error.message);
          return null;
        }
      });

      // 4. Exécuter tous les appels en parallèle
      const balanceResults = await Promise.all(balancePromises);

      // 5. Filtrer les résultats valides et calculer le total
      const validBalances = balanceResults.filter((balance): balance is TokenBalance => balance !== null);
      const totalBalanceUSD = validBalances.reduce((sum, token) => sum + token.balanceUSD, 0);

      this.logger.log(`Retrieved balances for ${validBalances.length}/${tokensInPool.length} tokens`);

      return {
        walletAddress,
        tokens: validBalances,
        totalBalanceUSD,
      };
    } catch (error) {
      this.logger.error('Error fetching user token balances:', error);
      throw error;
    }
  }

  /**
   * Récupère la balance d'un token spécifique pour un utilisateur
   */
  async getUserTokenBalance(walletAddress: string, tokenAddress: string): Promise<TokenBalance | null> {
    try {
      // Récupérer les infos du token
      const token = await this.db.token.findUnique({
        where: { address: tokenAddress.toLowerCase() },
        select: {
          address: true,
          symbol: true,
          name: true,
          decimals: true,
        },
      });

      if (!token) {
        this.logger.warn(`Token not found: ${tokenAddress}`);
        return null;
      }

      // Récupérer la balance
      let balance: bigint;

      if (tokenAddress === zeroAddress) {
        // BERA natif
        balance = await this.bc.client.getBalance({
          address: walletAddress as `0x${string}`,
        });
      } else {
        // Token ERC20
        balance = await this.bc.client.readContract({
          address: tokenAddress as `0x${string}`,
          abi: [
            {
              inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
              name: 'balanceOf',
              outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          functionName: 'balanceOf',
          args: [walletAddress as `0x${string}`],
        });
      }

      // Convertir et calculer
      const balanceString = formatUnits(balance, token.decimals);
      const balanceNumber = parseFloat(balanceString);
      const priceUSD = await this.tokenPriceService.getLatestTokenPrice(tokenAddress);
      const balanceUSD = balanceNumber * (priceUSD || 0);

      return {
        tokenAddress: token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        balance: balanceString,
        balanceUSD,
        priceUSD: priceUSD || 0,
      };
    } catch (error) {
      this.logger.error(`Error fetching balance for token ${tokenAddress}:`, error);
      return null;
    }
  }

  /**
   * Valide une adresse de wallet
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Récupère les balances avec validation d'adresse
   */
  async getUserTokenBalancesSafe(walletAddress: string): Promise<UserBalancesResponse | null> {
    if (!this.isValidAddress(walletAddress)) {
      this.logger.warn(`Invalid wallet address: ${walletAddress}`);
      return null;
    }

    return this.getUserTokenBalances(walletAddress);
  }
}
