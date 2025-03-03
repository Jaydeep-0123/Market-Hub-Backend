import { myCache } from "../app.js";
import { getProductById } from "../controllers/product.controller.js";
import orderModel from "../models/order.model.js";
import productModel from "../models/product.model.js";
import { FuncProps, InvalidateCacheProps, OrderItemType } from "../types/types.js";

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
       myCache.del(["admin-stats","admin-pie-charts","admin-bar-charts","admin-line-charts"]);
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
  
  if(lastMonth===0)
  {
    return thisMonth*100;
  }
  const percent=(thisMonth/lastMonth)*100;
  return Number(percent.toFixed(0));
  
}

export const getCategories=async({allCategories,productsCount}:{allCategories: string[];productsCount:number;})=>
{
      const categoriesCountPromise = allCategories.map((category)=>
        productModel.countDocuments({category})
    )

    const categoriesCount = await Promise.all(categoriesCountPromise);

    const categoryCount: Record<string,number>[]=[];

    allCategories.forEach((category,i)=>{
    categoryCount.push({
        [category]:Math.round((categoriesCount[i]/productsCount)*100)
    })
    })
    return categoryCount
}

export interface MyDocumnet extends Document {
  createdAt:Date;
  discount?:number,
  total?:number
}

export const getChartData=({length,docArr,today,property}:FuncProps)=>
{
  
  const data:number[]=new Array(length).fill(0);
  docArr.forEach((i)=>{
     const creationDate = i.createdAt;
     const monthDiff=(today.getMonth()-creationDate.getMonth()+12)%12;
     if(monthDiff<length)
     {
       data[length-monthDiff-1]+=property?i[property]!:1; 
    
     }
     
  })
  return data;
}