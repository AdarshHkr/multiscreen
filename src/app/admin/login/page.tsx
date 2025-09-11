'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

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

      const { room_access_token } = await joinResponse.json();
      router.push(`/room/${roomName}?token=${room_access_token}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main >
      <Header />
      
        <div className="createRoomContainer">
          <div className="form_area">
            <p className="title">Admin Login</p>

            <form onSubmit={handleSubmit}>
              {/* Username (Your Name) Input */}
              <div className="form_group">
                <label className="sub_title"htmlFor="username">Your Name</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="form_style"
                  placeholder="Enter your name"
                />
              </div>

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
                  placeholder="Enter the room name"
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
                  required
                  className="form_style"
                  placeholder="Enter your password"
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn"
                >
                  {isLoading ? 'Logging In...' : 'Log In & Join Room'}
                </button>
                
                {/* Error message with visible color for dark theme */}
                {error && <p style={{color: '#F87171', fontSize: '14px', marginTop: '-15px'}}>{error}</p>}

                <p>
                  Don&apos;t have a room?
                  <Link href="/admin/create" className="link">
                    Create one
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
    </main>
  );
}