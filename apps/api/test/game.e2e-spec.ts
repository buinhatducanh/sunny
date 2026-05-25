import { INestApplication } from "@nestjs/common";
import request from "supertest";
import { createApp, registerUser, authHeader, genEmail, AuthTokens } from "./helpers";

describe("Game E2E (POST /api/v1/game/*)", () => {
  let app: INestApplication;
  let player: AuthTokens & { userId: string; playerId: string };

  beforeAll(async () => {
    const fixture = await createApp();
    app = fixture.app;
    player = await registerUser(
      app,
      genEmail("solo"),
      "SoloPlayer",
      "Password123!",
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /game/online — Online Count", () => {
    it("returns online player count", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/game/online")
        .set(authHeader(player.accessToken))
        .expect(200);

      expect(res.body).toMatchObject({ online: expect.any(Number) });
    });

    it("returns 401 without auth", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/game/online")
        .expect(401);
    });
  });

  describe("POST /game/solo — Solo Practice with Bots", () => {
    it("creates a solo practice room with 3 bots", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/game/solo")
        .set(authHeader(player.accessToken))
        .send({ name: "Practice Room", botCount: 3 })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        name: "Practice Room",
        status: "WAITING",
        maxPlayers: 4,
      });
      expect(res.body.config).toMatchObject({ isPrivate: true });
      expect(res.body.bots).toHaveLength(3);
    });

    it("creates solo room with default bot count (3)", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/game/solo")
        .set(authHeader(player.accessToken))
        .send({})
        .expect(201);

      expect(res.body.maxPlayers).toBe(4);
    });

    it("clamps botCount to valid range 1-4", async () => {
      const overRes = await request(app.getHttpServer())
        .post("/api/v1/game/solo")
        .set(authHeader(player.accessToken))
        .send({ botCount: 10 })
        .expect(201);

      expect(overRes.body.maxPlayers).toBe(5);

      const underRes = await request(app.getHttpServer())
        .post("/api/v1/game/solo")
        .set(authHeader(player.accessToken))
        .send({ botCount: 0 })
        .expect(201);

      expect(underRes.body.maxPlayers).toBe(2);
    });

    it("returns 401 without auth", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/game/solo")
        .send({})
        .expect(401);
    });
  });

  describe("POST /game/matchmaking/join", () => {
    it("adds player to matchmaking queue", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/game/matchmaking/join")
        .set(authHeader(player.accessToken))
        .expect(201);

      expect(res.body).toMatchObject({
        status: expect.stringMatching(/^(queued|matched)$/),
      });
    });

    it("returns 401 without auth", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/game/matchmaking/join")
        .expect(401);
    });
  });

  describe("GET /game/matchmaking/status", () => {
    it("returns queue info for player in queue", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/game/matchmaking/join")
        .set(authHeader(player.accessToken))
        .expect(201);

      const res = await request(app.getHttpServer())
        .get("/api/v1/game/matchmaking/status")
        .set(authHeader(player.accessToken))
        .expect(200);

      expect(res.body).toMatchObject({
        queueSize: expect.any(Number),
        position: expect.any(Number),
      });
    });
  });

  describe("DELETE /game/matchmaking/leave", () => {
    it("removes player from queue", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/game/matchmaking/join")
        .set(authHeader(player.accessToken))
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete("/api/v1/game/matchmaking/leave")
        .set(authHeader(player.accessToken))
        .expect(200);

      expect(res.body.ok).toBe(true);
    });
  });

  describe("POST /game/energy/restore", () => {
    it("restores energy with gems (returns ok + energy info)", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/game/energy/restore")
        .set(authHeader(player.accessToken))
        .send({ amount: 20 })
        .expect(201);

      expect(res.body).toMatchObject({
        ok: true,
        gemsSpent: expect.any(Number),
        energyRestored: expect.any(Number),
        currentEnergy: expect.any(Number),
        maxEnergy: expect.any(Number),
        remainingGems: expect.any(Number),
      });
    });

    it("uses default amount when not specified", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/game/energy/restore")
        .set(authHeader(player.accessToken))
        .send({})
        .expect(201);

      expect(res.body.ok).toBe(true);
    });

    it("returns 401 without auth", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/game/energy/restore")
        .send({ amount: 10 })
        .expect(401);
    });
  });
});
