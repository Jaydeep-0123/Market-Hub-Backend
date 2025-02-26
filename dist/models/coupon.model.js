import mongoose from "mongoose";
const couponSchema = new mongoose.Schema({
    coupon_Code: {
        type: String,
        required: [true, "Please enter the Coupon Code"],
        unique: true
    },
    amount: {
        type: Number,
        required: [true, "Please enter the Discount Amount"],
    },
}, { timestamps: true });
const couponModel = mongoose.model("coupon", couponSchema);
export default couponModel;
