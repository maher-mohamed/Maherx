import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  PlusCircle,
  LogIn,
  Users,
  Gamepad2,
  Zap,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { useSocket } from './hooks/useSocket';
import { Header } from './components/Header';
import { CreateRoomModal } from './components/CreateRoomModal';
import { JoinModal } from './components/JoinModal';
import { Lobby } from './components/Lobby';
import { ImpostorGame } from './components/games/ImpostorGame';
import { FakeArtistGame } from './components/games/FakeArtistGame';
import { LeaderboardModal } from './components/LeaderboardModal';

export const App: React.FC = () => {
  const {
    isConnected,
    room,
    myPlayer,
    errorMessage,
    kickedMessage,
    clearKickedMessage,
    createRoom,
    joinRoom,
    selectGame,
    toggleReady,
    kickPlayer,
    startGame,
    startVotingEarly,
    endDrawingTurn,
    sendDrawLine,
    castVote,
    submitImpostorGuess,
    nextRound,
    returnToLobby,
    leaveRoom
  } = useSocket();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [initialRoomCode, setInitialRoomCode] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    if (codeParam && codeParam.length >= 4 && !room) {
      setInitialRoomCode(codeParam.toUpperCase());
      setShowJoinModal(true);
    }
  }, [room]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-arabic selection:bg-blue-600 selection:text-white relative">
      {/* Background ambient lighting effects with royal blue & electric cyan */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-600/15 rounded-full blur-[128px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px]" />
      </div>

      {/* Header */}
      <Header
        room={room}
        myPlayer={myPlayer}
        isConnected={isConnected}
        onLeaveRoom={leaveRoom}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
      />

      {/* Global Error Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-1/2 translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-rose-600/90 text-white font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 backdrop-blur-md border border-white/20"
          >
            <AlertCircle className="w-5 h-5 text-white" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kicked Modal */}
      {kickedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel max-w-sm w-full rounded-3xl p-6 text-center space-y-4 border border-rose-500/30">
            <span className="text-4xl">🚪</span>
            <h3 className="text-xl font-black text-white">تم طردك من الغرفة</h3>
            <p className="text-xs text-slate-400">{kickedMessage}</p>
            <button
              onClick={clearKickedMessage}
              className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              حسناً
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col justify-center">
        {!room ? (
          /* LANDING PAGE */
          <div className="max-w-6xl mx-auto px-4 py-8 sm:py-14 space-y-12 sm:space-y-16">
            {/* Hero Section */}
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              {/* Brand Section: White MAHERX Wordmark PNG as requested */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center space-y-4"
              >
                {/* White MAHERX Wordmark PNG Image */}
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-md py-3 filter drop-shadow-[0_0_30px_rgba(56,189,248,0.55)]">
                  <img
                    src="/assets/maherxww.png"
                    alt="MAHERX"
                    className="w-full h-auto object-contain mx-auto"
                    
                  />
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-sky-300 text-xs font-bold border border-blue-500/30 shadow-inner">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>منصة ماهر إكس (MAHERX) لألعاب الحفلات والشلة 🎮</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight"
              >
                اجمع أصحابك والعبوا <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300">
                  أمتع ألعاب التحدي والرسم والضحك
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed"
              >
                العبوا <strong className="text-blue-300">"مين الكداب؟"</strong> أو <strong className="text-cyan-300">"لوّن المعنى (Fake Artist)"</strong> على منصة <strong className="text-sky-400 font-sans tracking-wide">MAHERX</strong> مباشرة من المتصفح بدون أي تحميل!
              </motion.p>

              {/* Main CTAs in Royal Electric Blue */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
              >
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:via-blue-400 hover:to-cyan-400 font-black text-white text-base shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-3 transition-all active:scale-95 group"
                >
                  <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span>إنشاء غرفة جديدة (مضيف)</span>
                </button>

                <button
                  onClick={() => setShowJoinModal(true)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-base border border-blue-500/20 hover:border-blue-400/40 flex items-center justify-center gap-3 transition-all active:scale-95 backdrop-blur-md"
                >
                  <LogIn className="w-5 h-5 text-sky-400" />
                  <span>الانضمام برمز الغرفة</span>
                </button>
              </motion.div>
            </div>

            {/* Featured Games Grid */}
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-white">الألعاب المتوفرة على MAHERX</h2>
                <p className="text-xs sm:text-sm text-slate-400">اختر لعبتكم المفضلة وابدأوا الجولة فوراً</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game 1 Card */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/20 relative overflow-hidden group hover:border-blue-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">🕵️‍♂️</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-sky-300 border border-blue-500/30">
                      2 - 16 لاعب
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">مين الكداب؟ (The Impostor)</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    لعبة ذكاء وتخفي! الكل يعرف الكلمة السرية ما عدا لاعب واحد هو "الكداب". على الجميع إعطاء تلميحات ذكية لكشف الكداب والتصويت عليه، بينما يحاول الكداب تخمين الكلمة قبل كشفه.
                  </p>
                </div>

                {/* Game 3 Card: Fake Artist */}
                <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-blue-500/20 relative overflow-hidden group hover:border-cyan-500/50 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">🎨</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      2 - 16 لاعب
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-2">لوّن المعنى (Fake Artist)</h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    لوحة رسم جماعية تفاعلية! الكل يرسم خطاً يعبر عن الكلمة، والرسام الفاشل يقلد الخطوط بالذكاء. في النهاية يتم التصويت عليه، وإذا كُشف أمامه 15 ثانية لتخمين الكلمة وسرقة الفوز!
                  </p>
                </div>
              </div>
            </div>

            {/* Platform Highlights in Blue Shades */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel rounded-2xl p-4 text-center border border-blue-500/15 space-y-1.5">
                <Zap className="w-5 h-5 text-amber-400 mx-auto" />
                <h4 className="text-xs sm:text-sm font-bold text-white">تفاعل فوري</h4>
                <p className="text-[11px] text-slate-400">WebSockets بدون تأخير</p>
              </div>
              <div className="glass-panel rounded-2xl p-4 text-center border border-blue-500/15 space-y-1.5">
                <Users className="w-5 h-5 text-sky-400 mx-auto" />
                <h4 className="text-xs sm:text-sm font-bold text-white">حتى 16 لاعب</h4>
                <p className="text-[11px] text-slate-400">مناسبة للتجمعات الكبيرة</p>
              </div>
              <div className="glass-panel rounded-2xl p-4 text-center border border-blue-500/15 space-y-1.5">
                <Gamepad2 className="w-5 h-5 text-cyan-400 mx-auto" />
                <h4 className="text-xs sm:text-sm font-bold text-white">محتوى عربي</h4>
                <p className="text-[11px] text-slate-400">مئات الكلمات الممتعة</p>
              </div>
              <div className="glass-panel rounded-2xl p-4 text-center border border-blue-500/15 space-y-1.5">
                <Volume2 className="w-5 h-5 text-emerald-400 mx-auto" />
                <h4 className="text-xs sm:text-sm font-bold text-white">مؤثرات صوتية</h4>
                <p className="text-[11px] text-slate-400">أجواء حماسية وتفاعلية</p>
              </div>
            </div>
          </div>
        ) : (
          /* ROOM GAMEPLAY STATE */
          <div className="w-full flex-1 flex flex-col justify-center">
            {room.selectedGame === 'IMPOSTOR' && room.impostorGame ? (
              <ImpostorGame
                room={room}
                myPlayer={myPlayer}
                onCastVote={castVote}
                onStartVotingEarly={startVotingEarly}
                onNextRound={nextRound}
                onReturnToLobby={returnToLobby}
              />
            ) : room.selectedGame === 'FAKE_ARTIST' && room.fakeArtistGame ? (
              <FakeArtistGame
                room={room}
                myPlayer={myPlayer}
                onDrawStroke={sendDrawLine}
                onEndDrawingTurn={endDrawingTurn}
                onCastVote={castVote}
                onSubmitImpostorGuess={submitImpostorGuess}
                onStartVotingEarly={startVotingEarly}
                onNextRound={nextRound}
                onReturnToLobby={returnToLobby}
              />
            ) : (
              <Lobby
                room={room}
                myPlayer={myPlayer}
                onSelectGame={selectGame}
                onToggleReady={toggleReady}
                onKickPlayer={kickPlayer}
                onStartGame={startGame}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={(nickname, avatar, maxPlayers, password) => {
          createRoom(nickname, avatar, maxPlayers, password);
          setShowCreateModal(false);
        }}
      />

      <JoinModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        initialRoomCode={initialRoomCode}
        onJoin={(code, nickname, avatar, password) => {
          joinRoom(code, nickname, avatar, password);
          setShowJoinModal(false);
        }}
      />

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        room={room}
      />

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-blue-500/10 relative z-10 flex flex-col items-center justify-center gap-1">
        <p>منصة ألعاب <strong className="text-sky-400 font-sans">MAHERX</strong> © {new Date().getFullYear()} — جميع الحقوق محفوظة</p>
      </footer>
    </div>
  );
};




