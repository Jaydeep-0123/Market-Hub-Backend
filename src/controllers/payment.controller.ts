import { StatusCodes } from "http-status-codes";
import { TryCatch } from "../middlewares/error.middleware.js";
import ErrorHandler from "../utils/utility-class.js";
import couponModel from "../models/coupon.model.js";
import { stripe } from "../app.js";


export const newCoupon=TryCatch(async (req,res,next)=>
{
   const {coupon_Code,amount}=req.body;

   if(!coupon_Code || !amount)
   {
    return next(new ErrorHandler("Please enter both coupon and amount",StatusCodes.BAD_REQUEST));
   }
   const coupon=await couponModel.create({
     coupon_Code:coupon_Code,
     amount:amount
    })
  return res.status(StatusCodes.OK).send({
    success:true,
    statusCode:200,
    message:`Coupon ${coupon.coupon_Code} Created Successfully`,
    data:coupon,
    error:""
  })
})


export const createPaymentIntent=TryCatch(async (req,res,next)=>
{
  console.log("amount");
  const {amount}=req.body;
  
  if(!amount)
  {
    return next(new ErrorHandler("Please enter amount",StatusCodes.BAD_REQUEST));
  }
  const realAmount=Number(amount)*100;
  const paymentIntent=await stripe.paymentIntents.create({amount:realAmount,currency:"inr"})
  
   return res.status(StatusCodes.OK).send({
    success:true,
    statusCode:200,
    message:`Payment Intent Created Successfully`,
    data:paymentIntent.client_secret,
    error:""
   })
})


export const applyDiscount=TryCatch(async(req,res,next)=> 
{
   const {coupon_Code}=req.query;

   const discount=await couponModel.findOne({coupon_Code:coupon_Code});
   const discountAmount=discount?.amount;
   if(!discount)
   {
    return next(new ErrorHandler("Invalid Coupon Code",StatusCodes.BAD_REQUEST));
   }
  return res.status(StatusCodes.OK).send({
    success:true,
    statusCode:200,
    message:`Coupon ${discount.coupon_Code} Applied Successfully`,
    discount:discountAmount,
    error:""
  })
})


export const getAllCoupons=TryCatch(async (req,res,next)=>
{
   const coupons=await couponModel.find({});
   if(!coupons)
   {
    return next(new ErrorHandler("somethig went worng",StatusCodes.NOT_FOUND));
   }
   return res.status(StatusCodes.OK).send({
    success:true,
    statusCode:200,
    message:`All Coupons Retrieved Successfully`,
    data:coupons,
    error:""
   })
})


export const deleteCoupon=TryCatch(async(req,res,next)=>
{
   const {id}=req.params;
   const coupon=await couponModel.findById({_id:id});
   
   if(!coupon)
   {
     return next(new ErrorHandler("Coupon Not Found! Invalid Coupon Id",StatusCodes.NOT_FOUND));
   }
   else
   {
      await coupon.deleteOne();
   }
   return res.status(StatusCodes.OK).send({
    success:true,
    statusCode:200,
    message:`Coupon ${coupon.coupon_Code} Deleted Successfully`,
    error:""
   })
})