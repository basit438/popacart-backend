import Coupon from '../models/coupon.model.js';
import User from '../models/user.model.js';

export async function createCoupon(req, res) {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      usageLimit,
      expiresAt
    } = req.body;

    // Basic validation
    if (!code || !discountType || !discountValue || !expiresAt) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Check for existing coupon
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(409).json({ message: 'Coupon code already exists.' });
    }

    // Create the coupon
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase: minPurchase || 0,
      maxDiscount: maxDiscount || null,
      usageLimit: usageLimit || null,
      expiresAt
    });

    await newCoupon.save();

    res.status(201).json({ message: 'Coupon created successfully.', coupon: newCoupon });
  } catch (error) {
    console.error('Error creating coupon:', error);
    res.status(500).json({ message: 'Something went wrong while creating the coupon.' });
  }
}
