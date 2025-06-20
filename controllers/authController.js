import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const handleErrors = (error) => {
  console.log(error.message, error.code)
  let errors = { email: '', password: '' }
  if (error.message.includes('User validation failed')) {
    Object.values(error.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message
    })
  }
  return errors
}

const maxAge = 3 * 24 * 60 * 60

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge })
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const user = await User.findOne({ email })
    if (user) {
      return res.status(400).json({ message: 'User already exists' })
    }

    const newUser = new User({ name, email, password })
    await newUser.save()

    const token = createToken(newUser._id)
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })

    res.status(201).json({ user: newUser._id })
  } catch (error) {
    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'User not found' })
    }
  } catch (error) {
    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
}
