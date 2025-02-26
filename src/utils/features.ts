import { myCache } from "../app.js";
import { getProductById } from "../controllers/product.controller.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";

export const invalidateCache=async({product,order,admin,userId,orderId,productId}:InvalidateCacheProps)=>
{
    if(product)
    {
       const productKeys:string[]=["latest-products","categories","allProducts"];
       if(typeof productId==="string")
       {
         productKeys.push(`product-${productId}`)
       }
       if(typeof productId==="object")
       {
         productId.forEach((i)=> productKeys.push(`product-${i}`))
         
       }
       myCache.del(productKeys);
    }
    if(order)
    {
       const orderKeys:string[]=["allOrders",`myOrders-${userId}`,"singleOrder"+orderId];
       myCache.del(orderKeys)
    }
    if(admin)
    {

    }
}

export const reduceStock=async(orderItem:OrderItemType[])=>
{
    for(let i=0;i<orderItem.length;i++)
    {
       const order=orderItem[i];
       const product=await productModel.findById(order.productId);
       if(!product)
       {
         throw new Error("Product Not Found");
       }
       product.stock-=order.quantity;
       await product.save();
    }
};

export const calculatePercantage=(thisMonth:number,lastMonth:number)=>{
  console.log(thisMonth,lastMonth);
  
}