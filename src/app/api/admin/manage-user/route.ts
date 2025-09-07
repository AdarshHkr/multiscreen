import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface AdminTokenPayload {
  userId: string;
  roomName: string;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AdminTokenPayload;

    const { waitingUserId, roomName, action } = await req.json();

    if (!waitingUserId || !roomName || !action) {
        return NextResponse.json({ error: 'User ID, Room Name, and Action are required.'}, { status: 400 });
    }

    if (decoded.roomName !== roomName) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userInWaitingRoom = await prisma.waitingUser.findUnique({ where: { id: waitingUserId } });
    if (!userInWaitingRoom) {
      return NextResponse.json({ message: 'User is no longer in the waiting room.' });
    }

    if (action === 'admit') {
      // Use a transaction to ensure both operations succeed or fail together
      await prisma.$transaction([
        // Use 'upsert' to prevent unique constraint errors if admin clicks admit multiple times
        prisma.admittedUser.upsert({
          where: {
            username_roomName: {
              username: userInWaitingRoom.username,
              roomName: userInWaitingRoom.roomName,
            },
          },
          update: {}, // No update needed if the user already exists in the admitted list
          create: {
            username: userInWaitingRoom.username,
            roomName: userInWaitingRoom.roomName,
          },
        }),
        // Remove the user from the waiting list
        prisma.waitingUser.delete({
          where: { id: waitingUserId },
        }),
      ]);
      return NextResponse.json({ message: 'User has been admitted.' });
    }
    
    if (action === 'deny') {
      // For 'deny', simply remove the user from the waiting list
      await prisma.waitingUser.delete({
        where: { id: waitingUserId },
      });
      return NextResponse.json({ message: 'User has been denied.' });
    }
    
    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });

  } catch (error) {
    console.error('Error managing user:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}