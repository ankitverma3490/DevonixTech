import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongod: any = null;

export const connectDB = async (): Promise<void> => {
  const isProduction = ENV.NODE_ENV === 'production' || !!process.env.RAILWAY_ENVIRONMENT;
  let uri = ENV.MONGODB_URI;

  if (!uri) {
    if (isProduction) {
      console.error('❌ FATAL: MONGODB_URI is not defined in environment variables!');
      console.error('👉 Please go to your Railway Dashboard -> Variables and add:');
      console.error('   MONGODB_URI=mongodb+srv://ankitverma3490_db_user:<password>@cluster0.xucoq4z.mongodb.net/agencyops?retryWrites=true&w=majority&appName=Cluster0');
      process.exit(1);
    }

    console.log('🔄 No MONGODB_URI found. Initializing in-memory MongoDB server for local dev...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log(`📦 MongoDB In-Memory instance started at: ${uri}`);
    } catch (memErr) {
      console.error('❌ Failed to start in-memory MongoDB:', memErr);
      process.exit(1);
    }
  } else {
    // Mask credentials in logs for security
    const maskedUri = uri.replace(/\/\/[^:]+:([^@]+)@/, '//***:***@');
    console.log(`🔗 Connecting to MongoDB Atlas: ${maskedUri}`);
  }

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB successfully.');
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    if (!isProduction && !mongod) {
      try {
        console.log('🔄 Retrying with in-memory MongoDB fallback for local development...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const fallbackUri = mongod.getUri();
        await mongoose.connect(fallbackUri);
        console.log('✅ Connected to In-Memory MongoDB fallback.');
        return;
      } catch (fallbackError) {
        console.error('❌ In-Memory MongoDB fallback failed:', fallbackError);
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
