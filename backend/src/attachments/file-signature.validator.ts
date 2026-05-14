import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';

const FILE_SIGNATURES: Record<string, Buffer> = {
  'application/pdf': Buffer.from([0x25, 0x50, 0x44, 0x46]),
  'image/png': Buffer.from([0x89, 0x50, 0x4e, 0x47]),
  'image/jpeg': Buffer.from([0xff, 0xd8, 0xff]),
};

export async function validateFileSignature(
  filePath: string,
  mimeType: string,
) {
  const expectedSignature = FILE_SIGNATURES[mimeType];

  if (!expectedSignature) {
    throw new BadRequestException('Unsupported file type');
  }

  const fileHandle = await fs.open(filePath, 'r');

  try {
    const buffer = Buffer.alloc(expectedSignature.length);

    const { bytesRead } = await fileHandle.read(
      buffer,
      0,
      expectedSignature.length,
      0,
    );

    if (bytesRead < expectedSignature.length) {
      throw new BadRequestException(
        'File is incomplete or corrupted',
      );
    }

    if (!expectedSignature.equals(buffer)) {
      throw new BadRequestException(
        'File signature does not match declared type',
      );
    }
  } finally {
    await fileHandle.close();
  }
}