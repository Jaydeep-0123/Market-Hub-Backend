import { StatusCodes } from "http-status-codes";
import { TryCatch } from "../middlewares/error.middleware.js";
import { myCache } from "../app.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";
import { calculatePercantage, getCategories } from "../utils/features.js";
//--------------------------------------------------------------------------------------------------------
export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats = {};
    if (myCache.has("admin-stats")) {
        stats = JSON.parse(myCache.get("admin-stats"));
    }
    else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
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
                $lte: thisMonth.end,
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
        const lastSixMonthOrdersPromise = orderModel.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today,
            },
        });
        const latestTransictionPromise = orderModel.find({}).select(["orderItems", "discount", "total", "status"]).limit(4);
        const [thisMonthProducts, thisMonthUsers, thisMonthOrders, lastMonthProducts, lastMonthUsers, lastMonthOrders, productsCount, usersCount, ordersCount, allOrders, lastSixMonthOrders, allCategories, maleUserCount, femmaleUserCount, latestTransiction] = await Promise.all([
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            productModel.countDocuments(),
            userModel.countDocuments(),
            orderModel.countDocuments(),
            orderModel.find({}).select("total"),
            lastSixMonthOrdersPromise,
            productModel.distinct("category"),
            userModel.countDocuments({ gender: "male" }),
            userModel.countDocuments({ gender: "female" }),
            latestTransictionPromise
        ]);
        const thisMonthRevanue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const lastMonthRevanue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const percent = {
            revanue: calculatePercantage(thisMonthRevanue, lastMonthRevanue),
            userPercent: calculatePercantage(thisMonthUsers.length, lastMonthUsers.length),
            productPercent: calculatePercantage(thisMonthProducts.length, lastMonthProducts.length),
            orderPercent: calculatePercantage(thisMonthOrders.length, lastMonthOrders.length),
        };
        const revanue = allOrders.reduce((total, order) => total + (order.total || 0), 0);
        const count = {
            revanue,
            product: productsCount,
            user: usersCount,
            order: ordersCount
        };
        const userGenderRatio = {
            male: maleUserCount,
            female: femmaleUserCount
        };
        const modifiedLatestTransiction = latestTransiction.map((val, i) => ({
            _id: val._id,
            discount: val.discount,
            amount: val.total,
            quantity: val.orderItems.length,
            status: val.status
        }));
        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthRevanue = new Array(6).fill(0);
        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const monthDiff = today.getMonth() - creationDate.getMonth();
            if (monthDiff < 6) {
                orderMonthCounts[6 - monthDiff - 1] += 1;
                orderMonthRevanue[6 - monthDiff - 1] += order.total;
            }
        });
        const categoriesCountPromise = allCategories.map((category) => productModel.countDocuments({ category }));
        const categoriesCount = await Promise.all(categoriesCountPromise);
        const categoryCount = [];
        allCategories.forEach((category, i) => {
            categoryCount.push({
                [category]: Math.round((categoriesCount[i] / productsCount) * 100)
            });
        });
        stats = {
            categoryCount,
            percent,
            count,
            userGenderRatio,
            chart: {
                order: orderMonthCounts,
                revanue: orderMonthRevanue,
            },
            latestTransiction: modifiedLatestTransiction
        };
        myCache.set('admin-stats', JSON.stringify(stats));
    }
    return res.status(StatusCodes.OK).send({
        status: "success",
        statusCode: 200,
        data: stats,
        error: "",
    });
});
//------------------------------------------------------------------------------------------------------
export const getDashboardPie = TryCatch(async (req, res, next) => {
    let charts;
    let key = 'admin-pie-charts';
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key));
    }
    else {
        const [processingOrder, shippedOrder, deliveredOrder, allCategories, productsCount] = await Promise.all([
            orderModel.countDocuments({ status: "Processing" }),
            orderModel.countDocuments({ status: "Shipped" }),
            orderModel.countDocuments({ status: "Delivered" }),
            productModel.distinct("category"),
            productModel.countDocuments()
        ]);
        const orderFullfllMent = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder
        };
        const productCategories = await getCategories({ allCategories, productsCount });
        charts = {
            orderFullfllMent,
            productCategories
        };
        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(StatusCodes.OK).send({
        status: "success",
        statusCode: 200,
        charts,
        error: ""
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
