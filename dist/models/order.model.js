import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required: [true, "please enter the address"]
        },
        city: {
            type: String,
            required: [true, "please enter the city"]
        },
        state: {
            type: String,
            required: [true, "please enter the state"]
        },
        country: {
            type: String,
            required: [true, "please enter the country"]
        },
        pincode: {
            type: Number,
            required: [true, "please enter the pincode"]
        }
    },
    userId: {
        type: String,
        ref: "user",
        required: [true, "please enter the user id"]
    },
    subtotal: {
        type: Number,
        required: [true, "please enter the subtotal"]
    },
    tax: {
        type: Number,
        required: [true, "please enter the tax"]
    },
    shippingCharges: {
        type: Number,
        required: [true, "please enter the shipping charges"]
    },
    discount: {
        type: Number,
        required: [true, "please enter the discount"]
    },
    total: {
        type: Number,
        required: [true, "please enter the total"]
    },
    status: {
        type: String,
        enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Pending"],
        default: "Pending"
    },
    orderItems: [
        {
            name: String,
            photo: String,
            price: Number,
            quantity: Number,
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "product",
            }
        }
    ]
}, {
    timestamps: true
});
const orderModel = mongoose.model("order", orderSchema);
export default orderModel;
