import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UpdateReferralDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_-]{3,20}$/, {
    message: 'Referral code must be 3-20 alphanumeric characters, underscores or hyphens',
  })
  referralCode: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class ReferralResponseDto {
  wallet: string;
  referralCode: string;
}

export class UseReferralDto {
  @IsString()
  @IsNotEmpty()
  referralCode: string;

  @IsString()
  @IsNotEmpty()
  signature: string;
}

export class UseReferralResponseDto {
  wallet: string;
  referredBy: string;
}
