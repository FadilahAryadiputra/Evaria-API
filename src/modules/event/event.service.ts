import { Organizer, Prisma, User } from '../../generated/prisma';
import { ApiError } from '../../utils/api-error';
import { generateSlug } from '../../utils/generate-slug';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventTicketDTO } from '../event-ticket/dto/create-event-ticket.dto';
import { CreateEventDTO } from './dto/create-event.dto';
import { GetEventsDTO } from './dto/get-events.dto';

export class EventService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
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

  createEvent = async (
    body: CreateEventDTO,
    thumbnail: Express.Multer.File,
    authUser: { id: string; role: string }
  ) => {
    if(authUser.role !== 'ORGANIZER') {
      throw new ApiError('Only organizers can create an event', 403);
    }

    const event = await this.prisma.event.findFirst({
      where: { title: body.title },
    });
    if (event) {
      throw new ApiError('Event already exists', 400);
    }

    const slug = generateSlug(body.title);

    const { secure_url } = await this.cloudinaryService.upload(thumbnail);

    await this.prisma.event.create({
      data: {
        ...body,
        thumbnail: secure_url,
        organizerId: authUser.id,
        slug: slug,
      },
    });

    return { message: 'Create event success' };
  };

  createEventTicket = async (
    body: CreateEventTicketDTO,
    authUser: { id: string; role: string }
  ) => {
    if(authUser.role !== 'ORGANIZER') {
      throw new ApiError('Only organizers can create an event', 403);
    }

    const event = await this.prisma.event.findFirst({
      where: { id: body.eventId, organizerId: authUser.id },
    });
    if (!event) {
      throw new ApiError('Event not found or access denied', 404);
    }

    const eventTicket = await this.prisma.eventTicket.findFirst({
      where: { 
        title: body.title,
        eventId: body.eventId
      },
    });
    if (eventTicket) {
      throw new ApiError('Event ticket already exists for this event', 400);
    }

    await this.prisma.eventTicket.create({
      data: {
        ...body,
      },
    });

    return { message: 'Create event ticket success' };
  }

  authSessionLogin = async ({ id }: Pick<User | Organizer, 'id'>) => {
    const [user, organizer] = await Promise.all([
      this.prisma.user.findUnique({ where: { id } }),
      this.prisma.organizer.findUnique({ where: { id } }),
    ]);

    const account = user || organizer;

    if (!account) {
      throw new ApiError('Authentication session login failed', 400);
    }

    return { name: account.username, role: account.role };
  };

  getOrganizerEvents = async (authUser: { id: string }) => {
    if(!authUser.id) {
      throw new ApiError('User not found', 404);
    }
    console.log(authUser)
    console.log(">>>")
    const events = await this.prisma.event.findMany({
      where: { organizerId: authUser.id },
    });

    return events;
  }
}
