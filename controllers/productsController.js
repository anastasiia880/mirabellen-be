import Product from '../models/Product.js'

export const getAllProducts = async (req, res) => {
  try {
    const filter = {}
    if (req.query.popular) {
      filter.popular = req.query.popular === 'true'
    }
    const products = await Product.find(filter).sort({ createdAt: -1 })
    res.status(200).json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    res.status(200).json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, in_stock, category, popular } = req.body
    const imageUrls = req.files.map((file) => file.path)

    const newProduct = new Product({
      name,
      description,
      price,
      in_stock,
      category,
      popular,
      images: imageUrls,
    })
    const savedProduct = await newProduct.save()
    res.status(201).json(savedProduct)
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id

    let images = []
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path)
    }

    const updateData = {
      ...req.body,
    }

    if (images.length > 0) {
      updateData.images = images
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true })

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }

    res.status(200).json(updatedProduct)
  } catch (error) {
    console.error('Error updating product:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id)
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' })
    }
    res.status(200).json({ message: 'Product deleted successfully' })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
