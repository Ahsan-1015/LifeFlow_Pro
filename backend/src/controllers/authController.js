import bcrypt from "bcryptjs";
import { getFirebaseAdmin, hasFirebaseAdminConfig } from "../config/firebaseAdmin.js";
import User from "../models/User.js";
import { createError } from "../utils/createError.js";
import { generateToken } from "../utils/generateToken.js";
import { normalizeRole } from "../utils/roles.js";

const syncFirebaseEmailPasswordUser = async ({ name, email, password }) => {
  if (!hasFirebaseAdminConfig()) {
    return { uid: "", created: false };
  }

  const firebaseAdmin = getFirebaseAdmin();

  try {
    const existingUser = await firebaseAdmin.auth().getUserByEmail(email);
    const updatedUser = await firebaseAdmin.auth().updateUser(existingUser.uid, {
      displayName: name,
      password,
    });

    return { uid: updatedUser.uid, created: false };
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }
  }

  const createdUser = await getFirebaseAdmin().auth().createUser({
    displayName: name,
    email,
    password,
  });

  return { uid: createdUser.uid, created: true };
};

const mapFirebaseAuthError = (error) => {
  if (error.code === "auth/email-already-exists") {
    return createError(409, "This email already exists in Firebase Authentication");
  }

  if (error.code === "auth/invalid-password" || error.code === "auth/password-does-not-meet-requirements") {
    return createError(400, "Password does not meet Firebase Authentication requirements");
  }

  if (error.code === "auth/invalid-email") {
    return createError(400, "Invalid email address for Firebase Authentication");
  }

  return createError(500, "Failed to sync user with Firebase Authentication");
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      throw createError(409, "Email is already registered");
    }

    let firebaseUid = "";
    let createdFirebaseUser = false;

    try {
      const firebaseResult = await syncFirebaseEmailPasswordUser({
        name,
        email: normalizedEmail,
        password,
      });
      firebaseUid = firebaseResult.uid;
      createdFirebaseUser = firebaseResult.created;
    } catch (error) {
      throw mapFirebaseAuthError(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let user;

    try {
      user = await User.create({
        name,
        email: normalizedEmail,
        password: hashedPassword,
        provider: "local",
        firebaseUid,
      });
    } catch (error) {
      if (createdFirebaseUser && firebaseUid && hasFirebaseAdminConfig()) {
        await getFirebaseAdmin().auth().deleteUser(firebaseUid).catch(() => {});
      }
      throw error;
    }

    res.status(201).json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: normalizeRole(user.role),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      throw createError(401, "Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw createError(401, "Invalid email or password");
    }

    res.json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: normalizeRole(user.role),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      throw createError(400, "Google ID token is required");
    }

    if (!hasFirebaseAdminConfig()) {
      throw createError(503, "Firebase Admin credentials are not configured on the backend");
    }

    const firebaseAdmin = getFirebaseAdmin();
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);

    if (!decodedToken.email) {
      throw createError(400, "Google account email is missing");
    }

    const normalizedEmail = decodedToken.email.trim().toLowerCase();
    let user =
      (await User.findOne({ googleUid: decodedToken.uid })) ||
      (await User.findOne({ email: normalizedEmail }));

    if (!user) {
      user = await User.create({
        name: decodedToken.name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        avatar: decodedToken.picture || "",
        provider: "google",
        googleUid: decodedToken.uid,
        firebaseUid: decodedToken.uid,
      });
    } else {
      user.name = decodedToken.name || user.name;
      user.avatar = decodedToken.picture || user.avatar;
      user.provider = "google";
      user.googleUid = decodedToken.uid;
      user.firebaseUid = decodedToken.uid;
      await user.save();
    }

    res.json({
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: normalizeRole(user.role),
        provider: user.provider,
      },
    });
  } catch (error) {
    if (!error.statusCode && error.code?.startsWith("auth/")) {
      error.statusCode = 401;
      error.message = "Google sign-in could not be verified";
    }

    next(error);
  }
};

export const getCurrentUser = async (req, res) => {
  res.json({
    user: {
      ...req.user.toObject(),
      role: normalizeRole(req.user.role),
    },
  });
};
