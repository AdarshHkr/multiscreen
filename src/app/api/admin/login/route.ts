// livekit-multiscreen/src/app/api/admin/login/route.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, password, roomName } = await req.json();

    if (!username || !password || !roomName) {
      return NextResponse.json({ error: 'Username, password, and room name are required' }, { status: 400 });
    }

    const admin = await prisma.admin.findFirst({
      where: {
        username: username,
        roomName: roomName,
        isActive: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials or the room session has ended.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials for this room.' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: admin.id, username: admin.username, isAdmin: true, roomName: admin.roomName },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    return NextResponse.json({ token });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}