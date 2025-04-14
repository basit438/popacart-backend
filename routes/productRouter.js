import express from "express";
import { getAllProducts, getProductDetails} from "../controllers/productControllers.js";

const productRouter = express.Router();

productRouter.get("/", getAllProducts);

productRouter.get("/:id", getProductDetails); // Assuming you want to use the same controller for product details

export default productRouter;

