import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { hasRoleAccess, normalizeRole } from "../utils/roles.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.isDeleted) {
      return res.status(403).json({ message: "This account is no longer available" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "This account has been blocked by an administrator" });
    }

    user.role = normalizeRole(user.role);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!hasRoleAccess(req.user.role, allowedRoles)) {
      return res.status(403).json({ message: "You do not have permission to access this resource" });
    }

    next();
  };
