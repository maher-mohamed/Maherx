export interface Player {
  id: string;
  socketId: string;
  nickname: string;
  avatar: string;
  isHost: boolean;
  score: number;
  isReady: boolean;
  isConnected: boolean;
  color?: string;
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
  maxPlayers: number;
  password?: string;
  roundDurationSec: number;
}

export interface DrawStroke {
  prevX: number; // 0 to 1
  prevY: number; // 0 to 1
  currX: number; // 0 to 1
  currY: number; // 0 to 1
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
  votes: Record<string, string>;
  eliminatedPlayerId?: string;
  impostorWon?: boolean;
  roundNumber: number;
}

export interface FakeArtistGameData {
  state: FakeArtistState;
  category: string;
  secretWord: string;
  fakeArtistId: string;
  currentTurnPlayerId: string;
  currentRoundNumber: number;
  turnOrder: string[];
  turnIndex: number;
  turnTimeRemaining: number;
  strokes: DrawStroke[];
  votes: Record<string, string>;
  mostVotedPlayerId?: string;
  fakeArtistCaught?: boolean;
  impostorGuess?: string;
  impostorGuessTimeRemaining?: number;
  impostorGuessSuccess?: boolean;
  artistsWon?: boolean;
  roundNumber: number;
}

export interface Room {
  code: string;
  hostId: string;
  settings: RoomSettings;
  selectedGame: GameType;
  players: Record<string, Player>;
  impostorGame?: ImpostorGameData;
  fakeArtistGame?: FakeArtistGameData;
  createdAt: number;
}

export type SoundEffect =
  | 'ROUND_START'
  | 'TICK'
  | 'BUZZ'
  | 'VOTE_CAST'
  | 'REVEAL'
  | 'VICTORY'
  | 'GAME_OVER'
  | 'POP';
