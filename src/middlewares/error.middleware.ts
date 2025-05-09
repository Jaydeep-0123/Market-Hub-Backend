import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
// import ErrorHandler from "../utils/utility-class.js";
import { ControllerType } from "../types/types.js";

export const errorMiddleware: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  if (err.name === "CastError") {
    err.message = "Invalid Id";
  }

  res.status(err.statusCode).json({
    status: "Failed",
    message: err.message,
  });
};


export const TryCatch =
  (func: ControllerType) =>
  (req: Request, res: Response, next: NextFunction) => {
      return Promise.resolve(func(req, res, next)).catch(next);
    };


