import { Router } from 'express';
import { EventController } from './event.controller';
import { UploaderMiddleware } from '../../middlewares/uploader.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { CreateEventDTO } from './dto/create-event.dto';
import { JwtMiddleware } from '../../middlewares/jwt.middleware';
import { CreateEventTicketDTO } from '../event-ticket/dto/create-event-ticket.dto';

export class EventRouter {
  private router: Router;
  private eventController: EventController;
  private uploaderMiddleware: UploaderMiddleware;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.eventController = new EventController();
    this.uploaderMiddleware = new UploaderMiddleware();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.eventController.getEvents);
    this.router.get('/:slug', this.eventController.getEventBySlug);
    this.router.post(
      '/',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.uploaderMiddleware
        .upload()
        .fields([{ name: 'thumbnail', maxCount: 1 }]),
      validateBody(CreateEventDTO),
      this.eventController.createEvent
    );
    this.router.post(
      '/create-event-ticket',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      validateBody(CreateEventTicketDTO),
      this.eventController.createEventTicket
    );
    this.router.get(
      '/get-organizer-events',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.eventController.getOrganizerEvents
    )
    this.router.get(
      '/session-login',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.eventController.authSessionLogin
    )
  }

  getRouter = () => {
    return this.router;
  };
}
