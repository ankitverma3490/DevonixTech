import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ENV } from './env.js';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    let uri = ENV.MONGODB_URI;

    if (!uri) {
      console.log('🔄 No MONGODB_URI found. Initializing in-memory MongoDB server...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`📦 MongoDB In-Memory instance started at: ${uri}`);
    } else {
      console.log(`🔗 Connecting to configured MongoDB URI: ${uri}`);
    }

    mongoose.set('strictQuery', false);
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    // If external URI fails, try falling back to in-memory server
    if (!mongod) {
      try {
        console.log('🔄 Retrying with in-memory MongoDB fallback...');
        mongod = await MongoMemoryServer.create();
        const fallbackUri = mongod.getUri();
        await mongoose.connect(fallbackUri);
        console.log('✅ Connected to In-Memory MongoDB fallback.');
        return;
      } catch (fallbackError) {
        console.error('❌ In-Memory MongoDB fallback also failed:', fallbackError);
      }
    }
    process.exit(1);
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
};
