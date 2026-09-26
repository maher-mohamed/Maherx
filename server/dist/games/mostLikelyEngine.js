"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MostLikelyEngine = void 0;
const arabicQuestions_1 = require("../data/arabicQuestions");
class MostLikelyEngine {
    /**
     * Initializes or restarts the Most Likely To game
     */
    static initGame(room) {
        // Pick random question from question bank
        const randomQuestion = arabicQuestions_1.ARABIC_MOST_LIKELY_QUESTIONS[Math.floor(Math.random() * arabicQuestions_1.ARABIC_MOST_LIKELY_QUESTIONS.length)];
        const currentRound = (room.mostLikelyGame?.roundNumber || 0) + 1;
        const gameData = {
            state: 'QUESTION_PRESENTATION',
            currentQuestion: randomQuestion,
            questionIndex: currentRound,
            totalQuestions: 5,
            votingTimeRemaining: 15,
            votes: {},
            roundWinners: [],
            roundNumber: currentRound
        };
        room.mostLikelyGame = gameData;
        return gameData;
    }
    /**
     * Transitions from Question Presentation to Voting
     */
    static startVoting(room) {
        if (!room.mostLikelyGame)
            return;
        room.mostLikelyGame.state = 'VOTING';
        room.mostLikelyGame.votingTimeRemaining = 15;
        room.mostLikelyGame.votes = {};
    }
    /**
     * Casts a vote from a voter to a target player
     */
    static castVote(room, voterId, targetId) {
        if (!room.mostLikelyGame || room.mostLikelyGame.state !== 'VOTING')
            return false;
        if (!room.players[voterId] || !room.players[targetId])
            return false;
        room.mostLikelyGame.votes[voterId] = targetId;
        // Check if all connected players have voted
        const activePlayerIds = Object.keys(room.players).filter(id => room.players[id].isConnected);
        const voteCount = Object.keys(room.mostLikelyGame.votes).length;
        return voteCount >= activePlayerIds.length;
    }
    /**
     * Evaluates voting results, updates player scores and transitions to RESULTS_SUMMARY
     */
    static evaluateVotes(room) {
        if (!room.mostLikelyGame)
            return;
        const votes = room.mostLikelyGame.votes;
        const voteTally = {};
        Object.values(votes).forEach(votedId => {
            voteTally[votedId] = (voteTally[votedId] || 0) + 1;
        });
        let maxCount = 0;
        Object.values(voteTally).forEach(count => {
            if (count > maxCount)
                maxCount = count;
        });
        const winners = [];
        Object.entries(voteTally).forEach(([playerId, count]) => {
            if (count === maxCount && count > 0) {
                winners.push({ playerId, count });
                // Award 150 points for being voted most likely
                if (room.players[playerId]) {
                    room.players[playerId].score += 150;
                }
            }
        });
        // Award 50 points to anyone who voted for the winning answer (majority consensus bonus)
        Object.entries(votes).forEach(([voterId, targetId]) => {
            if (winners.some(w => w.playerId === targetId) && room.players[voterId]) {
                room.players[voterId].score += 50;
            }
        });
        room.mostLikelyGame.roundWinners = winners;
        room.mostLikelyGame.state = 'RESULTS_SUMMARY';
    }
}
exports.MostLikelyEngine = MostLikelyEngine;
