import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, Player, GameType, SoundEffect, DrawStroke } from '../types/game';
import { soundManager } from '../utils/sound';

const SESSION_KEY = 'sohba_player_uuid';
const ROOM_CODE_KEY = 'sohba_active_room_code';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [kickedMessage, setKickedMessage] = useState<string | null>(null);

  const getSessionPlayerId = useCallback((): string => {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(ROOM_CODE_KEY);
    setRoom(null);
    setMyPlayer(null);
  }, []);

  useEffect(() => {
    const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '/';
    const s: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      setIsConnected(true);
      const savedRoomCode = localStorage.getItem(ROOM_CODE_KEY);
      const sessionPlayerId = localStorage.getItem(SESSION_KEY);
      if (savedRoomCode && sessionPlayerId) {
        s.emit('RECONNECT_SESSION', {
          roomCode: savedRoomCode,
          sessionPlayerId
        });
      }
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    s.on('ROOM_CREATED', (data: { room: Room; player: Player }) => {
      setRoom(data.room);
      setMyPlayer(data.player);
      localStorage.setItem(ROOM_CODE_KEY, data.room.code);
      setErrorMessage(null);
    });

    s.on('JOINED_ROOM', (data: { room: Room; player: Player }) => {
      setRoom(data.room);
      setMyPlayer(data.player);
      localStorage.setItem(ROOM_CODE_KEY, data.room.code);
      setErrorMessage(null);
    });

    s.on('RECONNECTED', (data: { room: Room; player: Player }) => {
      setRoom(data.room);
      setMyPlayer(data.player);
      setErrorMessage(null);
    });

    s.on('RECONNECT_FAILED', () => {
      localStorage.removeItem(ROOM_CODE_KEY);
      setRoom(null);
      setMyPlayer(null);
    });

    s.on('ROOM_STATE_UPDATE', (data: { room: Room }) => {
      setRoom(data.room);
      const sessionPlayerId = localStorage.getItem(SESSION_KEY);
      if (sessionPlayerId && data.room.players[sessionPlayerId]) {
        setMyPlayer(data.room.players[sessionPlayerId]);
      }
    });

    s.on('LINE_DRAWN', (data: { stroke: DrawStroke }) => {
      setRoom(prevRoom => {
        if (!prevRoom || !prevRoom.fakeArtistGame) return prevRoom;
        return {
          ...prevRoom,
          fakeArtistGame: {
            ...prevRoom.fakeArtistGame,
            strokes: [...prevRoom.fakeArtistGame.strokes, data.stroke]
          }
        };
      });
    });

    s.on('SOUND_TRIGGER', (data: { sound: SoundEffect }) => {
      soundManager.play(data.sound);
    });

    s.on('KICKED', (data: { message: string }) => {
      setKickedMessage(data.message || 'تم طردك من الغرفة');
      clearSession();
    });

    s.on('ERROR', (data: { message: string }) => {
      setErrorMessage(data.message);
      soundManager.play('BUZZ');
      setTimeout(() => setErrorMessage(null), 4000);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [getSessionPlayerId, clearSession]);

  const createRoom = useCallback(
    (nickname: string, avatar: string, maxPlayers?: number, password?: string) => {
      if (!socket) return;
      soundManager.play('POP');
      const sessionPlayerId = getSessionPlayerId();
      socket.emit('CREATE_ROOM', {
        nickname,
        avatar,
        maxPlayers,
        password,
        sessionPlayerId
      });
    },
    [socket, getSessionPlayerId]
  );

  const joinRoom = useCallback(
    (roomCode: string, nickname: string, avatar: string, password?: string) => {
      if (!socket) return;
      soundManager.play('POP');
      const sessionPlayerId = getSessionPlayerId();
      socket.emit('JOIN_ROOM', {
        roomCode,
        nickname,
        avatar,
        password,
        sessionPlayerId
      });
    },
    [socket, getSessionPlayerId]
  );

  const selectGame = useCallback(
    (gameType: GameType) => {
      if (!socket || !room) return;
      socket.emit('SELECT_GAME', {
        roomCode: room.code,
        gameType
      });
    },
    [socket, room]
  );

  const toggleReady = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('TOGGLE_READY', {
      roomCode: room.code
    });
  }, [socket, room]);

  const kickPlayer = useCallback(
    (targetPlayerId: string) => {
      if (!socket || !room) return;
      socket.emit('KICK_PLAYER', {
        roomCode: room.code,
        targetPlayerId
      });
    },
    [socket, room]
  );

  const startGame = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('START_GAME', {
      roomCode: room.code
    });
  }, [socket, room]);

  const startVotingEarly = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('START_VOTING_EARLY', { roomCode: room.code });
  }, [socket, room]);

  const endDrawingTurn = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('END_DRAWING_TURN', { roomCode: room.code });
  }, [socket, room]);

  const sendDrawLine = useCallback(
    (stroke: DrawStroke) => {
      if (!socket || !room) return;
      socket.emit('DRAW_LINE', {
        roomCode: room.code,
        stroke
      });
    },
    [socket, room]
  );

  const castVote = useCallback(
    (targetPlayerId: string) => {
      if (!socket || !room) return;
      socket.emit('CAST_VOTE', {
        roomCode: room.code,
        targetPlayerId
      });
    },
    [socket, room]
  );

  const submitImpostorGuess = useCallback(
    (guessedWord: string) => {
      if (!socket || !room) return;
      socket.emit('SUBMIT_IMPOSTOR_GUESS', {
        roomCode: room.code,
        guessedWord
      });
    },
    [socket, room]
  );

  const nextRound = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('NEXT_ROUND', {
      roomCode: room.code
    });
  }, [socket, room]);

  const returnToLobby = useCallback(() => {
    if (!socket || !room) return;
    socket.emit('RETURN_TO_LOBBY', {
      roomCode: room.code
    });
  }, [socket, room]);

  const leaveRoom = useCallback(() => {
    if (socket && room) {
      socket.emit('LEAVE_ROOM');
      clearSession();
      socket.disconnect();
      socket.connect();
      return;
    }
    clearSession();
  }, [clearSession, socket, room]);

  return {
    socket,
    isConnected,
    room,
    myPlayer,
    errorMessage,
    kickedMessage,
    clearKickedMessage: () => setKickedMessage(null),
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
  };
}
