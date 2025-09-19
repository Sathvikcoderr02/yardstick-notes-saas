'use client';

import { useState, useEffect } from 'react';
import NotesList from './NotesList';
import CreateNoteForm from './CreateNoteForm';
import UpgradePrompt from './UpgradePrompt';
import AdminPanel from './AdminPanel';

interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesAppProps {
  user: User;
  token: string;
  onLogout: () => void;
}

export default function NotesApp({ user, token, onLogout }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/notes', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch notes');
      }

      setNotes(data.notes);
    } catch (err) {
      console.error('Error fetching notes:', err);
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotes();
    }
  }, [token]);

  const handleCreateNote = async (title: string, content: string) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.limitReached) {
          setShowUpgradePrompt(true);
          return;
        }
        throw new Error(data.error || 'Failed to create note');
      }

      setNotes([data.note, ...notes]);
      setShowCreateForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete note');
      }

      setNotes(notes.filter(note => note._id !== noteId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleUpgrade = async () => {
    try {
      const tenantSlug = user.email.includes('acme') ? 'acme' : 'globex';
      const response = await fetch(`/api/tenants/${tenantSlug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upgrade');
      }

      setShowUpgradePrompt(false);
      alert('Successfully upgraded to Pro plan! You can now create unlimited notes.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade');
    }
  };

  const getTenantInfo = () => {
    const isAcme = user.email.includes('acme');
    return {
      name: isAcme ? 'Acme Corporation' : 'Globex Corporation',
      color: isAcme ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600',
      icon: isAcme ? '🏢' : '🌐'
    };
  };

  const tenantInfo = getTenantInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-white">Loading your workspace...</p>
          {error && (
            <div className="mt-4">
              <p className="text-red-400 mb-2">{error}</p>
              <button
                onClick={fetchNotes}
                className="btn btn-primary text-sm"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="glass border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${tenantInfo.color} flex items-center justify-center text-white font-bold text-lg`}>
                {tenantInfo.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Yardstick Notes</h1>
                <p className="text-xs text-white/80">{tenantInfo.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-white">{user.email}</p>
                <p className="text-xs text-white/80 capitalize">{user.role} • {notes.length} notes</p>
              </div>
              
              {user.role === 'admin' && (
                <button
                  onClick={() => setShowAdminPanel(true)}
                  className="btn btn-secondary text-sm text-white hover:bg-white/20"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin
                </button>
              )}
              
              <button
                onClick={onLogout}
                className="btn btn-secondary text-sm text-white hover:bg-white/20"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {error && (
          <div className="alert alert-error animate-slide-up mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center space-x-4 mb-2">
                <h2 className="text-3xl font-bold text-white">
                  Your Notes
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-semibold rounded-full">
                    Pro Plan
                  </span>
                  <span className="text-xs text-white/80">Unlimited</span>
                </div>
              </div>
              <p className="text-white/90">
                {notes.length === 0 
                  ? "No notes yet. Create your first note to get started!" 
                  : `You have ${notes.length} ${notes.length === 1 ? 'note' : 'notes'} in your workspace.`
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn btn-primary text-base px-8 py-3 shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Note
              </button>
            </div>
          </div>
        </div>

        {/* Create Note Form */}
        {showCreateForm && (
          <div className="mb-8 animate-slide-up">
            <CreateNoteForm
              onSubmit={handleCreateNote}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {/* Notes Grid */}
        <div className="animate-fade-in">
          <NotesList
            notes={notes}
            onDelete={handleDeleteNote}
            token={token}
          />
        </div>

        {/* Upgrade Prompt Modal */}
        {showUpgradePrompt && (
          <UpgradePrompt
            onUpgrade={handleUpgrade}
            onCancel={() => setShowUpgradePrompt(false)}
          />
        )}

        {/* Admin Panel Modal */}
        {showAdminPanel && (
          <AdminPanel
            user={user}
            token={token}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </main>
    </div>
  );
}
