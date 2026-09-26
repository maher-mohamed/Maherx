"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImpostorEngine = void 0;
const arabicQuestions_1 = require("../data/arabicQuestions");
class ImpostorEngine {
    /**
     * Initializes or restarts the Impostor game
     */
    static initGame(room) {
        const playerIds = Object.keys(room.players).filter(id => room.players[id].isConnected);
        // Pick random category and word
        const randomCategoryObj = arabicQuestions_1.ARABIC_WORD_BANK[Math.floor(Math.random() * arabicQuestions_1.ARABIC_WORD_BANK.length)];
        const randomWord = randomCategoryObj.words[Math.floor(Math.random() * randomCategoryObj.words.length)];
        // Pick random impostor
        const randomImpostorId = playerIds[Math.floor(Math.random() * playerIds.length)];
        const currentRound = (room.impostorGame?.roundNumber || 0) + 1;
        const gameData = {
            state: 'WORD_ASSIGNMENT',
            category: randomCategoryObj.category,
            secretWord: randomWord,
            impostorId: randomImpostorId,
            discussionTimeRemaining: room.settings.roundDurationSec || 60,
            currentSpeakerIndex: 0,
            votes: {},
            roundNumber: currentRound
        };
        room.impostorGame = gameData;
        return gameData;
    }
    /**
     * Transitions from Word Assignment to Discussion
     */
    static startDiscussion(room) {
        if (!room.impostorGame)
            return;
        room.impostorGame.state = 'DISCUSSION';
        room.impostorGame.discussionTimeRemaining = room.settings.roundDurationSec || 60;
    }
    /**
     * Transitions from Discussion to Voting
     */
    static startVoting(room) {
        if (!room.impostorGame)
            return;
        room.impostorGame.state = 'VOTING';
        room.impostorGame.votes = {};
    }
    /**
     * Casts a vote from a voter to a target player
     */
    static castVote(room, voterId, targetId) {
        if (!room.impostorGame || room.impostorGame.state !== 'VOTING')
            return false;
        // Ensure both players exist in room
        if (!room.players[voterId] || !room.players[targetId])
            return false;
        room.impostorGame.votes[voterId] = targetId;
        // Check if all connected active players have voted
        const activePlayerIds = Object.keys(room.players).filter(id => room.players[id].isConnected);
        const voteCount = Object.keys(room.impostorGame.votes).length;
        return voteCount >= activePlayerIds.length;
    }
    /**
     * Evaluates voting results, updates player scores and sets reveal state
     */
    static evaluateVotes(room) {
        if (!room.impostorGame)
            return;
        const votes = room.impostorGame.votes;
        const voteTally = {};
        Object.values(votes).forEach(votedId => {
            voteTally[votedId] = (voteTally[votedId] || 0) + 1;
        });
        let highestVotes = -1;
        let mostVotedPlayerId = undefined;
        let isTie = false;
        Object.entries(voteTally).forEach(([playerId, count]) => {
            if (count > highestVotes) {
                highestVotes = count;
                mostVotedPlayerId = playerId;
                isTie = false;
            }
            else if (count === highestVotes) {
                isTie = true;
            }
        });
        const impostorId = room.impostorGame.impostorId;
        let impostorCaught = false;
        if (!isTie && mostVotedPlayerId === impostorId) {
            // Citizens successfully caught the impostor!
            impostorCaught = true;
            room.impostorGame.impostorWon = false;
            room.impostorGame.eliminatedPlayerId = impostorId;
            // Award 200 points to each citizen who voted for the impostor
            Object.entries(votes).forEach(([voterId, targetId]) => {
                if (voterId !== impostorId && targetId === impostorId && room.players[voterId]) {
                    room.players[voterId].score += 200;
                }
            });
        }
        else {
            // Impostor escaped! (or tie occurred)
            impostorCaught = false;
            room.impostorGame.impostorWon = true;
            room.impostorGame.eliminatedPlayerId = isTie ? undefined : mostVotedPlayerId;
            // Award 350 bonus points to the impostor
            if (room.players[impostorId]) {
                room.players[impostorId].score += 350;
            }
        }
        room.impostorGame.state = 'REVEAL';
    }
    /**
     * Transitions to final round results
     */
    static showResults(room) {
        if (!room.impostorGame)
            return;
        room.impostorGame.state = 'RESULTS';
    }
    /**
     * Sanitizes the game data sent to a specific player so the secret word/impostor isn't leaked
     */
    static getSanitizedGameData(room, playerId) {
        if (!room.impostorGame)
            return undefined;
        const { state, category, secretWord, impostorId, discussionTimeRemaining, currentSpeakerIndex, votes, eliminatedPlayerId, impostorWon, roundNumber } = room.impostorGame;
        const isImpostor = playerId === impostorId;
        const canRevealSecret = state === 'REVEAL' || state === 'RESULTS';
        return {
            state,
            category,
            // If player is impostor and round is still ongoing, hide secret word
            secretWord: isImpostor && !canRevealSecret ? '' : secretWord,
            // Hide impostor ID until reveal
            impostorId: canRevealSecret ? impostorId : (isImpostor ? impostorId : ''),
            discussionTimeRemaining,
            currentSpeakerIndex,
            votes: state === 'VOTING' ? {} : votes, // Hide other votes during secret voting
            eliminatedPlayerId,
            impostorWon,
            roundNumber
        };
    }
}
exports.ImpostorEngine = ImpostorEngine;
