import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  HttpException,
  UseGuards,
  Request 
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(
        registerDto.email, 
        registerDto.password
      );
    } catch (error) {
      if (error.status === 409) {
        throw new HttpException(
          'Email already exists',
          HttpStatus.CONFLICT
        );
      }
      throw error;
    }
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute for login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(
      refreshTokenDto.userId,
      refreshTokenDto.refreshToken
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req) {
    return this.authService.logout(req.user.userId);
  }
}