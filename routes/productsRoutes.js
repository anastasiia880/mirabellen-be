import express from 'express'
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productsController.js'
import upload from '../middleware/upload.js'

const router = express.Router()

router.get('/', getAllProducts)
router.get('/:id', getProductById)
router.post('/', upload.single('image'), createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router
