import { IsEnum } from 'class-validator';
import { SubmissionStatus } from '@prisma/client';

export class UpdateSubmissionStatusDto {
  @IsEnum(SubmissionStatus)
  status: SubmissionStatus;
}