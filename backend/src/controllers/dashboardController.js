import { buildDashboardData } from "../services/dashboardService.js";

export const getDashboardData = async (req, res, next) => {
  try {
    const dashboard = await buildDashboardData({ user: req.user });
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};
