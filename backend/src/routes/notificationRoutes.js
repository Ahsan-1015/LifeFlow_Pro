import express from "express";
import { getNotifications, markNotificationAsRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/", getNotifications);
router.patch("/:notificationId/read", markNotificationAsRead);

export default router;
