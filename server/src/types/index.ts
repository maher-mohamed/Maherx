export interface Player {
  id: string; // Session UUID / persistent player ID
  socketId: string;
  nickname: string;
  avatar: string; // Avatar emoji or preset
  isHost: boolean;
  score: number;
  isReady: boolean;
  isConnected: boolean;
  color?: string; // Assigned drawing color in Fake Artist
}

export type GameType = 'IMPOSTOR' | 'FAKE_ARTIST' | 'NONE';

export type ImpostorState =
  | 'LOBBY'
  | 'WORD_ASSIGNMENT'
  | 'DISCUSSION'
  | 'VOTING'
  | 'REVEAL'
  | 'RESULTS';

export type FakeArtistState =
  | 'LOBBY'
  | 'CATEGORY_AND_ROLE_ASSIGNMENT'
  | 'DRAWING_TURNS'
  | 'VOTING'
  | 'IMPOSTOR_GUESS'
  | 'RESULTS';

export interface RoomSettings {
  maxPlayers: number; // 2 to 16
  password?: string; // Optional PIN
  roundDurationSec: number;
}

export interface DrawStroke {
  prevX: number; // Normalized 0 to 1
  prevY: number; // Normalized 0 to 1
  currX: number; // Normalized 0 to 1
  currY: number; // Normalized 0 to 1
  color: string;
  lineWidth: number;
}

export interface ImpostorGameData {
  state: ImpostorState;
  category: string;
  secretWord: string;
  impostorId: string;
  discussionTimeRemaining: number;
  currentSpeakerIndex: number;
  votes: Record<string, string>; // voterPlayerId -> votedPlayerId
  eliminatedPlayerId?: string;
  impostorWon?: boolean;
  roundNumber: number;
}

export interface FakeArtistGameData {
  state: FakeArtistState;
  category: string;
  secretWord: string;
  fakeArtistId: string; // Player ID of the Fake Artist
  currentTurnPlayerId: string;
  currentRoundNumber: number; // 1 or 2 (game runs for 2 rounds)
  turnOrder: string[]; // Array of player IDs
  turnIndex: number; // Current index in turnOrder
  turnTimeRemaining: number; // 12s per turn
  strokes: DrawStroke[]; // Real-time stroke history for synchronization
  votes: Record<string, string>; // voterId -> targetId
  mostVotedPlayerId?: string;
  fakeArtistCaught?: boolean;
  impostorGuess?: string;
  impostorGuessTimeRemaining?: number; // 15s
  impostorGuessSuccess?: boolean;
  artistsWon?: boolean;
  roundNumber: number;
}

export interface Room {
  code: string; // 5-letter uppercase code
  hostId: string;
  settings: RoomSettings;
  selectedGame: GameType;
  players: Record<string, Player>; // playerId -> Player
  impostorGame?: ImpostorGameData;
  fakeArtistGame?: FakeArtistGameData;
  createdAt: number;
}

// Client to Server Events
export interface CreateRoomPayload {
  nickname: string;
  avatar: string;
  maxPlayers?: number;
  password?: string;
  sessionPlayerId?: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  nickname: string;
  avatar: string;
  password?: string;
  sessionPlayerId?: string;
}

export interface ReconnectPayload {
  roomCode: string;
  sessionPlayerId: string;
}

export interface SelectGamePayload {
  roomCode: string;
  gameType: GameType;
}

export interface KickPlayerPayload {
  roomCode: string;
  targetPlayerId: string;
}

export interface ToggleReadyPayload {
  roomCode: string;
}

export interface StartGamePayload {
  roomCode: string;
}

export interface ReturnToLobbyPayload {
  roomCode: string;
}

export interface CastVotePayload {
  roomCode: string;
  targetPlayerId: string;
}

export interface DrawLinePayload {
  roomCode: string;
  stroke: DrawStroke;
}

export interface ImpostorGuessPayload {
  roomCode: string;
  guessedWord: string;
}

export interface NextRoundPayload {
  roomCode: string;
}

// Server to Client Events
export interface RoomStateUpdatePayload {
  room: Room;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

export interface SoundTriggerPayload {
  sound: 'ROUND_START' | 'TICK' | 'BUZZ' | 'VOTE_CAST' | 'REVEAL' | 'VICTORY' | 'GAME_OVER' | 'POP';
}
