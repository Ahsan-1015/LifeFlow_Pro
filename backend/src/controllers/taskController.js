import cloudinary from "../config/cloudinary.js";
import Comment from "../models/Comment.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { createActivity } from "../services/activityService.js";
import { createNotification } from "../services/notificationService.js";
import { createError } from "../utils/createError.js";
import { getProjectPermissions } from "../utils/projectAccess.js";

const populateTask = (query) =>
  query.populate("assignedTo", "name email avatar").populate("createdBy", "name email avatar");

export const createTask = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      throw createError(404, "Project not found");
    }

    const permissions = getProjectPermissions(project, req.user);
    if (!permissions.canManageTasks) {
      throw createError(403, "You do not have permission to create tasks in this project");
    }

    const task = await Task.create({
      ...req.body,
      projectId: project._id,
      createdBy: req.user._id,
    });

    if (task.assignedTo) {
      const assignedUser = await User.findById(task.assignedTo);
      if (assignedUser) {
        await createNotification(req.io, {
          userId: assignedUser._id,
          message: `You were assigned task ${task.title}`,
          type: "task_assigned",
          metadata: { taskId: task._id, projectId: project._id },
        });
      }
    }

    await createActivity({
      projectId: project._id,
      userId: req.user._id,
      text: `${req.user.name} created task ${task.title}`,
      entityType: "task",
      entityId: task._id,
    });

    const populatedTask = await populateTask(Task.findById(task._id));
    req.io.to(`project:${project._id}`).emit("task:created", populatedTask);

    res.status(201).json(populatedTask);
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      throw createError(404, "Task not found");
    }

    const project = await Project.findById(task.projectId);
    const permissions = getProjectPermissions(project, req.user, task);

    if (!permissions.canManageTasks && !permissions.canUpdateOwnTask) {
      throw createError(403, "You do not have permission to update this task");
    }

    if (permissions.canUpdateOwnTask && !permissions.canManageTasks) {
      const incomingKeys = Object.keys(req.body || {});
      const allowedKeys = ["status"];
      const onlyAllowedKeys = incomingKeys.every((key) => allowedKeys.includes(key));

      if (!onlyAllowedKeys) {
        throw createError(403, "Members can only update their own task status");
      }
    }

    const previousStatus = task.status;
    const previousAssignee = task.assignedTo ? String(task.assignedTo) : null;

    Object.assign(task, req.body);
    await task.save();

    await createActivity({
      projectId: project._id,
      userId: req.user._id,
      text:
        req.body.status && req.body.status !== previousStatus
          ? `${req.user.name} moved ${task.title} to ${task.status}`
          : `${req.user.name} updated task ${task.title}`,
      entityType: "task",
      entityId: task._id,
    });

    if (task.assignedTo && String(task.assignedTo) !== previousAssignee) {
      await createNotification(req.io, {
        userId: task.assignedTo,
        message: `You were assigned task ${task.title}`,
        type: "task_assigned",
        metadata: { taskId: task._id, projectId: project._id },
      });
    }

    const populatedTask = await populateTask(Task.findById(task._id));
    req.io.to(`project:${project._id}`).emit("task:updated", populatedTask);

    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      throw createError(404, "Task not found");
    }

    const project = await Project.findById(task.projectId);
    const permissions = getProjectPermissions(project, req.user, task);
    if (!permissions.canManageTasks) {
      throw createError(403, "You do not have permission to delete this task");
    }

    await Comment.deleteMany({ taskId: task._id });
    await task.deleteOne();

    await createActivity({
      projectId: project._id,
      userId: req.user._id,
      text: `${req.user.name} deleted task ${task.title}`,
      entityType: "task",
      entityId: task._id,
    });

    req.io.to(`project:${project._id}`).emit("task:deleted", { taskId: req.params.taskId });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getTaskComments = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      throw createError(404, "Task not found");
    }

    const project = await Project.findById(task.projectId);
    getProjectPermissions(project, req.user, task);

    const comments = await Comment.find({ taskId: task._id })
      .populate("userId", "name avatar email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      throw createError(404, "Task not found");
    }

    const project = await Project.findById(task.projectId);
    const permissions = getProjectPermissions(project, req.user, task);
    if (!permissions.canUploadTaskAttachment) {
      throw createError(403, "You do not have permission to upload files to this task");
    }

    if (!req.file) {
      throw createError(400, "Attachment file is required");
    }

    const uploadedFile = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "project-management-saas/attachments", resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    task.attachments.push({
      url: uploadedFile.secure_url,
      publicId: uploadedFile.public_id,
      originalName: req.file.originalname,
    });
    await task.save();

    const populatedTask = await populateTask(Task.findById(task._id));
    res.json(populatedTask);
  } catch (error) {
    next(error);
  }
};
