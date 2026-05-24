// packages/utils/src/validation.ts

import type { Card, SlotType } from "@sunny-game/types/card.types";
import type { PlayerState } from "@sunny-game/types/player.types";
import { GAME_CONSTANTS } from "@sunny-game/constants/game.constants";

export interface ValidationResult {
  valid: boolean;
  error?: string;
  errorCode?: ValidationErrorCode;
}

export type ValidationErrorCode =
  | "TOO_EARLY"
  | "TOO_LATE"
  | "WRONG_STORE_TYPE"
  | "INSUFFICIENT_ENERGY"
  | "INSUFFICIENT_MONEY"
  | "INSUFFICIENT_WATER"
  | "INSUFFICIENT_POWER"
  | "ALREADY_PLAYED"
  | "INVALID_SLOT"
  | "SLOT_OCCUPIED"
  | "WRONG_CARD_TYPE"
  | "NOT_IN_HAND"
  | "GAME_NOT_IN_ACTION_PHASE"
  | "ALREADY_READY"
  | "INVALID_ROOM_STATE";

export function validateCardPlay(
  card: Card,
  player: PlayerState,
  round: number,
  storeType: string,
): ValidationResult {
  if (round < card.minRound) {
    return { valid: false, error: "Card cannot be played this early.", errorCode: "TOO_EARLY" };
  }
  if (card.maxRound !== -1 && round > card.maxRound) {
    return { valid: false, error: "Card cannot be played this late.", errorCode: "TOO_LATE" };
  }
  if (!card.storeTypes.includes(storeType as never)) {
    return { valid: false, error: "Card does not match store type.", errorCode: "WRONG_STORE_TYPE" };
  }
  if (player.energy < card.energyCost) {
    return { valid: false, error: "Not enough energy.", errorCode: "INSUFFICIENT_ENERGY" };
  }
  if (player.money < card.moneyCost) {
    return { valid: false, error: "Not enough money.", errorCode: "INSUFFICIENT_MONEY" };
  }
  if (player.hand.indexOf(card.id) === -1) {
    return { valid: false, error: "Card is not in your hand.", errorCode: "NOT_IN_HAND" };
  }
  return { valid: true };
}

export function validateSlotPlacement(
  card: Card,
  slotIndex: number,
): ValidationResult {
  if (slotIndex < 0 || slotIndex >= GAME_CONSTANTS.HAND_SIZE) {
    return { valid: false, error: "Invalid slot index.", errorCode: "INVALID_SLOT" };
  }
  const expectedSlot = getExpectedSlot(slotIndex);
  if (card.slotType !== "SPECIAL" && card.slotType !== expectedSlot) {
    return {
      valid: false,
      error: `Card must go in ${card.slotType} slot, not slot ${slotIndex} (${expectedSlot}).`,
      errorCode: "WRONG_CARD_TYPE",
    };
  }
  return { valid: true };
}

export function getExpectedSlot(slotIndex: number): SlotType {
  switch (slotIndex) {
    case 0: return "REVENUE";
    case 1: return "BUFF";
    case 2: return "COST";
    case 3: return "DEFENSE";
    case 4: return "SPECIAL";
    default: return "SPECIAL";
  }
}

export function validateRoomJoin(
  roomStatus: string,
  currentPlayerCount: number,
  maxPlayers: number,
  isPrivate: boolean,
  inviteCode?: string,
  correctCode?: string,
): ValidationResult {
  if (currentPlayerCount >= maxPlayers) {
    return { valid: false, error: "Room is full.", errorCode: "INVALID_ROOM_STATE" };
  }
  if (roomStatus !== "WAITING") {
    return { valid: false, error: "Game already in progress.", errorCode: "INVALID_ROOM_STATE" };
  }
  if (isPrivate && inviteCode !== correctCode) {
    return { valid: false, error: "Invalid invite code.", errorCode: "WRONG_STORE_TYPE" };
  }
  return { valid: true };
}

export function validateUsername(username: string): ValidationResult {
  if (username.length < GAME_CONSTANTS.USERNAME_MIN) {
    return { valid: false, error: "Username too short.", errorCode: "INVALID_ROOM_STATE" };
  }
  if (username.length > GAME_CONSTANTS.USERNAME_MAX) {
    return { valid: false, error: "Username too long.", errorCode: "INVALID_ROOM_STATE" };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, error: "Username contains invalid characters.", errorCode: "INVALID_ROOM_STATE" };
  }
  return { valid: true };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
