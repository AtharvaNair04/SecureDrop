import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
} from '@nestjs/common';
import sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    return this.sanitize(value);
  }

  private sanitize(value: unknown): unknown {
    if (typeof value === 'string') {
      return sanitizeHtml(value, {
        allowedTags: [],
        allowedAttributes: {},
      });
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.sanitize(item));
    }

    if (typeof value === 'object' && value !== null) {
      const sanitized: Record<string, unknown> = {};

      for (const [key, val] of Object.entries(value)) {
        sanitized[key] = this.sanitize(val);
      }

      return sanitized;
    }

    return value;
  }
}
