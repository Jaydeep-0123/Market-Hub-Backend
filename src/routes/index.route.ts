import express from 'express'
import userRouter from './user.route.js';
import productRouter from './product.route.js';
import orderRouter from './order.route.js';
import paymentRouter from './payment.route.js';
import dashboardRouter from './dashboard-stats.route.js';

const router=express.Router();

router.use("/api/v1/user",userRouter);
router.use("/api/v1/product",productRouter)
router.use("/api/v1/order",orderRouter);
router.use('/api/v1/payment',paymentRouter);
router.use('/api/v1/dashboard',dashboardRouter);

export default router;