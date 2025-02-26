import { NextFunction, Request, Response } from "express";
import orderModel from "../models/order.model.js";
import { TryCatch } from "../middlewares/error.middleware.js";
import { StatusCodes } from "http-status-codes";
import { NewOrderRequestBody } from "../types/types.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";

export const newOrder = TryCatch(
  async (req: Request<{}, {}, NewOrderRequestBody>, res, next) => {
    const {
      shippingInfo,
      orderItems,
      userId,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    } = req.body;

    if (
      !shippingInfo ||
      !orderItems ||
      !userId ||
      !subtotal ||
      !tax ||
      !shippingCharges ||
      !discount ||
      !total
    ) {
      return next(
        new ErrorHandler("Please Enter All Fields", StatusCodes.BAD_REQUEST)
      );
    }
    const order = await orderModel.create({
      shippingInfo,
      orderItems,
      userId,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
    });
    await reduceStock(orderItems);
    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: order.userId,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    return res.status(StatusCodes.OK).send({
      status: "success",
      statusCode: 200,
      message: "Order Placed Successfully",
      data: order,
      error: "",
    });
  }
);

export const myOrders = TryCatch(async (req, res, next) => {
  const { id } = req.query; // Correct way to extract the ID as a string
  let orders;
  let key = `myOrders-${id}`;
  if (!id) {
    return res.status(StatusCodes.BAD_REQUEST).send({
      status: "failed",
      statusCode: 400,
      message: "User ID is required",
      data: null,
      error: "Missing user ID in request",
    });
  }
  if (myCache.has(key)) {
    orders = JSON.parse(myCache.get(key) as string);
  } else {
    orders = await orderModel.find({ userId: id });
    myCache.set(key, JSON.stringify(orders));
  }

  return res.status(StatusCodes.OK).send({
    status: "success",
    statusCode: 200,
    message: "Orders Retrieved Successfully",
    data: orders,
    error: "",
  });
});

export const allOrders = TryCatch(async (req, res, next) => {
  let key = "allOrders";
  let allOrders;
  if (myCache.has(key)) {
    allOrders = JSON.parse(myCache.get(key) as string);
  } else {
    allOrders = await orderModel.find({}).populate("userId", "name");
    myCache.set(key, JSON.stringify(allOrders));
  }
  return res.status(StatusCodes.OK).send({
    status: "success",
    statusCode: 200,
    msg: "All Order Retrieved Successfully",
    data: allOrders,
    error: "",
  });
});

export const getSingleOrder = TryCatch(async (req, res, next) => {
  const id = req.params.id;

  let key = "singleOrder" + id;
  let order;
  if (myCache.has(key)) {
    order = JSON.parse(myCache.get(key) as string);
  } else {
    order = await orderModel.findById({ _id: id }).populate("userId", "name");
    if (!order) {
      return next(
        new ErrorHandler(
          "Order Not Found!,Invalid Order Id",
          StatusCodes.NOT_FOUND
        )
      );
    }
    myCache.set(key, JSON.stringify(order));
  }
  return res.status(StatusCodes.OK).send({
    status: "success",
    statusCode: 200,
    message: "Order Retrieved Successfully",
    data: order,
    error: "",
  });
});

export const orderProcess = TryCatch(async (req, res, next) => {
  const { id } = req.params;

  let order = await orderModel.findById(id);
  if (!order) {
    return next(
      new ErrorHandler("Order Not Found! Invalid Id", StatusCodes.NOT_FOUND)
    );
  } else {
    const status = order.status;
    switch (status) {
      case "Processing":
        order.status = "Shipped";
        break;

      case "Shipped":
        order.status = "Delivered";
        break;

      default:
        order.status = "Delivered";
        break;
    }
    await order.save();
    await invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.userId,
      orderId: String(order._id),
    });
  }
  return res.status(StatusCodes.OK).send({
    status: "success",
    statusCode: 200,
    message: "Order Processed Successfully",
    data: order,
    error: "",
  });
});

export const deleteOrder = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const order = await orderModel.findById(id);
  if (!order) {
    return next(new ErrorHandler("Order Not Found", StatusCodes.NOT_FOUND));
  } else {
    await order.deleteOne();
  }
  await invalidateCache({
    product: false,
    order: true,
    admin: true,
    userId: order.userId,
    orderId: String(order._id),
  });
  return res.status(StatusCodes.OK).send({
    status: "success",
    statusCode: 200,
    message: "Order Deleted Successfully",
    error: "",
  });
});
