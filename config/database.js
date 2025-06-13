import { MongoClient, ServerApiVersion } from 'mongodb'

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

    await client.db('admin').command({ ping: 1 })
    console.log('MongoDB connection successful')

    return client
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    throw error
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
