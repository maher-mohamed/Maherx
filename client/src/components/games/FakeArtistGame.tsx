import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Palette,
  RotateCcw,
  Home,
  CheckCircle2,
  Crown,
  Send,
  HelpCircle
} from 'lucide-react';
import { Room, Player, DrawStroke } from '../../types/game';
import { CanvasBoard } from './CanvasBoard';
import { soundManager } from '../../utils/sound';

interface FakeArtistGameProps {
  room: Room;
  myPlayer: Player | null;
  onDrawStroke: (stroke: DrawStroke) => void;
  onEndDrawingTurn: () => void;
  onCastVote: (targetPlayerId: string) => void;
  onSubmitImpostorGuess: (guessedWord: string) => void;
  onStartVotingEarly: () => void;
  onNextRound: () => void;
  onReturnToLobby: () => void;
}

export const FakeArtistGame: React.FC<FakeArtistGameProps> = ({
  room,
  myPlayer,
  onDrawStroke,
  onEndDrawingTurn,
  onCastVote,
  onSubmitImpostorGuess,
  onStartVotingEarly,
  onNextRound,
  onReturnToLobby
}) => {
  const gameData = room.fakeArtistGame;
  const isHost = myPlayer?.isHost || false;
  const [cardFlipped, setCardFlipped] = useState(false);
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);
  const [guessInput, setGuessInput] = useState('');
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);

  if (!gameData) return null;

  const isFakeArtist = gameData.fakeArtistId === myPlayer?.id || (!gameData.secretWord && gameData.state === 'CATEGORY_AND_ROLE_ASSIGNMENT');
  const playersList = Object.values(room.players).filter(p => p.isConnected);
  const isMyTurn = gameData.state === 'DRAWING_TURNS' && gameData.currentTurnPlayerId === myPlayer?.id;
  const myColor = myPlayer?.color || '#ef4444';
  const currentTurnPlayer = room.players[gameData.currentTurnPlayerId];
  const votedCount = Object.keys(gameData.votes || {}).length;
  const hasVoted = myPlayer ? !!gameData.votes?.[myPlayer.id] || selectedVoteId !== null : false;

  const handleDrawStroke = (stroke: DrawStroke) => {
    setHasDrawnThisTurn(true);
    onDrawStroke(stroke);
  };

  const handleEndDrawingTurn = () => {
    if (!isMyTurn || !hasDrawnThisTurn) return;
    setHasDrawnThisTurn(false);
    onEndDrawingTurn();
  };

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

  const handleGuessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guessInput.trim()) return;
    soundManager.play('POP');
    onSubmitImpostorGuess(guessInput.trim());
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Stage Header */}
      <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-white/10 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-600/30">
            🎨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-white">لوّن المعنى (Fake Artist)</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                الجولة {gameData.roundNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {gameData.state === 'CATEGORY_AND_ROLE_ASSIGNMENT' && 'توزيع الأدوار وسر الكلمة'}
              {gameData.state === 'DRAWING_TURNS' && 'جولة الرسم — الأدوار مستمرة حتى ينهي الليدر'}
              {gameData.state === 'VOTING' && 'التصويت لكشف الرسام الفاشل'}
              {gameData.state === 'IMPOSTOR_GUESS' && 'فرصة الرسام الفاشل لتخمين الكلمة'}
              {gameData.state === 'RESULTS' && 'النتائج وتوزيع النقاط'}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
          بدون مؤقت — كل مرحلة تنتهي يدويًا
        </div>
      </div>

      {/* STATE 1: ROLE ASSIGNMENT */}
      {gameData.state === 'CATEGORY_AND_ROLE_ASSIGNMENT' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-6 space-y-6"
        >
          <div className="text-center space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-pink-200">
              بطاقتك الفنية السرية
            </h3>
            <p className="text-sm text-slate-400">اضغط على البطاقة لمعرفة دورك والكلمة المطلوب رسمها</p>
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
              {/* Card Front */}
              <div className="absolute inset-0 backface-hidden rounded-3xl p-6 bg-gradient-to-br from-purple-900/80 via-slate-900/90 to-indigo-900/80 border-2 border-purple-500/40 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-3xl shadow-inner">
                  🎨
                </div>
                <p className="text-lg font-black text-white">اضغط هنا لكشف دورك</p>
                <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                  <span>لونك: </span>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: myColor }} />
                </div>
              </div>

              {/* Card Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 bg-gradient-to-br from-[#1b152d] via-[#1a1c33] to-[#251833] border-2 border-pink-500/50 flex flex-col items-center justify-center text-center space-y-3">
                {isFakeArtist ? (
                  <>
                    <span className="text-4xl animate-bounce">🦹🎨</span>
                    <span className="text-xs font-bold text-pink-400 uppercase tracking-wider bg-pink-500/10 px-3 py-1 rounded-full border border-pink-500/30">
                      أنت الرسام الفاشل! (Fake Artist)
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-rose-300">
                      أنت لا تعرف الكلمة السرية!
                    </h4>
                    <p className="text-xs text-slate-300">
                      التصنيف العام: <strong className="text-white">{gameData.category}</strong>
                    </p>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      راقب ما يرسمه الآخرون وضع خطوطاً ذكية توحي بأنك تعرف الكلمة!
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">🖌️</span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                      أنت فنان حقيقي
                    </span>
                    <p className="text-xs text-slate-400">التصنيف: {gameData.category}</p>
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/10 w-full">
                      <p className="text-xs text-slate-400 mb-1">الكلمة المطلوب رسمها:</p>
                      <h4 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-purple-300">
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

      {/* STATE 2: DRAWING TURNS */}
      {gameData.state === 'DRAWING_TURNS' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Bar: Secret Reminder + Current Turn Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Player's Secret Info Reminder */}
            <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{isFakeArtist ? '🦹' : '🖌️'}</span>
                <div>
                  <p className="text-[11px] text-slate-400">بطاقتك السرية:</p>
                  <p className="text-xs sm:text-sm font-black text-white">
                    {isFakeArtist ? (
                      <span className="text-pink-400">أنت الرسام الفاشل ({gameData.category})</span>
                    ) : (
                      <span>الكلمة: <strong className="text-amber-300">{gameData.secretWord}</strong></span>
                    )}
                  </p>
                </div>
              </div>
              <div
                className="w-5 h-5 rounded-full ring-2 ring-white/30"
                style={{ backgroundColor: myColor }}
                title="لونك المخصص"
              />
            </div>

            {/* Current Active Artist Banner */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-4 h-4 rounded-full ring-2 ring-white/20"
                  style={{ backgroundColor: currentTurnPlayer?.color || '#fff' }}
                />
                <div>
                  <p className="text-[11px] text-slate-400">
                    جولة الرسم ({gameData.currentRoundNumber} من 2) — دور:
                  </p>
                  <p className="text-xs sm:text-sm font-black text-white">
                    {isMyTurn ? (
                      <span className="text-emerald-400 font-black animate-pulse">دورك أنت الآن! ✏️</span>
                    ) : (
                      <span>{currentTurnPlayer?.nickname || 'لاعب'} ({currentTurnPlayer?.avatar})</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Synchronized Canvas */}
          <CanvasBoard
            isMyTurn={isMyTurn}
            myColor={myColor}
            strokes={gameData.strokes || []}
            onDrawStroke={handleDrawStroke}
          />

          {/* Turn Order Timeline Carousel */}
          <div className="glass-panel rounded-2xl p-3 border border-white/5 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-400 font-bold whitespace-nowrap pl-2">ترتيب الأدوار:</span>
            {gameData.turnOrder.map((playerId, idx) => {
              const p = room.players[playerId];
              const isCurrent = gameData.currentTurnPlayerId === playerId;
              const isPast = idx < gameData.turnIndex;

              return (
                <div
                  key={playerId}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-purple-600/30 border-purple-500 text-purple-200 ring-2 ring-purple-500/50 shadow-md scale-105'
                      : isPast
                      ? 'bg-white/5 border-white/5 text-slate-500 opacity-60'
                      : 'bg-white/5 border-white/5 text-slate-300'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p?.color || '#fff' }}
                  />
                  <span>{p?.nickname}</span>
                </div>
              );
            })}
          </div>

          {/* Manual turn + host round controls */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            {isMyTurn && (
              <button
                onClick={handleEndDrawingTurn}
                disabled={!hasDrawnThisTurn}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:from-slate-700 disabled:to-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-black shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
              >
                {hasDrawnThisTurn ? 'خلصت رسمتي — الدور اللي بعدي ✏️' : 'ارسم خط الأول ✏️'}
              </button>
            )}
            {isHost && (
              <button
                onClick={onStartVotingEarly}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-pink-600/20 transition-all active:scale-95"
              >
                إنهاء الجولة والبدء بالتصويت ⚡
              </button>
            )}
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
              من هو الرسام الفاشل؟ 🕵️‍♂️🎨
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              انظر إلى اللوحة وخطوط كل لاعب، وصوّت لمن تعتقد أنه لم يكن يعرف الكلمة
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              <span>تم تصويت {votedCount} من {playersList.length}</span>
            </div>
          </div>

          {/* Canvas preview (locked) */}
          <div className="max-w-md mx-auto">
            <CanvasBoard
              isMyTurn={false}
              myColor={myColor}
              strokes={gameData.strokes || []}
              onDrawStroke={() => {}}
              disabled={true}
            />
          </div>

          {/* Player Voting Cards */}
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
                  className={`glass-panel rounded-3xl p-5 border text-right transition-all relative flex items-center justify-between ${
                    isSelected
                      ? 'border-pink-500 bg-pink-950/40 ring-2 ring-pink-500/50'
                      : isMe
                      ? 'opacity-40 border-white/5 cursor-not-allowed'
                      : hasVoted
                      ? 'opacity-60 border-white/5 cursor-default'
                      : 'hover:border-purple-500/60 hover:bg-white/10 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl shadow-inner">
                        {player.avatar}
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full ring-2 ring-slate-900"
                        style={{ backgroundColor: player.color || '#fff' }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">{player.nickname}</p>
                      <p className="text-[11px] text-slate-400">
                        {isMe ? 'أنت' : 'اضغط للتصويت عليه كرسام فاشل'}
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

      {/* STATE 4: IMPOSTOR GUESS */}
      {gameData.state === 'IMPOSTOR_GUESS' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 text-center"
        >
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-pink-500/50 bg-gradient-to-b from-pink-950/50 to-slate-950 shadow-2xl space-y-4">
            <span className="text-5xl">🚨</span>
            <h3 className="text-2xl sm:text-3xl font-black text-white">
              تم كشف الرسام الفاشل بالاتفاق!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              الرسام الفاشل هو: <strong className="text-pink-400">{room.players[gameData.fakeArtistId]?.nickname}</strong> ({room.players[gameData.fakeArtistId]?.avatar})
            </p>

            {/* Fake Artist Guess Form */}
            {isFakeArtist ? (
              <form onSubmit={handleGuessSubmit} className="max-w-md mx-auto space-y-4 pt-4">
                <div className="p-4 bg-black/40 rounded-2xl border border-pink-500/40 text-right space-y-2">
                  <p className="text-xs text-pink-300 font-bold">
                    أمامك فرصة أخيرة للفوز باللعبة! 🎯 خمن الكلمة السرية التي رسمها الآخرون:
                  </p>
                  <p className="text-[11px] text-slate-400">التصنيف: {gameData.category}</p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="اكتب اسم الكلمة السرية هنا..."
                    value={guessInput}
                    onChange={(e) => setGuessInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm font-bold focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-sm flex items-center gap-1.5 shadow-lg shadow-pink-600/30"
                  >
                    <span>تأكيد</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 bg-black/40 rounded-2xl border border-white/10 max-w-md mx-auto space-y-2 text-center">
                <p className="text-sm font-bold text-slate-300">
                  الرسام الفاشل يحاول تخمين الكلمة السرية الآن...
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-pink-400 font-mono animate-pulse">
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* STATE 5: RESULTS */}
      {gameData.state === 'RESULTS' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 text-center"
        >
          {/* Winner Banner */}
          <div
            className={`glass-panel rounded-3xl p-6 sm:p-8 border shadow-2xl space-y-4 ${
              gameData.artistsWon
                ? 'border-emerald-500 bg-gradient-to-b from-emerald-950/60 to-slate-950'
                : 'border-pink-500 bg-gradient-to-b from-pink-950/60 to-slate-950'
            }`}
          >
            <span className="text-5xl">{gameData.artistsWon ? '🏆🎨' : '😈✨'}</span>

            <h3 className="text-2xl sm:text-4xl font-black text-white">
              {gameData.artistsWon
                ? 'فاز الفنانون الحقيقيون!'
                : gameData.impostorGuessSuccess
                ? 'فاز الرسام الفاشل وخمن الكلمة بنجاح!'
                : 'فاز الرسام الفاشل وخدع الجميع!'}
            </h3>

            {/* Impostor Identity Reveal */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 max-w-md mx-auto space-y-2">
              <p className="text-xs text-slate-400">الرسام الفاشل كان:</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">
                  {room.players[gameData.fakeArtistId]?.avatar || '🦹'}
                </span>
                <span className="text-xl font-black text-pink-400">
                  {room.players[gameData.fakeArtistId]?.nickname || 'لاعب مجهول'}
                </span>
              </div>
            </div>

            {/* Secret Word Reveal */}
            <div className="p-3 bg-white/5 rounded-2xl max-w-md mx-auto text-xs text-slate-300">
              <span>الكلمة السرية كانت: </span>
              <strong className="text-amber-300 font-bold text-sm">{gameData.secretWord}</strong>
              <span className="text-slate-400"> (من تصنيف {gameData.category})</span>
            </div>

            {gameData.impostorGuess && (
              <div className="text-xs text-slate-400">
                تخمين الرسام الفاشل كان: <strong className="text-white">"{gameData.impostorGuess}"</strong>
              </div>
            )}
          </div>

          {/* Canvas Display */}
          <div className="max-w-md mx-auto">
            <CanvasBoard
              isMyTurn={false}
              myColor={myColor}
              strokes={gameData.strokes || []}
              onDrawStroke={() => {}}
              disabled={true}
            />
          </div>

          {/* Host Next Round or Return to Lobby */}
          <div className="flex items-center justify-center gap-3 pt-2">
            {isHost ? (
              <>
                <button
                  onClick={onNextRound}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 flex items-center gap-2 active:scale-95 transition-all"
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
