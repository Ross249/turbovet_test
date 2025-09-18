import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthPayload } from '@turbovetnx/data';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { AuthenticatedUser } from '../common/authenticated-user.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthPayload> {
    const user = await this.authService.validateCredentials(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthenticatedUser> {
    return user;
  }
}
