import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionStatusDto } from './dto/update-submission-status.dto';

import { JwtAuthGuard } from '../auth/jwt.guard';
import { OptionalJwtGuard } from '../auth/optional-jwt.guard';
import { PermissionsGuard } from '../auth/permissions.guard';
import { Permissions } from '../auth/permissions.decorator';

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

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('VIEW_SUBMISSIONS')
  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;

    return this.submissionsService.findAll(user.userId);
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

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('UPDATE_SUBMISSION_STATUS')
  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSubmissionStatusDto,
    @Req() req: Request,
  ) {
    const user = req.user as AuthenticatedUser;

    return this.submissionsService.updateStatus(
      id,
      user.userId,
      dto,
    );
  }
}