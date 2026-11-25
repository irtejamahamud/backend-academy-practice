import 'reflect-metadata';
import { config } from 'dotenv';

// Prefer an explicit test env; fall back to the dev .env for local runs.
config({ path: '.env.test', quiet: true });
config({ path: '.env', quiet: true });
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'silent';
delete process.env.SMTP_URL;
