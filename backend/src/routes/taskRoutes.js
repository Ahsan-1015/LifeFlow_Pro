import express from "express";
import {
  createTask,
  deleteTask,
  getTaskComments,
  updateTask,
  uploadAttachment,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/project/:projectId", createTask);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);
router.get("/:taskId/comments", getTaskComments);
router.post("/:taskId/attachments", upload.single("file"), uploadAttachment);

export default router;
