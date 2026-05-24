// apps/api/src/game/game-events.service.ts

import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class GameEvents {
  constructor(private emitter: EventEmitter2) {}

  emit(event: string, data: unknown) {
    this.emitter.emit(event, data);
  }

  on(event: string, handler: (data: unknown) => void) {
    this.emitter.on(event, handler as (...args: unknown[]) => void);
  }

  off(event: string, handler: (data: unknown) => void) {
    this.emitter.off(event, handler as (...args: unknown[]) => void);
  }
}
