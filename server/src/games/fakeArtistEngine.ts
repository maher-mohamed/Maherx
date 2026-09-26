import { Room, FakeArtistGameData, DrawStroke } from '../types';
import { ARABIC_WORD_BANK, ARTIST_PALETTE } from '../data/arabicQuestions';

export class FakeArtistEngine {
  /**
   * Initializes or restarts the Fake Artist game
   */
  public static initGame(room: Room): FakeArtistGameData {
    const playerIds = Object.keys(room.players).filter(id => room.players[id].isConnected);

    // Assign unique drawing colors to all players
    playerIds.forEach((playerId, index) => {
      room.players[playerId].color = ARTIST_PALETTE[index % ARTIST_PALETTE.length];
    });

    // Pick random category and secret word
    const randomCategoryObj = ARABIC_WORD_BANK[Math.floor(Math.random() * ARABIC_WORD_BANK.length)];
    const randomWord = randomCategoryObj.words[Math.floor(Math.random() * randomCategoryObj.words.length)];

    // Pick random Fake Artist
    const randomFakeArtistId = playerIds[Math.floor(Math.random() * playerIds.length)];

    // Shuffle player order for turns
    const shuffledTurns = [...playerIds].sort(() => Math.random() - 0.5);

    const currentRound = (room.fakeArtistGame?.roundNumber || 0) + 1;

    const gameData: FakeArtistGameData = {
      state: 'CATEGORY_AND_ROLE_ASSIGNMENT',
      category: randomCategoryObj.category,
      secretWord: randomWord,
      fakeArtistId: randomFakeArtistId,
      currentTurnPlayerId: shuffledTurns[0],
      currentRoundNumber: 1,
      turnOrder: shuffledTurns,
      turnIndex: 0,
      turnTimeRemaining: 12,
      strokes: [],
      votes: {},
      roundNumber: currentRound
    };

    room.fakeArtistGame = gameData;
    return gameData;
  }

  /**
   * Transitions from Role Assignment to Drawing Turns
   */
  public static startDrawingTurns(room: Room): void {
    if (!room.fakeArtistGame) return;
    room.fakeArtistGame.state = 'DRAWING_TURNS';
    room.fakeArtistGame.currentRoundNumber = 1;
    room.fakeArtistGame.turnIndex = 0;
    room.fakeArtistGame.currentTurnPlayerId = room.fakeArtistGame.turnOrder[0];
    room.fakeArtistGame.turnTimeRemaining = 12;
  }

  /**
   * Advances to the next player's drawing turn or transitions to voting after 2 full rounds
   */
  public static advanceTurn(room: Room): boolean {
    if (!room.fakeArtistGame || room.fakeArtistGame.state !== 'DRAWING_TURNS') return false;

    const game = room.fakeArtistGame;
    game.turnIndex += 1;

    if (game.turnIndex >= game.turnOrder.length) {
      // A full turn order has finished. Start the same order again.
      // Keep looping until the host manually ends the round.
      game.currentRoundNumber += 1;
      game.turnIndex = 0;
      game.currentTurnPlayerId = game.turnOrder[0];
      game.turnTimeRemaining = 0;
      return false;
    } else {
      game.currentTurnPlayerId = game.turnOrder[game.turnIndex];
      game.turnTimeRemaining = 12;
      return false;
    }
  }

  /**
   * Records a new drawing stroke on the canvas
   */
  public static addStroke(room: Room, stroke: DrawStroke): void {
    if (!room.fakeArtistGame) return;
    room.fakeArtistGame.strokes.push(stroke);
  }

  /**
   * Casts a vote from a voter to a target player
   */
  public static castVote(room: Room, voterId: string, targetId: string): boolean {
    if (!room.fakeArtistGame || room.fakeArtistGame.state !== 'VOTING') return false;
    if (!room.players[voterId] || !room.players[targetId]) return false;

    room.fakeArtistGame.votes[voterId] = targetId;

    const activePlayerIds = Object.keys(room.players).filter(id => room.players[id].isConnected);
    const voteCount = Object.keys(room.fakeArtistGame.votes).length;

    return voteCount >= activePlayerIds.length;
  }

