import express, { RequestHandler } from 'express'
import { applyDiscount, createPaymentIntent, deleteCoupon, getAllCoupons, newCoupon } from '../controllers/payment.controller.js';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.js';

const paymentRouter=express.Router();

paymentRouter.route("/newCoupon").post(adminAuthentication as RequestHandler,newCoupon as RequestHandler);
paymentRouter.route("/discount").get(applyDiscount as RequestHandler);
paymentRouter.route("/all/coupons").get(adminAuthentication as RequestHandler,getAllCoupons as RequestHandler);
paymentRouter.route("/delete/coupon/:id").delete(adminAuthentication as RequestHandler,deleteCoupon as RequestHandler);
paymentRouter.route('/createPayment').post(createPaymentIntent as RequestHandler);

export default paymentRouter;