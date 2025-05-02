import express from "express";
import { getAllProducts, getProductDetails , createProduct} from "../controllers/productControllers.js";
import { verifyToken } from "../middlewares/verifytoken.js";
import upload from "../middlewares/multer.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const productRouter = express.Router();

productRouter.get("/", getAllProducts);

productRouter.get("/:id", getProductDetails); // Assuming you want to use the same controller for product details

// productRouter.post("/addReview/:productId", verifyToken, addReview );

productRouter.post("/create-product", verifyToken, roleMiddleware('seller'), upload.any(), createProduct)
export default productRouter;

