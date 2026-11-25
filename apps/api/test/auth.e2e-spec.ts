import { ROLE_PERMISSIONS, ROLES } from '@academy/shared';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { ENV } from '../src/config/config.module.js';
import { loadEnv } from '../src/config/env.js';
import { MailService } from '../src/modules/mail/mail.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { setupApp } from '../src/setup-app.js';

/** Captures outgoing tokens instead of sending email. */
class FakeMail {
  sent: { to: string; kind: string; token?: string }[] = [];
  async sendVerification(to: string, _n: string, token: string) { this.sent.push({ to, kind: 'verify', token }); }
  async sendPasswordReset(to: string, _n: string, token: string) { this.sent.push({ to, kind: 'reset', token }); }
  async sendAccountExists(to: string) { this.sent.push({ to, kind: 'exists' }); }
  last(kind: string) { return [...this.sent].reverse().find((m) => m.kind === kind); }
}

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('Auth (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const mail = new FakeMail();
  const user = { name: 'Grace Hopper', email: 'grace@example.com', password: 'compiler pioneer 1' };

  beforeAll(async () => {
    const env = { ...loadEnv(), REFRESH_REUSE_GRACE_SECONDS: 0, TRUST_PROXY: false, SWAGGER_ENABLED: false };
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ENV).useValue(env)
      .overrideProvider(MailService).useValue(mail)
      .compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ logger: false });
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    for (const name of ROLES) {
      const role = await prisma.role.upsert({ where: { name }, update: {}, create: { name } });
      for (const p of ROLE_PERMISSIONS[name]) {
        const perm = await prisma.permission.upsert({ where: { name: p }, update: {}, create: { name: p } });
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
          update: {},
          create: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  });

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: { endsWith: '@example.com' } } });
    mail.sent = [];
  });

  afterAll(async () => {
    await prisma?.user.deleteMany({ where: { email: { endsWith: '@example.com' } } });
    await app?.close();
  });

  const http = () => request(app.getHttpServer());
  const cookiesOf = (res: request.Response): string[] => (res.headers['set-cookie'] as unknown as string[]) ?? [];

  async function registerAndVerify(): Promise<void> {
    await http().post('/api/v1/auth/register').send(user).expect(202);
    await http().post('/api/v1/auth/verify-email').send({ token: mail.last('verify')!.token }).expect(200);
  }

  it('registers, blocks login until verified, then signs in', async () => {
    await http().post('/api/v1/auth/register').send(user).expect(202);
    const blocked = await http().post('/api/v1/auth/login').send(user).expect(403);
    expect(blocked.body.error.code).toBe('EMAIL_NOT_VERIFIED');

    await http().post('/api/v1/auth/verify-email').send({ token: mail.last('verify')!.token }).expect(200);
    const login = await http().post('/api/v1/auth/login').send(user).expect(200);
    expect(login.body.data.user).toMatchObject({ email: user.email, roles: ['STUDENT'], emailVerified: true });
    expect(cookiesOf(login).join(';')).toMatch(/ba_at=.*HttpOnly/);

    const me = await http().get('/api/v1/auth/me').set('Cookie', cookiesOf(login)).expect(200);
    expect(me.body.data.user.email).toBe(user.email);
    expect(me.body.data.user).not.toHaveProperty('passwordHash');
  });

  it('does not reveal whether an email is registered', async () => {
    await registerAndVerify();
    const again = await http().post('/api/v1/auth/register').send(user).expect(202);
    const fresh = await http().post('/api/v1/auth/register').send({ ...user, email: 'new@example.com' }).expect(202);
    expect(again.body).toEqual(fresh.body);
    expect(mail.last('exists')?.to).toBe(user.email);
  });

  it('rejects wrong passwords and unknown users identically', async () => {
    await registerAndVerify();
    const wrong = await http().post('/api/v1/auth/login').send({ ...user, password: 'not the password 1' }).expect(401);
    const unknown = await http().post('/api/v1/auth/login').send({ ...user, email: 'ghost@example.com' }).expect(401);
    expect(wrong.body.error.code).toBe('INVALID_CREDENTIALS');
    expect(unknown.body.error.message).toBe(wrong.body.error.message);
  });

  it('detects refresh token reuse and revokes the session family', async () => {
    await registerAndVerify();
    const login = await http().post('/api/v1/auth/login').send(user).expect(200);
    const original = cookiesOf(login);

    const rotated = await http().post('/api/v1/auth/refresh').set('Cookie', original).expect(200);
    await new Promise((r) => setTimeout(r, 1100)); // past the (zero) grace window
    await http().post('/api/v1/auth/refresh').set('Cookie', original).expect(401);

    // The legitimate, rotated session is now revoked too.
    await http().post('/api/v1/auth/refresh').set('Cookie', cookiesOf(rotated)).expect(401);
    await http().get('/api/v1/auth/me').set('Cookie', cookiesOf(rotated)).expect(401);
  });

  it('resets the password and revokes existing sessions', async () => {
    await registerAndVerify();
    const login = await http().post('/api/v1/auth/login').send(user).expect(200);

    await http().post('/api/v1/auth/forgot-password').send({ email: user.email }).expect(202);
    const token = mail.last('reset')!.token!;
    await http().post('/api/v1/auth/reset-password').send({ token, password: 'brand new secret 2' }).expect(200);
    await http().post('/api/v1/auth/reset-password').send({ token, password: 'brand new secret 3' }).expect(400);

    await http().get('/api/v1/auth/me').set('Cookie', cookiesOf(login)).expect(401);
    await http().post('/api/v1/auth/login').send({ ...user, password: 'brand new secret 2' }).expect(200);
  });

  it('enforces permissions server-side', async () => {
    await registerAndVerify();
    const login = await http().post('/api/v1/auth/login').send(user).expect(200);
    const res = await http().get('/api/v1/users').set('Cookie', cookiesOf(login)).expect(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
    await http().get('/api/v1/users').expect(401);
  });

  it('rejects cross-origin state-changing requests', async () => {
    await http().post('/api/v1/auth/logout').set('Origin', 'https://evil.example').expect(403);
  });

  it('returns structured validation errors with a request id', async () => {
    const res = await http()
      .post('/api/v1/auth/register')
      .set('x-request-id', 'test-request-0001')
      .send({ name: '', email: 'nope', password: 'x' })
      .expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.requestId).toBe('test-request-0001');
    expect(res.body.error.details.map((d: { path: string }) => d.path)).toEqual(
      expect.arrayContaining(['name', 'email', 'password']),
    );
  });
});
