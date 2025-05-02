import Cart from "../models/cart.model.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import dayjs from "dayjs";
import Product from "../models/product.model.js";

export async function createOrder(req, res) {
    try {
        // Fetch the cart of the user
        const userCart = await Cart.findOne({ userId: req.user.id }).populate("products.productId");

        if (!userCart || userCart.products.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Please add at least one product to your cart before placing an order"
            }); 
        }

        const ProductList = userCart.products;
        const totalPrice = ProductList.reduce((acc, cv) => cv.productId.finalPrice * cv.quantity + acc, 0);
        console.log("Total Price: ", totalPrice);

        // Check if the user has applied any coupon
        let amountTobePaid = totalPrice;
        let discountAmount = 0;
        let appliedCoupon = null;
        
        if(req.body.coupon) {
            const coupon = await Coupon.findOne({ code: req.body.coupon.toUpperCase() });
            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: "Coupon not found"
                });
            }
            
            // Check if coupon is active
            if (!coupon.isActive) {
                return res.status(400).json({
                    success: false,
                    message: "This coupon is not active"
                });
            }
            
            // Check expiry date
            const currentDate = dayjs();
            const expiryDate = dayjs(coupon.expiresAt);
            const isCouponValid = expiryDate.isAfter(currentDate);
            if (!isCouponValid) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon has expired"
                });
            }

            // Check usage limit
            if (coupon.usageLimit !== null && coupon.usageLimit === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon usage limit reached"
                });
            }
            
            // Check minimum purchase requirement
            if (coupon.minPurchase > totalPrice) {
                return res.status(400).json({
                    success: false,
                    message: `Minimum purchase to claim this coupon is ${coupon.minPurchase}`
                });
            }
            
            // Calculate discount based on discount type
            if (coupon.discountType === 'percentage') {
                discountAmount = totalPrice * (coupon.discountValue / 100);
                
                // Apply maximum discount cap if it exists
                if (coupon.maxDiscount !== null && discountAmount > coupon.maxDiscount) {
                    discountAmount = coupon.maxDiscount;
                }
            } else if (coupon.discountType === 'fixed') {
                discountAmount = coupon.discountValue;
                
                // Fixed discount cannot be more than the total price
                if (discountAmount > totalPrice) {
                    discountAmount = totalPrice;
                }
            }
            
            // Calculate final amount to be paid
            amountTobePaid = totalPrice - discountAmount;
            
            // Update coupon usage
            if (coupon.usageLimit !== null) {
                coupon.usageLimit -= 1;
            }
            coupon.usedCount += 1;
            await coupon.save();
            
            appliedCoupon = coupon;
            console.log("Applied coupon:", coupon.code);
            console.log("Discount amount:", discountAmount);
            console.log("Amount to be paid:", amountTobePaid);
        }

        // Check payment details 
        if (req.body.payment.method === "ONLINE") {
           // redirect to payment gateway
           // This would be implemented based on the payment gateway integration
        }

        // Map products for order creation
        const productsOrdered = userCart.products.map((product) => {
            return {
                productId: product.productId._id,
                quantity: product.quantity,
                priceAtPurchase: product.productId.finalPrice,
                finalPrice: product.productId.finalPrice * product.quantity,
                selectedColor: product.selectedColor || null,
                selectedSize: product.selectedSize || null
            };
        });
        
        console.log("Products Ordered: ", productsOrdered);

        // Create order in the database
        const orderDetails = {
            userId: req.user.id,
            items: productsOrdered,
            shippingAddress: req.body.shippingAddress,
            payment: {
                method: req.body.payment.method,
                status: 'Pending'
            },
            totalAmount: totalPrice,
            discountAmount: discountAmount
        };
        
        // If coupon was applied, add it to the order
        if(appliedCoupon) {
            orderDetails.coupon = appliedCoupon._id;
        }

        // Create the order
        await Order.create(orderDetails);

        // Clear the cart after successful order creation
        
        userCart.products = [];
        await userCart.save();

        // updatee the stock of the products ordered

        for (const product of productsOrdered) {
            const productDetails = await Product.findById(product.productId);
            if (productDetails) {
                productDetails.stock -= product.quantity;
                await productDetails.save();
            }
        }


        return res.status(200).json({
            success: true,
            message: "Order created successfully"
        });

    } catch (error) {
        console.error("Error creating order:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while creating your order"
        });
    }
}
        



    