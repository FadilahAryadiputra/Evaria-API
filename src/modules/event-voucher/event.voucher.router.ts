import { Router } from 'express';
import { JwtMiddleware } from '../../middlewares/jwt.middleware';
import { validateBody } from '../../middlewares/validate.middleware';
import { EventVoucherController } from './event.voucher.controller';
import { CreateEventVoucherDTO } from './dto/create-event-voucher.dto';

export class EventVoucherRouter {
  private router: Router;
  private eventVoucherController: EventVoucherController;
  private jwtMiddleware: JwtMiddleware;

  constructor() {
    this.router = Router();
    this.eventVoucherController = new EventVoucherController();
    this.jwtMiddleware = new JwtMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/create-event-voucher',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      validateBody(CreateEventVoucherDTO),
      this.eventVoucherController.createEventVoucher
    );
  }

  getRouter = () => {
    return this.router;
  };
}
