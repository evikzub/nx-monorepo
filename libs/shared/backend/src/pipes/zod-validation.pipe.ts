import { PipeTransform, BadRequestException, Logger } from '@nestjs/common';
import { ZodError, ZodSchema } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  private readonly logger = new Logger('ZodValidationPipe');
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      this.logger.debug('Validation error', error);
      throw new BadRequestException('Validation failed', {
        cause: error,
        description: error instanceof ZodError ? error.errors.toString() : 'undefined',
      });
    }
  }
} 