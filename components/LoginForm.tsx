'use client';

import { useState } from 'react';

interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

interface LoginFormProps {
  onLogin: (user: User, token: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onLogin(data.user, data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const testAccounts = [
    { email: 'admin@acme.test', role: 'Admin', tenant: 'Acme', color: 'from-blue-500 to-blue-600' },
    { email: 'user@acme.test', role: 'Member', tenant: 'Acme', color: 'from-green-500 to-green-600' },
    { email: 'admin@globex.test', role: 'Admin', tenant: 'Globex', color: 'from-purple-500 to-purple-600' },
    { email: 'user@globex.test', role: 'Member', tenant: 'Globex', color: 'from-pink-500 to-pink-600' },
  ];

  const handleTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-floating"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-floating" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-floating" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Login Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mb-4 pulse-glow">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">
              Yardstick Notes
            </h1>
            <p className="text-gray-600 font-medium">
              Multi-Tenant SaaS Platform
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  className={`input ${error ? 'input-error' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error animate-slide-up">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Test Accounts */}
          <div className="mt-8">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Quick Test Accounts</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((account, index) => (
                <button
                  key={account.email}
                  onClick={() => handleTestAccount(account.email)}
                  className={`p-3 rounded-xl text-xs font-medium text-white transition-all duration-200 hover:scale-105 hover:shadow-lg bg-gradient-to-r ${account.color}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="font-semibold">{account.role}</div>
                  <div className="opacity-90">{account.tenant}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                All test accounts use password: <span className="font-mono font-semibold">password</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <p className="text-sm text-white/80">
            Secure • Scalable • Multi-Tenant
          </p>
        </div>
      </div>
    </div>
  );
}
