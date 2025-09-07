// livekit-multiscreen/src/app/api/admin/waiting-room/route.ts

import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface AdminTokenPayload {
  userId: string;
  roomName: string;
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AdminTokenPayload;

    // CORRECTED LINE: Use `req.nextUrl.searchParams` which is robust
    // and works correctly even when behind a reverse proxy like Nginx.
    const roomName = req.nextUrl.searchParams.get('roomName');

    if (!roomName) {
      return NextResponse.json({ error: 'Room name query parameter is required' }, { status: 400 });
    }

    // Security check: Ensure the admin is requesting users for their own room.
    if (decoded.roomName !== roomName) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Find all users who are in the waiting list for the specified room.
    const waitingUsers = await prisma.waitingUser.findMany({
      where: {
        roomName: roomName,
      },
      select: {
        id: true,
        username: true,
      },
    });

    return NextResponse.json(waitingUsers);

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    console.error('Error fetching waiting users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}