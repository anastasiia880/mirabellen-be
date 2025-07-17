import Product from '../models/Product.js'
import Category from '../models/Category.js'

export const getAllProducts = async (req, res) => {
  try {
    const filter = {}
    if (req.query.popular) {
      filter.popular = req.query.popular === 'true'
    }
    const products = await Product.find(filter).sort({ createdAt: -1 }).populate('category')
    res.status(200).json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category')
    res.status(200).json(product)
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, in_stock, category, popular, tags, modifications } = req.body
    const imageUrls = req.files.map((file) => file.path)

    let processedTags = []
    if (tags) {
      if (Array.isArray(tags)) {
        processedTags = tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)
      } else if (typeof tags === 'string') {
        processedTags = tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      }
    }

    let processedModifications = []
    if (modifications) {
      if (Array.isArray(modifications)) {
        processedModifications = modifications.map((mod) => ({
          name: mod.name,
          price: Number(mod.price),
          in_stock: mod.in_stock !== undefined ? mod.in_stock : true,
          sku: mod.sku || null,
        }))
      }
    }

    const newProduct = new Product({
      name,
      description,
      price,
      in_stock,
      category,
      popular,
      tags: processedTags,
      images: imageUrls,
      modifications: processedModifications,
    })
    const savedProduct = await newProduct.save()
    await savedProduct.populate('category')
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

    if (updateData.tags) {
      if (Array.isArray(updateData.tags)) {
        updateData.tags = updateData.tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)
      } else if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      }
    }

    if (updateData.modifications) {
      if (Array.isArray(updateData.modifications)) {
        updateData.modifications = updateData.modifications.map((mod) => ({
          name: mod.name,
          price: Number(mod.price),
          in_stock: mod.in_stock !== undefined ? mod.in_stock : true,
          sku: mod.sku || null,
        }))
      }
    }

    if (images.length > 0) {
      updateData.images = images
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, {
      new: true,
    }).populate('category')

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

export const getProducts = async (req, res) => {
  try {
    const {
      search = '',
      tags,
      in_stock,
      category,
      sort = 'name',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query

    const filter = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ]
    }

    if (category) {
      const categoryDoc = await Category.findOne({ slug: category })
      if (categoryDoc) {
        filter.category = categoryDoc._id
      } else {
        return res.status(200).json({
          total: 0,
          page: Number(page),
          pages: 0,
          items: [],
        })
      }
    }

    if (tags) {
      const tagList = tags.split(',').map((tag) => tag.trim())
      filter.tags = { $in: tagList }
    }

    if (in_stock !== undefined) {
      filter.in_stock = in_stock === 'true'
    }

    const allowedSortFields = ['name', 'price']
    const sortField = allowedSortFields.includes(sort) ? sort : 'name'

    const sortOrder = order === 'asc' ? 1 : -1

    const products = await Product.find(filter)
      .populate('category')
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    const total = await Product.countDocuments(filter)

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      items: products,
    })
  } catch (err) {
    res.status(500).json({
      message: 'Failed to fetch products',
      error: err.message,
    })
  }
}

export const getAvailableTags = async (req, res) => {
  try {
    const tags = await Product.distinct('tags')

    const availableTags = tags.filter((tag) => tag && tag.trim().length > 0).sort()

    res.status(200).json(availableTags)
  } catch (error) {
    console.error('Error fetching available tags:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
