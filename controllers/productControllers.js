import Product from "../models/product.model.js";

export async function getAllProducts(req, res) {
  try {
    const itemsPerPage = 10;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.search || "";

    // Build a dynamic filter using regex for partial matches (case-insensitive)
    const searchFilter = searchQuery
      ? {
          $or: [
            { name: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } },
            { brand: { $regex: searchQuery, $options: "i" } },
            { category: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    // Count total products after applying the filter
    const totalProducts = await Product.countDocuments(searchFilter);
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const products = await Product.find(searchFilter)
      .select("name price description category brand images")
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);

    res.status(200).json({
      message: "Products fetched successfully",
      success: true,
      results: products.length,
      currentPage: page,
      totalPages: totalPages,
      products: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


// get each prduct details by id

export async function getProductDetails(req, res) {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({
      message: "Product details fetched successfully",
      success: true,
      product: product,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
