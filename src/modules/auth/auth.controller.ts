import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  registerUser = async (req: Request, res: Response) => {
    const result = await this.authService.registerUser(req.body);
    res.status(200).send(result);
  };
  
  registerOrganizer = async (req: Request, res: Response) => {
    const result = await this.authService.registerOrganizer(req.body);
    res.status(200).send(result);
  };

  login = async (req: Request, res: Response) => {
    const result = await this.authService.login(req.body);
    res.status(200).send(result);
  };

  authSessionLogin = async (req: Request, res: Response) => {
    const user = res.locals.user;
    console.log(user)
    const sessionData = await this.authService.authSessionLogin({ id: user.id });
    res.status(200).json({
      success: true,
      message: 'Authentication session login successful',
      data: sessionData,
    });
  };
}
