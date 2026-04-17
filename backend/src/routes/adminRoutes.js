import express from "express";
import { updateUserRole } from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("super_admin"));

router.patch("/users/:userId/role", updateUserRole);

export default router;
