import mongoose from "mongoose";
import { APP_ROLES } from "../utils/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: {
      type: String,
      required: function requiredPassword() {
        return this.provider !== "google";
      },
      validate: {
        validator(value) {
          if (this.provider === "google") return true;
          return Boolean(value && value.length >= 6);
        },
        message: "Password must be at least 6 characters long",
      },
      default: undefined,
    },
    avatar: { type: String, default: "" },
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleUid: {
      type: String,
      default: "",
      index: true,
    },
    firebaseUid: {
      type: String,
      default: "",
      index: true,
    },
    role: {
      type: String,
      enum: [...APP_ROLES, "admin"],
      default: "member",
    },
    ownerAccessStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    ownerAccessRequestedAt: { type: Date, default: null },
    ownerAccessReviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
