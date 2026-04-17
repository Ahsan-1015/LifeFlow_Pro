import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { createError } from "../utils/createError.js";
import { APP_ROLES, normalizeRole } from "../utils/roles.js";

const allowedManagedRoles = [...APP_ROLES];

export const updateUserRole = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId).select("-password");

    if (!targetUser) {
      throw createError(404, "User not found");
    }

    if (String(targetUser._id) === String(req.user._id)) {
      throw createError(400, "You cannot change your own role from the admin panel");
    }

    const nextRole = normalizeRole(req.body.role);

    if (!allowedManagedRoles.includes(nextRole)) {
      throw createError(400, "Invalid role selected");
    }

    const previousRole = normalizeRole(targetUser.role);

    if (previousRole === nextRole) {
      return res.json({
        message: "User role is already up to date",
        user: {
          _id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: previousRole,
        },
      });
    }

    targetUser.role = nextRole;
    await targetUser.save();

    await createNotification(req.io, {
      userId: targetUser._id,
      message: `Your platform role was updated to ${nextRole.replace("_", " ")} by ${req.user.name}`,
      type: "role_updated",
      metadata: {
        previousRole,
        nextRole,
      },
    });

    res.json({
      message: `${targetUser.name}'s role updated to ${nextRole.replace("_", " ")}`,
      user: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: nextRole,
      },
    });
  } catch (error) {
    next(error);
  }
};
