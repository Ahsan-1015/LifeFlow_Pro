import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import { createActivity } from "../services/activityService.js";
import { createNotification } from "../services/notificationService.js";
import { createError } from "../utils/createError.js";
import { ensureProjectAccess, getProjectPermissions } from "../utils/projectAccess.js";
import { normalizeRole } from "../utils/roles.js";

export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { "members.user": req.user._id }],
    })
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role")
      .sort({ updatedAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req, res, next) => {
  try {
    const role = normalizeRole(req.user.role);
    if (!["super_admin", "owner"].includes(role)) {
      throw createError(403, "Only super admins and project owners can create projects");
    }

    const { title, description, deadline, members = [] } = req.body;
    const normalizedMembers = members.filter((member) => String(member.user) !== String(req.user._id));

    const project = await Project.create({
      title,
      description,
      deadline,
      owner: req.user._id,
      members: [{ user: req.user._id, role: "admin" }, ...normalizedMembers],
    });

    await createActivity({
      projectId: project._id,
      userId: req.user._id,
      text: `${req.user.name} created project ${project.title}`,
      entityType: "project",
      entityId: project._id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    res.status(201).json(populatedProject);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    if (!project) {
      throw createError(404, "Project not found");
    }

    ensureProjectAccess(project, req.user._id);

    const tasks = await Task.find({ projectId: project._id })
      .populate("assignedTo", "name email avatar")
      .populate("createdBy", "name email avatar")
      .sort({ updatedAt: -1 });

    res.json({ ...project.toObject(), tasks });
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      throw createError(404, "Project not found");
    }

    const permissions = getProjectPermissions(project, req.user);
    if (!permissions.canManageProject) {
      throw createError(403, "Only the owner can update project details");
    }

    Object.assign(project, req.body);
    await project.save();

    await createActivity({
      projectId: project._id,
      userId: req.user._id,
      text: `${req.user.name} updated project ${project.title}`,
      entityType: "project",
      entityId: project._id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    res.json(populatedProject);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      throw createError(404, "Project not found");
    }

    const permissions = getProjectPermissions(project, req.user);
    if (!permissions.canManageProject) {
      throw createError(403, "Only the owner can delete a project");
    }

    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();
    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const inviteMember = async (req, res, next) => {
  try {
    const { email, role = "member" } = req.body;
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      throw createError(404, "Project not found");
    }

    const permissions = getProjectPermissions(project, req.user);
    if (!permissions.canManageTeam) {
      throw createError(403, "You cannot invite members to this project");
    }

    const invitedUser = await User.findOne({ email });
    if (!invitedUser) {
      throw createError(404, "User with this email does not exist");
    }

    const exists = project.members.some((member) => String(member.user) === String(invitedUser._id));
    if (exists) {
      throw createError(409, "User is already a project member");
    }

    project.members.push({ user: invitedUser._id, role });
    await project.save();

    await Promise.all([
      createActivity({
        projectId: project._id,
        userId: req.user._id,
        text: `${req.user.name} invited ${invitedUser.name} to ${project.title}`,
        entityType: "project",
        entityId: project._id,
      }),
      createNotification(req.io, {
        userId: invitedUser._id,
        message: `You were added to project ${project.title}`,
        type: "project_invite",
        metadata: { projectId: project._id },
      }),
    ]);

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email avatar")
      .populate("members.user", "name email avatar role");

    res.json(populatedProject);
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      throw createError(404, "Project not found");
    }

    const permissions = getProjectPermissions(project, req.user);
    if (!permissions.canManageTeam) {
      throw createError(403, "Only the owner can update member roles");
    }

    const member = project.members.find((item) => String(item.user) === req.params.memberId);
    if (!member) {
      throw createError(404, "Member not found in project");
    }

    member.role = req.body.role;
    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      throw createError(404, "Project not found");
    }

    const permissions = getProjectPermissions(project, req.user);
    if (!permissions.canManageTeam) {
      throw createError(403, "Only the owner can remove members");
    }

    project.members = project.members.filter((member) => String(member.user) !== req.params.memberId);
    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
};
