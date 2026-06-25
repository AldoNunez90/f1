import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

declare global {
  var mongooseConn: typeof mongoose;
}

let cached = global.mongooseConn;

if (!cached) {
  cached = global.mongooseConn = mongoose;
}

async function connectDB() {
  if (cached.connections[0].readyState === 1) {
    return cached;
  }

  await cached.connect(MONGODB_URI!);
  return cached;
}

export default connectDB;
