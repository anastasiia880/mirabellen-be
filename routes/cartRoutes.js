import express from 'express'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
} from '../controllers/cartController.js'

const router = express.Router()

router.get('/', getCart)
router.get('/count', getCartItemCount)
router.post('/add', addToCart)
router.put('/update', updateCartItem)
router.delete('/remove', removeFromCart)
router.delete('/clear', clearCart)

export default router
