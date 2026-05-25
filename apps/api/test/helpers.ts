import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../src/app.module";
export { request };

export async function createApp(): Promise<{
  app: INestApplication;
  module: TestingModule;
}> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors();
  await app.init();
  return { app, module: moduleFixture };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function registerUser(
  app: INestApplication,
  email: string,
  username: string,
  password: string,
): Promise<AuthTokens & { userId: string; playerId: string }> {
  const res = await request(app.getHttpServer())
    .post("/api/v1/auth/register")
    .send({ email, username, password })
    .expect(201);

  return {
    userId: res.body.user.id,
    playerId: res.body.user.player.id,
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
  };
}

export async function loginUser(
  app: INestApplication,
  email: string,
  password: string,
): Promise<AuthTokens & { userId: string; playerId: string }> {
  const res = await request(app.getHttpServer())
    .post("/api/v1/auth/login")
    .send({ email, password })
    .expect(200);

  return {
    userId: res.body.user.id,
    playerId: res.body.user.player.id,
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
  };
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function genEmail(prefix = "test") {
  return `${prefix}_${Date.now()}@sunny-test.io`;
}
