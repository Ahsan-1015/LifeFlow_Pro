import express from "express";
import { changePassword, requestOwnerAccess, updateProfile, uploadAvatar } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.put("/", updateProfile);
router.put("/password", changePassword);
router.post("/avatar", upload.single("file"), uploadAvatar);
router.post("/request-owner-access", requestOwnerAccess);

export default router;
