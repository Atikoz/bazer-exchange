import mongoose from "mongoose";

export async function connectToMongo(uri: string) {
  try {
    await mongoose.connect(uri);
    console.log('[MongoDB] Connected to database');
  } catch (error) {
    console.error('[MongoDB] Connection error:', error);
    process.exit(1);
  }
}

export async function disconnectMongo() {
  await mongoose.connection.close();
  console.log('[MongoDB] Disconnected');
}