import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class JsonTokenDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  decimals: number;

  @IsString()
  logoUri: string;

  @IsString()
  coingeckoId: string;

  @IsArray()
  tags: string[];
}
