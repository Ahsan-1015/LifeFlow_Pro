import bcrypt from "bcryptjs";
import cloudinary, { hasCloudinaryConfig } from "../config/cloudinary.js";
import User from "../models/User.js";
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
