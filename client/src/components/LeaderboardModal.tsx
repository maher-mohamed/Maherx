import React from 'react';
import { motion } from 'framer-motion';
import { X, Trophy, Medal, Crown } from 'lucide-react';
import { Room } from '../types/game';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, room }) => {
  if (!isOpen || !room) return null;

  const sortedPlayers = Object.values(room.players).sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass-panel w-full max-w-md rounded-3xl p-6 text-white relative overflow-hidden border border-white/10 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-xl font-black">لوحة الصدارة والترتيب</h3>
              <p className="text-xs text-slate-400">إجمالي النقاط في جميع الجولات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {sortedPlayers.map((player, index) => {
            const isFirst = index === 0;
            const isSecond = index === 1;
            const isThird = index === 2;

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isFirst
                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-500/40 text-amber-200'
                    : isSecond
                    ? 'bg-gradient-to-r from-slate-400/20 to-slate-300/10 border-slate-400/30 text-slate-200'
                    : isThird
                    ? 'bg-gradient-to-r from-amber-700/20 to-amber-600/10 border-amber-700/30 text-amber-400'
                    : 'bg-white/5 border-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-black text-sm">
                    {isFirst ? '🥇' : isSecond ? '🥈' : isThird ? '🥉' : `#${index + 1}`}
                  </span>
                  <span className="text-2xl">{player.avatar}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white">{player.nickname}</span>
                      {player.isHost && (
                        <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 inline" />
                      )}
                    </div>
                    {!player.isConnected && (
                      <span className="text-[10px] text-rose-400">غير متصل</span>
                    )}
                  </div>
                </div>

                <div className="text-left font-mono font-black text-base text-amber-400">
                  {player.score} <span className="text-[10px] font-sans text-slate-400 font-normal">نقطة</span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
