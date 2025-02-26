import express, { RequestHandler } from 'express';
import { getDashboardBar, getDashboardLine, getDashboardPie, getDashboardStats } from '../controllers/dashboard-stats.controller.js';
import { adminAuthentication } from '../middlewares/authentication/admin.authentication.js';

const dashboardRouter=express.Router();

dashboardRouter.route("/stats").get(adminAuthentication as RequestHandler,getDashboardStats as RequestHandler);
dashboardRouter.route('/pie').get(adminAuthentication as RequestHandler,getDashboardPie as RequestHandler);
dashboardRouter.route('/bar').get(adminAuthentication as RequestHandler,getDashboardBar as RequestHandler);
dashboardRouter.route("/line").get(adminAuthentication as RequestHandler,getDashboardLine as RequestHandler);

export default dashboardRouter;