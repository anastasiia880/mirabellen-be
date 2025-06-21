import express from 'express'
import { register, login, logout, checkUser } from '../controllers/authController.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.get('/logout', logout)
router.get('/user', checkUser)

export default router
