// livekit-multiscreen/src/app/api/admin/create/route.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, password, roomName, isWaitingRoomEnabled } = await req.json();

    if (!username || !password || !roomName) {
      return NextResponse.json({ error: 'Username, password, and room name are required' }, { status: 400 });
    }

    const existingActiveRoom = await prisma.admin.findFirst({
      where: {
        roomName,
        isActive: true,
      },
    });

    if (existingActiveRoom) {
      return NextResponse.json({ error: 'An active room with this name already exists.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        roomName,
        isWaitingRoomEnabled: isWaitingRoomEnabled ?? true,
        isActive: true,
      },
    });

    return NextResponse.json({ message: 'Admin user and room created successfully', admin });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}