import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['Men', 'Women', 'Kids', 'Unisex'],
    required: true
  },
  type: {
    type: String,
    enum: ['Shirt', 'T-Shirt', 'Jeans', 'Jacket', 'Sweater', 'Dress', 'Shorts', 'Skirt', 'Other'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number,
    required: true
  },
  sizes: [{
    size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
    stock: { type: Number, default: 0 }
  }],
  colors: [{
    colorName: String,
    colorCode: String,
    images: [String]
  }],
  material: {
    type: String,
    default: "Cotton"
  },
  careInstructions: {
    type: String
  },
  gender: {
    type: String,
    enum: ['Men', 'Women', 'Unisex', 'Kids']
  },
  tags: [String],
  isFeatured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
    required: true
  },
  reviews: [{
    userId: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(v);
        },
        message: props => `${props.value} is not a valid UUID v4!`
      }
    },
    comment: String,
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
