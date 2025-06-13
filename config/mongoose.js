import mongoose from 'mongoose'

mongoose.set('strictQuery', false)

export const connectMongoose = async () => {
  try {
    const uri = process.env.MONGODB_URI

    await mongoose.connect(uri, {
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      maxPoolSize: 50,
      retryWrites: true,
    })

    console.log('Mongoose connection successful')
  } catch (error) {
    console.error('Error connecting to MongoDB with Mongoose:', error)
    throw error
  }
}

mongoose.connection.on('error', err => {
  console.error('Mongoose connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected')
})

export const closeMongooseConnection = async () => {
  try {
    await mongoose.connection.close()
    console.log('Mongoose connection closed')
  } catch (error) {
    console.error('Error closing Mongoose connection:', error)
  }
}

export default mongoose
