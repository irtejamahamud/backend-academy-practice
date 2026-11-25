import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { RequirePermissions } from '../../common/auth/decorators.js';
import { ZodValidationPipe } from '../../common/validation/zod.js';
import { UsersService } from './users.service.js';

const listQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

@ApiTags('Users')
@ApiCookieAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions('users:read')
  @ApiOperation({ summary: 'List users (admin)' })
  async list(@Query(new ZodValidationPipe(listQuery)) q: z.output<typeof listQuery>) {
    const { items, total } = await this.users.list(q.page, q.pageSize);
    return { items, page: q.page, pageSize: q.pageSize, total };
  }
}
