import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import router from './routes/index.route.js';
import dbConnection from './config/dbconnection.config.js';
import NodeCache from 'node-cache';
import { errorMiddleware } from './middlewares/error.middleware.js';
import Stripe from 'stripe';
dotenv.config();
const app = express();
const port = process.env.PORT || 4000;
const url = process.env.MONGO_URL || "defaultMongoURL";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "defaultStripeSecretKey";
dbConnection(url);
export const stripe = new Stripe(stripeSecretKey);
export const myCache = new NodeCache();
app.use('/uploads', express.static("uploads"));
app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended:true}));
app.use(cors({
    credentials: true,
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.use(morgan('common'));
app.get("/", (req, res) => {
    res.send({ msg: "Api Working with /api/v1" });
});
app.use(router);
app.use(errorMiddleware);
app.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
