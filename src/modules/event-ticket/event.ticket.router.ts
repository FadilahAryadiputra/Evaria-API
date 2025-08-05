import { Router } from 'express';
import { JwtMiddleware } from '../../middlewares/jwt.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { EventTicketController } from './event.ticket.controller';
import { CreateEventTicketDTO } from './dto/create-event-ticket.dto';

export class EventTicketRouter {
  private router: Router;
  private eventTicketController: EventTicketController;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.eventTicketController = new EventTicketController();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/create-event-ticket',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      validateBody(CreateEventTicketDTO),
      this.eventTicketController.createEventTicket
    );
    this.router.get(
      '/get-organizer-events',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.eventTicketController.getOrganizerEvents
    );
  }

  getRouter = () => {
    return this.router;
  };
}
