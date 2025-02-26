import express from 'express';
import { getDashboardBar, getDashboardLine, getDashboardPie, getDashboardStats } from '../controllers/dashboard-stats.controller.js';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.js';
const dashboardRouter = express.Router();
dashboardRouter.route("/stats").get(adminAuthentication, getDashboardStats);
dashboardRouter.route('/pie').get(adminAuthentication, getDashboardPie);
dashboardRouter.route('/bar').get(adminAuthentication, getDashboardBar);
dashboardRouter.route("/line").get(adminAuthentication, getDashboardLine);
export default dashboardRouter;
