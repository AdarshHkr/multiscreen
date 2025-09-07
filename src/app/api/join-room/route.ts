// livekit-multiscreen/src/app/api/join-room/route.ts

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DecodedToken {
  userId: string;
  isAdmin: boolean;
  roomName: string;
  username: string;
}

export async function POST(req: NextRequest) {
  try {
    const { username, room } = await req.json();
    if (!username || !room) {
      return NextResponse.json({ error: 'Username and room are required' }, { status: 400 });
    }

    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;
        if (decoded.isAdmin && decoded.roomName === room) {
          const roomAccessToken = jwt.sign({ username: decoded.username, room, isAdmin: true }, process.env.JWT_SECRET!, { expiresIn: '10m' });
          return NextResponse.json({ room_access_token: roomAccessToken });
        }
      } catch (e) {
        console.error("Invalid admin token provided:", e instanceof Error ? e.message : e);
      }
    }

    const roomAdmin = await prisma.admin.findFirst({
      where: { roomName: room, isActive: true },
    });

    if (!roomAdmin) {
      return NextResponse.json({ error: `Room '${room}' not found or is not active.` }, { status: 404 });
    }

    if (!roomAdmin.isWaitingRoomEnabled) {
      const roomAccessToken = jwt.sign({ username, room, isAdmin: false }, process.env.JWT_SECRET!, { expiresIn: '10m' });
      return NextResponse.json({ room_access_token: roomAccessToken });
    }

    const uniqueId = { username, roomName: room };
    const admittedUser = await prisma.admittedUser.findUnique({ where: { username_roomName: uniqueId } });
    if (admittedUser) {
      await prisma.admittedUser.delete({ where: { username_roomName: uniqueId } });
      const roomAccessToken = jwt.sign({ username, room, isAdmin: false }, process.env.JWT_SECRET!, { expiresIn: '10m' });
      return NextResponse.json({ room_access_token: roomAccessToken });
    }

    const waitingUser = await prisma.waitingUser.findUnique({ where: { username_roomName: uniqueId } });
    if (waitingUser) {
      return NextResponse.json({ error: 'Awaiting admin approval...' }, { status: 428 });
    }

    const isPolling = req.nextUrl.searchParams.get('polling') === 'true';
    if (!isPolling) {
      await prisma.waitingUser.create({
        data: { username, roomName: room, adminId: roomAdmin.id },
      });
      return NextResponse.json({ error: 'You have been placed in the waiting room.' }, { status: 428 });
    }

    return NextResponse.json({ error: 'Access to the room has been denied by the admin.' }, { status: 403 });

  } catch (error) {
    console.error('Error in /api/join-room:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
}