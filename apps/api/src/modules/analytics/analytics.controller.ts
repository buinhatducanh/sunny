// apps/api/src/modules/analytics/analytics.controller.ts

import { Controller, Get, Post, Body, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AnalyticsService } from "./analytics.service";

@Controller("analytics")
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get("stats")
  async getPlayerStats(@CurrentUser("id") userId: string) {
    return this.analytics.getPlayerStats(userId);
  }

  @Post("track")
  async trackEvent(
    @CurrentUser("id") userId: string,
    @Body() body: { eventName: string; eventData?: Record<string, unknown> },
  ) {
    await this.analytics.trackEvent({
      userId,
      eventName: body.eventName,
      eventData: body.eventData,
    });
    return { ok: true };
  }
}
