import { StatusCodes } from "http-status-codes";
import { TryCatch } from "../middlewares/error.middleware.js";
import { myCache } from "../app.js";
import { start } from "repl";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";
import { calculatePercantage } from "../utils/features.js";

export const getDashboardStats = TryCatch(async (req, res, next) => {
  let stats;

 
  if (myCache.has("admin-stats")) {
    stats = JSON.parse(myCache.get("admin-stats")!);
  } else {
    const today = new Date();

    const thisMonth = {
      start: new Date(today.getFullYear(), today.getMonth(), 1),
      end: today,
    };

    const lastMonth = {
      start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      end: new Date(today.getFullYear(), today.getMonth(), 0),
    };

    //Products
    const thisMonthProductsPromise = productModel.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end
      },
    });

    const lastMonthProductsPromise = productModel.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    //Users
    const thisMonthUsersPromise = userModel.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthUsersPromise = userModel.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    //orders
    const thisMonthOrdersPromise = orderModel.find({
      createdAt: {
        $gte: thisMonth.start,
        $lte: thisMonth.end,
      },
    });

    const lastMonthOrdersPromise = orderModel.find({
      createdAt: {
        $gte: lastMonth.start,
        $lte: lastMonth.end,
      },
    });

    const [thisMonthProducts,thisMonthUsers, thisMonthOrders,lastMonthProducts, lastMonthUsers, lastMonthOrders] 
        = await Promise.all([thisMonthProductsPromise,
                thisMonthUsersPromise,
                thisMonthOrdersPromise,

                lastMonthProductsPromise,
                lastMonthUsersPromise,
                lastMonthOrdersPromise,
                ]);

    const userChangePercent = calculatePercantage(thisMonthUsers.length,lastMonthUsers.length);
    const productChangePercent = calculatePercantage(thisMonthProducts.length,lastMonthProducts.length);
    const orderChangePersent = calculatePercantage(thisMonthOrders.length,lastMonthOrders.length);

  }
  return res.status(StatusCodes.OK).send({
    status: "success",
    statusCode: 200,
    data: stats,
    error: "",
  });
});

export const getDashboardPie = TryCatch(async (req, res, next) => {
  return res.status(StatusCodes.OK).send({
    msg: "This is a Dashboard Pie",
  });
});

export const getDashboardBar = TryCatch(async (req, res, next) => {
  return res.status(StatusCodes.OK).send({
    status: "success",
  });
});

export const getDashboardLine = TryCatch(async (req, res, next) => {
  return res.status(StatusCodes.OK).send({
    msg: "This is a Dashboard Line",
  });
});
