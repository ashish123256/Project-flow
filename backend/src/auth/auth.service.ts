import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../users/schemas/user.schema';

const COOKIE_NAME = 'access_token';

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto, res: Response) {
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });

    const token = this.signToken(user);

    // Set httpOnly cookie (works in production / same-origin)
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return {
      message: 'Account created successfully',
      data: {
        // Also return token in body so frontend can use Bearer header in dev
        token,
        user: this.sanitizeUser(user),
      },
    };
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.signToken(user);

    // Set httpOnly cookie
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    return {
      message: 'Login successful',
      data: {
        // Also return token in body so frontend can use Bearer header in dev
        token,
        user: this.sanitizeUser(user),
      },
    };
  }

  logout(res: Response) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    return { message: 'Logged out successfully', data: null };
  }

  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      message: 'User profile fetched',
      data: this.sanitizeUser(user),
    };
  }

  private signToken(user: UserDocument): string {
    return this.jwtService.sign({
      sub: user._id.toString(),
      email: user.email,
    });
  }

  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject ? user.toObject() : user;
    const { password, __v, ...rest } = obj as any;
    return { ...rest, id: rest._id?.toString() || rest.id };
  }
}
