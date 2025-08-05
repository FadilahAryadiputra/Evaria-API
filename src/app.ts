import cors from 'cors';
import express, {
  Express,
  json,
  NextFunction,
  Request,
  Response,
  urlencoded
} from 'express';
import { PORT } from './config';
import { ApiError } from './utils/api-error';

import "reflect-metadata";
import { AuthRouter } from './modules/auth/auth.router';
import { EventRouter } from './modules/event/event.router';
import { EventTicketRouter } from './modules/event-ticket/event.ticket.router';

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(json());
    this.app.use(urlencoded({ extended: true }));
  }

  private handleError(): void {
    // Not Found Handler
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes('/api/')) {
        res
          .status(404)
          .send(
            'We are sorry, the endpoint you are trying to access could not be found on this server. Please ensure the URL is correct!'
          );
      } else {
        next();
      }
    });

    // Error Handler
    this.app.use(
      (error: any, req: Request, res: Response, next: NextFunction) => {
        console.log(error);
        const statusCode =
          error.statusCode ||
          (error.name === 'TokenExpiredError' ||
          error.name === 'JsonWebTokenError'
            ? 401
            : 500);
        const message =
          error instanceof ApiError || error.isOperational
            ? error.message ||
              error.name === 'TokenExpiredError' ||
              error.name === 'JsonWebTokenError'
            : 'Internal server error. Please try again later!';
        if (req.path.includes('/api/')) {
          res.status(statusCode).json({
            success: false,
            message: message,
          });
        } else {
          next();
        }
      }
    );
  }

  private routes(): void {
    const authRouter = new AuthRouter();
    const eventRouter = new EventRouter();
    const eventTicketRouter = new EventTicketRouter();

    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Purwadhika Student API!`);
    });
    this.app.use('/api/auth', authRouter.getRouter());
    this.app.use('/api/events', eventRouter.getRouter())
    this.app.use('/api/event-tickets', eventTicketRouter.getRouter())
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜ [API] Local:   http://localhost:${PORT}/`);
    });
  }
}
