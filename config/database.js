import { MongoClient, ServerApiVersion } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const uri = process.env.MONGODB_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

async function connectToDatabase() {
  try {
    await client.connect()
    console.log('MongoDB connection successful')
    return client
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(1)
  }
}

async function closeConnection() {
  try {
    await client.close()
    console.log('MongoDB connection closed')
  } catch (error) {
    console.error('Error closing MongoDB connection:', error)
  }
}

export { connectToDatabase, closeConnection, client }
