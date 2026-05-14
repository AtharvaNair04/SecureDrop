import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

import { JwtAuthGuard } from '../auth/jwt.guard';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';

type AuthenticatedUser = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
};

@Controller('submissions')
export class SubmissionsController {
  constructor(
    private readonly submissionsService: SubmissionsService,
  ) {}

  @UseGuards(OptionalJwtGuard)
  @Post()
  create(
    @Body() dto: CreateSubmissionDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser | undefined;

    return this.submissionsService.create(
      user?.userId ?? null,
      dto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  findMine(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    return this.submissionsService.findMine(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.submissionsService.findOne(
      id,
      user.userId,
    );
  }
}