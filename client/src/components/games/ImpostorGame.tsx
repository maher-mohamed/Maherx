import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Flame,
  RotateCcw,
  Home,
  CheckCircle2,
  AlertTriangle,
  Award,
  Crown
} from 'lucide-react';
import { Room, Player, ImpostorGameData } from '../../types/game';
import { soundManager } from '../../utils/sound';

interface ImpostorGameProps {
  room: Room;
  myPlayer: Player | null;
  onCastVote: (targetPlayerId: string) => void;
  onStartVotingEarly: () => void;
  onNextRound: () => void;
  onReturnToLobby: () => void;
}

export const ImpostorGame: React.FC<ImpostorGameProps> = ({
  room,
  myPlayer,
  onCastVote,
  onStartVotingEarly,
  onNextRound,
  onReturnToLobby
}) => {
  const gameData = room.impostorGame;
  const isHost = myPlayer?.isHost || false;
  const [cardFlipped, setCardFlipped] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);

  if (!gameData) return null;

  const isImpostor = gameData.impostorId === myPlayer?.id || (!gameData.secretWord && gameData.state === 'WORD_ASSIGNMENT');
  const playersList = Object.values(room.players).filter(p => p.isConnected);
  const votedCount = Object.keys(gameData.votes || {}).length;
  const hasVoted = myPlayer ? !!gameData.votes?.[myPlayer.id] || selectedVoteId !== null : false;

  const handleVote = (targetId: string) => {
    if (gameData.state !== 'VOTING' || hasVoted) return;
    if (targetId === myPlayer?.id) {
      alert('لا يمكنك التصويت لنفسك!');
      return;
    }
    setSelectedVoteId(targetId);
    soundManager.play('VOTE_CAST');
    onCastVote(targetId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Game Stage Header */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/10 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/30">
            🕵️‍♂️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">مين الكداب؟</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                الجولة {gameData.roundNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {gameData.state === 'WORD_ASSIGNMENT' && 'توزيع الأدوار وسر الكلمة'}
              {gameData.state === 'DISCUSSION' && 'وقت النقاش وطرح التلميحات'}
              {gameData.state === 'VOTING' && 'التصويت السري لكشف الكداب'}
              {gameData.state === 'REVEAL' && 'كشف هوية الكداب والنتائج'}
              {gameData.state === 'RESULTS' && 'ملخص الجولة والترتيب'}
            </p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
          بدون مؤقت — المضيف ينهي النقاش عند الجاهزية
        </div>
      </div>

      {/* STATE 1: WORD ASSIGNMENT */}
      {gameData.state === 'WORD_ASSIGNMENT' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-6 space-y-6"
        >
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-pink-200">
              دورك السري في اللعبة
            </h3>
            <p className="text-sm text-slate-400">اضغط على البطاقة لكشف الكلمة السرية أو هويتك</p>
          </div>

          {/* Interactive Flip Card */}
          <div
            onClick={() => {
              setCardFlipped(!cardFlipped);
              soundManager.play('POP');
            }}
            className="w-full max-w-sm aspect-[4/3] cursor-pointer perspective-1000"
          >
            <motion.div
              animate={{ rotateY: cardFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="w-full h-full relative transform-style-3d shadow-2xl rounded-3xl"
            >
              {/* Card Front (Hidden) */}
              <div className="absolute inset-0 backface-hidden rounded-3xl p-6 bg-gradient-to-br from-indigo-900/80 via-slate-900/90 to-purple-900/80 border-2 border-indigo-500/40 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-inner">
                  🔒
                </div>
                <p className="text-lg font-black text-white">اضغط هنا لكشف بطاقتك</p>
                <span className="text-xs text-indigo-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-500/30">
                  سري للغاية 🤫
                </span>
              </div>

              {/* Card Back (Revealed) */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 bg-gradient-to-br from-[#13192b] via-[#1b2238] to-[#251b38] border-2 border-pink-500/50 flex flex-col items-center justify-center text-center space-y-3">
                {isImpostor ? (
                  <>
                    <span className="text-4xl animate-bounce">🦹</span>
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wider bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/30">
                      أنت الكداب!
                    </span>
                    <h4 className="text-xl sm:text-2xl font-black text-rose-300">
                      حاول تخمّن الكلمة من كلام الباقيين!
                    </h4>
                    <p className="text-xs text-slate-300">
                      التصنيف العام: <strong className="text-white">{gameData.category}</strong>
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">🍲</span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                      أنت مواطن شريف
                    </span>
                    <p className="text-xs text-slate-400">التصنيف: {gameData.category}</p>
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/10 w-full">
                      <p className="text-xs text-slate-400 mb-1">الكلمة السرية:</p>
                      <h4 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-indigo-300">
                        {gameData.secretWord}
                      </h4>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* STATE 2: DISCUSSION */}
      {gameData.state === 'DISCUSSION' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Secret reminder card for the player */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{isImpostor ? '🦹' : '🗝️'}</span>
              <div>
                <p className="text-xs text-slate-400">تذكير ببطاقتك:</p>
                <p className="text-sm sm:text-base font-black text-white">
                  {isImpostor ? (
                    <span className="text-pink-400">أنت الكداب! (التصنيف: {gameData.category})</span>
                  ) : (
                    <span>الكلمة: <strong className="text-amber-300">{gameData.secretWord}</strong></span>
                  )}
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">لا تفضح الكلمة مباشرة!</span>
          </div>

          {/* Gameplay Instructions */}
          <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-white/10 space-y-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>كيف تديرون جولة النقاش؟</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300 leading-relaxed list-disc list-inside">
              <li>كل لاعب يقول <strong className="text-indigo-300">كلمة أو صفة أو تلميح ذكي</strong> عن الكلمة السرية بالترتيب.</li>
              <li>إذا كنت <strong className="text-emerald-300">مواطن</strong>: لا تكن صريحاً جداً حتى لا يعرف الكداب الكلمة!</li>
              <li>إذا كنت <strong className="text-pink-400">الكداب</strong>: حاول تقليد الآخرين وإعطاء تلميح عام ومقنع دون أن يشكوا بك.</li>
            </ul>

            {/* Host Skip button */}
            {isHost && (
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  onClick={onStartVotingEarly}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-pink-600/20 transition-all active:scale-95"
                >
                  إنهاء النقاش والبدء بالتصويت فوراً ⚡
                </button>
              </div>
            )}
          </div>

          {/* Active players grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {playersList.map((player) => (
              <div
                key={player.id}
                className="glass-panel rounded-2xl p-3 border border-white/5 flex items-center gap-3"
              >
                <span className="text-2xl">{player.avatar}</span>
                <div className="overflow-hidden">
                  <p className="font-bold text-xs text-white truncate">{player.nickname}</p>
                  <p className="text-[10px] text-amber-400 font-mono">{player.score} نقطة</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* STATE 3: VOTING */}
      {gameData.state === 'VOTING' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              من هو الكداب في رأيك؟ 🕵️‍♂️
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              صوّت للشخص الذي تعتقد أنه لا يعرف الكلمة السرية
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <span>تم تصويت {votedCount} من {playersList.length} لاعبين</span>
            </div>
          </div>

          {/* Voting Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playersList.map((player) => {
              const isMe = player.id === myPlayer?.id;
              const isSelected = selectedVoteId === player.id;

              return (
                <motion.button
                  key={player.id}
                  whileHover={!hasVoted && !isMe ? { scale: 1.03 } : {}}
                  whileTap={!hasVoted && !isMe ? { scale: 0.97 } : {}}
                  disabled={hasVoted || isMe}
                  onClick={() => handleVote(player.id)}
                  className={`glass-panel rounded-3xl p-5 border text-right transition-all relative overflow-hidden flex items-center justify-between ${
                    isSelected
                      ? 'border-pink-500 bg-pink-950/40 ring-2 ring-pink-500/50'
                      : isMe
                      ? 'opacity-40 border-white/5 cursor-not-allowed'
                      : hasVoted
                      ? 'opacity-60 border-white/5 cursor-default'
                      : 'hover:border-indigo-500/60 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
                      {player.avatar}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{player.nickname}</p>
                      <p className="text-[11px] text-slate-400">
                        {isMe ? 'أنت (لا يمكنك التصويت لنفسك)' : 'اضغط للتصويت عليه ككداب'}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {hasVoted && (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center text-emerald-300 text-xs font-bold animate-pulse">
              ✓ تم تسجيل تصويتك بنجاح! في انتظار باقي اللاعبين...
            </div>
          )}
        </motion.div>
      )}

      {/* STATE 4: REVEAL */}
      {gameData.state === 'REVEAL' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-center"
        >
          {/* Winner Announcement Banner */}
          <div
            className={`glass-panel rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-4 ${
              gameData.impostorWon
                ? 'border-pink-500 bg-gradient-to-b from-pink-950/60 to-slate-950'
                : 'border-emerald-500 bg-gradient-to-b from-emerald-950/60 to-slate-950'
            }`}
          >
            <span className="text-5xl">{gameData.impostorWon ? '😈' : '🎉'}</span>

            <h3 className="text-2xl sm:text-4xl font-black text-white">
              {gameData.impostorWon
                ? 'فاز الكداب وخدع الجميع!'
                : 'فاز المواطنون الأذكياء وكشفوا الكداب!'}
            </h3>

            {/* Impostor Identity Reveal */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 max-w-md mx-auto space-y-2">
              <p className="text-xs text-slate-400">الكداب الحقيقي كان:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">
                  {room.players[gameData.impostorId]?.avatar || '🦹'}
                </span>
                <span className="text-xl font-black text-pink-400">
                  {room.players[gameData.impostorId]?.nickname || 'لاعب مجهول'}
                </span>
              </div>
            </div>

            {/* Word Reveal */}
            <div className="p-3 bg-white/5 rounded-2xl max-w-md mx-auto text-xs text-slate-300">
              <span>الكلمة السرية كانت: </span>
              <strong className="text-amber-300 font-bold text-sm">{gameData.secretWord}</strong>
              <span className="text-slate-400"> (من تصنيف {gameData.category})</span>
            </div>
          </div>

          {/* Voting Breakdown */}
          <div className="glass-panel rounded-3xl p-5 border border-white/10 text-right space-y-3">
            <h4 className="text-sm font-bold text-white">نتائج تصويت اللاعبين:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(gameData.votes || {}).map(([voterId, targetId]) => (
                <div key={voterId} className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    {room.players[voterId]?.nickname || 'لاعب'} صوّت لـ:
                  </span>
                  <span className={`font-bold ${targetId === gameData.impostorId ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {room.players[targetId]?.nickname || 'لاعب'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Host Next Round or Return to Lobby */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {isHost ? (
              <>
                <button
                  onClick={onNextRound}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>الجولة التالية</span>
                </button>
                <button
                  onClick={onReturnToLobby}
                  className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/10 flex items-center gap-2 active:scale-95 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>العودة للوبي</span>
                </button>
              </>
            ) : (
              <p className="text-xs text-slate-400 animate-pulse">في انتظار قرار المضيف لبدء الجولة التالية...</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
