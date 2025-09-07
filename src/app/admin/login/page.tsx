'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Step 1: Log in the admin to get the main authentication token
      const loginResponse = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, roomName }),
      });

      if (!loginResponse.ok) {
        const { error: errorMessage } = await loginResponse.json();
        throw new Error(errorMessage || 'Failed to log in. Please check your credentials.');
      }

      const { token: adminAuthToken } = await loginResponse.json();
      localStorage.setItem('admin-auth-token', adminAuthToken);

      // Step 2: Use the auth token to join the room and get a room_access_token
      const joinResponse = await fetch('/api/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminAuthToken}`,
        },
        body: JSON.stringify({ username, room: roomName }),
      });

      if (!joinResponse.ok) {
          const { error: joinError } = await joinResponse.json();
          throw new Error(joinError || 'Logged in, but failed to join the room.');
      }

      // Step 3: Redirect to the room with the final room access token
      const { room_access_token } = await joinResponse.json();
      router.push(`/room/${roomName}?token=${room_access_token}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center p-6 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100">Admin Login</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300">
              admin name
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-300">
              roomname
            </label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-white focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isLoading ? 'Logging In...' : 'Log In & Join Room'}
          </button>
        </form>
        <div className="text-center mt-6">
          <Link href="/admin/create" className="text-sm text-indigo-400 hover:text-indigo-300">
            Don&apos;t have a room? Create one.
          </Link>
        </div>
      </div>
    </main>
  );
}