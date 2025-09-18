import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../../apps/api/src/app/app.module';

describe('RBAC Task API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.DATABASE_PATH = ':memory:';
    process.env.ORM_LOGGING = 'false';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function login(email: string, password: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email, password })
      .expect(201);
    return response.body.accessToken as string;
  }

  it('allows owners to create tasks', async () => {
    const token = await login('owner@turbovets.test', 'ChangeMe123!');
    const payload = {
      title: 'E2E Auth Task',
      description: 'Ensure RBAC works end-to-end',
      organizationId: (await request(app.getHttpServer())
        .get('/api/organizations')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)).body[0].id as string,
    };

    const createResponse = await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)
      .expect(201);

    expect(createResponse.body.title).toEqual(payload.title);
    expect(createResponse.body.organizationId).toEqual(payload.organizationId);
  });

  it('prevents viewers from mutating tasks', async () => {
    const token = await login('viewer@turbovets.test', 'ChangeMe123!');
    const tasksResponse = await request(app.getHttpServer())
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(tasksResponse.body)).toBe(true);

    await request(app.getHttpServer())
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Blocked Viewer Task',
        organizationId: tasksResponse.body[0]?.organizationId ?? '',
      })
      .expect(403);
  });
});
