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
import { UpdateReferralDto, ReferralResponseDto } from './referral.dto';

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
}
