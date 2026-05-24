// apps/api/src/health/health.controller.ts

import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
  @Get()
  @ApiOperation({ summary: "Health check" })
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "project-sunny-api",
    };
  }

  @Get("ready")
  @ApiOperation({ summary: "Readiness check" })
  ready() {
    return { ready: true };
  }
}
