'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  subscription: 'free' | 'pro';
  noteLimit: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminPanelProps {
  user: User;
  token: string;
  onClose: () => void;
}

export default function AdminPanel({ user, token, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'member'>('member');
  const [isInviting, setIsInviting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notesCount, setNotesCount] = useState(0);

  // Fetch real data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tenant info
        const tenantSlug = user.email.includes('acme') ? 'acme' : 'globex';
        const tenantResponse = await fetch(`/api/tenants/${tenantSlug}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (tenantResponse.ok) {
          const tenantData = await tenantResponse.json();
          setTenant(tenantData.tenant);
        }

        // Fetch notes count
        const notesResponse = await fetch('/api/notes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          setNotesCount(notesData.notes.length);
        }

        // Fetch users
        const usersResponse = await fetch('/api/tenants/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        } else {
          // Fallback to current user if API fails
          setUsers([user]);
        }
        
      } catch (err) {
        setError('Failed to load admin data');
        console.error('Admin data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, token]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail.trim()) return;

    setIsInviting(true);
    try {
      // This would call a real invite API endpoint
      const response = await fetch('/api/tenants/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newUserEmail,
          role: newUserRole,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(`User ${newUserEmail} has been added to the tenant. Temporary password: ${data.tempPassword}`);
        setNewUserEmail('');
        // Refresh users list
        const usersResponse = await fetch('/api/tenants/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        }
      } else {
        const data = await response.json();
        alert(`Failed to add user: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const getTenantInfo = () => {
    const isAcme = user.email.includes('acme');
    return {
      name: isAcme ? 'Acme Corporation' : 'Globex Corporation',
      slug: isAcme ? 'acme' : 'globex',
      color: isAcme ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600',
      icon: isAcme ? '🏢' : '🌐'
    };
  };

  const tenantInfo = getTenantInfo();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-bounce-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${tenantInfo.color} flex items-center justify-center text-white font-bold text-lg`}>
              {tenantInfo.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
              <p className="text-gray-600">{tenantInfo.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost p-2 hover:bg-gray-100 rounded-xl"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'users', label: 'Users', icon: '👥' },
            { id: 'settings', label: 'Settings', icon: '⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 pulse-glow">
                <svg className="w-6 h-6 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="text-gray-600">Loading admin data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-error">
            {error}
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Tenant Overview</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Notes</p>
                        <p className="text-3xl font-bold text-gray-900">{notesCount}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Plan</p>
                        <p className="text-3xl font-bold gradient-text">
                          {tenant?.subscription === 'pro' ? 'Pro' : 'Free'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Tenant Information</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Company Name</span>
                      <span className="text-sm text-gray-900">{tenant?.name || 'Loading...'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Tenant Slug</span>
                      <span className="text-sm text-gray-900">{tenant?.slug || 'Loading...'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Note Limit</span>
                      <span className="text-sm text-gray-900">
                        {tenant?.noteLimit === -1 ? 'Unlimited' : tenant?.noteLimit || 'Loading...'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Created</span>
                      <span className="text-sm text-gray-900">
                        {tenant?.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'Loading...'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">User Management</h3>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="btn btn-primary"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Invite User
                  </button>
                </div>

                {/* Invite Form */}
                <div className="card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Invite New User</h4>
                  <form onSubmit={handleInviteUser} className="space-y-4">
                    <div>
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        className="input"
                        placeholder="user@company.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Role</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value as 'admin' | 'member')}
                        className="input"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isInviting || !newUserEmail.trim()}
                      className="btn btn-primary"
                    >
                      {isInviting ? 'Sending...' : 'Send Invitation'}
                    </button>
                  </form>
                </div>

                {/* User List */}
                <div className="card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Current Users</h4>
                  {users.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No users found</p>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user, index) => (
                        <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                              user.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'
                            }`}>
                              {user.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.email}</p>
                              <p className="text-sm text-gray-600 capitalize">{user.role}</p>
                            </div>
                          </div>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Tenant Settings</h3>
                
                <div className="card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Subscription</h4>
                  <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${
                    tenant?.subscription === 'pro' 
                      ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200' 
                      : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                  }`}>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {tenant?.subscription === 'pro' ? 'Pro Plan' : 'Free Plan'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {tenant?.subscription === 'pro' 
                          ? 'Unlimited notes and features' 
                          : 'Limited to 3 notes'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold gradient-text">
                        {tenant?.noteLimit === -1 ? '∞' : tenant?.noteLimit || '3'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tenant?.noteLimit === -1 ? 'unlimited' : 'notes max'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Tenant Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        value={tenant?.name || 'Loading...'}
                        className="input"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="form-label">Tenant Slug</label>
                      <input
                        type="text"
                        value={tenant?.slug || 'Loading...'}
                        className="input"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="form-label">Created</label>
                      <input
                        type="text"
                        value={tenant?.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : 'Loading...'}
                        className="input"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="form-label">Last Updated</label>
                      <input
                        type="text"
                        value={tenant?.updatedAt ? new Date(tenant.updatedAt).toLocaleDateString() : 'Loading...'}
                        className="input"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h4>
                  <div className="space-y-3">
                    <button className="btn btn-danger w-full">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete Tenant
                    </button>
                    <p className="text-xs text-gray-500">This action cannot be undone. All data will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
