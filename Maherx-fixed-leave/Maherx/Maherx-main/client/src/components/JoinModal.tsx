import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, ArrowLeft, KeyRound } from 'lucide-react';

interface JoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string, nickname: string, avatar: string, password?: string) => void;
  initialRoomCode?: string;
}

const AVATARS = ['🦊', '🐼', '🦁', '🐱', '🦹', '🧙‍♂️', '🤖', '👻', '🦄', '⚡', '🚀', '🎭', '🥑', '🍕', '🎯', '👑'];

export const JoinModal: React.FC<JoinModalProps> = ({
  isOpen,
  onClose,
  onJoin,
  initialRoomCode = ''
}) => {
  const [roomCode, setRoomCode] = useState(initialRoomCode);
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦊');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim() || !nickname.trim()) return;
    onJoin(roomCode.trim().toUpperCase(), nickname.trim(), selectedAvatar, password ? password.trim() : undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden border border-blue-500/30 shadow-2xl shadow-blue-950/50"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header with PNG Logo */}
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0047ba] flex items-center justify-center shadow-lg shadow-blue-600/40 p-1">
              <img src="/assets/whitemm.png" alt="M" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black">الانضمام إلى غرفة</h2>
              <p className="text-xs text-slate-400">أدخل رمز الغرفة المكون من 5 أحرف واسمك</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative z-10">
          {/* Room Code */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span>رمز الغرفة (5 أحرف):</span>
            </label>
            <input
              type="text"
              required
              maxLength={5}
              placeholder="مثال: X7K9L"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-blue-500/30 text-white placeholder-slate-500 font-mono tracking-widest text-center uppercase text-xl font-black focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
            />
          </div>

          {/* Avatar selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">اختر الأفاتار الخاص بك:</label>
            <div className="grid grid-cols-8 gap-2 p-2 bg-black/40 rounded-2xl border border-blue-500/20 max-h-28 overflow-y-auto">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`text-2xl p-2 rounded-xl transition-all aspect-square flex items-center justify-center ${
                    selectedAvatar === avatar
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md scale-110 ring-2 ring-white/50'
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
              placeholder="أدخل اسمك داخل اللعبة"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-blue-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 text-sm font-medium transition-all"
            />
          </div>

          {/* Password (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>كلمة المرور (إذا كانت الغرفة مقفلة برمز PIN):</span>
            </label>
            <input
              type="text"
              placeholder="اتركه فارغاً إذا لم تكن الغرفة مقفلة"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-blue-500/20 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 text-sm font-medium transition-all"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!roomCode.trim() || !nickname.trim()}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-blue-600 hover:from-cyan-400 hover:via-blue-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-black text-white shadow-xl shadow-blue-600/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>انضمام للغرفة</span>
            <ArrowLeft className="w-5 h-5" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

