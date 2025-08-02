import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const handleErrors = (error) => {
  console.log(error.message, error.code)
  let errors = { message: 'An error occurred' }

  if (error.message.includes('validation failed')) {
    errors.message = 'Validation failed'
  }
  if (error.message.includes('not found')) {
    errors.message = 'Item not found'
  }
  return errors
}

const getUserIdFromToken = (req) => {
  const token = req.cookies.jwt
  if (!token) {
    throw new Error('No authentication token provided')
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.id
  } catch (error) {
    throw new Error('Invalid authentication token')
  }
}

export const getCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)

    let cart = await Cart.findOne({ user: userId }).populate('items.product', 'name price images')

    if (!cart) {
      cart = new Cart({ user: userId, items: [] })
      await cart.save()
    }

    res.status(200).json({ cart })
  } catch (error) {
    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
}

export const addToCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)
    const { productId, quantity = 1, modification } = req.body

    if (!productId) {
      return res.status(400).json({ errors: { message: 'Product ID is required' } })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ errors: { message: 'Product not found' } })
    }

    let itemPrice = product.price

    if (modification) {
      const selectedModification = product.modifications.find((mod) => mod.name === modification)
      if (!selectedModification) {
        return res.status(400).json({ errors: { message: 'Selected modification not found' } })
      }
      if (!selectedModification.in_stock) {
        return res
          .status(400)
          .json({ errors: { message: 'Selected modification is out of stock' } })
      }
      itemPrice = selectedModification.price
    }

    let cart = await Cart.findOne({ user: userId })
    if (!cart) {
      cart = new Cart({ user: userId, items: [] })
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.modification === modification
    )

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity
    } else {
      cart.items.push({
        product: productId,
        quantity,
        price: itemPrice,
        modification: modification || undefined,
      })
    }

    await cart.save()
    await cart.populate('items.product', 'name price images')

    res.status(200).json({ cart, message: 'Item added to cart successfully' })
  } catch (error) {
    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
}

export const updateCartItem = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)
    const { productId, quantity, modification } = req.body

    if (!productId || !quantity) {
      return res.status(400).json({ errors: { message: 'Product ID and quantity are required' } })
    }

    if (quantity < 1) {
      return res.status(400).json({ errors: { message: 'Quantity must be at least 1' } })
    }

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return res.status(404).json({ errors: { message: 'Cart not found' } })
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.modification === modification
    )

    if (itemIndex === -1) {
      return res.status(404).json({ errors: { message: 'Item not found in cart' } })
    }

    cart.items[itemIndex].quantity = quantity
    await cart.save()
    await cart.populate('items.product', 'name price images')

    res.status(200).json({ cart, message: 'Cart item updated successfully' })
  } catch (error) {
    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
}

export const removeFromCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)
    const { productId, modification } = req.body

    if (!productId) {
      return res.status(400).json({ errors: { message: 'Product ID is required' } })
    }

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return res.status(404).json({ errors: { message: 'Cart not found' } })
    }

    cart.items = cart.items.filter(
      (item) => !(item.product.toString() === productId && item.modification === modification)
    )

    await cart.save()
    await cart.populate('items.product', 'name price images')

    res.status(200).json({ cart, message: 'Item removed from cart successfully' })
  } catch (error) {
    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
}

export const clearCart = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)

    const cart = await Cart.findOne({ user: userId })
    if (!cart) {
      return res.status(404).json({ errors: { message: 'Cart not found' } })
    }

    cart.items = []
    await cart.save()

    res.status(200).json({ cart, message: 'Cart cleared successfully' })
  } catch (error) {
    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
}

export const getCartItemCount = async (req, res) => {
  try {
    const userId = getUserIdFromToken(req)

    const cart = await Cart.findOne({ user: userId })
    const itemCount = cart ? cart.items.reduce((total, item) => total + item.quantity, 0) : 0

    res.status(200).json({ itemCount })
  } catch (error) {
    const errors = handleErrors(error)
    res.status(400).json({ errors })
  }
}
