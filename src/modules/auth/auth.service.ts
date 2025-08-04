import { Organizer, User } from '../../generated/prisma';
import { ApiError } from '../../utils/api-error';
import { JwtService } from '../jwt/jwt.service';
import { PasswordService } from '../password/password.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDTO } from './dto/login.dto';
import { RegisterDTO } from './dto/register.dto';

export class AuthService {
  private prisma: PrismaService;
  private passwordService: PasswordService;
  private jwtService: JwtService;

  constructor() {
    this.prisma = new PrismaService();
    this.passwordService = new PasswordService();
    this.jwtService = new JwtService();
  }

  private generateUniqueRefCode = async (): Promise<string> => {
    let newCode = '';

    while (true) {
      newCode = Math.floor(100000 + Math.random() * 900000).toString();

      const existingUser = await this.prisma.user.findUnique({
        where: { refCode: newCode },
      });

      if (!existingUser) {
        break;
      }
    }

    return newCode;
  };

  registerUser = async (body: RegisterDTO) => {
    const user = await this.prisma.user.findFirst({
      where: { email: body.email },
    });

    if (user) {
      throw new ApiError('Email already exists', 400);
    }
    
    if (body.refCode) {
      const referrer = await this.prisma.user.findFirst({
        where: {refCode: body.refCode}
      })
      if (!referrer) {
        throw new ApiError('Invalid referral code', 400);
      }
      await this.prisma.user.update({
        where: {id: referrer.id},
        data: {
          point: { increment: 10000 }
        }
      })
    }

    const hashedPassword = await this.passwordService.hashPassword(
      body.password
    );
    
    const newRefCode = await this.generateUniqueRefCode();
    
    return await this.prisma.user.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
        refCode: newRefCode,
      },
      omit: { password: true },
    });
  };

  registerOrganizer = async (body: RegisterDTO) => {
    const organizer = await this.prisma.organizer.findFirst({
      where: {
        OR: [{ username: body.username }, { email: body.email }],
      },
    });

    if (organizer) {
      if (organizer.username === body.username) {
        throw new ApiError('Username already exists', 400);
      }
      if (organizer.email === body.email) {
        throw new ApiError('Email already exists', 400);
      }
      throw new ApiError('Organizer already exists', 400);
    }

    const hashedPassword = await this.passwordService.hashPassword(
      body.password
    );

    return await this.prisma.organizer.create({
      data: {
        username: body.username,
        email: body.email,
        password: hashedPassword,
      },
      omit: { password: true },
    });
  };

  login = async (body: LoginDTO) => {
    const [organizer, user] = await Promise.all([
      this.prisma.organizer.findFirst({ where: { email: body.email } }),
      this.prisma.user.findFirst({ where: { email: body.email } }),
    ]);

    const account = organizer || user;

    if (!account) {
      throw new ApiError('User not found', 400);
    }
    const isPasswordValid = await this.passwordService.comparePassword(
      body.password,
      account.password
    );

    if (!isPasswordValid) {
      throw new ApiError('Invalid password', 400);
    }

    const payload = { id: account.id, role: account.role };

    const accessToken = this.jwtService.generateToken(
      payload,
      process.env.JWT_SECRET_KEY!,
      { expiresIn: '2h' }
    );

    const { password, ...userWithouthPassword } = account;

    return { ...userWithouthPassword, accessToken };
  };

  authSessionLogin = async ({ id }: Pick<User | Organizer, 'id'>) => {
    const [user, organizer] = await Promise.all([
      this.prisma.user.findUnique({ where: { id } }),
      this.prisma.organizer.findUnique({ where: { id } }),
    ]);

    const account = user || organizer;

    if (!account) {
      throw new ApiError('Authentication session login failed', 400);
    }

    return { name: account.username, role: account.role };
  };
}
