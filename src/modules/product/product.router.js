import reviewRouter from "../reviews/reviews.router.js";
import * as productController from "./controller/product.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { auth, authorized } from "../../middleware/auth.js";
import { Router } from "express";
import { endPoint } from "./product.endPoint.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "../product/product.validation.js";
const router = Router();

router.use("/:productId/review", reviewRouter);

router.post(
  "/",
  auth,
  authorized(endPoint.createProduct),
  fileUpload(fileValidation.image).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  validation(validators.createProduct),
  productController.createProduct
);

router.put(
  "/:productId",
  auth,
  authorized(endPoint.updateProduct),
  fileUpload(fileValidation.image).fields([
    { name: "mainImage", maxCount: 1 },
    { name: "subImages", maxCount: 5 },
  ]),
  validation(validators),
  productController.updateProduct
);

// wishlist

router.patch(
  "/:productId/wishlist/add",
  auth,
  authorized(endPoint.wishlist),
  productController.wishlist
);

router.patch(
  "/:productId/wishlist/remove",
  auth,
  authorized(endPoint.wishlist),
  productController.deleteFromWishlist
);

export default router;
