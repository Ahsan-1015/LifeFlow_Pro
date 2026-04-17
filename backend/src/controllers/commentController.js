import Comment from "../models/Comment.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import { createActivity } from "../services/activityService.js";
import { createNotification } from "../services/notificationService.js";
import { createError } from "../utils/createError.js";
import { getProjectPermissions } from "../utils/projectAccess.js";

export const createComment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      throw createError(404, "Task not found");
    }

    const project = await Project.findById(task.projectId);
    const permissions = getProjectPermissions(project, req.user, task);
    if (!permissions.canLeaveFeedback) {
      throw createError(403, "You do not have permission to comment on this task");
    }

    const comment = await Comment.create({
      taskId: task._id,
      userId: req.user._id,
      message: req.body.message,
    });

    await createActivity({
      projectId: project._id,
      userId: req.user._id,
      text: `${req.user.name} commented on ${task.title}`,
      entityType: "comment",
      entityId: comment._id,
    });

    if (task.assignedTo && String(task.assignedTo) !== String(req.user._id)) {
      await createNotification(req.io, {
        userId: task.assignedTo,
        message: `New comment on task ${task.title}`,
        type: "task_comment",
        metadata: { taskId: task._id, projectId: project._id },
      });
    }

    const populatedComment = await Comment.findById(comment._id).populate("userId", "name avatar email");
    req.io.to(`task:${task._id}`).emit("comment:created", populatedComment);
    req.io.to(`project:${project._id}`).emit("comment:created", {
      taskId: task._id,
      comment: populatedComment,
    });

    res.status(201).json(populatedComment);
  } catch (error) {
    next(error);
  }
};
