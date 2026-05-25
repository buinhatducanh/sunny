import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createApp, registerUser, loginUser, authHeader, genEmail } from "./helpers";

describe("Auth E2E (POST /api/v1/auth/*)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const fixture = await createApp();
    app = fixture.app;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /auth/register", () => {
    it("registers a new user and returns tokens + user profile", async () => {
      const email = genEmail("register");
      const res = await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({ email, username: "TestPlayer", password: "SecurePass123!" })
        .expect(201);

      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          id: expect.any(String),
          email,
          username: "TestPlayer",
          player: {
            id: expect.any(String),
            displayName: "TestPlayer",
            level: 1,
            xp: 0,
          },
        },
      });
      expect(res.body.accessToken.split(".")).toHaveLength(3);
    });

    it("returns 409 when email already exists", async () => {
      const email = genEmail("duplicate");
      await registerUser(app, email, "User1", "Password123!");
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({ email, username: "User2", password: "Password123!" })
        .expect(409);
    });

    it("returns 409 when username already exists", async () => {
      const email1 = genEmail("dupuser1");
      const email2 = genEmail("dupuser2");
      await registerUser(app, email1, "SameUsername", "Password123!");
      await request(app.getHttpServer())
        .post("/api/v1/auth/register")
        .send({ email: email2, username: "SameUsername", password: "Password123!" })
        .expect(409);
    });
  });

  describe("POST /auth/login", () => {
    it("logs in with valid credentials and returns tokens", async () => {
      const email = genEmail("login");
      await registerUser(app, email, "LoginUser", "Password123!");
      const res = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({ email, password: "Password123!" })
        .expect(200);

      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: {
          email,
          username: "LoginUser",
          player: expect.any(Object),
        },
      });
    });

    it("returns 401 for wrong password", async () => {
      const email = genEmail("wrongpass");
      await registerUser(app, email, "WrongPassUser", "Password123!");
      await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({ email, password: "WrongPassword!" })
        .expect(401);
    });

    it("returns 401 for non-existent email", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({ email: genEmail("notexist"), password: "Password123!" })
        .expect(401);
    });
  });

  describe("POST /auth/refresh", () => {
    it("refreshes tokens with a valid refresh token", async () => {
      const email = genEmail("refresh");
      const { refreshToken } = await registerUser(app, email, "RefreshUser", "Password123!");
      const res = await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .send({ refreshToken })
        .expect(200);

      expect(res.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it("returns 401 for invalid refresh token", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/refresh")
        .send({ refreshToken: "invalid.token.here" })
        .expect(401);
    });
  });

  describe("POST /auth/logout", () => {
    it("logs out authenticated user successfully", async () => {
      const email = genEmail("logout");
      const { accessToken } = await registerUser(app, email, "LogoutUser", "Password123!");
      await request(app.getHttpServer())
        .post("/api/v1/auth/logout")
        .set(authHeader(accessToken))
        .expect(200);
    });

    it("returns 401 when not authenticated", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/logout")
        .expect(401);
    });

    it("returns 401 with invalid bearer token", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/auth/logout")
        .set({ Authorization: "Bearer invalid.token.here" })
        .expect(401);
    });
  });

  describe("Full Auth Flow: Register → Login → Access protected route", () => {
    it("access token works for authenticated endpoints", async () => {
      const email = genEmail("fullflow");
      const { accessToken } = await registerUser(app, email, "FullFlowUser", "Password123!");
      const { accessToken: reLoginToken } = await loginUser(app, email, "Password123!");
      expect(reLoginToken).toBeTruthy();

      const res = await request(app.getHttpServer())
        .get("/api/v1/game/online")
        .set(authHeader(accessToken))
        .expect(200);

      expect(res.body).toMatchObject({ online: expect.any(Number) });
    });
  });
});
