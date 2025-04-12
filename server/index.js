const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import DB connection
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const linkRoutes = require('./routes/linkRoutes');

// Initialize app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({ message: 'API is running' });
});

// Set port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
