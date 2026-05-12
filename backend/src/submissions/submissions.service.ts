import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

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
        authorId: userId, // retain ownership internally
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
        resourceType: 'Submission',
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
        resourceType: 'Submission',
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
          resourceType: 'Submission',
          resourceId: id,
        },
      });

      throw new NotFoundException('Submission not found');
    }

    await this.prisma.accessAuditLog.create({
      data: {
        userId,
        action: 'VIEW_SUBMISSION',
        resourceType: 'Submission',
        resourceId: id,
      },
    });

    return submission;
  }
}