import mongoose from 'mongoose';

const globalForMongoose = globalThis;

if (!globalForMongoose.__mongooseConnectionPromise) {
  globalForMongoose.__mongooseConnectionPromise = null;
}

const connectDB = async () => {
  // If already connected, return existing connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If currently connecting, wait for existing promise
  if (globalForMongoose.__mongooseConnectionPromise && mongoose.connection.readyState === 2) {
    return globalForMongoose.__mongooseConnectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 to prevent Windows/Node getaddrinfo DNS timeout on Atlas
  };

  globalForMongoose.__mongooseConnectionPromise = mongoose.connect(mongoUri, options)
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    })
    .catch((error) => {
      globalForMongoose.__mongooseConnectionPromise = null;
      console.error(`MongoDB connection error: ${error.message}`);
      throw error;
    });

  return globalForMongoose.__mongooseConnectionPromise;
};

mongoose.connection.on('disconnected', () => {
  globalForMongoose.__mongooseConnectionPromise = null;
});

export default connectDB;
