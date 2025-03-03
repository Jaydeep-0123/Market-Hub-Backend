import { TryCatch } from "../middlewares/error.middleware.js";
import productModel from "../models/product.model.js";
import { StatusCodes } from "http-status-codes";
import { rm } from "fs";
import fs from "fs";
import { faker } from '@faker-js/faker';
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
export const newProduct = TryCatch(async (req, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    if (!photo) {
        return next(new ErrorHandler("Please add photo", StatusCodes.BAD_REQUEST));
    }
    else if (!name || !price || !stock || !category) {
        rm(photo.path, () => {
            console.log("Deleted");
        });
        return next(new ErrorHandler("Please enter all fields", StatusCodes.BAD_REQUEST));
    }
    else {
        const product = await productModel.create({
            name: name,
            price: price,
            stock: stock,
            category: category.toLowerCase(),
            photo: photo.path,
        });
        invalidateCache({ product: true, admin: true });
        return res.status(StatusCodes.OK).send({
            status: "success",
            statusCode: 200,
            message: "Product created successfully",
            data: product,
            error: "",
        });
    }
});
export const deleteProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const product = await productModel.findByIdAndDelete({ _id: id });
    const path = product?.photo;
    if (product && typeof path === "string" && path.trim() !== "") {
        fs.unlink(path, (err) => {
            if (!err)
                console.log("sucessfully deleted", path);
            else
                console.log(err);
        });
    }
    else {
        return next(new ErrorHandler("Product Not Found", StatusCodes.NOT_FOUND));
    }
    invalidateCache({ product: true, productId: String(product._id), admin: true });
    return res.status(StatusCodes.OK).send({
        status: "success",
        statusCode: 200,
        message: "product deleted successfully",
        error: "",
    });
});
export const getAllProduct = TryCatch(async (req, res, next) => {
    let allProducts;
    if (myCache.has("allProducts")) {
        allProducts = JSON.parse(myCache.get("allProducts"));
    }
    else {
        allProducts = await productModel.find({});
        myCache.set("allProducts", JSON.stringify(allProducts));
    }
    return res.status(StatusCodes.OK).send({
        status: "success",
        statusCode: 200,
        data: allProducts,
        error: "",
    });
});
export const getProductById = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    let product;
    if (myCache.has(`product-${id}`)) {
        product = JSON.parse(myCache.get(`product-${id}`));
    }
    else {
        product = await productModel.findOne({ _id: id });
        if (!product) {
            next(new ErrorHandler("Product Not Found", StatusCodes.NOT_FOUND));
        }
        myCache.set(`product-${id}`, JSON.stringify(product));
    }
    return res.status(StatusCodes.OK).send({
        status: "success",
        statusCode: 200,
        data: product,
        error: "",
    });
});
export const getlatestProducts = TryCatch(async (req, res, next) => {
    let products;
    if (myCache.has("latest-products")) {
        products = JSON.parse(myCache.get("latest-products"));
    }
    else {
        products = await productModel.find({}).sort({ createdAt: -1 }).limit(5);
        myCache.set("latest-products", JSON.stringify(products));
    }
    return res.status(StatusCodes.OK).send({
        status: "success",
        statusCode: 200,
        data: products,
        error: "",
    });
});
export const getAllCategories = TryCatch(async (req, res, next) => {
    let categories;
    if (myCache.has("categories")) {
        categories = JSON.parse(myCache.get("categories"));
    }
    else {
        categories = await productModel.distinct("category");
        myCache.set("categories", JSON.stringify(categories));
    }
    return res.status(StatusCodes.OK).send({
        status: "success",
        statusCode: 200,
        category: categories,
        error: "",
    });
});
export const updateProduct = TryCatch(async (req, res, next) => {
    const id = req.params.id;
    const { name, price, stock, category } = req.body;
    const photo = req.file;
    const product = await productModel.findOne({ _id: id });
    if (!product) {
        return next(new ErrorHandler("Product Not Found", StatusCodes.NOT_FOUND));
    }
    if (photo) {
        rm(product.photo, () => {
            console.log("Old Photo Deleted");
        });
        product.photo = photo.path;
    }
    if (name)
        product.name = name;
    if (price)
        product.price = price;
    if (stock)
        product.stock = stock;
    if (category)
        product.category = category;
    await product.save();
    invalidateCache({ product: true, productId: String(product._id), admin: true });
    return res.status(StatusCodes.OK).send({
        status: "success",
        statusCode: 200,
        msg: "Product Updated Successfully",
        error: "",
    });
});
export const searchProducts = TryCatch(async (req, res, next) => {
    const { search, price, category, sort } = req.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit * (page - 1);
    const baseQuery = {};
    if (search) {
        baseQuery.name = { $regex: search, $options: "i" };
    }
    if (price) {
        baseQuery.price = { $lte: Number(price) || 0 };
    }
    if (category) {
        baseQuery.category = category;
    }
    const [searchProduct, filterProducts] = await Promise.all([
        productModel
            .find(baseQuery)
            .sort(sort && { price: sort === "asc" ? 1 : -1 })
            .limit(limit)
            .skip(skip),
        productModel.find(baseQuery)
    ]);
    const totalPages = Math.ceil(filterProducts.length / limit);
    return res.status(StatusCodes.OK).send({
        status: "success",
        statusCode: 200,
        totalPages: totalPages,
        data: searchProduct,
        error: "",
    });
});
const genrateRandomProducts = async (count = 10) => {
    const products = [];
    for (let i = 0; i < count; i++) {
        const product = {
            name: faker.commerce.productName(),
            photo: "uploads\\bb4881c1-4c92-4588-9b86-98e8a06eb3d2.jpeg",
            price: faker.commerce.price({ min: 1500, max: 80000 }),
            stock: faker.commerce.price({ min: 0, max: 100 }),
            category: faker.commerce.department(),
            createdAt: new Date(faker.date.past()),
            updatedAt: new Date(faker.date.past()),
            _v: 0,
        };
        products.push(product);
    }
    await productModel.insertMany(products);
    console.log("Successfully Data Inserted");
};
// genrateRandomProducts(45)
const deleteRandomProducts = async () => {
    const produts = await productModel.find({}).skip(2);
    for (let i = 0; i < produts.length; i++) {
        const product = produts[i];
        await product.deleteOne();
    }
    console.log("Deleted Successfully");
};
// deleteRandomProducts()
