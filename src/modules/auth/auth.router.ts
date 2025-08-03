import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middlewares/validate.middleware';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';

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
      '/register/user',
      validateBody(RegisterDTO),
      this.authController.registerUser
    );
    this.router.post(
      '/register/organizer',
      validateBody(RegisterDTO),
      this.authController.registerOrganizer
    );
    this.router.post(
      '/login',
      validateBody(LoginDTO),
      this.authController.login
    );
  };

  getRouter = () => {
    return this.router;
  };
}
