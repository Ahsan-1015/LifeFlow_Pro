import express from "express";
import { changePassword, updateProfile, uploadAvatar } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.put("/", updateProfile);
router.put("/password", changePassword);
router.post("/avatar", upload.single("file"), uploadAvatar);

export default router;
