import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SubmissionStatus } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateSubmissionStatusDto } from './dto/update-submission-status.dto';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string | null, dto: CreateSubmissionDto) {
    const isAnonymous = dto.isAnonymous ?? false;

    if (!userId && !isAnonymous) {
      throw new ForbiddenException(
        'Authentication required for non-anonymous submissions',
      );
    }

    const submission = await this.prisma.submission.create({
      data: {
        title: dto.title,
        description: dto.description,
        isAnonymous,
        authorId: userId,
      },
      include: {
        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
    });

    await this.prisma.accessAuditLog.create({
      data: {
        userId,
        action: 'CREATE_SUBMISSION',
        resourceType: 'SUBMISSION',
        resourceId: submission.id,
      },
    });

    return submission;
  }

  async findMine(userId: string) {
    const submissions = await this.prisma.submission.findMany({
      where: {
        authorId: userId,
      },
      include: {
        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    await this.prisma.accessAuditLog.create({
      data: {
        userId,
        action: 'LIST_OWN_SUBMISSIONS',
        resourceType: 'SUBMISSION',
        resourceId: 'MULTIPLE',
      },
    });

    return submissions;
  }

  async findOne(id: string, userId: string) {
    const submission = await this.prisma.submission.findFirst({
      where: {
        id,
        authorId: userId,
      },
      include: {
        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
    });

    if (!submission) {
      await this.prisma.accessAuditLog.create({
        data: {
          userId,
          action: 'DENIED_SUBMISSION_ACCESS',
          resourceType: 'SUBMISSION',
          resourceId: id,
        },
      });

      throw new NotFoundException('Submission not found');
    }

    await this.prisma.accessAuditLog.create({
      data: {
        userId,
        action: 'VIEW_SUBMISSION',
        resourceType: 'SUBMISSION',
        resourceId: id,
      },
    });

    return submission;
  }

  async findAll(userId: string) {
    const submissions = await this.prisma.submission.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
    });

    await this.prisma.accessAuditLog.create({
      data: {
        userId,
        action: 'VIEW_ALL_SUBMISSIONS',
        resourceType: 'SUBMISSION',
        resourceId: 'ALL',
      },
    });

    return submissions.map((submission) => ({
      ...submission,
      author: submission.isAnonymous ? null : submission.author,
    }));
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateSubmissionStatusDto,
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    const updatedSubmission = await this.prisma.submission.update({
      where: { id },
      data: {
        status: dto.status as SubmissionStatus,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            fileSize: true,
            createdAt: true,
          },
        },
      },
    });

    await this.prisma.accessAuditLog.create({
      data: {
        userId,
        action: 'UPDATE_SUBMISSION_STATUS',
        resourceType: 'SUBMISSION',
        resourceId: id,
      },
    });

    return {
      ...updatedSubmission,
      author: updatedSubmission.isAnonymous
        ? null
        : updatedSubmission.author,
    };
  }
}