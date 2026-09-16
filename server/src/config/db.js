import mongoose from 'mongoose';

const globalForMongoose = globalThis;

if (!globalForMongoose.__mongooseConnectionPromise) {
  globalForMongoose.__mongooseConnectionPromise = null;
}

const connectDB = async () => {
  if (globalForMongoose.__mongooseConnectionPromise) {
    return globalForMongoose.__mongooseConnectionPromise;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not configured.');
  }

  globalForMongoose.__mongooseConnectionPromise = mongoose.connect(mongoUri)
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

export default connectDB;
