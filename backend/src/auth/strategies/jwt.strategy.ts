import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      // Try cookie first, then fall back to Authorization Bearer header
      // Cookie works in production (Vercel → Render cross-origin)
      // Bearer works in development (Vite proxy doesn't forward Set-Cookie properly)
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Extractor 1: httpOnly cookie
        (request: Request) => {
          return request?.cookies?.access_token ?? null;
        },
        // Extractor 2: Authorization: Bearer <token>  (dev fallback)
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JwtStrategy.validate payload:', payload);
    const user = await this.usersService.findById(payload.sub);
    console.log('JwtStrategy.validate found user:', Boolean(user), user?._id || user?.id);
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }
    return user;
  }
}
