import { Router } from "express";
import * as reviewController from "./controller/review.js";
import * as validators from "./reviews.validation.js";
import { auth, authorized } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { endpoint } from "./reviews.endPoint.js";

const router = Router({ mergeParams: true });

router.post(
  "/",
  auth,
  authorized(endpoint.create),
  validation(validators.createReview),
  reviewController.createReview
);

router.patch(
  "/:reviewId",
  auth,
  authorized(endpoint.update),
  validation(validators.updateReview),
  reviewController.updateReview
);

router.get("/", (req, res) => {
  res.status(200).json({ message: "reviews Module" });
});

export default router;
