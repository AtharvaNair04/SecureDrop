import {
  BadRequestException,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt.guard';
import { AttachmentsService } from './attachments.service';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
];

type AuthenticatedUser = {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
};

@Controller('submissions/:id/attachments')
export class AttachmentsController {
  constructor(
    private readonly attachmentsService: AttachmentsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './storage/uploads',
        filename: (_, file, cb) => {
          const extensionMap: Record<string, string> = {
            'application/pdf': '.pdf',
            'image/png': '.png',
            'image/jpeg': '.jpg',
          };

          const ext = extensionMap[file.mimetype];

          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_, file, cb) => {
        console.log('UPLOAD DEBUG:', { originalname: file.originalname, mimetype: file.mimetype, });
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Invalid file type'),
            false,
          );
        }

        cb(null, true);
      },
    }),
  )
  upload(
    @Param('id', new ParseUUIDPipe()) submissionId: string,
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const user = req.user as AuthenticatedUser;

    if (!file) {
      throw new BadRequestException('File required');
    }

    return this.attachmentsService.upload(
      submissionId,
      user.userId,
      file,
    );
  }
}