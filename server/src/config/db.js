import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri) {
      console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 4000,
      });
      console.log('✅ Connected to MongoDB successfully.');
      return;
    }
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB connection failed (${err.message}). Attempting in-memory fallback...`);
  }

  // In-memory fallback if no URI provided or connection fails
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const memoryUri = mongod.getUri();
    console.log(`🚀 Started In-Memory MongoDB Server at: ${memoryUri}`);
    await mongoose.connect(memoryUri);
    console.log('✅ Connected to In-Memory MongoDB successfully.');
  } catch (memErr) {
    console.error('❌ Failed to connect to both Primary and In-Memory MongoDB:', memErr.message);
    throw memErr;
  }
}

