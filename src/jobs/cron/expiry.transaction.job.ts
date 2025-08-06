import { addMinutes } from 'date-fns';
import { ApiError } from '../../utils/api-error';
import { PrismaService } from '../../modules/prisma/prisma.service';

export class expiryTransactionJob {
  private prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  expiryTransactionSchedul = async () => {
    const updatedTransaction = await this.prisma.transaction.updateMany({
    where: {
      status: 'WAITING_FOR_PAYMENT',
      expiredAt: {
        lte: new Date(),
      },
    },
    data: {
      status: 'EXPIRED',
    },
  });

  console.log(`[⌚ CRON] ${updatedTransaction.count} has been expiry 💸`)
  }
}
