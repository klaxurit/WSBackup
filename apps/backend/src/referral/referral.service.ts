import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { randomUUID } from 'crypto';
import { verifyMessage } from 'viem';

@Injectable()
export class ReferralService {
  constructor(private readonly db: DatabaseService) {}

  async getReferral(wallet: string): Promise<{ wallet: string; referralCode: string }> {
    const normalizedWallet = wallet.toLowerCase();

    let entry = await this.db.leaderboardEntry.findUnique({
      where: { wallet: normalizedWallet },
    });

    if (!entry) {
      // Create entry with generated referral code
      const referralCode = randomUUID().slice(0, 8);
      entry = await this.db.leaderboardEntry.create({
        data: {
          id: normalizedWallet,
          wallet: normalizedWallet,
          referralCode,
          rank: 0,
        },
      });
    } else if (!entry.referralCode) {
      // Generate referral code if missing
      const referralCode = randomUUID().slice(0, 8);
      entry = await this.db.leaderboardEntry.update({
        where: { wallet: normalizedWallet },
        data: { referralCode },
      });
    }

    return {
      wallet: entry.wallet,
      referralCode: entry.referralCode!,
    };
  }

  async updateReferral(
    wallet: string,
    newCode: string,
    signature: string,
  ): Promise<{ wallet: string; referralCode: string }> {
    const normalizedWallet = wallet.toLowerCase() as `0x${string}`;

    // Verify signature
    const message = newCode;
    let isValid = false;
    try {
      isValid = await verifyMessage({
        address: normalizedWallet,
        message,
        signature: signature as `0x${string}`,
      });
    } catch {
      throw new BadRequestException('Invalid signature format');
    }

    if (!isValid) {
      throw new BadRequestException('Signature verification failed');
    }

    // Check if code already exists
    const existing = await this.db.leaderboardEntry.findUnique({
      where: { referralCode: newCode },
    });

    if (existing && existing.wallet !== normalizedWallet) {
      throw new ConflictException('Referral code already taken');
    }

    // Upsert the entry
    const entry = await this.db.leaderboardEntry.upsert({
      where: { wallet: normalizedWallet },
      update: { referralCode: newCode },
      create: {
        id: normalizedWallet,
        wallet: normalizedWallet,
        referralCode: newCode,
        rank: 0,
      },
    });

    return {
      wallet: entry.wallet,
      referralCode: entry.referralCode!,
    };
  }
}
