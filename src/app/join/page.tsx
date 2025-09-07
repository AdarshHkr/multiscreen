'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

export default function JoinPage() {
  const [room, setRoom] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const router = useRouter();
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const attemptToJoin = async (isPollingRequest: boolean) => {
    const apiUrl = isPollingRequest ? '/api/join-room?polling=true' : '/api/join-room';

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, room }),
      });

      const data = await response.json();

      if (response.ok) {
        stopPolling();
        router.push(`/room/${room}?token=${data.room_access_token}`);
      } else if (response.status === 428) { // Waiting
        if (!isWaiting) setIsWaiting(true);
        setStatusMessage(data.error || 'Awaiting admin approval...');
        if (!pollingInterval.current) {
          pollingInterval.current = setInterval(() => attemptToJoin(true), 5000);
        }
      } else { // Denied, not found, etc.
        stopPolling();
        setIsWaiting(false);
        setError(data.error || 'Failed to join the room.');
      }
    } catch (err) {
      stopPolling();
      setIsWaiting(false);
      setError('A network error occurred. Please try again.');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isWaiting) return;
    setError('');
    setStatusMessage('');
    await attemptToJoin(false);
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-900 text-white">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          {isWaiting ? (
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">You are in the waiting room</h1>
              <p className="text-gray-400">{statusMessage}</p>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-center mb-2">Join a Room</h1>
              <p className="text-center text-gray-400 mb-8">Enter your name and the room name provided by the admin.</p>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300">Your Name</label>
                  <input id="name" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"/>
                </div>
                <div>
                  <label htmlFor="room" className="block text-sm font-medium text-gray-300">Room Name</label>
                  <input id="room" type="text" value={room} onChange={(e) => setRoom(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"/>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Join as Participant
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}