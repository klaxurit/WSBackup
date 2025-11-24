import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ReferralService } from './referral.service';
import { UpdateReferralDto, ReferralResponseDto, UseReferralDto, UseReferralResponseDto, ReferralCountResponseDto } from './referral.dto';

@Controller('referral')
export class ReferralController {
  constructor(private readonly referralService: ReferralService) {}

  @Get(':wallet')
  @HttpCode(HttpStatus.OK)
  async getReferral(@Param('wallet') wallet: string): Promise<ReferralResponseDto> {
    return this.referralService.getReferral(wallet);
  }

  @Post(':wallet')
  @HttpCode(HttpStatus.OK)
  async updateReferral(
    @Param('wallet') wallet: string,
    @Body() dto: UpdateReferralDto,
  ): Promise<ReferralResponseDto> {
    return this.referralService.updateReferral(
      wallet,
      dto.referralCode,
      dto.signature,
    );
  }

  @Post(':wallet/use')
  @HttpCode(HttpStatus.OK)
  async useReferralCode(
    @Param('wallet') wallet: string,
    @Body() dto: UseReferralDto,
  ): Promise<UseReferralResponseDto> {
    return this.referralService.useReferralCode(
      wallet,
      dto.referralCode,
      dto.signature,
    );
  }

  @Get('count/:referralCode')
  @HttpCode(HttpStatus.OK)
  async getReferralCount(
    @Param('referralCode') referralCode: string,
  ): Promise<ReferralCountResponseDto> {
    return this.referralService.getReferralCount(referralCode);
  }
}
