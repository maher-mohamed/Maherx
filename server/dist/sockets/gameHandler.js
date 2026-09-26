"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerGameHandlers = exports.clearRoomTimer = void 0;
const roomController_1 = require("../controllers/roomController");
const impostorEngine_1 = require("../games/impostorEngine");
const fakeArtistEngine_1 = require("../games/fakeArtistEngine");
const roomTimers = new Map();
const clearRoomTimer = (roomCode) => {
    const existingTimer = roomTimers.get(roomCode);
    if (existingTimer) {
        clearInterval(existingTimer);
        roomTimers.delete(roomCode);
    }
};
exports.clearRoomTimer = clearRoomTimer;
const registerGameHandlers = (io, socket) => {
    const broadcastRoomState = (room) => {
        Object.values(room.players).forEach(player => {
            if (!player.isConnected)
                return;
            const sanitizedRoom = {
                ...room,
                impostorGame: room.impostorGame
                    ? impostorEngine_1.ImpostorEngine.getSanitizedGameData(room, player.id)
                    : undefined,
                fakeArtistGame: room.fakeArtistGame
                    ? fakeArtistEngine_1.FakeArtistEngine.getSanitizedGameData(room, player.id)
                    : undefined
            };
            io.to(player.socketId).emit('ROOM_STATE_UPDATE', { room: sanitizedRoom });
        });
    };
    const emitSound = (roomCode, sound) => {
        io.to(roomCode).emit('SOUND_TRIGGER', { sound });
    };
    // Helper for starting drawing turn intervals in Fake Artist
    const startDrawingTurnTimer = (roomCode) => {
        (0, exports.clearRoomTimer)(roomCode);
        const interval = setInterval(() => {
            const room = roomController_1.roomController.getRoom(roomCode);
            if (!room || !room.fakeArtistGame || room.fakeArtistGame.state !== 'DRAWING_TURNS') {
                (0, exports.clearRoomTimer)(roomCode);
                return;
            }
            room.fakeArtistGame.turnTimeRemaining -= 1;
            if (room.fakeArtistGame.turnTimeRemaining <= 3 && room.fakeArtistGame.turnTimeRemaining > 0) {
                emitSound(room.code, 'TICK');
            }
            if (room.fakeArtistGame.turnTimeRemaining <= 0) {
                // Advance to next turn
                const finishedDrawing = fakeArtistEngine_1.FakeArtistEngine.advanceTurn(room);
                if (finishedDrawing) {
                    (0, exports.clearRoomTimer)(roomCode);
                    emitSound(room.code, 'BUZZ');
                    broadcastRoomState(room);
                }
                else {
                    emitSound(room.code, 'POP');
                    broadcastRoomState(room);
                }
            }
            else {
                broadcastRoomState(room);
            }
        }, 1000);
        roomTimers.set(roomCode, interval);
    };
    // 1. Create Room
    socket.on('CREATE_ROOM', (payload) => {
        try {
            if (!payload.nickname || !payload.nickname.trim()) {
                socket.emit('ERROR', { message: 'يرجى إدخال اسمك المستعار' });
                return;
            }
            const { room, player } = roomController_1.roomController.createRoom(payload.nickname, payload.avatar, socket.id, {
                maxPlayers: payload.maxPlayers,
                password: payload.password,
                sessionPlayerId: payload.sessionPlayerId
            });
            socket.join(room.code);
            socket.emit('ROOM_CREATED', { room, player });
            broadcastRoomState(room);
        }
        catch (err) {
            socket.emit('ERROR', { message: err.message || 'حدث خطأ أثناء إنشاء الغرفة' });
        }
    });
    // 2. Join Room
    socket.on('JOIN_ROOM', (payload) => {
        try {
            if (!payload.roomCode || !payload.nickname) {
                socket.emit('ERROR', { message: 'يرجى ملء جميع الحقول المطلوبة' });
                return;
            }
            const result = roomController_1.roomController.joinRoom(payload.roomCode, payload.nickname, payload.avatar, socket.id, payload.password, payload.sessionPlayerId);
            if (!result.success || !result.room || !result.player) {
                socket.emit('ERROR', { message: result.error || 'تعذر الانضمام للغرفة' });
                return;
            }
            socket.join(result.room.code);
            socket.emit('JOINED_ROOM', { room: result.room, player: result.player });
            broadcastRoomState(result.room);
            emitSound(result.room.code, 'TICK');
        }
        catch (err) {
            socket.emit('ERROR', { message: err.message || 'حدث خطأ أثناء الانضمام' });
        }
    });
    // 3. Reconnect Session
    socket.on('RECONNECT_SESSION', (payload) => {
        try {
            const result = roomController_1.roomController.handleReconnect(payload.roomCode, payload.sessionPlayerId, socket.id);
            if (result.success && result.room && result.player) {
                socket.join(result.room.code);
                socket.emit('RECONNECTED', { room: result.room, player: result.player });
                broadcastRoomState(result.room);
            }
            else {
                socket.emit('RECONNECT_FAILED', { message: 'انتهت صلاحية الجلسة' });
            }
        }
        catch (err) {
            socket.emit('RECONNECT_FAILED', { message: 'تعذرت إعادة الاتصال' });
        }
    });
    // 4. Select Game
    socket.on('SELECT_GAME', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player)
            return;
        const result = roomController_1.roomController.selectGame(payload.roomCode, player.id, payload.gameType);
        if (result.success && result.room) {
            broadcastRoomState(result.room);
            emitSound(result.room.code, 'TICK');
        }
        else {
            socket.emit('ERROR', { message: result.error || 'تعذر اختيار اللعبة' });
        }
    });
    // 5. Toggle Ready
    socket.on('TOGGLE_READY', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player)
            return;
        const result = roomController_1.roomController.toggleReady(payload.roomCode, player.id);
        if (result.success && result.room) {
            broadcastRoomState(result.room);
            emitSound(result.room.code, 'TICK');
        }
    });
    // 6. Kick Player
    socket.on('KICK_PLAYER', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player)
            return;
        const result = roomController_1.roomController.kickPlayer(payload.roomCode, player.id, payload.targetPlayerId);
        if (result.success && result.room && result.kickedSocketId) {
            io.to(result.kickedSocketId).emit('KICKED', { message: 'تم طردك من قبل المضيف' });
            io.in(result.kickedSocketId).socketsLeave(result.room.code);
            broadcastRoomState(result.room);
        }
        else {
            socket.emit('ERROR', { message: result.error || 'تعذر طرد اللاعب' });
        }
    });
    // 7. Start Game
    socket.on('START_GAME', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player)
            return;
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
        (0, exports.clearRoomTimer)(room.code);
        emitSound(room.code, 'ROUND_START');
        if (room.selectedGame === 'IMPOSTOR') {
            impostorEngine_1.ImpostorEngine.initGame(room);
            broadcastRoomState(room);
            const assignmentTimer = setTimeout(() => {
                const currentRoom = roomController_1.roomController.getRoom(room.code);
                if (currentRoom && currentRoom.impostorGame && currentRoom.impostorGame.state === 'WORD_ASSIGNMENT') {
                    impostorEngine_1.ImpostorEngine.startDiscussion(currentRoom);
                    broadcastRoomState(currentRoom);
                    const interval = setInterval(() => {
                        const r = roomController_1.roomController.getRoom(room.code);
                        if (!r || !r.impostorGame || r.impostorGame.state !== 'DISCUSSION') {
                            (0, exports.clearRoomTimer)(room.code);
                            return;
                        }
                        r.impostorGame.discussionTimeRemaining -= 1;
                        if (r.impostorGame.discussionTimeRemaining <= 5 && r.impostorGame.discussionTimeRemaining > 0) {
                            emitSound(room.code, 'TICK');
                        }
                        if (r.impostorGame.discussionTimeRemaining <= 0) {
                            (0, exports.clearRoomTimer)(room.code);
                            impostorEngine_1.ImpostorEngine.startVoting(r);
                            emitSound(room.code, 'BUZZ');
                            broadcastRoomState(r);
                        }
                        else {
                            broadcastRoomState(r);
                        }
                    }, 1000);
                    roomTimers.set(room.code, interval);
                }
            }, 6000);
            roomTimers.set(room.code, assignmentTimer);
        }
        else if (room.selectedGame === 'FAKE_ARTIST') {
            fakeArtistEngine_1.FakeArtistEngine.initGame(room);
            broadcastRoomState(room);
            // 6 seconds to view category & role, then start drawing turns
            const assignmentTimer = setTimeout(() => {
                const currentRoom = roomController_1.roomController.getRoom(room.code);
                if (currentRoom && currentRoom.fakeArtistGame && currentRoom.fakeArtistGame.state === 'CATEGORY_AND_ROLE_ASSIGNMENT') {
                    fakeArtistEngine_1.FakeArtistEngine.startDrawingTurns(currentRoom);
                    broadcastRoomState(currentRoom);
                    startDrawingTurnTimer(currentRoom.code);
                }
            }, 6000);
            roomTimers.set(room.code, assignmentTimer);
        }
    });
    // 8. Real-time Canvas Drawing (draw_line / DRAW_LINE)
    socket.on('DRAW_LINE', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player || !room.fakeArtistGame)
            return;
        // Verify it is currently this player's turn to draw
        if (room.fakeArtistGame.state !== 'DRAWING_TURNS')
            return;
        if (room.fakeArtistGame.currentTurnPlayerId !== player.id)
            return;
        // Use player's assigned color
        const stroke = {
            ...payload.stroke,
            color: player.color || payload.stroke.color
        };
        fakeArtistEngine_1.FakeArtistEngine.addStroke(room, stroke);
        // Broadcast stroke immediately to all room members
        io.to(room.code).emit('LINE_DRAWN', { stroke });
    });
    // 9. Cast Vote (for Impostor or Fake Artist)
    socket.on('CAST_VOTE', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player)
            return;
        if (room.selectedGame === 'IMPOSTOR' && room.impostorGame?.state === 'VOTING') {
            const allVoted = impostorEngine_1.ImpostorEngine.castVote(room, player.id, payload.targetPlayerId);
            emitSound(room.code, 'VOTE_CAST');
            broadcastRoomState(room);
            if (allVoted) {
                (0, exports.clearRoomTimer)(room.code);
                impostorEngine_1.ImpostorEngine.evaluateVotes(room);
                emitSound(room.code, 'REVEAL');
                broadcastRoomState(room);
            }
        }
        else if (room.selectedGame === 'FAKE_ARTIST' && room.fakeArtistGame?.state === 'VOTING') {
            const allVoted = fakeArtistEngine_1.FakeArtistEngine.castVote(room, player.id, payload.targetPlayerId);
            emitSound(room.code, 'VOTE_CAST');
            broadcastRoomState(room);
            if (allVoted) {
                (0, exports.clearRoomTimer)(room.code);
                const movingToGuess = fakeArtistEngine_1.FakeArtistEngine.evaluateVotes(room);
                emitSound(room.code, 'REVEAL');
                broadcastRoomState(room);
                if (movingToGuess) {
                    // Fake Artist gets 15s to guess the secret word
                    const guessInterval = setInterval(() => {
                        const r = roomController_1.roomController.getRoom(room.code);
                        if (!r || !r.fakeArtistGame || r.fakeArtistGame.state !== 'IMPOSTOR_GUESS') {
                            (0, exports.clearRoomTimer)(room.code);
                            return;
                        }
                        r.fakeArtistGame.impostorGuessTimeRemaining = (r.fakeArtistGame.impostorGuessTimeRemaining || 15) - 1;
                        if (r.fakeArtistGame.impostorGuessTimeRemaining <= 0) {
                            (0, exports.clearRoomTimer)(room.code);
                            // Automatic timeout fail
                            fakeArtistEngine_1.FakeArtistEngine.submitImpostorGuess(r, '');
                            emitSound(room.code, 'VICTORY');
                            broadcastRoomState(r);
                        }
                        else {
                            broadcastRoomState(r);
                        }
                    }, 1000);
                    roomTimers.set(room.code, guessInterval);
                }
            }
        }
    });
    // 10. Impostor Secret Word Guess (Fake Artist only)
    socket.on('SUBMIT_IMPOSTOR_GUESS', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player || !room.fakeArtistGame)
            return;
        if (room.fakeArtistGame.state !== 'IMPOSTOR_GUESS')
            return;
        if (room.fakeArtistGame.fakeArtistId !== player.id)
            return;
        (0, exports.clearRoomTimer)(room.code);
        fakeArtistEngine_1.FakeArtistEngine.submitImpostorGuess(room, payload.guessedWord);
        emitSound(room.code, 'VICTORY');
        broadcastRoomState(room);
    });
    // 11. Early Skip to Voting (Host control)
    socket.on('START_VOTING_EARLY', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player || room.hostId !== player.id)
            return;
        if (room.impostorGame && room.impostorGame.state === 'DISCUSSION') {
            (0, exports.clearRoomTimer)(room.code);
            impostorEngine_1.ImpostorEngine.startVoting(room);
            emitSound(room.code, 'BUZZ');
            broadcastRoomState(room);
        }
        else if (room.fakeArtistGame && room.fakeArtistGame.state === 'DRAWING_TURNS') {
            (0, exports.clearRoomTimer)(room.code);
            room.fakeArtistGame.state = 'VOTING';
            room.fakeArtistGame.votes = {};
            emitSound(room.code, 'BUZZ');
            broadcastRoomState(room);
        }
    });
    // 12. Next Round
    socket.on('NEXT_ROUND', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player || room.hostId !== player.id)
            return;
        (0, exports.clearRoomTimer)(room.code);
        if (room.selectedGame === 'IMPOSTOR') {
            impostorEngine_1.ImpostorEngine.initGame(room);
            emitSound(room.code, 'ROUND_START');
            broadcastRoomState(room);
            const assignmentTimer = setTimeout(() => {
                const currentRoom = roomController_1.roomController.getRoom(room.code);
                if (currentRoom && currentRoom.impostorGame && currentRoom.impostorGame.state === 'WORD_ASSIGNMENT') {
                    impostorEngine_1.ImpostorEngine.startDiscussion(currentRoom);
                    broadcastRoomState(currentRoom);
                    const interval = setInterval(() => {
                        const r = roomController_1.roomController.getRoom(room.code);
                        if (!r || !r.impostorGame || r.impostorGame.state !== 'DISCUSSION') {
                            (0, exports.clearRoomTimer)(room.code);
                            return;
                        }
                        r.impostorGame.discussionTimeRemaining -= 1;
                        if (r.impostorGame.discussionTimeRemaining <= 0) {
                            (0, exports.clearRoomTimer)(room.code);
                            impostorEngine_1.ImpostorEngine.startVoting(r);
                            emitSound(room.code, 'BUZZ');
                            broadcastRoomState(r);
                        }
                        else {
                            broadcastRoomState(r);
                        }
                    }, 1000);
                    roomTimers.set(room.code, interval);
                }
            }, 6000);
            roomTimers.set(room.code, assignmentTimer);
        }
        else if (room.selectedGame === 'FAKE_ARTIST') {
            fakeArtistEngine_1.FakeArtistEngine.initGame(room);
            emitSound(room.code, 'ROUND_START');
            broadcastRoomState(room);
            const assignmentTimer = setTimeout(() => {
                const currentRoom = roomController_1.roomController.getRoom(room.code);
                if (currentRoom && currentRoom.fakeArtistGame && currentRoom.fakeArtistGame.state === 'CATEGORY_AND_ROLE_ASSIGNMENT') {
                    fakeArtistEngine_1.FakeArtistEngine.startDrawingTurns(currentRoom);
                    broadcastRoomState(currentRoom);
                    startDrawingTurnTimer(currentRoom.code);
                }
            }, 6000);
            roomTimers.set(room.code, assignmentTimer);
        }
    });
    // 13. Return to Lobby
    socket.on('RETURN_TO_LOBBY', (payload) => {
        const { room, player } = roomController_1.roomController.getPlayerBySocket(socket.id);
        if (!room || !player)
            return;
        (0, exports.clearRoomTimer)(room.code);
        const result = roomController_1.roomController.resetToLobby(payload.roomCode, player.id);
        if (result.success && result.room) {
            broadcastRoomState(result.room);
        }
        else {
            socket.emit('ERROR', { message: result.error || 'تعذر العودة للوبي' });
        }
    });
    // 14. Disconnect
    socket.on('disconnect', () => {
        const { room } = roomController_1.roomController.handleDisconnect(socket.id);
        if (room) {
            broadcastRoomState(room);
        }
    });
};
exports.registerGameHandlers = registerGameHandlers;
