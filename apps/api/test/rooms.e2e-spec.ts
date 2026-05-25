import { INestApplication } from "@nestjs/common";
import request from "supertest";
import {
  createApp,
  registerUser,
  authHeader,
  genEmail,
  AuthTokens,
} from "./helpers";

describe("Rooms E2E (POST|GET /api/v1/game/rooms/*)", () => {
  let app: INestApplication;
  let alice: AuthTokens & { userId: string; playerId: string };
  let bob: AuthTokens & { userId: string; playerId: string };

  beforeAll(async () => {
    const fixture = await createApp();
    app = fixture.app;
    alice = await registerUser(app, genEmail("alice"), "AlicePlayer", "Password123!");
    bob = await registerUser(app, genEmail("bob"), "BobPlayer", "Password123!");
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /game/rooms — Create Room", () => {
    it("creates a public room as authenticated user", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Test Room", maxPlayers: 4 })
        .expect(201);

      expect(res.body).toMatchObject({
        id: expect.any(String),
        hostId: alice.userId,
        name: "Test Room",
        maxPlayers: 4,
        status: "WAITING",
      });
    });

    it("creates a private room with inviteCode", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Private Room", maxPlayers: 2, isPrivate: true })
        .expect(201);

      expect(res.body).toMatchObject({
        inviteCode: expect.any(String),
        config: expect.objectContaining({ isPrivate: true }),
      });
    });

    it("returns 401 when not authenticated", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .send({ name: "No Auth Room" })
        .expect(401);
    });

    it("stores custom roundTimeLimit and votingTimeLimit in config", async () => {
      const res = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ roundTimeLimit: 45, votingTimeLimit: 15 })
        .expect(201);

      expect(res.body.config).toMatchObject({
        roundTimeLimit: 45,
        votingTimeLimit: 15,
      });
    });
  });

  describe("GET /game/rooms — List Rooms (auth required)", () => {
    it("lists public WAITING rooms with pagination", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .expect(200);

      expect(res.body).toMatchObject({
        rooms: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        pages: expect.any(Number),
      });
    });

    it("filters by status query param", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/game/rooms?status=RUNNING")
        .set(authHeader(alice.accessToken))
        .expect(200);

      expect(Array.isArray(res.body.rooms)).toBe(true);
    });

    it("supports pagination", async () => {
      const res = await request(app.getHttpServer())
        .get("/api/v1/game/rooms?page=1&limit=5")
        .set(authHeader(alice.accessToken))
        .expect(200);

      expect(res.body.page).toBe(1);
    });

    it("returns 401 without auth", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/game/rooms")
        .expect(401);
    });
  });

  describe("POST /game/rooms/:roomId/join — Join Room", () => {
    it("joins a public waiting room", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Join Test Room", maxPlayers: 4 })
        .expect(201);

      const roomId = roomRes.body.id;

      const joinRes = await request(app.getHttpServer())
        .post(`/api/v1/game/rooms/${roomId}/join`)
        .set(authHeader(bob.accessToken))
        .expect(201);

      expect(joinRes.body).toMatchObject({ id: roomId });
      expect(joinRes.body.players).toHaveLength(2);
    });

    it("joins a private room with correct inviteCode", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Private Join Room", isPrivate: true })
        .expect(201);

      const { inviteCode } = roomRes.body;

      await request(app.getHttpServer())
        .post(`/api/v1/game/rooms/${roomRes.body.id}/join`)
        .set(authHeader(bob.accessToken))
        .send({ inviteCode })
        .expect(201);
    });

    it("returns 401 when not authenticated", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "No Auth Join Room" })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/game/rooms/${roomRes.body.id}/join`)
        .expect(401);
    });
  });

  describe("GET /game/rooms/:roomId — Get Room Details", () => {
    it("returns room details by ID", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Detail Test Room" })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/game/rooms/${roomRes.body.id}`)
        .set(authHeader(alice.accessToken))
        .expect(200);

      expect(res.body).toMatchObject({
        id: roomRes.body.id,
        name: "Detail Test Room",
        status: "WAITING",
      });
    });

    it("returns 401 without auth", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Detail Room No Auth" })
        .expect(201);

      await request(app.getHttpServer())
        .get(`/api/v1/game/rooms/${roomRes.body.id}`)
        .expect(401);
    });

    it("returns 404 for non-existent room", async () => {
      await request(app.getHttpServer())
        .get("/api/v1/game/rooms/non-existent-id")
        .set(authHeader(alice.accessToken))
        .expect(404);
    });
  });

  describe("POST /game/rooms/:roomId/start — Start Game", () => {
    it("host can start game when room has 2 players", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Start Game Room", maxPlayers: 2 })
        .expect(201);

      const roomId = roomRes.body.id;

      await request(app.getHttpServer())
        .post(`/api/v1/game/rooms/${roomId}/join`)
        .set(authHeader(bob.accessToken))
        .expect(201);

      const startRes = await request(app.getHttpServer())
        .post(`/api/v1/game/rooms/${roomId}/start`)
        .set(authHeader(alice.accessToken))
        .expect(201);

      expect(startRes.body.status).toBe("VOTING");
    });

    it("returns 400 when non-host tries to start", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Non-host Start Room", maxPlayers: 2 })
        .expect(201);

      const roomId = roomRes.body.id;

      await request(app.getHttpServer())
        .post(`/api/v1/game/rooms/${roomId}/join`)
        .set(authHeader(bob.accessToken))
        .expect(201);

      // Non-host (Bob) tries to start
      await request(app.getHttpServer())
        .post(`/api/v1/game/rooms/${roomId}/start`)
        .set(authHeader(bob.accessToken))
        .expect(400);
    });
  });

  describe("DELETE /game/rooms/:roomId/leave — Leave Room", () => {
    it("player can leave a waiting room", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Leave Test Room" })
        .expect(201);

      const roomId = roomRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/v1/game/rooms/${roomId}/leave`)
        .set(authHeader(alice.accessToken))
        .expect(200);
    });

    it("returns 401 when not authenticated", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "No Auth Leave Room" })
        .expect(201);

      await request(app.getHttpServer())
        .delete(`/api/v1/game/rooms/${roomRes.body.id}/leave`)
        .expect(401);
    });
  });

  describe("Full Room Lifecycle", () => {
    it("complete flow: create → join → start", async () => {
      const roomRes = await request(app.getHttpServer())
        .post("/api/v1/game/rooms")
        .set(authHeader(alice.accessToken))
        .send({ name: "Lifecycle Room", maxPlayers: 2 })
        .expect(201);

      const roomId = roomRes.body.id;

      await request(app.getHttpServer())
        .post(`/api/v1/game/rooms/${roomId}/join`)
        .set(authHeader(bob.accessToken))
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/game/rooms/${roomId}/start`)
        .set(authHeader(alice.accessToken))
        .expect(201);

      const finalRes = await request(app.getHttpServer())
        .get(`/api/v1/game/rooms/${roomId}`)
        .set(authHeader(alice.accessToken))
        .expect(200);

      expect(finalRes.body.status).toBe("VOTING");
    });
  });
});
