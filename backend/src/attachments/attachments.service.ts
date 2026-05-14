import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import * as fs from 'fs/promises';

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
}