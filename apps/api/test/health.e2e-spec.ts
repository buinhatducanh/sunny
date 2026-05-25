import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createApp } from "./helpers";

describe("Health E2E (/api/v1/health/*)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixture = await createApp();
    app = fixture.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /api/v1/health", () => {
    it("returns 200 OK with status info", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/health")
        .expect(200);

      expect(res.body).toMatchObject({
        status: expect.any(String),
        timestamp: expect.any(String),
        service: "project-sunny-api",
      });
    });
  });

  describe("GET /api/v1/health/ready", () => {
    it("returns 200 when API is ready", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/health/ready")
        .expect(200);
    });
  });
});
