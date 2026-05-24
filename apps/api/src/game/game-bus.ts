// apps/api/src/game/game-bus.ts
// Shared event bus to decouple GameEngine and GameGateway (breaks circular dependency)

import { EventEmitter } from "events";

export const gameBus = new EventEmitter();
gameBus.setMaxListeners(100);
