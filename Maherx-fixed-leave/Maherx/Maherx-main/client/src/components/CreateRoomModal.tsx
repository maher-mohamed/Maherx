import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, Lock, ArrowLeft } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (nickname: string, avatar: string, maxPlayers?: number, password?: string) => void;
}

const AVATARS = ['👑', '🦁', '🦊', '🐼', '🦹', '🧙‍♂️', '🤖', '👻', '🐱', '🦄', '⚡', '🚀', '🎭', '🥑', '🍕', '🎯'];

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👑');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [password, setPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onCreate(nickname.trim(), selectedAvatar, maxPlayers, hasPassword ? password : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-950/50"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header with PNG Logo */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0047ba] flex items-center justify-center shadow-lg shadow-blue-600/40 p-1">
              <img src="/assets/whitemm.png" alt="M" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">إنشاء غرفة جديدة</h2>
              <p className="text-xs text-slate-400">كن المضيف وتحكم في مجريات اللعبة والأصدقاء</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {/* Avatar selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">اختر الأفاتار الخاص بك:</label>
            <div className="grid grid-cols-8 gap-2 p-2 bg-black/40 rounded-2xl border border-blue-500/20 max-h-32 overflow-y-auto">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl p-2 rounded-xl transition-all aspect-square flex items-center justify-center ${
                    selectedAvatar === avatar
                      ? 'bg-gradient-to-tr from-blue-600 to-cyan-500 shadow-md scale-110 ring-2 ring-white/50'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {/* Nickname input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">اسمك المستعار:</label>
            <input
              type="text"
              required
              maxLength={18}
              placeholder="مثال: البطل، المحقق، سلومة..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-blue-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 text-sm font-medium transition-all"
            />
          </div>

          {/* Max players slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" />
                <span>الحد الأقصى للاعبين:</span>
              </label>
              <span className="text-sm font-black text-sky-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/30">
                {maxPlayers} لاعبين
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={16}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full accent-blue-500 bg-white/10 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2 لاعبين</span>
              <span>8 لاعبين</span>
              <span>16 لاعب</span>
            </div>
          </div>

          {/* Optional Password PIN */}
          <div className="p-3 bg-white/5 rounded-2xl border border-blue-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>حماية الغرفة برمز سري (PIN)</span>
              </label>
              <input
                type="checkbox"
                checked={hasPassword}
                onChange={(e) => setHasPassword(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-500 cursor-pointer"
              />
            </div>
            {hasPassword && (
              <input
                type="text"
                maxLength={6}
                placeholder="أدخل رمز PIN من أرقام أو حروف (مثال: 1234)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-black/40 border border-blue-500/30 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={!nickname.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed font-black text-white shadow-xl shadow-blue-600/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>ابدأ الغرفة الآن</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

