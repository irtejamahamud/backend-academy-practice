import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { ENV } from './config/config.module.js';
import type { Env } from './config/env.js';

export const API_PREFIX = 'api/v1';

/** Shared by main.ts and the e2e tests so both run the exact same HTTP pipeline. */
export function setupApp(app: NestExpressApplication): Env {
  const env = app.get<Env>(ENV);

  app.useLogger(app.get(Logger));
  app.set('trust proxy', env.TRUST_PROXY ? 1 : false);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: new URL(env.WEB_ORIGIN).origin, credentials: true });
  app.setGlobalPrefix(API_PREFIX);
  app.enableShutdownHooks();

  if (env.SWAGGER_ENABLED) setupSwagger(app);
  return env;
}

function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Backend Academy API')
    .setDescription('REST API for the Backend Academy learning platform.')
    .setVersion('1.0')
    .addCookieAuth('ba_at')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, () => SwaggerModule.createDocument(app, config));
}
