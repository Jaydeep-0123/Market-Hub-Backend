import { StatusCodes } from "http-status-codes";
import { TryCatch } from "../middlewares/error.middleware.js";
import { myCache } from "../app.js";
import productModel from "../models/product.model.js";
import userModel from "../models/user.model.js";
import orderModel from "../models/order.model.js";
import { calculatePercantage, getCategories, getChartData } from "../utils/features.js";
//--------------------------------------------------------------------------------------------------------
export const getDashboardStats = TryCatch(async (req, res, next) => {
    let stats = {};
    let key = "admin-stats";
    if (myCache.has(key)) {
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
            const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
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
        myCache.set(key, JSON.stringify(stats));
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
        const allOrdersPromise = orderModel.find({}).select(["total", "discount", "subtotal", "tax", "shippingCharges"]);
        const [processingOrder, shippedOrder, deliveredOrder, allCategories, productsCount, productsOutOfStock, allOrders, allusers, adminUsers, customerUsers] = await Promise.all([
            orderModel.countDocuments({ status: "Processing" }),
            orderModel.countDocuments({ status: "Shipped" }),
            orderModel.countDocuments({ status: "Delivered" }),
            productModel.distinct("category"),
            productModel.countDocuments(),
            productModel.countDocuments({ stock: 0 }),
            allOrdersPromise,
            userModel.find({}).select("dob"),
            userModel.countDocuments({ role: "admin" }),
            userModel.countDocuments({ role: "user" })
        ]);
        const orderFullfllMent = {
            processing: processingOrder,
            shipped: shippedOrder,
            delivered: deliveredOrder
        };
        const productCategories = await getCategories({ allCategories, productsCount });
        const stockAvailablity = {
            inStock: productsCount - productsOutOfStock,
            outOfStock: productsOutOfStock
        };
        const grossIncome = allOrders.reduce((pre, order) => pre + (order.total || 0), 0);
        const discount = allOrders.reduce((pre, order) => pre + (order.discount || 0), 0);
        const productionCost = allOrders.reduce((pre, order) => pre + (order.shippingCharges || 0), 0);
        const brunt = allOrders.reduce((pre, order) => pre + (order.tax || 0), 0);
        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin = grossIncome - discount - productionCost - brunt - marketingCost;
        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            brunt,
            marketingCost
        };
        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers
        };
        const teen = allusers.filter((i) => i.age < 20).length;
        const adult = allusers.filter((i) => i.age >= 20 && i.age < 40).length;
        const old = allusers.filter((i) => i.age >= 40).length;
        const userAgeGroup = {
            teen: teen,
            adult: adult,
            old: old
        };
        charts = {
            orderFullfllMent,
            productCategories,
            stockAvailablity,
            revenueDistribution,
            adminCustomer,
            userAgeGroup
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
//-------------------------------------------------------------------------------------------------------
export const getDashboardBar = TryCatch(async (req, res, next) => {
    let charts = {};
    let key = 'admin-bar-charts';
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key));
    }
    else {
        const today = new Date();
        const sixMonthAgo = new Date();
        sixMonthAgo.setMonth(sixMonthAgo.getMonth() - 6);
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);
        const sixMonthProductPromise = productModel.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lt: today
            }
        }).select('createdAt');
        const twelveMonthOrderPromise = orderModel.find({
            createdAt: {
                $gte: twelveMonthAgo,
                $lt: today
            }
        }).select('createdAt');
        const sixMonthUsersPromise = orderModel.find({
            createdAt: {
                $gte: sixMonthAgo,
                $lte: today
            }
        }).select("createdAt");
        const [products, orders, users] = await Promise.all([
            sixMonthProductPromise,
            twelveMonthOrderPromise,
            sixMonthUsersPromise,
        ]);
        const productCounts = getChartData({ length: 6, docArr: products, today });
        const ordersCounts = getChartData({ length: 12, docArr: orders, today });
        const usersCounts = getChartData({ length: 6, docArr: users, today });
        charts = {
            products: productCounts,
            orders: ordersCounts,
            users: usersCounts
        };
        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(StatusCodes.OK).send({
        status: "success",
        StatusCode: 200,
        charts: charts,
        error: ""
    });
});
//------------------------------------------------------------------------------------------------------
export const getDashboardLine = TryCatch(async (req, res, next) => {
    let charts = {};
    const key = 'admin-line-charts';
    if (myCache.has(key)) {
        charts = JSON.parse(myCache.get(key));
    }
    else {
        const today = new Date();
        const twelveMonthAgo = new Date();
        twelveMonthAgo.setMonth(twelveMonthAgo.getMonth() - 12);
        const baseQuery = {
            createdAt: {
                $gte: twelveMonthAgo,
                $lte: today,
            }
        };
        const twelveMonthOrderPromise = orderModel.find(baseQuery).select(['createdAt', 'discount', 'total']);
        const twelveMonthUserPromise = userModel.find(baseQuery).select(['createdAt']);
        const twelveMonthProductPromise = productModel.find(baseQuery).select('createdAt');
        const [orders, users, products] = await Promise.all([
            twelveMonthOrderPromise,
            twelveMonthUserPromise,
            twelveMonthProductPromise
        ]);
        const userCount = getChartData({ length: 12, docArr: users, today });
        const productCount = getChartData({ length: 12, docArr: products, today });
        const discount = getChartData({ length: 12, docArr: orders, today, property: "discount", });
        const revanue = getChartData({ length: 12, docArr: orders, today, property: "total", });
        charts = {
            users: userCount,
            products: productCount,
            discount: discount,
            revanue: revanue
        };
        myCache.set(key, JSON.stringify(charts));
    }
    return res.status(StatusCodes.OK).send({
        status: "success",
        StatusCode: 200,
        charts: charts,
        error: ""
    });
});
