import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import { ShieldCheck, School, Users, ArrowRight } from 'lucide-react';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const result = login(email, password);
    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    const result = login(demoEmail, demoPass);
    if (result.success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sign In / Select Portal Role">
      <div className="space-y-6 text-left">
        
        {/* Quick Demo Logins */}
        <div className="space-y-3">
          <label className="block text-xs font-extrabold uppercase text-emerald-800 font-outfit tracking-wider">
            Quick One-Click Demo Logins
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

            <button
              type="button"
              onClick={() => handleQuickLogin('admin.kitende@uneb.go.ug', 'admin123')}
              className="p-3 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl text-left transition-all group flex items-center justify-between shadow-xs hover:shadow-sm"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center space-x-1.5">
                  <School className="w-4 h-4 text-blue-600" />
                  <span>O-Level Admin</span>
                </div>
                <span className="text-[10px] text-slate-500">Kitende UCE Standard</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin.mengo@uneb.go.ug', 'admin123')}
              className="p-3 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl text-left transition-all group flex items-center justify-between shadow-xs hover:shadow-sm"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center space-x-1.5">
                  <School className="w-4 h-4 text-emerald-600" />
                  <span>A-Level Admin</span>
                </div>
                <span className="text-[10px] text-slate-500">Mengo UACE Points</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('tr.mukasa@kitende.edu.ug', 'teacher123')}
              className="p-3 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-xl text-left transition-all group flex items-center justify-between shadow-xs hover:shadow-sm"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center space-x-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Teacher Portal</span>
                </div>
                <span className="text-[10px] text-slate-500">Tr. Mukasa (Mark Entry)</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
            </button>

          </div>
        </div>

        <div className="relative border-t border-slate-200 my-4 text-center">
          <span className="bg-white px-3 text-[10px] text-slate-500 uppercase font-bold absolute -top-2 left-1/2 -translate-x-1/2">
            OR ENTER CUSTOM CREDENTIALS
          </span>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="user@uneb.go.ug"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            Sign In to Portal
          </button>
        </form>

      </div>
    </Modal>
  );
}
