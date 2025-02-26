import express, { RequestHandler } from 'express'
import { deleteProduct, getAllCategories, getAllProduct, getlatestProducts, getProductById, newProduct, searchProducts, updateProduct } from '../controllers/product.controller.js';
import image from '../middlewares/multer.middleware.js';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.js';

const productRouter=express.Router();

productRouter.route("/newProduct").post(adminAuthentication as RequestHandler,image,newProduct as RequestHandler);
productRouter.route('/delete/:id').delete(adminAuthentication as RequestHandler,deleteProduct as RequestHandler)
productRouter.route("/all").get(adminAuthentication as RequestHandler,getAllProduct as RequestHandler);
productRouter.route('/:id').get(getProductById as RequestHandler);
productRouter.route("/latest/product").get(getlatestProducts as RequestHandler);
productRouter.route("/all/category").get(getAllCategories as RequestHandler);
productRouter.route("/update/product/:id").patch(adminAuthentication as RequestHandler,image,updateProduct as RequestHandler);
productRouter.route('/search/product').get(searchProducts as RequestHandler);

export default productRouter;