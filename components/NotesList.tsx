'use client';

import { useState } from 'react';

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface NotesListProps {
  notes: Note[];
  onDelete: (noteId: string) => void;
  token: string;
}

export default function NotesList({ notes, onDelete, token }: NotesListProps) {
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleEdit = (note: Note) => {
    setEditingNote(note._id);
    setEditTitle(note.title);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update note');
      }

      setEditingNote(null);
      setEditTitle('');
      setEditContent('');
      // Refresh the page to show updated notes
      window.location.reload();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update note');
    }
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditTitle('');
    setEditContent('');
  };

  const getNoteColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-red-500 to-red-600',
      'from-teal-500 to-teal-600',
    ];
    return colors[index % colors.length];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
          <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No notes yet</h3>
        <p className="text-white/80 mb-6">Create your first note to get started with organizing your thoughts and ideas.</p>
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Click "Create Note" to begin
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {notes.map((note, index) => (
        <div 
          key={note._id} 
          className={`note-card group animate-fade-in`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {editingNote === note._id ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Edit Note</h3>
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              </div>
              
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input text-lg font-semibold"
                placeholder="Note title"
                autoFocus
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="input h-32 resize-none"
                placeholder="Note content"
              />
              
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleSaveEdit(note._id)}
                  className="btn btn-success flex-1 text-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="btn btn-secondary flex-1 text-sm"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Note Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {note.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDate(note.createdAt)}
                    {note.updatedAt !== note.createdAt && (
                      <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                        Updated
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getNoteColor(index)} ml-2`}></div>
              </div>

              {/* Note Content */}
              <div className="flex-1 mb-4">
                <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed">
                  {note.content}
                </p>
              </div>

              {/* Note Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="btn btn-ghost text-xs px-3 py-1.5 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(note._id)}
                    className="btn btn-ghost text-xs px-3 py-1.5 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
                
                <div className="text-xs text-gray-400">
                  {note.content.length > 100 ? 'Long note' : 'Short note'}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
