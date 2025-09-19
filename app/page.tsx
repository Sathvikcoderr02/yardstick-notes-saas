'use client';

import { useState, useEffect } from 'react';
import LoginForm from '@/components/LoginForm';
import NotesApp from '@/components/NotesApp';

interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!user || !token) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return <NotesApp user={user} token={token} onLogout={handleLogout} />;
}
