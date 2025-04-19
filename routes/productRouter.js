import express from "express";
import { getAllProducts, getProductDetails , createProduct} from "../controllers/productControllers.js";
import { verifyToken } from "../middlewares/verifytoken.js";
import upload from "../middlewares/multer.js";

const productRouter = express.Router();

productRouter.get("/", getAllProducts);

productRouter.get("/:id", getProductDetails); // Assuming you want to use the same controller for product details

// productRouter.post("/addReview/:productId", verifyToken, addReview );

productRouter.post("/create-product", verifyToken, upload.any(), createProduct)
export default productRouter;

