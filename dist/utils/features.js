import { myCache } from "../app.js";
import productModel from "../models/product.model.js";
export const invalidateCache = async ({ product, order, admin, userId, orderId, productId }) => {
    if (product) {
        const productKeys = ["latest-products", "categories", "allProducts"];
        if (typeof productId === "string") {
            productKeys.push(`product-${productId}`);
        }
        if (typeof productId === "object") {
            productId.forEach((i) => productKeys.push(`product-${i}`));
        }
        myCache.del(productKeys);
    }
    if (order) {
        const orderKeys = ["allOrders", `myOrders-${userId}`, "singleOrder" + orderId];
        myCache.del(orderKeys);
    }
    if (admin) {
    }
};
export const reduceStock = async (orderItem) => {
    for (let i = 0; i < orderItem.length; i++) {
        const order = orderItem[i];
        const product = await productModel.findById(order.productId);
        if (!product) {
            throw new Error("Product Not Found");
        }
        product.stock -= order.quantity;
        await product.save();
    }
};
export const calculatePercantage = (thisMonth, lastMonth) => {
    console.log(thisMonth, lastMonth);
};
