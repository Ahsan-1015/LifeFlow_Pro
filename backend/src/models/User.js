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
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
