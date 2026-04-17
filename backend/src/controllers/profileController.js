import bcrypt from "bcryptjs";
import cloudinary, { hasCloudinaryConfig } from "../config/cloudinary.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { createError } from "../utils/createError.js";

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name || user.name;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      ownerAccessStatus: user.ownerAccessStatus,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const matches = await bcrypt.compare(currentPassword, user.password);

    if (!matches) {
      throw createError(400, "Current password is incorrect");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw createError(400, "Avatar file is required");
    }

    if (!req.file.mimetype?.startsWith("image/")) {
      throw createError(400, "Please upload a valid image file");
    }

    let avatarUrl = "";

    if (hasCloudinaryConfig()) {
      try {
        const uploadedFile = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "project-management-saas/avatars", resource_type: "image" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

        avatarUrl = uploadedFile.secure_url;
      } catch (uploadError) {
        // Fallback to inline image storage when Cloudinary is unavailable or misconfigured.
        avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      }
    } else {
      avatarUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const requestOwnerAccess = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw createError(404, "User not found");
    }

    if (["owner", "super_admin", "admin"].includes(user.role)) {
      throw createError(400, "This account already has elevated workspace access");
    }

    if (user.ownerAccessStatus === "pending") {
      return res.json({
        message: "Your owner access request is already pending review",
        ownerAccessStatus: user.ownerAccessStatus,
      });
    }

    user.ownerAccessStatus = "pending";
    user.ownerAccessRequestedAt = new Date();
    user.ownerAccessReviewedAt = null;
    await user.save();

    const superAdmins = await User.find({
      role: { $in: ["super_admin", "admin"] },
      isDeleted: { $ne: true },
      isBlocked: { $ne: true },
    }).select("_id");

    await Promise.all(
      superAdmins.map((admin) =>
        createNotification(req.io, {
          userId: admin._id,
          message: `${user.name} requested project owner approval`,
          type: "owner_access_request",
          metadata: {
            requestedBy: user._id,
          },
        })
      )
    );

    res.json({
      message: "Owner access request sent to the super admin team",
      ownerAccessStatus: user.ownerAccessStatus,
      ownerAccessRequestedAt: user.ownerAccessRequestedAt,
    });
  } catch (error) {
    next(error);
  }
};
