'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { jwtDecode } from 'jwt-decode';

interface WaitingUser {
  id: string;
  username: string;
}

// --- Waiting Room Banner Component ---
function WaitingRoomBanner({ roomName, token }: { roomName: string; token: string }) {
  const [users, setUsers] = useState<WaitingUser[]>([]);

  const fetchWaitingUsers = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch(`/api/admin/waiting-room?roomName=${roomName}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) setUsers(await response.json());
    } catch (error) { console.error('Failed to fetch waiting users:', error); }
  }, [roomName, token]);

  useEffect(() => {
    fetchWaitingUsers();
    const interval = setInterval(fetchWaitingUsers, 5000);
    return () => clearInterval(interval);
  }, [fetchWaitingUsers]);

  const handleManageUser = async (userId: string, action: 'admit' | 'deny') => {
    try {
      await fetch('/api/admin/manage-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ waitingUserId: userId, roomName, action }),
      });
      fetchWaitingUsers();
    } catch (error) { console.error('Failed to manage user:', error); }
  };

  if (users.length === 0) return null;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className="bg-gray-800 bg-opacity-80 backdrop-blur-md text-white rounded-lg shadow-2xl p-4 border border-gray-700">
        <h3 className="text-lg font-bold text-center mb-3">Waiting Room ({users.length})</h3>
        <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-2 bg-gray-700 rounded-md">
              <span className="font-medium">{user.username}</span>
              <div className="flex items-center gap-3">
                <button onClick={() => handleManageUser(user.id, 'admit')} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md text-sm font-semibold">Admit</button>
                <button onClick={() => handleManageUser(user.id, 'deny')} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm font-semibold">Deny</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Main Room Content ---
function RoomContent({ isAdmin }: { isAdmin: boolean }) {
  const tracks = useTracks([{ source: Track.Source.ScreenShare, withPlaceholder: false }], { onlySubscribed: true });
  const router = useRouter();
  const roomName = typeof window !== 'undefined' ? window.location.pathname.split('/')[2] : '';
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('admin-auth-token') || '' : '';

  const handleEndRoom = async () => {
    if (!adminToken || !confirm('Are you sure you want to end this room for all participants?')) return;
    try {
      await fetch('/api/admin/end-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ roomName }),
      });
    } catch (err) { alert('An error occurred while trying to end the room.'); }
  };

  return (
    <div className="relative h-full">
      {isAdmin && <WaitingRoomBanner roomName={roomName} token={adminToken} />}
      
      <div className="p-4" style={{ height: 'calc(100% - 80px)' }}>
        {isAdmin ? (
          <GridLayout tracks={tracks}>
            <ParticipantTile />
          </GridLayout>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-white">
            <h2 className="text-2xl mb-4">You have joined the room</h2>
            <p className="text-gray-400">Click the screen share button below to begin sharing.</p>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 flex justify-center p-4">
        {isAdmin ? (
          <>
            <ControlBar variation="minimal" controls={{ leave: true }} />
            <button onClick={handleEndRoom} className="ml-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
              End Room for All
            </button>
          </>
        ) : (
          <ControlBar variation="minimal" controls={{ microphone: true, screenShare: true, leave: true }} />
        )}
      </div>
      
      <RoomAudioRenderer />
    </div>
  );
}

// --- Main Page Component ---
// livekit-multiscreen/src/app/room/[roomName]/page.tsx

// --- Main Page Component (Corrected) ---
export default function RoomPage() {
  const [livekitToken, setLivekitToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDisconnected, setIsDisconnected] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const roomAccessToken = searchParams.get('token');
    if (!roomAccessToken) {
      setError("No access token provided.");
      router.push('/');
      return;
    }

    try {
      const decoded: { room: string, username: string } = jwtDecode(roomAccessToken);
      
      (async () => {
        try {
          const resp = await fetch('/api/get-livekit-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: decoded.room, username: decoded.username }),
          });
          if (!resp.ok) throw new Error((await resp.json()).error || 'Failed to get connection token.');
          const data = await resp.json();
          setLivekitToken(data.livekit_token);
        } catch (e) { setError(e instanceof Error ? e.message : 'An unknown error occurred.'); }
      })();
    } catch(e) {
        setError("Invalid access token provided.");
        router.push('/');
    }

  }, [searchParams, router]);
  
  const handleDisconnect = () => setIsDisconnected(true);

  if (isDisconnected) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h2 className="text-2xl mb-4 text-yellow-500">Disconnected</h2>
        <p className="mb-6">The room session has ended.</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700">Return to Homepage</button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h2 className="text-2xl mb-4 text-red-500">Connection Error</h2>
        <p className="mb-6">{error}</p>
        <button onClick={() => router.push('/')} className="px-4 py-2 bg-indigo-600 rounded-md hover:bg-indigo-700">Return to Lobby</button>
      </div>
    );
  }

  if (livekitToken === '') {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Connecting...</div>;
  }

  const roomAccessToken = searchParams.get('token');
  const decodedToken: { isAdmin?: boolean } = roomAccessToken ? jwtDecode(roomAccessToken) : {};

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={livekitToken}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: '100vh', background: '#1a1a1a' }}
      onDisconnected={handleDisconnect}
    >
      <RoomContent isAdmin={decodedToken.isAdmin || false} />
    </LiveKitRoom>
  );
}