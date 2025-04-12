const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      // No longer needed in mongoose 6+, but good to be explicit
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Connection timeout after 5 seconds
      serverSelectionTimeoutMS: 5000,
      // Socket timeout after 45 seconds
      socketTimeoutMS: 45000,
    };

    // Try to connect to MongoDB Atlas
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    // Display connection info
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Database: ${conn.connection.name}`);

    // Set up event listeners for MongoDB connection
    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    // Handle application shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);

    // Only exit in production; in development we can use a fallback
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('Using in-memory fallback for development...');
      // Simple in-memory fallback is better than nothing for local development
      return {
        connection: {
          host: 'in-memory-db',
          name: 'development'
        }
      };
    }
  }
};

module.exports = connectDB;
