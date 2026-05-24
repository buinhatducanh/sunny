// apps/api/src/modules/friends/friends.service.ts

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new Error("Không thể kết bạn với chính mình");

    // Check if already friends
    const existing = await this.prisma.friend.findFirst({
      where: {
        OR: [
          { requesterId: senderId, receiverId },
          { requesterId: receiverId, receiverId: senderId },
        ],
      },
    });
    if (existing) throw new Error("Đã là bạn");

    // Check if request already exists
    const existingRequest = await this.prisma.friendRequest.findFirst({
      where: { senderId, receiverId },
    });
    if (existingRequest) throw new Error("Đã gửi lời mời trước đó");

    return this.prisma.friendRequest.create({
      data: { senderId, receiverId },
    });
  }

  async acceptFriendRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error("Không tìm thấy lời mời");
    if (request.receiverId !== userId) throw new Error("Không có quyền");

    await this.prisma.friend.create({
      data: { requesterId: request.senderId, receiverId: userId },
    });

    await this.prisma.friendRequest.delete({ where: { id: requestId } });

    return { ok: true };
  }

  async rejectFriendRequest(requestId: string, userId: string) {
    const request = await this.prisma.friendRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error("Không tìm thấy lời mời");
    if (request.receiverId !== userId) throw new Error("Không có quyền");

    await this.prisma.friendRequest.delete({ where: { id: requestId } });
    return { ok: true };
  }

  async removeFriend(userId: string, friendId: string) {
    await this.prisma.friend.deleteMany({
      where: {
        OR: [
          { requesterId: userId, receiverId: friendId },
          { requesterId: friendId, receiverId: userId },
        ],
      },
    });
    return { ok: true };
  }

  async getFriends(userId: string) {
    const friends = await this.prisma.friend.findMany({
      where: { OR: [{ requesterId: userId }, { receiverId: userId }] },
      include: {
        requester: { include: { player: true } },
        receiver: { include: { player: true } },
      },
    });

    return friends.map((f) => {
      const other = f.requesterId === userId ? f.receiver : f.requester;
      return {
        friendId: other.id,
        displayName: other.player?.displayName ?? other.username,
        avatarUrl: other.avatarUrl,
        level: other.player?.level ?? 1,
        since: f.createdAt,
      };
    });
  }

  async getIncomingRequests(userId: string) {
    const requests = await this.prisma.friendRequest.findMany({
      where: { receiverId: userId },
      include: { sender: { include: { player: true } } },
    });

    return requests.map((r) => ({
      requestId: r.id,
      senderId: r.sender.id,
      displayName: r.sender.player?.displayName ?? r.sender.username,
      avatarUrl: r.sender.avatarUrl,
      level: r.sender.player?.level ?? 1,
      sentAt: r.createdAt,
    }));
  }

  async getOutgoingRequests(userId: string) {
    const requests = await this.prisma.friendRequest.findMany({
      where: { senderId: userId },
      include: { receiver: { include: { player: true } } },
    });

    return requests.map((r) => ({
      requestId: r.id,
      receiverId: r.receiver.id,
      displayName: r.receiver.player?.displayName ?? r.receiver.username,
      avatarUrl: r.receiver.avatarUrl,
      level: r.receiver.player?.level ?? 1,
      sentAt: r.createdAt,
    }));
  }

  async searchPlayers(query: string, currentUserId: string): Promise<Array<{
    userId: string;
    playerId: string;
    displayName: string;
    level: number;
    username: string;
  }>> {
    const results = await this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { player: { displayName: { contains: query, mode: "insensitive" } } },
        ],
        id: { not: currentUserId },
      },
      include: { player: true },
      take: 20,
    });

    return results.map((u) => ({
      userId: u.id,
      playerId: u.player?.id ?? "",
      displayName: u.player?.displayName ?? u.username,
      level: u.player?.level ?? 1,
      username: u.username,
    }));
  }
}
