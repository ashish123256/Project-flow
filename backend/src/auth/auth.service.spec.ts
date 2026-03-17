import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Response } from 'express';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

const mockRes = {
  cookie: jest.fn(),
  clearCookie: jest.fn(),
} as unknown as Response;

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
  findById: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user, set cookie, and return token in body', async () => {
      const dto = { name: 'Test User', email: 'test@example.com', password: 'Test@123' };
      const mockUser = {
        _id: 'user-id-123',
        name: dto.name,
        email: dto.email,
        toObject: () => ({ _id: 'user-id-123', name: dto.name, email: dto.email }),
      };

      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await authService.register(dto, mockRes);

      expect(result.data.token).toBe('mock-jwt-token');
      expect(result.data.user.email).toBe(dto.email);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token', 'mock-jwt-token',
        expect.objectContaining({ httpOnly: true }),
      );
    });
  });

  describe('login', () => {
    it('should login, set cookie, and return token in body', async () => {
      const dto = { email: 'test@example.com', password: 'Test@123' };
      const mockUser = {
        _id: 'user-id-123',
        name: 'Test User',
        email: dto.email,
        password: 'hashed',
        toObject: () => ({ _id: 'user-id-123', name: 'Test User', email: dto.email }),
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login(dto, mockRes);

      expect(result.data.token).toBe('mock-jwt-token');
      expect(result.data.user.email).toBe(dto.email);
      expect(mockRes.cookie).toHaveBeenCalledWith(
        'access_token', 'mock-jwt-token',
        expect.objectContaining({ httpOnly: true }),
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ password: 'hashed', toObject: () => ({}) });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ email: 'test@example.com', password: 'wrong' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'none@x.com', password: 'pass' }, mockRes),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should clear the access_token cookie', () => {
      const result = authService.logout(mockRes);
      expect(mockRes.clearCookie).toHaveBeenCalledWith(
        'access_token',
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result.message).toBe('Logged out successfully');
    });
  });
});
