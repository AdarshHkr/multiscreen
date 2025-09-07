import { AccessToken, VideoGrant } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedAdminToken {
  isAdmin: boolean;
  username: string;
}

export async function POST(req: NextRequest) {
  try {
    const { room, username } = await req.json();

    if (!room || !username) {
      return NextResponse.json({ error: 'Missing room or username' }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const jwtSecret = process.env.JWT_SECRET;

    if (!apiKey || !apiSecret || !jwtSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }
    
    let isAdmin = false;
    const authHeader = req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, jwtSecret) as DecodedAdminToken;
            isAdmin = decoded.isAdmin;
        } catch (e) {
            // Ignore invalid admin tokens, proceed as a regular user
        }
    }

    const grant: VideoGrant = {
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    };

    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
      name: username,
    });
    
    at.addGrant(grant);

    const livekitToken = await at.toJwt();
    
    // Also generate the room access token here
    const roomAccessToken = jwt.sign({ username, room, isAdmin }, jwtSecret, { expiresIn: '10m' });

    return NextResponse.json({ livekit_token: livekitToken, room_access_token: roomAccessToken });

  } catch (error) {
    console.error('Error in get-livekit-token:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}