import { ApiError } from '../../utils/api-error';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventVoucherDTO } from './dto/create-event-voucher.dto';

export class EventVoucherService {
  private prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  createEventVoucher = async (
    body: CreateEventVoucherDTO,
    authUser: { id: string; role: string }
  ) => {
    if(authUser.role !== 'ORGANIZER') {
      throw new ApiError('Only organizers can create an voucher', 403);
    }

    const event = await this.prisma.event.findFirst({
      where: { id: body.eventId, organizerId: authUser.id },
    });
    if (!event) {
      throw new ApiError('Event not found or access denied', 404);
    }

    const eventVoucher = await this.prisma.voucher.findFirst({
      where: { 
        code: body.code,
        eventId: body.eventId
      },
    });
    if (eventVoucher) {
      throw new ApiError('Voucher code already exists for this event', 400);
    }

    await this.prisma.voucher.create({
      data: {
        ...body,
      }
    })

    return { message: 'Create event voucher success' };
  }
}
