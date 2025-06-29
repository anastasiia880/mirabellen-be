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
router.post('/', upload.array('images', 5), createProduct)
router.put('/:id', upload.array('images', 5), updateProduct)
router.delete('/:id', deleteProduct)

export default router
