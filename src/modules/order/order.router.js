import { Router } from "express";
import * as orderController from "./controller/order.js";
import { endpoint } from "./order.endPoint.js";
import { auth, authorized } from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import * as validators from "./order.validation.js";
const router = Router();

router.post(
  "/", 
  auth,
  authorized(endpoint.create),
  validation(validators.createOrder),
  orderController.createOrder
);

router.patch(
  "/:orderId/cancel",
  auth,
  authorized(endpoint.cancel),
  validation(validators.cancelOrder),
  orderController.cancelOrder
);

router.patch(
  "/:orderId/delivered",
  auth,
  authorized(endpoint.delivered),
  validation(validators.deliveredOrder),
  orderController.deliveredOrder
);

export default router;
