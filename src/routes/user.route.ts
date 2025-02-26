import express, { RequestHandler } from 'express'
import { deleteUser, getAllUser, getUserById, newUser, updateUser } from '../controllers/user.controller.js';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.js';

const userRouter=express.Router()

userRouter.route("/newUser").post(newUser as RequestHandler);
userRouter.route('/all').get(adminAuthentication as RequestHandler,getAllUser as RequestHandler);
userRouter.route('/:id').get(adminAuthentication as RequestHandler,getUserById as RequestHandler);
userRouter.route('/:id').delete(adminAuthentication as RequestHandler,deleteUser as RequestHandler);
userRouter.route('/update/user/:id').patch(updateUser as RequestHandler);

export default userRouter;