  /**
   * Evaluates voting results
   * Returns true if fake artist caught and moving to IMPOSTOR_GUESS
   */
  public static evaluateVotes(room: Room): boolean {
    if (!room.fakeArtistGame) return false;

    const votes = room.fakeArtistGame.votes;
    const voteTally: Record<string, number> = {};

    Object.values(votes).forEach(votedId => {
      voteTally[votedId] = (voteTally[votedId] || 0) + 1;
    });

    let highestVotes = -1;
    let mostVotedPlayerId: string | undefined = undefined;
    let isTie = false;

    Object.entries(voteTally).forEach(([playerId, count]) => {
      if (count > highestVotes) {
        highestVotes = count;
        mostVotedPlayerId = playerId;
        isTie = false;
      } else if (count === highestVotes) {
        isTie = true;
      }
    });

    const fakeArtistId = room.fakeArtistGame.fakeArtistId;
    room.fakeArtistGame.mostVotedPlayerId = mostVotedPlayerId;

    if (!isTie && mostVotedPlayerId === fakeArtistId) {
      // Fake Artist was caught! Give Fake Artist 15s to guess the secret word
      room.fakeArtistGame.fakeArtistCaught = true;
      room.fakeArtistGame.state = 'IMPOSTOR_GUESS';
      room.fakeArtistGame.impostorGuessTimeRemaining = 15;
      return true;
    } else {
      // Fake Artist escaped and was NOT identified!
      room.fakeArtistGame.fakeArtistCaught = false;
      room.fakeArtistGame.artistsWon = false;
      room.fakeArtistGame.state = 'RESULTS';

      // Award 350 points to Fake Artist
      if (room.players[fakeArtistId]) {
        room.players[fakeArtistId].score += 350;
      }
      return false;
    }
  }

  /**
   * Normalizes Arabic text for flexible matching (removes diacritics, normalizes alif/taa marbuta)
   */
  private static normalizeArabic(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[\u064B-\u065F]/g, '') // remove tashkeel
      .replace(/[إأآا]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/\s+/g, ' ');
  }

  /**
   * Evaluates the Fake Artist's guess of the secret word
   */
  public static submitImpostorGuess(room: Room, guessedWord: string): void {
    if (!room.fakeArtistGame) return;

    const secret = this.normalizeArabic(room.fakeArtistGame.secretWord);
    const guess = this.normalizeArabic(guessedWord);

    const isMatch =
      secret === guess ||
      secret.includes(guess) ||
      guess.includes(secret);

    room.fakeArtistGame.impostorGuess = guessedWord;
    room.fakeArtistGame.impostorGuessSuccess = isMatch;
    room.fakeArtistGame.state = 'RESULTS';

    const fakeArtistId = room.fakeArtistGame.fakeArtistId;

    if (isMatch) {
      // Fake Artist guessed correctly! Fake Artist wins!
      room.fakeArtistGame.artistsWon = false;
      if (room.players[fakeArtistId]) {
        room.players[fakeArtistId].score += 400;
      }
    } else {
      // Fake Artist failed to guess! Real Artists win!
      room.fakeArtistGame.artistsWon = true;

      // Award 250 points to each citizen who correctly voted for the fake artist
      const votes = room.fakeArtistGame.votes;
      Object.entries(votes).forEach(([voterId, targetId]) => {
        if (voterId !== fakeArtistId && targetId === fakeArtistId && room.players[voterId]) {
          room.players[voterId].score += 250;
        }
      });
    }
  }

  /**
   * Sanitizes game data for player socket broadcasts
   */
  public static getSanitizedGameData(room: Room, playerId: string): Partial<FakeArtistGameData> | undefined {
    if (!room.fakeArtistGame) return undefined;

    const {
      state,
      category,
      secretWord,
      fakeArtistId,
      currentTurnPlayerId,
      currentRoundNumber,
      turnOrder,
      turnIndex,
      turnTimeRemaining,
      strokes,
      votes,
      mostVotedPlayerId,
      fakeArtistCaught,
      impostorGuess,
      impostorGuessTimeRemaining,
      impostorGuessSuccess,
      artistsWon,
      roundNumber
    } = room.fakeArtistGame;

    const isFakeArtist = playerId === fakeArtistId;
    const canRevealSecret = state === 'RESULTS';

    return {
      state,
      category,
      // If player is fake artist, hide secret word until results
      secretWord: isFakeArtist && !canRevealSecret ? '' : secretWord,
      // Hide fake artist identity from regular players until results or impostor guess
      fakeArtistId: canRevealSecret || state === 'IMPOSTOR_GUESS' ? fakeArtistId : (isFakeArtist ? fakeArtistId : ''),
      currentTurnPlayerId,
      currentRoundNumber,
      turnOrder,
      turnIndex,
      turnTimeRemaining,
      strokes,
      votes: state === 'VOTING' ? {} : votes,
      mostVotedPlayerId,
      fakeArtistCaught,
      impostorGuess,
      impostorGuessTimeRemaining,
      impostorGuessSuccess,
      artistsWon,
      roundNumber
    };
  }
}
