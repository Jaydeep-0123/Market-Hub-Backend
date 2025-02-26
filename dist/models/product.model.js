import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a product name"],
    },
    photo: {
        type: String,
        required: [true, "Please enter a product photo"],
    },
    price: {
        type: Number,
        required: [true, "Please enter a product price"],
    },
    stock: {
        type: Number,
        required: [true, "Please enter a product stock"],
    },
    category: {
        type: String,
        required: [true, "Please enter a product category"],
        trim: true
    }
}, { timestamps: true });
const productModel = mongoose.model("product", productSchema);
export default productModel;
