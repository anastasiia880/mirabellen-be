import mongoose from 'mongoose'

const modificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    in_stock: {
      type: Boolean,
      default: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
)

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    in_stock: {
      type: Boolean,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    images: {
      type: [String],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    modifications: {
      type: [modificationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Product = mongoose.model('Product', productSchema)

export default Product
