// src/app/admin/page.tsx
import Link from 'next/link';

export default function AdminHubPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 text-center">
        <h1 className="text-4xl font-bold mb-8">Admin Portal</h1>
        <p className="text-gray-400 mb-12">What would you like to do?</p>
        <div className="space-y-4">
          <Link 
            href="/admin/login" 
            className="block w-full text-center py-3 px-4 rounded-md shadow-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Login to an Existing Room
          </Link>
          <Link 
            href="/admin/create" 
            className="block w-full text-center py-3 px-4 rounded-md shadow-sm font-medium text-white bg-gray-700 hover:bg-gray-600"
          >
            Create a New Room
          </Link>
        </div>
      </div>
    </main>
  );
}