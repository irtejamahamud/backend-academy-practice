import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Response } from 'express';
import { Public } from '../../common/auth/decorators.js';
import { PrismaService } from '../../prisma/prisma.service.js';

@ApiTags('Health')
@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('live')
  @ApiOperation({ summary: 'Liveness: the process is up' })
  live(): { status: 'ok' } {
    return { status: 'ok' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness: dependencies are reachable' })
  async ready(@Res({ passthrough: true }) res: Response): Promise<{ status: string; checks: Record<string, string> }> {
    const database = await this.prisma.$queryRaw`SELECT 1`.then(() => 'up').catch(() => 'down');
    const ok = database === 'up';
    if (!ok) res.status(HttpStatus.SERVICE_UNAVAILABLE);
    return { status: ok ? 'ok' : 'degraded', checks: { database } };
  }
}
