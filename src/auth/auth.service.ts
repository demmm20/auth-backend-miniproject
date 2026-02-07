import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(email: string, password: string) {
    const user = await this.usersService.create(email, password);
    const userId = (user as any)._id.toString();
    const tokens = await this.generateTokens(userId, user.email, user.role);
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);

    return {
      user: {
        id: userId,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.validatePassword(user, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = (user as any)._id.toString();
    const tokens = await this.generateTokens(userId, user.email, user.role);
    await this.usersService.updateRefreshToken(userId, tokens.refreshToken);

    return {
      user: {
        id: userId,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.generateTokens((user as any)._id.toString(), user.email, user.role);
    await this.usersService.updateRefreshToken((user as any)._id.toString(), tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = {
      sub: userId,
      email: email,
      role: role,
    };

    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET') || 'default-access-secret';
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || 'default-refresh-secret';
    const accessExpiry = this.configService.get<string>('JWT_ACCESS_EXPIRY') || '15m';
    const refreshExpiry = this.configService.get<string>('JWT_REFRESH_EXPIRY') || '7d';

    // Use type assertion to fix JWT signing compatibility
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload as any, {
        secret: accessSecret,
        expiresIn: accessExpiry as any,
      }),
      this.jwtService.signAsync(payload as any, {
        secret: refreshSecret,
        expiresIn: refreshExpiry as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}