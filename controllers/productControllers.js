import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
export async function getAllProducts(req, res) {
  try {
    const itemsPerPage = 10;
    const page = parseInt(req.query.page) || 1;
    const searchQuery = req.query.search || "";
    const category = req.query.category;
    const type = req.query.type;
    const minPrice = parseFloat(req.query.minPrice);
    const maxPrice = parseFloat(req.query.maxPrice);

    // Build filter object
    let filter = {};

    // Add search filter if search query exists
    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { brand: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
        { tags: { $regex: searchQuery, $options: "i" } },
      ];
    }

    // Add category filter if category is provided
    if (category) {
      filter.category = category;
    }

    // Add type filter if type is provided
    if (type) {
      filter.type = type;
    }

    // Add price range filter if both min and max prices are provided
    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }

    // Count total products after applying the filter
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    const products = await Product.find(filter)
      .select("name price description category brand colors finalPrice")
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


// add product review



export async function createProduct(req, res) {
  try {
    // 1) Destructure & validate basic fields
    const {
      name,
      description,
      brand,
      category,
      type,
      price,
      discount = 0,
      material,
      careInstructions,
      gender,
      tags = '',
      isFeatured = false,
      sizes: sizesRaw = '[]',
      colors: colorsRaw = '[]'
    } = req.body;

    if (!name || !description || !brand || !category || !type || !price) {
      return res.status(400).json({
        success: false,
        message: 'name, description, brand, category, type and price are required.'
      });
    }

    // Validate price and discount
    const priceNum = Number(price);
    const discountNum = Number(discount);
    if (isNaN(priceNum) || priceNum <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0.' });
    }
    if (isNaN(discountNum) || discountNum < 0 || discountNum >= priceNum) {
      return res.status(400).json({ success: false, message: 'Invalid discount amount.' });
    }
    const finalPrice = priceNum - discountNum;

    // 2) Process tags
    const tagsArr = tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()).filter(Boolean)) : [];

    // 3) Parse and validate sizes
    let sizes;
    try {
      sizes = JSON.parse(sizesRaw);
      if (!Array.isArray(sizes)) throw new Error('Sizes must be an array');
      sizes = sizes.map(s => {
        if (!s.size || typeof s.stock !== 'number' || s.stock < 0) {
          throw new Error('Invalid size data');
        }
        return { size: s.size, stock: s.stock };
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sizes format. Expected array of { size: string, stock: number }'
      });
    }

    // 4) Parse and validate colors
    let colorsInput;
    try {
      colorsInput = JSON.parse(colorsRaw);
      if (!Array.isArray(colorsInput)) throw new Error('Colors must be an array');
      colorsInput.forEach(c => {
        if (!c.colorName || !c.colorCode || typeof c.colorName !== 'string' || typeof c.colorCode !== 'string') {
          throw new Error('Invalid color data');
        }
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid colors format. Expected array of { colorName: string, colorCode: string }'
      });
    }

    // 5) Validate and process image uploads
    if (!req.files || !Array.isArray(req.files)) {
      return res.status(400).json({
        success: false,
        message: 'Product images are required'
      });
    }

    // Process images for each color
    const colors = await Promise.all(
      colorsInput.map(async (color) => {
        const colorImages = req.files.filter(file => 
          file.fieldname === `images_${color.colorName}` && 
          file.mimetype.startsWith('image/')
        );

        if (colorImages.length === 0) {
          throw new Error(`No images provided for color: ${color.colorName}`);
        }

        const uploadedImages = await Promise.all(
          colorImages.map(async (file) => {
            try {
              const result = await uploadToCloudinary(file);
              return result.secure_url;
            } catch (error) {
              console.error(`Error uploading image for color ${color.colorName}:`, error);
              throw new Error(`Failed to upload image for color: ${color.colorName}`);
            }
          })
        );

        return {
          colorName: color.colorName,
          colorCode: color.colorCode,
          images: uploadedImages
        };
      })
    );

    // 6) Create product document
    const productData = {
      name,
      description,
      brand,
      category,
      type,
      price: priceNum,
      discount: discountNum,
      finalPrice,
      material,
      careInstructions,
      gender,
      tags: tagsArr,
      isFeatured: isFeatured === true || isFeatured === 'true',
      sizes,
      colors,
      owner: req.user?.id
    };

    const product = await Product.create(productData);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating product'
    });
  }
}
