'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function AdminCreatePage() {
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isWaitingRoomEnabled, setIsWaitingRoomEnabled] = useState(true); // Default to true
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const createResponse = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminName,
          password,
          roomName,
          isWaitingRoomEnabled, // Send the correct state
        }),
      });

      if (!createResponse.ok) {
        const { error: errorMessage } = await createResponse.json();
        throw new Error(errorMessage || 'Failed to create room.');
      }
      
      alert('Room created successfully! Please log in to continue.');
      router.push('/admin/login');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center p-6 sm:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100">Create Room</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="adminName" className="block text-sm font-medium text-gray-300">
              admin name
            </label>
            <input id="adminName" type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"/>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              password
            </label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"/>
          </div>
          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-300">
              roomname
            </label>
            <input id="roomName" type="text" value={roomName} onChange={(e) => setRoomName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md"/>
          </div>
          <div className="flex items-center">
            <input
              id="waiting-room"
              type="checkbox"
              checked={isWaitingRoomEnabled}
              onChange={(e) => setIsWaitingRoomEnabled(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label htmlFor="waiting-room" className="ml-2 block text-sm text-gray-300">
              Enable Waiting Room
            </label>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            {isLoading ? 'Creating Room...' : 'create room'}
          </button>
        </form>
        <div className="text-center mt-6">
          <Link href="/admin/login" className="text-sm text-indigo-400 hover:text-indigo-300">
            Already have a room? Login.
          </Link>
        </div>
      </div>
    </main>
  );
}