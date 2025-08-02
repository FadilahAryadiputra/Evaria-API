import { Router } from 'express';
import { EventController } from './event.controller';
import { UploaderMiddleware } from '../../middlewares/uploader.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { CreateEventDTO } from './dto/create-event.dto';
import { JwtMiddleware } from '../../middlewares/jwt.middleware';

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
  }

  getRouter = () => {
    return this.router;
  };
}
