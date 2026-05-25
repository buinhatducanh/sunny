import * as fs from "fs";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

// Restore original .env after all tests (global-setup.ts swapped it).
// DB cleanup also happens here (in addition to global-setup's teardown)
// to ensure cleanup even if global-setup fails.
const appDir = path.resolve(__dirname, "..");
const envPath = path.join(appDir, ".env");
const backupPath = path.join(appDir, ".env.backup.e2e");

if (fs.existsSync(backupPath)) {
  fs.writeFileSync(envPath, fs.readFileSync(backupPath, "utf-8"));
  fs.unlinkSync(backupPath);
}

export default async () => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    await prisma.$connect();
    await prisma.$transaction([
      prisma.friendRequest.deleteMany(),
      prisma.friend.deleteMany(),
      prisma.analyticsEvent.deleteMany(),
      prisma.dailyStats.deleteMany(),
      prisma.gameSession.deleteMany(),
      prisma.battlePassEntry.deleteMany(),
      prisma.achievement.deleteMany(),
      prisma.dailyQuest.deleteMany(),
      prisma.cardOwnership.deleteMany(),
      prisma.guildMember.deleteMany(),
      prisma.guild.deleteMany(),
      prisma.seasonSnapshot.deleteMany(),
      prisma.vote.deleteMany(),
      prisma.roundHistory.deleteMany(),
      prisma.gameEvent.deleteMany(),
      prisma.playerState.deleteMany(),
      prisma.gameRoom.deleteMany(),
      prisma.session.deleteMany(),
      prisma.player.deleteMany(),
      prisma.user.deleteMany(),
    ]);
  } finally {
    await prisma.$disconnect();
  }
  console.log("🧹 E2E database cleaned after tests (global-teardown)");
};
