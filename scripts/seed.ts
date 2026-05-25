// scripts/seed.ts — Run via: pnpm seed
// Uses pg directly to avoid Prisma WASM engine complexity

import "dotenv/config";
import { Pool } from "pg";
import * as bcrypt from "bcrypt";
import { ALL_CARDS } from "../packages/constants/src/card.data.js";
import { DAILY_QUESTS, WEEKLY_QUESTS } from "../packages/constants/src/quest.data.js";
import { ACHIEVEMENTS } from "../packages/constants/src/achievement.data.js";

function cuid(): string {
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let id = "c";
  const random = Array.from({ length: 24 }, () => chars[Math.floor(Math.random() * chars.length)]);
  return id + random.join("");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  console.log("🌱 Seeding database...");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const passwordHash = await bcrypt.hash("demo1234", 12);

    // Create or get existing user — use RETURNING to get actual userId (not newly generated one)
    const userResult = await client.query(
      `INSERT INTO "User" (id, email, username, "passwordHash", "createdAt")
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (email) DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", username = EXCLUDED.username
       RETURNING id`,
      [cuid(), "demo@sunny-game.vn", "SunnyDemo", passwordHash],
    );
    const userId = userResult.rows[0].id;

    // Create or update player
    const playerResult = await client.query(
      `INSERT INTO "Player" (id, "userId", "displayName", level, xp, intelligence, stamina, speed, spirit, agility, diplomacy, coins, "mainProfession", "secondaryProfession", "cardBackSkin", "cardFrame", title, "totalGames", "totalWins", "totalRevenue", "highestRound", gems, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 1, 0, 15, 12, 10, 10, 12, 14, 2000, 'SOFTWARE_ENGINEERING', 'MARKETING', 'default', 'default', 'Tân Binh', 0, 0, 0, 0, 0, NOW(), NOW())
       ON CONFLICT ("userId") DO UPDATE SET "displayName" = EXCLUDED."displayName", coins = EXCLUDED.coins, "updatedAt" = NOW()
       RETURNING id`,
      [cuid(), userId, "SunnyDemo"],
    );
    const playerId = playerResult.rows[0].id;

    console.log(`  👤 Created user ${userId} / player ${playerId}`);

    // Seed card ownership
    const starterCards = ALL_CARDS.filter(
      (c) => c.rarity === "COMMON" || c.rarity === "RARE",
    ).slice(0, 15);

    for (const card of starterCards) {
      await client.query(
        `INSERT INTO "CardOwnership" (id, "playerId", "cardKey", count)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT ("playerId", "cardKey") DO UPDATE SET count = "CardOwnership".count + 1`,
        [cuid(), playerId, card.cardKey],
      );
    }
    console.log(`  📦 Seeded ${starterCards.length} starter cards`);

    // Seed daily quests
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    for (const quest of DAILY_QUESTS) {
      await client.query(
        `INSERT INTO "DailyQuest" (id, "userId", "playerId", "questType", target, progress, completed, "expiresAt", reward)
         VALUES ($1, $2, $3, $4, $5, 0, false, $6, $7)
         ON CONFLICT (id) DO UPDATE SET progress = 0, completed = false, "expiresAt" = EXCLUDED."expiresAt"`,
        [quest.id, userId, playerId, quest.key, quest.target, tomorrow, JSON.stringify(quest.reward)],
      );
    }
    console.log(`  📋 Seeded ${DAILY_QUESTS.length} daily quests`);

    // Seed achievements (unlocked = false)
    for (const ach of ACHIEVEMENTS) {
      await client.query(
        `INSERT INTO "Achievement" (id, "userId", "playerId", "achievementType", progress, "unlockedAt")
         VALUES ($1, $2, $3, $4, 0, '1970-01-01')
         ON CONFLICT ("playerId", "achievementType") DO UPDATE SET progress = 0`,
        [ach.id, userId, playerId, ach.key],
      );
    }
    console.log(`  🏆 Seeded ${ACHIEVEMENTS.length} achievements`);

    await client.query("COMMIT");

    console.log("✅ Seed complete");
    console.log("   Demo: demo@sunny-game.vn / demo1234");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
