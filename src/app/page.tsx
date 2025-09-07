'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-[calc(100vh-68px)] flex-col items-center justify-center p-6 sm:p-24">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Join Room (as User) */}
        <Link href="/join" className="block w-64 h-48 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-xl hover:shadow-2xl hover:border-indigo-500 transition-all duration-300 flex items-center justify-center p-4">
          <span className="text-xl font-semibold text-white">Join Room (as User)</span>
        </Link>

        {/* Create Room (as Admin) */}
        <Link href="/admin/create" className="block w-64 h-48 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-xl hover:shadow-2xl hover:border-green-500 transition-all duration-300 flex items-center justify-center p-4">
          <span className="text-xl font-semibold text-white">Create Room (as Admin)</span>
        </Link>
        
        {/* Join Room (as Admin) */}
        <Link href="/admin/login" className="block w-64 h-48 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-xl hover:shadow-2xl hover:border-yellow-500 transition-all duration-300 flex items-center justify-center p-4">
          <span className="text-xl font-semibold text-white">Join Room (as Admin)</span>
        </Link>
      </div>
    </main>
  );
}