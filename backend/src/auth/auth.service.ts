import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: true,
                },
              },
            },
          },
        },
      });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.password, password);

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const roles = user.roles.map((ur) => ur.role.name);

    const permissions = user.roles.flatMap((ur) =>
      ur.role.permissions.map((p) => p.name),
    );

    const payload = {
      sub: user.id,
      email: user.email,
      roles,
      permissions,
    };

    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
    };
  }
}