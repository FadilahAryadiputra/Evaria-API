import { Organizer, User } from '../../generated/prisma';
import { ApiError } from '../../utils/api-error';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventTicketDTO } from './dto/create-event-ticket.dto';

export class EventTicketService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
  }

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

  getOrganizerEvents = async (authUser: string) => {
    if (!authUser) {
      throw new ApiError('Unauthorized: No user ID found', 401);
    }

    const events = await this.prisma.event.findMany({
      where: { organizerId: authUser },
    });

    return events;
  }
}
