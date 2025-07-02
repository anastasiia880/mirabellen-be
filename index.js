import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { connectToDatabase } from './config/database.js'
import { connectMongoose } from './config/mongoose.js'
import productsRoutes from './routes/productsRoutes.js'
import authRoutes from './routes/authRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'

dotenv.config()

const PORT = process.env.PORT || 3000

const app = express()

app.use(
  cors({
    origin: true,
    credentials: true,
  })
)

app.use(cookieParser())
app.use(express.json())
app.use('/api/products', productsRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)

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
