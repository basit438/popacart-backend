import User from "../models/user.model.js";


export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const userId = req.user.id;
    console.log(userId, productId);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isAlreadyInWishlist = user.wishlist.some(
      (id) => id.toString() === productId
    );

    let updatedUser;

    if (isAlreadyInWishlist) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $pull: { wishlist: productId } },
        { new: true }
      );
      return res.status(200).json({
        message: "Product removed from wishlist",
        wishlist: updatedUser.wishlist,
      });
    } else {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { wishlist: productId } },
        { new: true }
      );
      return res.status(200).json({
        message: "Product added to wishlist",
        wishlist: updatedUser.wishlist,
      });
    }
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("wishlist");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Wishlist fetched successfully",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error in getWishlist:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


