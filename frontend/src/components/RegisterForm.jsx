import React, { useState } from 'react';
import { registerUser } from '../api/user.api';
import { useDispatch } from 'react-redux';
import { login } from '../store/slice/authSlice';
import { useNavigate } from '@tanstack/react-router';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!name || !email || !password) return;
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = await registerUser(name, password, email);
      dispatch(login(data.user));
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-xs text-white/40 mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 text-sm"
        />
      </div>
      
      <div>
        <label className="block text-xs text-white/40 mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 text-sm"
        />
      </div>
      
      <div>
        <label className="block text-xs text-white/40 mb-2">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full px-3 py-2.5 bg-[#0a0a0a] border border-white/[0.08] rounded-lg text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 text-sm"
        />
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={loading || !name || !email || !password}
        className="w-full py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors mt-2"
      >
        {loading ? 'Creating...' : 'Create account'}
      </button>
    </div>
  );
};

export default RegisterForm;