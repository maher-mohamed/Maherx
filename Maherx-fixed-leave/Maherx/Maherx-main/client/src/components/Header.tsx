import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Copy, Check, LogOut, Wifi, WifiOff, Trophy, AlertTriangle, X } from 'lucide-react';
import { Room, Player } from '../types/game';
import { soundManager } from '../utils/sound';

interface HeaderProps {
  room: Room | null;
  myPlayer: Player | null;
  isConnected: boolean;
  onLeaveRoom: () => void;
  onOpenLeaderboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  room,
  isConnected,
  onLeaveRoom,
  onOpenLeaderboard
}) => {
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const toggleMute = () => {
    soundManager.isMuted = !soundManager.isMuted;
    setIsMuted(soundManager.isMuted);
    if (!soundManager.isMuted) {
      soundManager.play('POP');
    }
  };

  const copyRoomCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    soundManager.play('POP');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmLeave = () => {
    soundManager.play('POP');
    setShowLeaveConfirm(false);
    onLeaveRoom();
  };

  return (
    <>
      <header className="w-full bg-[#070e1e]/95 backdrop-blur-md border-b border-blue-500/20 sticky top-0 z-50 px-4 py-3 sm:px-6 shadow-lg shadow-black/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Logo: White M PNG Icon + Regular MAHERX Text */}
          <div className="flex items-center gap-3">
            {/* White M Logo PNG with suitable clean sizing */}
            <img
              src="/assets/whitemm.png"
              alt="Maherx White M Icon"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain drop-shadow-[0_0_14px_rgba(56,189,248,0.5)] transition-transform hover:scale-105"
            />

            {/* Regular Styled Text MAHERX */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-sky-200 to-blue-400 uppercase font-sans select-none">
                  MAHERX
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-sky-300 border border-blue-500/30">
                  GAMES
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">منصة ألعاب الحفلات والشلة</p>
            </div>
          </div>

          {/* Room Code & Stats (When in room) */}
          {room && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyRoomCode}
                title="نسخ رمز الغرفة"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-sky-300 text-sm font-mono font-bold transition-all shadow-sm active:scale-95"
              >
                <span className="tracking-widest uppercase text-base">{room.code}</span>
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              {onOpenLeaderboard && (
                <button
                  onClick={onOpenLeaderboard}
                  title="لوحة الصدارة"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all active:scale-95"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>النقاط</span>
                </button>
              )}
            </div>
          )}

          {/* Controls & Connection Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5 animate-pulse" />}
              <span className="hidden md:inline">{isConnected ? 'متصل' : 'جارِ الاتصال'}</span>
            </div>

            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all active:scale-90"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
            </button>

            {room && (
              <button
                onClick={() => setShowLeaveConfirm(true)}
                title="مغادرة الغرفة"
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all active:scale-90"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Custom Leave Room Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-sm sm:max-w-md bg-[#081024]/95 border border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-rose-950/50 text-center space-y-5 overflow-hidden"
            >
              {/* Background ambient red glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

              {/* Close Icon in corner */}
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Warning Icon Badge */}
              <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
                <AlertTriangle className="w-8 h-8" />
              </div>

              {/* Texts */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">مغادرة الغرفة؟</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  هل أنت متأكد أنك تريد مغادرة الغرفة والعودة للرئيسية؟
                </p>
                <p className="text-[11px] text-rose-400/90 font-medium">
                  ستفقد مكانك الحالي في الجولة إذا كانت اللعبة قد بدأت.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs sm:text-sm border border-white/10 active:scale-95 transition-all"
                >
                  البقاء في اللعبة
                </button>
                <button
                  onClick={handleConfirmLeave}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>نعم، خروج</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
