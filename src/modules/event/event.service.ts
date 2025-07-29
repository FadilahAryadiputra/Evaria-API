import { PaginationQueryParams } from '../pagination/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

export class EventService {
  private prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  getEvents = async (query: PaginationQueryParams) => {
    const { take, page, sortBy, sortOrder } = query;

    const events = await this.prisma.event.findMany({
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take: take,
    });

    const total = await this.prisma.event.count();

    return {
      data: events,
      meta: { page, take, total },
    };
  };
}
