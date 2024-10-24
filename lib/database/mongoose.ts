import mongoose, { Mongoose } from 'mongoose'

const MONGODB_URL = process.env.MONGODB_URL

interface MongooseConnection {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached: MongooseConnection = (global as any).mongoose

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = { conn: null, promise: null }
}

/**
 * Establishes a connection to the MongoDB database
 * @returns {Promise<Mongoose>} A promise that resolves to the connected Mongoose instance
 */
export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) {
    return cached.conn
  }

  if (!MONGODB_URL) throw new Error('Invalid/Missing environment variable: "MONGODB_URL"')

  cached.promise =
    cached.promise ||
    mongoose.connect(MONGODB_URL, {
      dbName: 'pixelmind',
      bufferCommands: false,
    })

  cached.conn = await cached.promise

  return cached.conn
}
