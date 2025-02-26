import express from 'express';
import { applyDiscount, deleteCoupon, getAllCoupons, newCoupon } from '../controllers/payment.controller.js';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.js';
const paymentRouter = express.Router();
paymentRouter.route("/newCoupon").post(adminAuthentication, newCoupon);
paymentRouter.route("/discount").get(applyDiscount);
paymentRouter.route("/all/coupons").get(adminAuthentication, getAllCoupons);
paymentRouter.route("/delete/coupon/:id").delete(adminAuthentication, deleteCoupon);
export default paymentRouter;
