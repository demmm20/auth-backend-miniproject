import { 
  Controller, 
  Get, 
  UseGuards, 
  Request,
  ForbiddenException 
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    
    if (!user) {
      return { 
        statusCode: 404,
        message: 'User not found' 
      };
    }

    return {
      id: (user as any)._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async getAllUsers(@Request() req) {
    // Only admin can access this
    const users = await this.usersService.findAll();
    return {
      count: users.length,
      users: users.map(user => ({
        id: (user as any)._id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }))
    };
  }
}