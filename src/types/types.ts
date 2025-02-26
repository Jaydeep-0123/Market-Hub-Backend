import { Request, Response, NextFunction } from "express";
import {ObjectId} from 'mongodb';   
export interface NewUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  dob: Date;
  _id: string;
}

export interface NewProductRequestBody {
  name: string;
  price: number;
  stock: number;
  category:string,
  
 
}

export type ControllerType = (
  req: Request<any>,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any,Record<string,any>>>;


export type searchRequestQuery={
  search?: string;
  price?: string;
  category?: string;
  sort?: string;
  page?: string;

}

export interface BaseQuery{
   name?:{
    $regex:string;
    $options:"i";
   };
   price?:{
    $lte:number;
   };
   category?:string;
}

export type InvalidateCacheProps={
  product?:boolean;
  order?:boolean;
  admin?:boolean;
  userId?:string;
  orderId?:string;
  productId?:string|string[];

}

export type OrderItemType={
  name:string;
  price:number;
  quantity:number;
  photo:string;
  productId:ObjectId
}

export type ShippingInfoType={
  address:string;
  city:string;
  state:string;
  country:string;
  pincode:number
  

}

export interface NewOrderRequestBody {
  shippingInfo:ShippingInfoType;
  userId:string;
  subtotal:number;
  tax:number;
  shippingCharges:number;
  discount:number;
  total:number;
  orderItems:OrderItemType[]
}