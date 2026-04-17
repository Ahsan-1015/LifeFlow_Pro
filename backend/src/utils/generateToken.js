import jwt from "jsonwebtoken";
import { normalizeRole } from "./roles.js";

const getExpiresIn = () => {
  const rawValue = process.env.JWT_EXPIRES_IN?.trim();

  if (!rawValue) return "7d";
  if (/^\d+$/.test(rawValue)) return Number(rawValue);
  if (/^\d+(ms|s|m|h|d|w|y)$/.test(rawValue)) return rawValue;

  return "7d";
};

export const generateToken = (userId, role = "member") =>
  jwt.sign({ userId, role: normalizeRole(role) }, process.env.JWT_SECRET, {
    expiresIn: getExpiresIn(),
  });
