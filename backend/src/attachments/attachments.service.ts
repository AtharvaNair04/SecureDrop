import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

import { PrismaService } from '../prisma/prisma.service';
import { validateFileSignature } from './file-signature.validator';

@Injectable()
export class AttachmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async upload(
    submissionId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    let shouldCleanup = true;

    try {
      const submission = await this.prisma.submission.findUnique({
        where: { id: submissionId },
      });

      if (!submission) {
        throw new NotFoundException('Submission not found');
      }

      if (submission.authorId !== userId) {
        throw new ForbiddenException('You do not own this submission');
      }

      await validateFileSignature(file.path, file.mimetype);

      const fileBuffer = await fs.readFile(file.path);

      const sha256Hash = createHash('sha256')
        .update(fileBuffer)
        .digest('hex');

      const attachment = await this.prisma.$transaction(async (tx) => {
        const createdAttachment = await tx.attachment.create({
          data: {
            originalName: file.originalname,
            storedName: file.filename,
            mimeType: file.mimetype,
            fileSize: file.size,
            storagePath: file.path,
            sha256Hash,
            submissionId,
          },
        });

        await tx.accessAuditLog.create({
          data: {
            userId,
            action: 'UPLOAD_ATTACHMENT',
            resourceType: 'ATTACHMENT',
            resourceId: createdAttachment.id,
          },
        });

        return createdAttachment;
      });

      shouldCleanup = false;

      return {
        id: attachment.id,
        originalName: attachment.originalName,
        mimeType: attachment.mimeType,
        fileSize: attachment.fileSize,
        sha256Hash: attachment.sha256Hash,
        submissionId: attachment.submissionId,
        createdAt: attachment.createdAt,
      };
    } catch (err) {
      if (shouldCleanup) {
        await fs.unlink(file.path).catch(() => {});
      }

      if (
        err instanceof ForbiddenException ||
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      throw new InternalServerErrorException('Attachment upload failed');
    }
  }

  async download(
    attachmentId: string,
    user: {
      userId: string;
      roles: string[];
      permissions: string[];
    },
  ) {
    const attachment =
      await this.prisma.attachment.findUnique({
        where: { id: attachmentId },
      });

    if (!attachment) {
      throw new NotFoundException(
        'Attachment not found',
      );
    }

    const uploadsRoot = path.resolve(
      'storage/uploads',
    );

    const resolvedPath = path.resolve(
      attachment.storagePath,
    );

    if (!resolvedPath.startsWith(uploadsRoot)) {
      throw new ForbiddenException(
        'Invalid attachment path',
      );
    }

    try {
      await fs.access(resolvedPath);
    } catch {
      throw new NotFoundException(
        'Attachment file missing',
      );
    }

    await this.prisma.accessAuditLog.create({
      data: {
        userId: user.userId,
        action: 'DOWNLOAD_ATTACHMENT',
        resourceType: 'ATTACHMENT',
        resourceId: attachment.id,
      },
    });

    return {
      ...attachment,
      storagePath: resolvedPath,
    };
  }

  async deleteAttachment(
    submissionId: string,
    attachmentId: string,
    userId: string,
  ) {
    const attachment = await this.prisma.attachment.findFirst({
      where: {
        id: attachmentId,
        submissionId,
      },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const uploadsRoot = path.resolve('storage/uploads');
    const resolvedPath = path.resolve(attachment.storagePath);

    if (!resolvedPath.startsWith(uploadsRoot)) {
      throw new ForbiddenException('Invalid attachment path');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.attachment.delete({
        where: {
          id: attachment.id,
        },
      });

      await tx.accessAuditLog.create({
        data: {
          userId,
          action: 'DELETE_ATTACHMENT',
          resourceType: 'ATTACHMENT',
          resourceId: attachment.id,
        },
      });
    });

    await fs.unlink(resolvedPath).catch(() => {});

    return {
      message: 'Attachment deleted successfully',
      attachmentId: attachment.id,
    };
  }
}