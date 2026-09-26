import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { registerGameHandlers } from './sockets/gameHandler';
import path from 'path';

const app = express();
const server = http.createServer(app);

const corsOrigin = process.env.CLIENT_URL || '*';

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

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
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Maherx Games API is Running. Frontend client is loading...');
    }
  });
});

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 30000,
  pingInterval: 25000
});

io.on('connection', (socket) => {
  registerGameHandlers(io, socket);
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`🎮 [Maherx Games Server] running on http://localhost:${PORT}`);
});
