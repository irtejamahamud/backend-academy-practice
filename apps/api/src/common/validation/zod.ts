import { applyDecorators, type PipeTransform } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';
import { z, type ZodType } from 'zod';
import { AppException } from '../errors/app-exception.js';

/** Validates and transforms a request part with a shared Zod schema. */
export class ZodValidationPipe<T extends ZodType> implements PipeTransform<unknown, z.output<T>> {
  constructor(private readonly schema: T) {}

  transform(value: unknown): z.output<T> {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new AppException(
        'VALIDATION_FAILED',
        'Request validation failed',
        result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      );
    }
    return result.data;
  }
}

/** Documents a Zod schema as the OpenAPI request body. */
export function ApiZodBody(schema: ZodType): MethodDecorator {
  const jsonSchema = z.toJSONSchema(schema, { target: 'openapi-3.0', io: 'input', unrepresentable: 'any' });
  return applyDecorators(ApiBody({ schema: jsonSchema as Record<string, unknown> }));
}
