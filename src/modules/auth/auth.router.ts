import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateBody } from '../../middlewares/validate.middleware';
import { RegisterDTO } from './dto/register.dto';
import { LoginDTO } from './dto/login.dto';
import { verify } from 'crypto';
import { JwtMiddleware } from '../../middlewares/jwt.middleware';

export class AuthRouter {
  private router: Router;
  private authController: AuthController;
  private jwtMiddleware: JwtMiddleware

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.jwtMiddleware = new JwtMiddleware();
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
    this.router.get(
      '/session-login',
      this.jwtMiddleware.verifyToken(process.env.JWT_SECRET_KEY!),
      this.authController.authSessionLogin
    )
  };

  getRouter = () => {
    return this.router;
  };
}
