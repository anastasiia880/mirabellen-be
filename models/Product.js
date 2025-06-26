import mongoose from 'mongoose'

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
    price: {
      type: Number,
      required: true,
    },
    in_stock: {
      type: Boolean,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    popular: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

const Product = mongoose.model('Product', productSchema)

export default Product
