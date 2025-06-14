import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectToDatabase } from './config/database.js'
import { connectMongoose } from './config/mongoose.js'
import productsRoutes from './routes/productsRoutes.js'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/products', productsRoutes)

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
