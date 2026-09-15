const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Please add a product description']
    },
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
      min: [0, 'Price must be positive']
    },
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: ['Electronics', 'Clothing', 'Home', 'Books', 'Other']
    },
    stock: {
      type: Number,
      required: [true, 'Please specify stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    images: [
      {
        type: String, // URLs to images
        required: false
      }
    ],
    isFeatured: {
      type: Boolean,
      default: false
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true // Automatically creates 'createdAt' and 'updatedAt' fields
  }
);

const Product=mongoose.model('Product',productSchema)
module.exports=Product