// Placeholder for server.js
console.log('Backend Server');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const jwt = require('jsonwebtoken');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

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
.catch((err) => console.error('❌ MongoDB Error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('🌾 FarmerSaaS Backend Running!');
});

// Example schema: User (farmer or buyer)
const userSchema = new mongoose.Schema({
  name: String,
  phone: String,
  role: { type: String, enum: ['farmer', 'buyer'] },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Example schema: Product
const productSchema = new mongoose.Schema({
  name: String,
  quantity: String,
  price: String,
  deliveryFee: String,
  location: String,
  farmerId: mongoose.Schema.Types.ObjectId,
});

const Product = mongoose.model('Product', productSchema);

// Auth endpoint: Register
app.post('/api/register', async (req, res) => {
  const { name, phone, password, role } = req.body;
  const user = new User({ name, phone, password, role });
  await user.save();
  res.json({ message: 'User registered' });
});

// Auth endpoint: Login (returns token)
app.post('/api/login', async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone, password });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
});

// Products endpoint: Create
app.post('/api/products', async (req, res) => {
  const { name, quantity, price, deliveryFee, location, farmerId } = req.body;
  const product = new Product({ name, quantity, price, deliveryFee, location, farmerId });
  await product.save();
  res.json({ message: 'Product listed' });
});

// Products endpoint: List all
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Socket.IO chat system
io.on('connection', (socket) => {
  console.log('🟢 New client connected');

  socket.on('send_message', (data) => {
    socket.broadcast.emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected');
  });
});

