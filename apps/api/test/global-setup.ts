import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

const appDir = path.resolve(__dirname, "..");

// Swap .env with .env.test so NestJS ConfigModule reads test values.
// This runs before any test workers start, so no race conditions.
const prodEnvPath = path.join(appDir, ".env");
const testEnvPath = path.join(appDir, ".env.test");
const backupPath = path.join(appDir, ".env.backup.e2e");

if (fs.existsSync(prodEnvPath)) {
  fs.copyFileSync(prodEnvPath, backupPath);
}
fs.copyFileSync(testEnvPath, prodEnvPath);

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
