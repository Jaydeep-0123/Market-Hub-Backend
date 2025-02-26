import { StatusCodes } from "http-status-codes";
import userModel from "../../models/user.model.js";
import ErrorHandler from "../../utils/utility-class.js";
import { TryCatch } from "../error.middleware.js";
export const adminAuthentication = TryCatch(async (req, res, next) => {
    const { id } = req.query;
    if (!id) {
        return next(new ErrorHandler("saale login kr pehle", StatusCodes.UNAUTHORIZED));
    }
    const user = await userModel.findById({ _id: id });
    if (!user) {
        return next(new ErrorHandler("user not found, Invalid Id", StatusCodes.UNAUTHORIZED));
    }
    else if (user.role !== "admin") {
        return next(new ErrorHandler("you are not admin", StatusCodes.UNAUTHORIZED));
    }
    else {
        next();
    }
});
