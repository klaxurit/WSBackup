import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DatabaseService } from 'src/database/database.service';
import { PriceSource } from '@repo/db';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenPriceService implements OnModuleInit {
  private readonly logger = new Logger(TokenPriceService.name);
  private readonly graphqlUrl: string;

  constructor(
    private readonly db: DatabaseService,
    private config: ConfigService,
  ) {
    this.graphqlUrl = this.config.get<string>('GRAPHQL_URL') || 'http://localhost:42069/graphql';
  }

  async onModuleInit() {
    // Initialiser les prix au démarrage
    await this.updateTokenPrices();
  }

  /**
   * Met à jour les prix de tous les tokens IN_POOL toutes les minutes
   * Utilise GraphQL pour récupérer les prix USD corrects
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async updateTokenPrices() {
    try {

      // Récupérer tous les tokens IN_POOL
      const tokensInPool = await this.db.token.findMany({
        where: {
          status: 'IN_POOL',
        },
        select: {
          address: true,
          symbol: true,
        },
      });

      if (tokensInPool.length === 0) {
        return;
      }


      // Récupérer les prix depuis GraphQL pour tous les tokens
      const tokenPrices = await this.fetchPricesFromGraphQL(tokensInPool);

      // Sauvegarder les prix en base de données
      await this.saveTokenPricesFromGraphQL(tokenPrices);

    } catch (error) {
    }
  }

  /**
   * Récupère les prix depuis GraphQL pour une liste de tokens
   */
  private async fetchPricesFromGraphQL(tokens: Array<{ address: string; symbol: string }>): Promise<Map<string, number>> {
    const tokenPrices = new Map<string, number>();

    // Requête GraphQL pour récupérer les prix
    const query = `
      query GetTokenPrices($ids: [String!]!) {
        tokens(where: { id_in: $ids }) {
          items {
            id
            tokenDayData(limit: 1, orderBy: "date", orderDirection: "desc") {
              items {
                priceUSD
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            ids: tokens.map(token =>
              token.address === '0x0000000000000000000000000000000000000000'
                ? '0x6969696969696969696969696969696969696969'
                : token.address
            ),
          },
        }),
      });

      if (!response.ok) {
        return tokenPrices;
      }

      const data = await response.json();

      if (data.errors) {
        return tokenPrices;
      }

      // Traiter les résultats
      for (const token of data.data.tokens.items) {
        const priceUSD = token.tokenDayData?.items?.[0]?.priceUSD;
        if (priceUSD && priceUSD > 0) {
          tokenPrices.set(token.id.toLowerCase(), parseFloat(priceUSD));
        }
      }

    } catch (error) {
    }

    return tokenPrices;
  }

  /**
   * Sauvegarde les prix des tokens depuis GraphQL en base de données
   */
  private async saveTokenPricesFromGraphQL(tokenPrices: Map<string, number>) {
    const priceEntries: Array<{
      tokenAddress: string;
      price: number;
      priceSource: PriceSource;
      confidence: number;
      volumeUSD: number;
      createdAt: Date;
    }> = [];

    for (const [tokenAddress, price] of tokenPrices) {
      priceEntries.push({
        tokenAddress: tokenAddress.toLowerCase(),
        price: price,
        priceSource: PriceSource.COINGECKO_FALLBACK, // Utiliser ce source pour GraphQL
        confidence: 1.0,
        volumeUSD: 0, // Pas disponible directement depuis GraphQL
        createdAt: new Date(),
      });
    }

    if (priceEntries.length === 0) {
      return;
    }

    // Sauvegarder en batch
    await this.db.client.tokenPrice.createMany({
      data: priceEntries,
      skipDuplicates: true,
    });

  }

  /**
   * Récupère le prix le plus récent d'un token
   */
  async getLatestTokenPrice(tokenAddress: string): Promise<number | null> {
    try {
      const latestPrice = await this.db.tokenPrice.findFirst({
        where: {
          tokenAddress: tokenAddress.toLowerCase(),
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          price: true,
        },
      });

      return latestPrice?.price || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Récupère les prix les plus récents de plusieurs tokens
   */
  async getLatestTokenPrices(tokenAddresses: string[]): Promise<Record<string, number>> {
    try {
      const latestPrices = await this.db.tokenPrice.findMany({
        where: {
          tokenAddress: {
            in: tokenAddresses.map(addr => addr.toLowerCase()),
          },
          priceSource: 'COINGECKO_FALLBACK', // Utiliser seulement les prix GraphQL
        },
        orderBy: {
          createdAt: 'desc',
        },
        distinct: ['tokenAddress'],
        select: {
          tokenAddress: true,
          price: true,
        },
      });

      // Convertir en objet pour faciliter l'accès
      const priceMap: Record<string, number> = {};
      for (const price of latestPrices) {
        priceMap[price.tokenAddress.toLowerCase()] = price.price;
      }

      // Ajouter le prix BERA natif basé sur WBERA (même prix)
      const wberaAddress = '0x6969696969696969696969696969696969696969';
      if (priceMap[wberaAddress]) {
        priceMap['0x0000000000000000000000000000000000000000'] = priceMap[wberaAddress];
      }

      return priceMap;
    } catch (error) {
      return {};
    }
  }

  /**
   * Force la mise à jour des prix (pour les tests ou mise à jour manuelle)
   */
  async forceUpdatePrices(): Promise<void> {
    await this.updateTokenPrices();
  }

}
