import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const handleErrors = (error) => {
  console.log(error.message, error.code)
  let errors = { email: '', password: '' }

  if (error.message.includes('incorrect email')) {
    errors.email = 'Email is not registered'
  }
  if (error.message.includes('incorrect password')) {
    errors.password = 'Password is incorrect'
  }

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
  const { email, password } = req.body
  try {
    const user = await User.login(email, password)
    const token = createToken(user._id)

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })

    res.status(200).json({ user: user._id })
  } catch (error) {
    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
}

export const logout = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    maxAge: 1,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  })
  res.status(200).json({ message: 'User logged out' })
}

export const checkUser = async (req, res) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
      if (err) {
        return res.status(401).json({ user: null, message: 'Invalid token' })
      } else {
        try {
          const user = await User.findById(decodedToken.id).select('-password')
          if (user) {
            return res.status(200).json({ user })
          } else {
            return res.status(404).json({ user: null, message: 'User not found' })
          }
        } catch (error) {
          return res.status(500).json({ user: null, message: 'Internal server error' })
        }
      }
    })
  } else {
    return res.status(401).json({ user: null, message: 'No token provided' })
  }
}
