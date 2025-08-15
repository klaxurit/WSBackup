import { TokenState } from '@repo/db';
import { IsNotEmpty } from 'class-validator';

export class NewTokenDTO {
  @IsNotEmpty()
  readonly address: `0x${string}`;

  @IsNotEmpty()
  readonly symbol: string;
  @IsNotEmpty()
  readonly name: string;
  @IsNotEmpty()
  readonly decimals: number;

  readonly logoUri: string;
  readonly website: string;
  readonly twitter: string;
  readonly description: string;
  readonly coingeckoId: string;

  readonly totalSupply: string;

  readonly status: TokenState;
  readonly discoveredAt: Date;
  readonly lastEnrichmentAt: Date;
  readonly lastActivityAt: Date;

  readonly isStableCoin: boolean;
  readonly isVerifiedManually: boolean;
  readonly metadata: { [key: string]: any };
}
