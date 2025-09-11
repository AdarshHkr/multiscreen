'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

export default function AdminCreatePage() {
  const [adminName, setAdminName] = useState('');
  const [password, setPassword] = useState('');
  const [roomName, setRoomName] = useState('');
  // The isWaitingRoomEnabled state is kept for functionality but the UI element is removed per the design.
  const [isWaitingRoomEnabled, setIsWaitingRoomEnabled] = useState(true);
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
          isWaitingRoomEnabled,
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

  return (<>
    <Header></Header>

    <main >
     <div className="createRoomContainer"> {/* Renamed class */}
      <div className="form_area">
        <p className="title">Create a new room</p>

        <form onSubmit={handleSubmit}>
          {/* Room Name Input */}
          <div className="form_group">
            <label className="sub_title" htmlFor="roomName">Room Name</label>
            <input
              id="roomName"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              className="form_style"
              placeholder="Enter a room name"
            />
          </div>

          {/* Password Input */}
          <div className="form_group">
            <label className="sub_title" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form_style"
              placeholder="Enter a password (optional)"
            />
          </div>

          {/* Admin Name Input */}
          <div className="form_group">
            <label className="sub_title" htmlFor="adminName">Your Name</label>
            <input
              id="adminName"
              type="text"
              value={adminName}
              onChange={(e) => setAdminName(e.target.value)}
              required
              className="form_style"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn"
            >
               {isLoading ? 'Creating...' : 'Create Room'} 
              Create Room
            </button>
            
            {/* Error message with updated color for dark theme */}
          {error && <p style={{color: '#F87171', fontSize: '14px', marginTop: '-15px'}}>{error}</p>} 

            <p>
              Already have a room?
              <Link href="/admin/login" className="link">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
    </main></>
  );
}