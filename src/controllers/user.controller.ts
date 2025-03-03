import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import userModel from "../models/user.model.js";
import { NewUserRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.middleware.js";
import ErrorHandler from "../utils/utility-class.js";



export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => 
{
    const { name, email, dob, _id, gender, photo } = req.body;

    let result = await userModel.findById(_id);
    if (result) {
      return res
        .status(StatusCodes.OK)
        .send({ success: true, message: `Welcome, ${result.name}!` });
    }
    if (!_id || !name || !email || !dob || !gender || !photo) {
      return next(
        new ErrorHandler("Please add all Fields", StatusCodes.BAD_REQUEST)
      );
    }

    result = await userModel.create({
      name: name,
      email: email,
      dob: new Date(dob),
      _id: _id,
      gender: gender,
      photo: photo,
    });
    return res.status(StatusCodes.OK).send({
      status: "success",
      statusCodes: 200,
      msg: "User Inserted Successfully",
      data: { result },
      error: "",
    });
  }
);


export const getAllUser = TryCatch(async (req, res, next) => {
  const users = await userModel.find({});
  return res.status(StatusCodes.OK).send({ 
    status: "Success", 
    statusCode: 200, 
    data: users, 
    error: "" 
  });
});


export const getUserById=TryCatch(async (req,res,next)=>
{
  const id=req.params.id;
  const user=await userModel.findOne({_id:id});
  if(!user)
  {
    return next(new ErrorHandler("Invalid Id",StatusCodes.BAD_REQUEST))
  }  
  return res.status(StatusCodes.OK).send({
    status:"success",
    statusCode:200,
    data:user,
    error:""
  })
})


export const deleteUser=TryCatch(async(req,res,next)=>
{
    const id=req.params.id;
    const user=await userModel.findOneAndDelete({_id:id});
    if(!user)
    {
      return next(new ErrorHandler("Invalid Id",StatusCodes.BAD_REQUEST))
    }
    return res.status(StatusCodes.OK).send({
      status:"success",
      statusCode:200,
      message:"User Deleted Successfully",
    })
})

export const updateUser=TryCatch(async (req,res,next)=>{
  const id=req.params.id;
  const user=await userModel.findById({_id:id})
  if(!user)
  {
     return next(new ErrorHandler("Invalid Id",401))
  }
  else
  {
    const updateUser=await userModel.updateOne({_id:id},{$set:req.body});
    return res.status(StatusCodes.OK).send({
      status:"success",
      statusCode:200,
      data:updateUser,
      message:"user updated sucessfully"
    })
  }
  
})