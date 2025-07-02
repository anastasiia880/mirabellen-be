import Category from '../models/Category.js'

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body
    const newCategory = new Category({ name, slug, description })
    const saved = await newCategory.save()
    res.status(201).json(saved)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create category', error: err.message })
  }
}

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.status(200).json(categories)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' })
  }
}
