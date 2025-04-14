import mongoose from "mongoose";

const product = {
  productId :{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
}

const cartSchema = new mongoose.Schema({
  products:{ 
    type :[product],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
 
  totalPrice: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model("Cart", cartSchema);