import { getFirebaseAdmin, hasFirebaseAdminConfig } from "../config/firebaseAdmin.js";
import User from "../models/User.js";
import { createNotification } from "../services/notificationService.js";
import { createError } from "../utils/createError.js";
import { APP_ROLES, normalizeRole } from "../utils/roles.js";

const allowedManagedRoles = [...APP_ROLES];

const syncFirebaseAccessState = async (user, disabled) => {
  if (!user?.firebaseUid || !hasFirebaseAdminConfig()) return;

  await getFirebaseAdmin()
    .auth()
    .updateUser(user.firebaseUid, { disabled })
    .catch(() => {});
};

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
    if (nextRole === "owner") {
      targetUser.ownerAccessStatus = "approved";
      targetUser.ownerAccessReviewedAt = new Date();
      targetUser.ownerAccessRequestedAt = targetUser.ownerAccessRequestedAt || new Date();
    } else if (previousRole === "owner" && nextRole !== "owner") {
      targetUser.ownerAccessStatus = "none";
      targetUser.ownerAccessRequestedAt = null;
      targetUser.ownerAccessReviewedAt = null;
    }
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

export const approveOwnerAccess = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId).select("-password");

    if (!targetUser) {
      throw createError(404, "User not found");
    }

    if (String(targetUser._id) === String(req.user._id)) {
      throw createError(400, "You cannot approve your own owner access");
    }

    targetUser.role = "owner";
    targetUser.ownerAccessStatus = "approved";
    targetUser.ownerAccessReviewedAt = new Date();
    targetUser.ownerAccessRequestedAt = targetUser.ownerAccessRequestedAt || new Date();
    await targetUser.save();

    await createNotification(req.io, {
      userId: targetUser._id,
      message: `Your owner access was approved by ${req.user.name}`,
      type: "owner_access_approved",
      metadata: {
        approvedBy: req.user._id,
      },
    });

    res.json({
      message: `${targetUser.name} is now approved as a project owner`,
      user: {
        _id: targetUser._id,
        role: "owner",
        ownerAccessStatus: targetUser.ownerAccessStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const rejectOwnerAccess = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId).select("-password");

    if (!targetUser) {
      throw createError(404, "User not found");
    }

    if (String(targetUser._id) === String(req.user._id)) {
      throw createError(400, "You cannot reject your own owner access");
    }

    targetUser.ownerAccessStatus = "rejected";
    targetUser.ownerAccessReviewedAt = new Date();
    if (normalizeRole(targetUser.role) === "owner") {
      targetUser.role = "member";
    }
    await targetUser.save();

    await createNotification(req.io, {
      userId: targetUser._id,
      message: `Your owner access request was declined by ${req.user.name}`,
      type: "owner_access_rejected",
      metadata: {
        rejectedBy: req.user._id,
      },
    });

    res.json({
      message: `${targetUser.name}'s owner access request was declined`,
      user: {
        _id: targetUser._id,
        role: normalizeRole(targetUser.role),
        ownerAccessStatus: targetUser.ownerAccessStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserBlockStatus = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId).select("-password");

    if (!targetUser) {
      throw createError(404, "User not found");
    }

    if (String(targetUser._id) === String(req.user._id)) {
      throw createError(400, "You cannot block your own account");
    }

    if (targetUser.isDeleted) {
      throw createError(400, "Deleted accounts cannot be updated");
    }

    const shouldBlock = Boolean(req.body.blocked);

    targetUser.isBlocked = shouldBlock;
    targetUser.blockedAt = shouldBlock ? new Date() : null;
    await targetUser.save();
    await syncFirebaseAccessState(targetUser, shouldBlock);

    await createNotification(req.io, {
      userId: targetUser._id,
      message: shouldBlock
        ? `Your account was blocked by ${req.user.name}`
        : `Your account was restored by ${req.user.name}`,
      type: shouldBlock ? "account_blocked" : "account_restored",
      metadata: {
        blocked: shouldBlock,
      },
    });

    res.json({
      message: shouldBlock
        ? `${targetUser.name} has been blocked`
        : `${targetUser.name} has been restored`,
      user: {
        _id: targetUser._id,
        isBlocked: targetUser.isBlocked,
        blockedAt: targetUser.blockedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserAccount = async (req, res, next) => {
  try {
    const targetUser = await User.findById(req.params.userId).select("-password");

    if (!targetUser) {
      throw createError(404, "User not found");
    }

    if (String(targetUser._id) === String(req.user._id)) {
      throw createError(400, "You cannot delete your own account");
    }

    if (targetUser.isDeleted) {
      return res.json({
        message: `${targetUser.name} is already deleted`,
        user: {
          _id: targetUser._id,
          isDeleted: true,
        },
      });
    }

    targetUser.isDeleted = true;
    targetUser.deletedAt = new Date();
    targetUser.isBlocked = true;
    targetUser.blockedAt = targetUser.blockedAt || new Date();
    await targetUser.save();
    await syncFirebaseAccessState(targetUser, true);

    res.json({
      message: `${targetUser.name} has been deleted`,
      user: {
        _id: targetUser._id,
        isDeleted: true,
        deletedAt: targetUser.deletedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};
