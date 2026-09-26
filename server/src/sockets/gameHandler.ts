import { Server, Socket } from 'socket.io';
import { roomController } from '../controllers/roomController';
import { ImpostorEngine } from '../games/impostorEngine';
import { FakeArtistEngine } from '../games/fakeArtistEngine';
import {
  CreateRoomPayload,
  JoinRoomPayload,
  ReconnectPayload,
  SelectGamePayload,
  KickPlayerPayload,
  ToggleReadyPayload,
  StartGamePayload,
  ReturnToLobbyPayload,
  CastVotePayload,
  DrawLinePayload,
  ImpostorGuessPayload,
  NextRoundPayload,
  SoundTriggerPayload,
  Room
} from '../types';

const roomTimers: Map<string, NodeJS.Timeout> = new Map();

export const clearRoomTimer = (roomCode: string) => {
  const existingTimer = roomTimers.get(roomCode);
  if (existingTimer) {
    clearInterval(existingTimer);
    roomTimers.delete(roomCode);
  }
};

export const registerGameHandlers = (io: Server, socket: Socket) => {
  const broadcastRoomState = (room: Room) => {
    Object.values(room.players).forEach(player => {
      if (!player.isConnected) return;

      const sanitizedRoom: Room = {
        ...room,
        impostorGame: room.impostorGame
          ? (ImpostorEngine.getSanitizedGameData(room, player.id) as any)
          : undefined,
        fakeArtistGame: room.fakeArtistGame
          ? (FakeArtistEngine.getSanitizedGameData(room, player.id) as any)
          : undefined
      };

      io.to(player.socketId).emit('ROOM_STATE_UPDATE', { room: sanitizedRoom });
    });
  };

  const emitSound = (roomCode: string, sound: SoundTriggerPayload['sound']) => {
    io.to(roomCode).emit('SOUND_TRIGGER', { sound });
  };

  // 1. Create Room
  socket.on('CREATE_ROOM', (payload: CreateRoomPayload) => {
    try {
      if (!payload.nickname || !payload.nickname.trim()) {
        socket.emit('ERROR', { message: 'يرجى إدخال اسمك المستعار' });
        return;
      }

      const { room, player } = roomController.createRoom(
        payload.nickname,
        payload.avatar,
        socket.id,
        {
          maxPlayers: payload.maxPlayers,
          password: payload.password,
          sessionPlayerId: payload.sessionPlayerId
        }
      );

      socket.join(room.code);
      socket.emit('ROOM_CREATED', { room, player });
      broadcastRoomState(room);
    } catch (err: any) {
      socket.emit('ERROR', { message: err.message || 'حدث خطأ أثناء إنشاء الغرفة' });
    }
  });

  // 2. Join Room
  socket.on('JOIN_ROOM', (payload: JoinRoomPayload) => {
    try {
      if (!payload.roomCode || !payload.nickname) {
        socket.emit('ERROR', { message: 'يرجى ملء جميع الحقول المطلوبة' });
        return;
      }

      const result = roomController.joinRoom(
        payload.roomCode,
        payload.nickname,
        payload.avatar,
        socket.id,
        payload.password,
        payload.sessionPlayerId
      );

      if (!result.success || !result.room || !result.player) {
        socket.emit('ERROR', { message: result.error || 'تعذر الانضمام للغرفة' });
        return;
      }

      socket.join(result.room.code);
      socket.emit('JOINED_ROOM', { room: result.room, player: result.player });
      broadcastRoomState(result.room);
      emitSound(result.room.code, 'TICK');
    } catch (err: any) {
      socket.emit('ERROR', { message: err.message || 'حدث خطأ أثناء الانضمام' });
    }
  });

  // 3. Reconnect Session
  socket.on('RECONNECT_SESSION', (payload: ReconnectPayload) => {
    try {
      const result = roomController.handleReconnect(payload.roomCode, payload.sessionPlayerId, socket.id);
      if (result.success && result.room && result.player) {
        socket.join(result.room.code);
        socket.emit('RECONNECTED', { room: result.room, player: result.player });
        broadcastRoomState(result.room);
      } else {
        socket.emit('RECONNECT_FAILED', { message: 'انتهت صلاحية الجلسة' });
      }
    } catch (err: any) {
      socket.emit('RECONNECT_FAILED', { message: 'تعذرت إعادة الاتصال' });
    }
  });

  // 4. Select Game
  socket.on('SELECT_GAME', (payload: SelectGamePayload) => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player) return;

    const result = roomController.selectGame(payload.roomCode, player.id, payload.gameType);
    if (result.success && result.room) {
      broadcastRoomState(result.room);
      emitSound(result.room.code, 'TICK');
    } else {
      socket.emit('ERROR', { message: result.error || 'تعذر اختيار اللعبة' });
    }
  });

  // 5. Toggle Ready
  socket.on('TOGGLE_READY', (payload: ToggleReadyPayload) => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player) return;

    const result = roomController.toggleReady(payload.roomCode, player.id);
    if (result.success && result.room) {
      broadcastRoomState(result.room);
      emitSound(result.room.code, 'TICK');
    }
  });

  // 6. Kick Player
  socket.on('KICK_PLAYER', (payload: KickPlayerPayload) => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player) return;

    const result = roomController.kickPlayer(payload.roomCode, player.id, payload.targetPlayerId);
    if (result.success && result.room && result.kickedSocketId) {
      io.to(result.kickedSocketId).emit('KICKED', { message: 'تم طردك من قبل المضيف' });
      io.in(result.kickedSocketId).socketsLeave(result.room.code);
      broadcastRoomState(result.room);
    } else {
      socket.emit('ERROR', { message: result.error || 'تعذر طرد اللاعب' });
    }
  });

  // 7. Start Game
  socket.on('START_GAME', (payload: StartGamePayload) => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player) return;

    if (room.hostId !== player.id) {
      socket.emit('ERROR', { message: 'المضيف فقط هو من يستطيع بدء اللعبة' });
      return;
    }

    const connectedCount = Object.values(room.players).filter(p => p.isConnected).length;
    if (connectedCount < 2) {
      socket.emit('ERROR', { message: 'يجب وجود لاعبين على الأقل لبدء اللعبة' });
      return;
    }

    if (room.selectedGame === 'NONE') {
      socket.emit('ERROR', { message: 'يرجى اختيار لعبة أولاً' });
      return;
    }

    clearRoomTimer(room.code);
    emitSound(room.code, 'ROUND_START');

    if (room.selectedGame === 'IMPOSTOR') {
      ImpostorEngine.initGame(room);
      ImpostorEngine.startDiscussion(room);
      broadcastRoomState(room);
    } else if (room.selectedGame === 'FAKE_ARTIST') {
      FakeArtistEngine.initGame(room);
      FakeArtistEngine.startDrawingTurns(room);
      broadcastRoomState(room);
    }
  });

  // 8. Real-time Canvas Drawing (draw_line / DRAW_LINE)
  socket.on('DRAW_LINE', (payload: DrawLinePayload) => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player || !room.fakeArtistGame) return;

    // Verify it is currently this player's turn to draw
    if (room.fakeArtistGame.state !== 'DRAWING_TURNS') return;
    if (room.fakeArtistGame.currentTurnPlayerId !== player.id) return;

    // Use player's assigned color
    const stroke = {
      ...payload.stroke,
      color: player.color || payload.stroke.color
    };

    FakeArtistEngine.addStroke(room, stroke);

    // Broadcast stroke immediately to all room members
    io.to(room.code).emit('LINE_DRAWN', { stroke });
  });

  // 9. Cast Vote (for Impostor or Fake Artist)
  socket.on('CAST_VOTE', (payload: CastVotePayload) => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player) return;

    if (room.selectedGame === 'IMPOSTOR' && room.impostorGame?.state === 'VOTING') {
      const allVoted = ImpostorEngine.castVote(room, player.id, payload.targetPlayerId);
      emitSound(room.code, 'VOTE_CAST');
      broadcastRoomState(room);

      if (allVoted) {
        clearRoomTimer(room.code);
        ImpostorEngine.evaluateVotes(room);
        emitSound(room.code, 'REVEAL');
        broadcastRoomState(room);
      }
    } else if (room.selectedGame === 'FAKE_ARTIST' && room.fakeArtistGame?.state === 'VOTING') {
      const allVoted = FakeArtistEngine.castVote(room, player.id, payload.targetPlayerId);
      emitSound(room.code, 'VOTE_CAST');
      broadcastRoomState(room);

      if (allVoted) {
        clearRoomTimer(room.code);
        const movingToGuess = FakeArtistEngine.evaluateVotes(room);
        emitSound(room.code, 'REVEAL');
        broadcastRoomState(room);

        if (movingToGuess) {
          broadcastRoomState(room);
        }
      }
    }
  });

  // 10. Impostor Secret Word Guess (Fake Artist only)
  socket.on('SUBMIT_IMPOSTOR_GUESS', (payload: ImpostorGuessPayload) => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player || !room.fakeArtistGame) return;

    if (room.fakeArtistGame.state !== 'IMPOSTOR_GUESS') return;
    if (room.fakeArtistGame.fakeArtistId !== player.id) return;

    clearRoomTimer(room.code);
    FakeArtistEngine.submitImpostorGuess(room, payload.guessedWord);
    emitSound(room.code, 'VICTORY');
    broadcastRoomState(room);
  });

  // 11. Manual round controls
  socket.on('END_DRAWING_TURN', () => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player || !room.fakeArtistGame) return;
    if (room.fakeArtistGame.state !== 'DRAWING_TURNS') return;
    if (room.fakeArtistGame.currentTurnPlayerId !== player.id) return;

    FakeArtistEngine.advanceTurn(room);
    emitSound(room.code, 'POP');
    broadcastRoomState(room);
  });

  socket.on('START_VOTING_EARLY', () => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player || room.hostId !== player.id) return;

    if (room.impostorGame && room.impostorGame.state === 'DISCUSSION') {
      ImpostorEngine.startVoting(room);
      emitSound(room.code, 'BUZZ');
      broadcastRoomState(room);
    } else if (room.fakeArtistGame && room.fakeArtistGame.state === 'DRAWING_TURNS') {
      room.fakeArtistGame.state = 'VOTING';
      room.fakeArtistGame.votes = {};
      emitSound(room.code, 'BUZZ');
      broadcastRoomState(room);
    }
  });

  // 12. Next Round
  socket.on('NEXT_ROUND', (payload: NextRoundPayload) => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player || room.hostId !== player.id) return;

    clearRoomTimer(room.code);

    if (room.selectedGame === 'IMPOSTOR') {
      ImpostorEngine.initGame(room);
      ImpostorEngine.startDiscussion(room);
      emitSound(room.code, 'ROUND_START');
      broadcastRoomState(room);
    } else if (room.selectedGame === 'FAKE_ARTIST') {
      FakeArtistEngine.initGame(room);
      FakeArtistEngine.startDrawingTurns(room);
      emitSound(room.code, 'ROUND_START');
      broadcastRoomState(room);
    }
  });

  // 13. Return to Lobby
  socket.on('RETURN_TO_LOBBY', (payload: ReturnToLobbyPayload) => {
    const { room, player } = roomController.getPlayerBySocket(socket.id);
    if (!room || !player) return;

    clearRoomTimer(room.code);
    const result = roomController.resetToLobby(payload.roomCode, player.id);
    if (result.success && result.room) {
      broadcastRoomState(result.room);
    } else {
      socket.emit('ERROR', { message: result.error || 'تعذر العودة للوبي' });
    }
  });

  // 14. Explicit Leave Room
  socket.on('LEAVE_ROOM', (ack?: (response: { success: boolean }) => void) => {
    const { room } = roomController.handleDisconnect(socket.id);

    // Update every remaining player before confirming the leave.
    if (room) {
      broadcastRoomState(room);
    }

    // Let the client safely disconnect only after the server processed the leave.
    if (ack) {
      ack({ success: true });
    }
  });

  // 14. Disconnect
  socket.on('disconnect', () => {
    const { room } = roomController.handleDisconnect(socket.id);
    if (room) {
      broadcastRoomState(room);
    }
  });
};
