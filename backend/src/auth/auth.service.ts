import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  async register(email: string, password: string) {
  const hash = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
      },
    });

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.password, password);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return { message: 'Login successful' };
  }
}
