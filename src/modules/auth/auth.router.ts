import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middlewares/validate.middleware';
import { RegisterDTO } from './dto/register.dto';

export class AuthRouter {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initializedRoutes();
  }

  private initializedRoutes = () => {
    this.router.post(
      '/register',
      validateBody(RegisterDTO),
      this.authController.register
    );
  };

  getRouter = () => {
    return this.router;
  };
}
