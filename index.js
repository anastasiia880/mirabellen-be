import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectToDatabase } from './config/database.js'
import { connectMongoose } from './config/mongoose.js'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World')
})

async function startServer() {
  try {
    await connectToDatabase()
    await connectMongoose()

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
