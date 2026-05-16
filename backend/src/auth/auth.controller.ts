import { Controller, Post, Body, Res, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import type { Response } from 'express';
import { PermissionsGuard } from './permissions.guard';
import { Permissions } from './permissions.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.login(
      body.email,
      body.password,
    );

    res.cookie('jwt', access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return { message: 'Login successful' };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('delete-test')
  @Permissions('DELETE_FILE')
  deleteTest() {
    return { message: 'You can delete files' };
  }
}