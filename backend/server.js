const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Express app setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('🌾 FarmerSaaS backend is live!');
});

// Socket.IO chat setup
io.on('connection', (socket) => {
  console.log('🟢 Client connected');

  socket.on('send_message', (data) => {
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });
});

// ✅ Start the server (ONLY ONE PORT DECLARATION)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
