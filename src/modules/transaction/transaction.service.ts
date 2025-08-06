import { addMinutes } from 'date-fns';
import { ApiError } from '../../utils/api-error';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionDTO } from './dto/create-transaction.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { GetTransactionsDTO } from './dto/get-transactions.dto';
import { Prisma } from '../../generated/prisma';

export class TransactionService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

  getTransactionsByUser = async (
    query: GetTransactionsDTO,
    authUser: {
      id: string;
      role: string;
    }
  ) => {
    if (authUser.role !== 'USER') {
      throw new ApiError('Only user can use this endpoint', 403);
    }

    const { take, page, sortBy, sortOrder, search } = query;

    const whereClause: Prisma.TransactionWhereInput = {
      userId: authUser.id,
    };

    if (search) {
      whereClause.eventId = { contains: search, mode: 'insensitive' };
    }

    const transaction = await this.prisma.transaction.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take, // offset
      take: take, // limit
      include: {
        event: true,
        eventTicket: true,
      },
    });

    const total = await this.prisma.transaction.count({
      where: whereClause,
    });

    return {
      data: transaction,
      meta: { page, take, total },
    };
  };

  createTransaction = async (
    body: CreateTransactionDTO,
    authUser: { id: string; role: string }
  ) => {
    if (authUser.role !== 'USER') {
      throw new ApiError('Only user can create a transaction', 403);
    }

    const eventTicket = await this.prisma.eventTicket.findFirst({
      where: { id: body.eventTicketId },
    });

    if (!eventTicket) {
      throw new ApiError(
        `Event ticket with id ${body.eventTicketId} not found`,
        404
      );
    }

    const event = await this.prisma.event.findFirst({
      where: { id: eventTicket?.eventId },
    });

    if (!event?.id) {
      throw new Error('Event ID is required');
    }

    await this.prisma.transaction.create({
      data: {
        quantity: body.quantity,
        pointUsed: body.pointUsed,
        totalPrice: body.quantity * eventTicket?.price - (body.pointUsed || 0),
        expiredAt: addMinutes(new Date(), 120),
        userId: authUser.id,
        eventId: event?.id,
        eventTicketId: eventTicket?.id,
      },
    });

    return { message: 'Transaction created successfully' };
  };

  getTransactionById = async (transactionId: string) => {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId },
      include: {
        user: true,
        event: {
          include: {
            organizer: true,
          },
        },
        eventTicket: true,
      },
    });

    if (!transaction) throw new ApiError('Transaction not found', 404);

    return transaction;
  };

  payTransaction = async (transactionId: string) => {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new ApiError('Transaction not found', 404);
    }

    if (transaction.expiredAt < new Date()) {
      throw new ApiError('Transaction is expired', 400);
    }

    if (transaction.status === 'EXPIRED') {
      throw new ApiError('Transaction is expired', 400);
    }

    if (transaction.status !== 'WAITING_FOR_PAYMENT') {
      throw new ApiError('Transaction is not waiting for payment', 400);
    }

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'WAITING_FOR_CONFIRMATION',
        updatedAt: new Date(),
      },
    });

    return { message: 'Transaction paid successfully' };
  };

  uploadPaymentProof = async (
    transactionId: string,
    authUser: { id: string; role: string },
    file: Express.Multer.File
  ) => {
    const { secure_url } = await this.cloudinaryService.upload(file);

    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId },
    });

    if (!transaction) throw new ApiError('Transaction not found', 404);
    if (transaction?.userId !== authUser.id)
      throw new ApiError('Access denied', 403);
    if (transaction.status === 'EXPIRED')
      throw new ApiError('Transaction is expired', 400);
    if (transaction.status !== 'WAITING_FOR_PAYMENT')
      throw new ApiError('Transaction is not waiting for payment', 400);

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentProof: secure_url,
        status: 'WAITING_FOR_CONFIRMATION',
        updatedAt: new Date(),
      },
    });

    return { message: 'Upload payment proof success' };
  };

  getOrganizerEvents = async (authUser: string) => {
    if (!authUser) {
      throw new ApiError('Unauthorized: No user ID found', 401);
    }

    const events = await this.prisma.event.findMany({
      where: { organizerId: authUser },
    });

    return events;
  };

  getPendingTransactionsByOrganizer = async (authUser: {
    id: string;
    role: string;
  }) => {
    if (authUser.role !== 'ORGANIZER') {
      throw new ApiError('Only organizer can use this endpoint', 403);
    }

    const transaction = await this.prisma.transaction.findMany({
      where: {
        status: 'WAITING_FOR_CONFIRMATION',
        event: { organizerId: authUser.id },
      },
      include: {
        user: true,
        event: true,
        eventTicket: true,
        voucher: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return transaction;
  };

  acceptTransaction = async (transactionId: string) => {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new ApiError('Transaction not found', 404);
    }

    if (transaction.status !== 'WAITING_FOR_CONFIRMATION') {
      throw new ApiError('Transaction is not waiting for confirmation', 400);
    }

    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'DONE',
        updatedAt: new Date(),
      },
    });

    return { message: 'Transaction accepted successfully' };
  };
}
