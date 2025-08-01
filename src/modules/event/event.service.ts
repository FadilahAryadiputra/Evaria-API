import { Prisma } from '../../generated/prisma';
import { ApiError } from '../../utils/api-error';
import { PrismaService } from '../prisma/prisma.service';
import { GetEventsDTO } from './dto/get-events.dto';

export class EventService {
  private prisma: PrismaService;

  constructor() {
    this.prisma = new PrismaService();
  }

  getEvents = async (query: GetEventsDTO) => {
    const {
      take,
      page,
      sortBy,
      sortOrder,
      search,
      startDate,
      endDate,
      category,
      location,
    } = query;

    const whereClause: Prisma.EventWhereInput = {};

    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' };
    }
    if (location) {
      whereClause.location = location;
    }
    if (category) {
      whereClause.category = category;
    }

    const parsedStartDate = startDate ? new Date(startDate) : undefined;
    const parsedEndDate = endDate ? new Date(endDate) : undefined;

    const isValidDate = (date: any) =>
      date instanceof Date && !isNaN(date.getTime());

    if (isValidDate(parsedStartDate) && isValidDate(parsedEndDate)) {
      whereClause.AND = [
        { startDate: { gte: parsedStartDate } },
        { endDate: { lte: parsedEndDate } },
      ];
    } else if (isValidDate(parsedStartDate)) {
      whereClause.OR = [
        { startDate: { gte: parsedStartDate } },
        { endDate: { gte: parsedStartDate } },
      ];
    } else if (isValidDate(parsedEndDate)) {
      whereClause.OR = [
        { startDate: { lte: parsedEndDate } },
        { endDate: { lte: parsedEndDate } },
      ];
    }

    const events = await this.prisma.event.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take, // offset
      take: take, // limit
      include: { organizer: { omit: { password: true } }, eventTickets: true }, // join to table event
    });

    const total = await this.prisma.event.count({
      where: whereClause,
    });

    return {
      data: events,
      meta: { page, take, total },
    };
  };

  getEventBySlug = async (slug: string) => {
    const event = await this.prisma.event.findFirst({
      where: { slug },
      include: { organizer: { omit: { password: true } }, eventTickets: true }, //join
    });

    if (!event) {
      throw new ApiError('Event not found', 404);
    }

    return event;
  };
}
