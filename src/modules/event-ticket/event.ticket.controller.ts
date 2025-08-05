import { Request, Response } from 'express';
import { EventTicketService } from './event.ticket.service';

export class EventTicketController {
  private eventTicketService: EventTicketService;

  constructor() {
    this.eventTicketService = new EventTicketService();
  }

  createEventTicket = async (req: Request, res: Response) => {
    const authUser = res.locals.user;
    const result = await this.eventTicketService.createEventTicket(req.body, authUser);
    res.status(200).send(result);
  };

  getOrganizerEvents = async (req: Request, res: Response) => {
    const authUser = res.locals.user;
    const result = await this.eventTicketService.getOrganizerEvents(authUser.id);
    res.status(200).send(result);
  };
}
