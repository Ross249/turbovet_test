import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../../../apps/api/src/app/app.module';

describe('Health endpoint (e2e)', () => {
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

  it('returns OK status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(typeof response.body.timestamp).toBe('string');
  });
});
