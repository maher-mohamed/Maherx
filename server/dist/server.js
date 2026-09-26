"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const gameHandler_1 = require("./sockets/gameHandler");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const corsOrigin = process.env.CLIENT_URL || '*';
app.use((0, cors_1.default)({
    origin: corsOrigin,
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express_1.default.json());
// API Health Check & Info
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        platform: 'Maherx Games (ألعاب ماهر إكس)',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
// Serve frontend static build if present
const clientDistPath = path_1.default.join(__dirname, '../../client/dist');
app.use(express_1.default.static(clientDistPath));
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
    }
    res.sendFile(path_1.default.join(clientDistPath, 'index.html'), (err) => {
        if (err) {
            res.status(200).send('Maherx Games API is Running. Frontend client is loading...');
        }
    });
});
// Socket.io initialization
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    pingTimeout: 30000,
    pingInterval: 25000
});
io.on('connection', (socket) => {
    (0, gameHandler_1.registerGameHandlers)(io, socket);
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🎮 [Maherx Games Server] running on http://localhost:${PORT}`);
});
