import express, { RequestHandler } from 'express';
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, orderProcess } from '../controllers/order.controller.js';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.js';

const orderRouter=express.Router();

orderRouter.route("/newOrder").post(newOrder as RequestHandler);
orderRouter.route("/myOrders").get(myOrders as RequestHandler)
orderRouter.route('/allOrders').get(adminAuthentication as RequestHandler,allOrders as RequestHandler);
orderRouter.route("/singleOrders/:id").get(getSingleOrder as RequestHandler);
orderRouter.route("/orderProcess/:id").put(adminAuthentication as RequestHandler,orderProcess as RequestHandler);
orderRouter.route("/deleteOrder/:id").delete(adminAuthentication as RequestHandler,deleteOrder as RequestHandler);

export default orderRouter;