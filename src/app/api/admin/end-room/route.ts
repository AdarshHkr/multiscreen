import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { RoomServiceClient } from 'livekit-server-sdk';

const prisma = new PrismaClient();


interface AdminTokenPayload {
  userId: string;
  roomName: string;
}

export async function POST(req: NextRequest) {
  try {
    const roomService = new RoomServiceClient(
      process.env.NEXT_PUBLIC_LIVEKIT_URL!,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AdminTokenPayload;

    const { roomName } = await req.json();

    if (decoded.roomName !== roomName) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await roomService.deleteRoom(roomName);

    await prisma.admin.update({
        where: { id: decoded.userId, roomName: roomName, isActive: true },
        data: { isActive: false, endedAt: new Date() },
    });

    return NextResponse.json({ message: `Room '${roomName}' has been successfully ended.` });

  } catch (error) {
    console.error('Error ending room:', error);
    // CORRECTED: This now uses the directly imported 'PrismaClientKnownRequestError' type.
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        return NextResponse.json({ error: 'Room not found or is already inactive.' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}