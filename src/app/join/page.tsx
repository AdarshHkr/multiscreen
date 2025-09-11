'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';

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
     <>
      <Header />
      <main>
        <div className="createRoomContainer">
          <div className="form_area">
            {isWaiting ? (
              // --- WAITING ROOM VIEW ---
              <div style={{ textAlign: 'center' }}>
                <p className="title">You are in the waiting room</p>
                <p className="sub_title" style={{ marginTop: '1rem' }}>{statusMessage}</p>
                <div className="spinner"></div>
              </div>
            ) : (
              // --- JOIN FORM VIEW ---
              <>
                <p className="title">Join a Room</p>
                <form onSubmit={handleSubmit}>
                  <div className="form_group">
                    <label className="sub_title" htmlFor="name">Your Name</label>
                    <input
                      id="name"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="form_style"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div className="form_group">
                    <label className="sub_title" htmlFor="room">Room Name</label>
                    <input
                      id="room"
                      type="text"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      required
                      className="form_style"
                      placeholder="Enter the room name"
                    />
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      className="btn"
                    >
                      Join as Participant
                    </button>
                    {error && <p style={{color: '#F87171', fontSize: '14px', marginTop: '-15px'}}>{error}</p>}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}