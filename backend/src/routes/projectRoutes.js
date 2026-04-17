import express from "express";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  inviteMember,
  removeMember,
  updateMemberRole,
  updateProject,
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.route("/").get(getProjects).post(createProject);
router.route("/:projectId").get(getProjectById).put(updateProject).delete(deleteProject);
router.post("/:projectId/invite", inviteMember);
router.patch("/:projectId/members/:memberId", updateMemberRole);
router.delete("/:projectId/members/:memberId", removeMember);

export default router;
