import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

const appDir = path.resolve(__dirname, "..");

// Only swap the JWT_SECRET in .env — keep DATABASE_URL from process.env (set by
// CI env vars or by the developer's local .env). NestJS ConfigModule reads .env
// from disk; we inject the test JWT_SECRET without overwriting the DATABASE_URL.
const prodEnvPath = path.join(appDir, ".env");
const backupPath = path.join(appDir, ".env.backup.e2e");

if (fs.existsSync(prodEnvPath)) {
  fs.copyFileSync(prodEnvPath, backupPath);
}
const prodEnvContent = fs.readFileSync(prodEnvPath, "utf-8");

// Inject JWT_SECRET from .env.test, keeping all other values from .env
const testEnvPath = path.join(appDir, ".env.test");
const testEnvContent = fs.readFileSync(testEnvPath, "utf-8");
const jwtSecretMatch = testEnvContent.match(/^JWT_SECRET=(.*)$/m);
if (jwtSecretMatch) {
  const lines = prodEnvContent.split("\n");
  const newLines = lines.map((line) => {
    if (line.startsWith("JWT_SECRET=")) return `JWT_SECRET=${jwtSecretMatch[1]}`;
    return line;
  });
  fs.writeFileSync(prodEnvPath, newLines.join("\n"));
}

export default async () => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  await prisma.$connect();

  // Clean database before all tests — delete in reverse dependency order
  await prisma.$transaction([
    // Social (depends on User)
    prisma.friendRequest.deleteMany(),
    prisma.friend.deleteMany(),
    // Analytics (depends on User/Player/Room)
    prisma.analyticsEvent.deleteMany(),
    prisma.dailyStats.deleteMany(),
    prisma.gameSession.deleteMany(),
    // BattlePass (depends on User/Player/Season)
    prisma.battlePassEntry.deleteMany(),
    // Achievements (depends on User/Player)
    prisma.achievement.deleteMany(),
    // Quests (depends on User/Player)
    prisma.dailyQuest.deleteMany(),
    // Card Ownership (depends on Player)
    prisma.cardOwnership.deleteMany(),
    // Guild (depends on User/Player)
    prisma.guildMember.deleteMany(),
    prisma.guild.deleteMany(),
    // Season Snapshots
    prisma.seasonSnapshot.deleteMany(),
    // Game state (depends on GameRoom/Player)
    prisma.vote.deleteMany(),
    prisma.roundHistory.deleteMany(),
    prisma.gameEvent.deleteMany(),
    prisma.playerState.deleteMany(),
    prisma.gameRoom.deleteMany(),
    // Auth (depends on User)
    prisma.session.deleteMany(),
    // Core (no dependencies)
    prisma.player.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  await prisma.$disconnect();
  console.log("✅ E2E database cleaned (global-setup)");
};
