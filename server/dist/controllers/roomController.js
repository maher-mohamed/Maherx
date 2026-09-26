"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = exports.RoomController = void 0;
const uuid_1 = require("uuid");
class RoomController {
    rooms = new Map();
    // Map socketId -> { roomCode, playerId }
    socketToPlayerMap = new Map();
    /**
     * Generates a clean, uppercase 5-character room code
     */
    generateRoomCode() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // Excludes 0, O, 1, I, L
        let code = '';
        let attempts = 0;
        do {
            code = '';
            for (let i = 0; i < 5; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            attempts++;
        } while (this.rooms.has(code) && attempts < 100);
        return code;
    }
    /**
     * Creates a new room and sets creator as host
     */
    createRoom(hostNickname, hostAvatar, socketId, options) {
        const code = this.generateRoomCode();
        const playerId = options?.sessionPlayerId || (0, uuid_1.v4)();
        const maxPlayers = Math.min(Math.max(options?.maxPlayers || 8, 2), 16);
        const hostPlayer = {
            id: playerId,
            socketId,
            nickname: hostNickname.trim(),
            avatar: hostAvatar || '👑',
            isHost: true,
            score: 0,
            isReady: true,
            isConnected: true
        };
        const settings = {
            maxPlayers,
            password: options?.password?.trim() || undefined,
            roundDurationSec: 60
        };
        const room = {
            code,
            hostId: playerId,
            settings,
            selectedGame: 'NONE',
            players: {
                [playerId]: hostPlayer
            },
            createdAt: Date.now()
        };
        this.rooms.set(code, room);
        this.socketToPlayerMap.set(socketId, { roomCode: code, playerId });
        return { room, player: hostPlayer };
    }
    /**
     * Joins an existing room
     */
    joinRoom(roomCode, nickname, avatar, socketId, password, sessionPlayerId) {
        const cleanCode = roomCode.trim().toUpperCase();
        const room = this.rooms.get(cleanCode);
        if (!room) {
            return { success: false, error: 'رمز الغرفة غير صحيح أو الغرفة غير موجودة' };
        }
        if (room.settings.password && room.settings.password !== password?.trim()) {
            return { success: false, error: 'كلمة المرور (PIN) غير صحيحة' };
        }
        if (sessionPlayerId && room.players[sessionPlayerId]) {
            const existingPlayer = room.players[sessionPlayerId];
            existingPlayer.socketId = socketId;
            existingPlayer.isConnected = true;
            if (nickname.trim())
                existingPlayer.nickname = nickname.trim();
            if (avatar)
                existingPlayer.avatar = avatar;
            this.socketToPlayerMap.set(socketId, { roomCode: cleanCode, playerId: sessionPlayerId });
            return { success: true, room, player: existingPlayer };
        }
        const activePlayerCount = Object.keys(room.players).length;
        if (activePlayerCount >= room.settings.maxPlayers) {
            return { success: false, error: 'الغرفة ممتلئة بالكامل' };
        }
        const isNameTaken = Object.values(room.players).some(p => p.nickname.toLowerCase() === nickname.trim().toLowerCase());
        if (isNameTaken) {
            return { success: false, error: 'هذا الاسم مستخدم بالفعل داخل الغرفة' };
        }
        const playerId = sessionPlayerId || (0, uuid_1.v4)();
        const newPlayer = {
            id: playerId,
            socketId,
            nickname: nickname.trim(),
            avatar: avatar || '🎨',
            isHost: false,
            score: 0,
            isReady: false,
            isConnected: true
        };
        room.players[playerId] = newPlayer;
        this.socketToPlayerMap.set(socketId, { roomCode: cleanCode, playerId });
        return { success: true, room, player: newPlayer };
    }
    handleReconnect(roomCode, sessionPlayerId, newSocketId) {
        const cleanCode = roomCode.trim().toUpperCase();
        const room = this.rooms.get(cleanCode);
        if (!room)
            return { success: false };
        const player = room.players[sessionPlayerId];
        if (!player)
            return { success: false };
        this.socketToPlayerMap.delete(player.socketId);
        player.socketId = newSocketId;
        player.isConnected = true;
        this.socketToPlayerMap.set(newSocketId, { roomCode: cleanCode, playerId: sessionPlayerId });
        return { success: true, room, player };
    }
    handleDisconnect(socketId) {
        const mapping = this.socketToPlayerMap.get(socketId);
        if (!mapping)
            return {};
        const { roomCode, playerId } = mapping;
        const room = this.rooms.get(roomCode);
        if (!room) {
            this.socketToPlayerMap.delete(socketId);
            return {};
        }
        const player = room.players[playerId];
        if (player) {
            player.isConnected = false;
            if (player.isHost) {
                const nextHost = Object.values(room.players).find(p => p.id !== playerId && p.isConnected);
                if (nextHost) {
                    player.isHost = false;
                    nextHost.isHost = true;
                    room.hostId = nextHost.id;
                }
            }
        }
        this.socketToPlayerMap.delete(socketId);
        return { room, player, roomCode };
    }
    kickPlayer(roomCode, requesterId, targetPlayerId) {
        const room = this.rooms.get(roomCode.toUpperCase());
        if (!room)
            return { success: false, error: 'الغرفة غير موجودة' };
        if (room.hostId !== requesterId) {
            return { success: false, error: 'المضيف فقط هو من يملك صلاحية طرد اللاعبين' };
        }
        if (requesterId === targetPlayerId) {
            return { success: false, error: 'لا يمكنك طرد نفسك من الغرفة' };
        }
        const targetPlayer = room.players[targetPlayerId];
        if (!targetPlayer)
            return { success: false, error: 'اللاعب غير موجود' };
        const kickedSocketId = targetPlayer.socketId;
        delete room.players[targetPlayerId];
        this.socketToPlayerMap.delete(kickedSocketId);
        return { success: true, room, kickedSocketId };
    }
    selectGame(roomCode, requesterId, gameType) {
        const room = this.rooms.get(roomCode.toUpperCase());
        if (!room)
            return { success: false, error: 'الغرفة غير موجودة' };
        if (room.hostId !== requesterId) {
            return { success: false, error: 'المضيف فقط هو من يستطيع اختيار اللعبة' };
        }
        room.selectedGame = gameType;
        return { success: true, room };
    }
    toggleReady(roomCode, playerId) {
        const room = this.rooms.get(roomCode.toUpperCase());
        if (!room || !room.players[playerId])
            return { success: false };
        room.players[playerId].isReady = !room.players[playerId].isReady;
        return { success: true, room };
    }
    resetToLobby(roomCode, requesterId) {
        const room = this.rooms.get(roomCode.toUpperCase());
        if (!room)
            return { success: false, error: 'الغرفة غير موجودة' };
        if (requesterId && room.hostId !== requesterId) {
            return { success: false, error: 'المضيف فقط هو من يستطيع إعادة الغرفة للانتظار' };
        }
        room.selectedGame = 'NONE';
        room.impostorGame = undefined;
        room.fakeArtistGame = undefined;
        Object.values(room.players).forEach(p => {
            p.isReady = p.isHost;
        });
        return { success: true, room };
    }
    getRoom(roomCode) {
        return this.rooms.get(roomCode.toUpperCase());
    }
    getPlayerBySocket(socketId) {
        const mapping = this.socketToPlayerMap.get(socketId);
        if (!mapping)
            return {};
        const room = this.rooms.get(mapping.roomCode);
        if (!room)
            return {};
        return { room, player: room.players[mapping.playerId] };
    }
}
exports.RoomController = RoomController;
exports.roomController = new RoomController();
