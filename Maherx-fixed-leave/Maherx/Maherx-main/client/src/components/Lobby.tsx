import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Play,
  UserX,
  Share2,
  Copy,
  Check,
  Sparkles,
  Lock,
  Users,
  CheckCircle2,
  Palette
} from 'lucide-react';
import { Room, Player, GameType } from '../types/game';
import { soundManager } from '../utils/sound';

interface LobbyProps {
  room: Room;
  myPlayer: Player | null;
  onSelectGame: (gameType: GameType) => void;
  onToggleReady: () => void;
  onKickPlayer: (playerId: string) => void;
  onStartGame: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  room,
  myPlayer,
  onSelectGame,
  onToggleReady,
  onKickPlayer,
  onStartGame
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = myPlayer?.isHost || false;
  const playersList = Object.values(room.players);
  const connectedCount = playersList.filter(p => p.isConnected).length;

  const copyInviteLink = () => {
    const url = `${window.location.origin}?code=${room.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    soundManager.play('POP');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `تعالوا نلعب على منصة ألعاب Maherx! 🎮\nرمز الغرفة: ${room.code}\nادخلوا من هنا: ${window.location.origin}?code=${room.code}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 space-y-6 sm:space-y-8">
      {/* Top Banner: Room Code & Quick Share */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel rounded-3xl p-5 sm:p-6 border border-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-blue-950/30"
      >
        <div className="flex items-center gap-4 text-right">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-500 flex items-center justify-center text-3xl shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/30">
            🛋️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">غرفة الانتظار (اللوبي)</h2>
              {room.settings.password && (
                <span className="flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                  <Lock className="w-3 h-3" />
                  <span>محمية برمز PIN</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              شارك الرمز مع أصدقائك في مكالمة الصوت أو الديسكورد للبدء
            </p>
          </div>
        </div>

        {/* Code badge & Share buttons */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-center">
          <div className="px-4 py-2 rounded-2xl bg-black/50 border border-blue-500/30 flex items-center gap-3">
            <span className="text-xs text-slate-400 font-bold">رمز الغرفة:</span>
            <span className="text-xl sm:text-2xl font-black font-mono tracking-widest text-sky-300 uppercase">
              {room.code}
            </span>
          </div>

          <button
            onClick={copyInviteLink}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-sky-300 border border-blue-500/30 text-xs font-bold transition-all active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
          </button>

          <button
            onClick={shareWhatsApp}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>واتساب</span>
          </button>
        </div>
      </motion.div>

      {/* Game Selection Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-sky-400" />
            <span>الألعاب المتاحة:</span>
          </h3>
          <span className="text-xs text-slate-400">
            {isHost ? 'اختر اللعبة لبدء الجولة' : 'في انتظار اختيار المضيف للعبة...'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Game 1: مين الكداب؟ */}
          <motion.div
            whileHover={isHost ? { scale: 1.02 } : {}}
            whileTap={isHost ? { scale: 0.98 } : {}}
            onClick={() => isHost && onSelectGame('IMPOSTOR')}
            className={`glass-panel rounded-3xl p-5 sm:p-6 border transition-all relative overflow-hidden cursor-pointer ${
              room.selectedGame === 'IMPOSTOR'
                ? 'border-blue-500 bg-gradient-to-br from-blue-950/70 to-indigo-950/70 ring-2 ring-blue-500/50 shadow-xl shadow-blue-500/20'
                : 'border-blue-500/15 hover:border-blue-500/30'
            } ${!isHost && 'cursor-default'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">
                🕵️‍♂️
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-blue-500/20 text-sky-300 font-bold border border-blue-500/30">
                  2 - 16 لاعب
                </span>
                {room.selectedGame === 'IMPOSTOR' && (
                  <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مختارة</span>
                  </span>
                )}
              </div>
            </div>

            <h4 className="text-lg sm:text-xl font-black text-white mt-4">مين الكداب؟ (The Impostor)</h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              كلمة سر سرية يعرفها الجميع إلا <strong className="text-cyan-400">كداب واحد</strong>! ناقشوا واكشفوا الكداب قبل أن يخدعكم جميعاً ويخمن الكلمة.
            </p>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded-lg bg-white/5">⏱️ جولة نقاش وتصويت</span>
              <span className="px-2 py-0.5 rounded-lg bg-white/5">💡 بنك كلمات عربي ضخم</span>
            </div>
          </motion.div>

          {/* Game 3: لوّن المعنى (Fake Artist) */}
          <motion.div
            whileHover={isHost ? { scale: 1.02 } : {}}
            whileTap={isHost ? { scale: 0.98 } : {}}
            onClick={() => isHost && onSelectGame('FAKE_ARTIST')}
            className={`glass-panel rounded-3xl p-5 sm:p-6 border transition-all relative overflow-hidden cursor-pointer ${
              room.selectedGame === 'FAKE_ARTIST'
                ? 'border-cyan-500 bg-gradient-to-br from-cyan-950/70 to-blue-950/70 ring-2 ring-cyan-500/50 shadow-xl shadow-cyan-500/20'
                : 'border-blue-500/15 hover:border-blue-500/30'
            } ${!isHost && 'cursor-default'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
                🎨
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                  2 - 16 لاعب
                </span>
                {room.selectedGame === 'FAKE_ARTIST' && (
                  <span className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مختارة</span>
                  </span>
                )}
              </div>
            </div>

            <h4 className="text-lg sm:text-xl font-black text-white mt-4">لوّن المعنى (Fake Artist)</h4>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              لوحة رسم مشتركة وأدوار متتالية! الجميع يرسم خطاً يعبر عن الكلمة السرية، بينما <strong className="text-sky-400">الرسام الفاشل</strong> لا يعرف الكلمة ويحاول التمويه!
            </p>

            <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
              <span className="px-2 py-0.5 rounded-lg bg-white/5">🖌️ لوحة رسم متزامنة باللمس والماوس</span>
              <span className="px-2 py-0.5 rounded-lg bg-white/5">🎯 جولتان لكل لاعب</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Players Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h3 className="text-base sm:text-lg font-black text-white">اللاعبون في الغرفة</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-sky-300 border border-blue-500/30">
              {connectedCount} / {room.settings.maxPlayers}
            </span>
          </div>
          {connectedCount < 2 && (
            <span className="text-xs text-amber-400">مطلوب لاعبين على الأقل للبدء</span>
          )}
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {playersList.map((player) => {
            const isMe = player.id === myPlayer?.id;

            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-panel rounded-2xl p-4 border flex flex-col items-center text-center relative group ${
                  isMe
                    ? 'border-blue-500/60 bg-blue-950/40'
                    : 'border-blue-500/10 bg-white/5'
                } ${!player.isConnected ? 'opacity-50' : ''}`}
              >
                {isHost && !isMe && (
                  <button
                    onClick={() => onKickPlayer(player.id)}
                    title="طرد اللاعب"
                    className="absolute top-2 left-2 p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/30 text-rose-400 border border-rose-500/20 opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                )}

                <div className="relative mb-2">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-blue-900/60 flex items-center justify-center text-3xl shadow-inner ring-2 ring-blue-500/20">
                    {player.avatar}
                  </div>
                  {player.isHost && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                      <Crown className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                    </div>
                  )}
                </div>

                <div className="w-full">
                  <p className="font-bold text-sm text-white truncate">
                    {player.nickname} {isMe && <span className="text-[11px] text-sky-400">(أنت)</span>}
                  </p>
                  <p className="text-[11px] font-mono text-amber-400 mt-0.5">{player.score} نقطة</p>
                </div>

                <div className="mt-2.5">
                  {player.isHost ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      مضيف الغرفة
                    </span>
                  ) : player.isReady ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      جاهز ✓
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                      في الانتظار
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Action Footer */}
      <div className="glass-panel rounded-3xl p-5 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-right">
          <p className="text-sm font-bold text-white">
            {room.selectedGame === 'NONE'
              ? 'لم يتم اختيار لعبة بعد'
              : room.selectedGame === 'IMPOSTOR'
              ? 'اللعبة المختارة: مين الكداب؟ 🕵️‍♂️'
              : 'اللعبة المختارة: لوّن المعنى (Fake Artist) 🎨'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {isHost
              ? connectedCount >= 2
                ? 'اضغط بدء اللعبة عند اكتمال الجميع'
                : 'في انتظار انضمام لاعب آخر...'
              : 'اضغط زر الاستعداد لتأكيد حضورك'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isHost && (
            <button
              onClick={onToggleReady}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                myPlayer?.isReady
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                  : 'bg-white/10 text-white border border-blue-500/20 hover:bg-white/20'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{myPlayer?.isReady ? 'أنا جاهز ✓' : 'تأكيد الجاهزية'}</span>
            </button>
          )}

          {isHost && (
            <button
              onClick={onStartGame}
              disabled={connectedCount < 2 || room.selectedGame === 'NONE'}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed font-black text-white shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>ابدأ اللعبة الآن</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
