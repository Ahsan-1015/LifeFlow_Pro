import express from "express";
import {
  approveOwnerAccess,
  deleteUserAccount,
  rejectOwnerAccess,
  updateUserBlockStatus,
  updateUserRole,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("super_admin"));

router.patch("/users/:userId/role", updateUserRole);
router.patch("/users/:userId/owner-approval", approveOwnerAccess);
router.patch("/users/:userId/owner-rejection", rejectOwnerAccess);
router.patch("/users/:userId/block", updateUserBlockStatus);
router.delete("/users/:userId", deleteUserAccount);

export default router;
