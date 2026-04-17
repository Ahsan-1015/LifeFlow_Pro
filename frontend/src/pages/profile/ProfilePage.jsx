import { useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import { normalizeRole, roleLabels } from "../../utils/roles";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const role = normalizeRole(user?.role);
  const canRequestOwnerAccess = !["owner", "super_admin"].includes(role);
  const [name, setName] = useState(user?.name || "");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ownerAccessStatus, setOwnerAccessStatus] = useState(user?.ownerAccessStatus || "none");

  const getErrorMessage = (err, fallback) => err.response?.data?.message || fallback;

  const updateProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const { data } = await api.put("/profile", { name });
      updateUser(data);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update profile."));
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.put("/profile/password", passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      setMessage("Password updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to update password."));
    }
  };

  const uploadAvatar = async (event) => {
    event.preventDefault();
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("file", avatarFile);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/profile/avatar", formData);
      updateUser(data);
      setAvatarFile(null);
      setMessage("Avatar uploaded successfully.");
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Avatar upload failed. Please verify your Cloudinary credentials and try a small image file."
        )
      );
    }
  };

  const requestOwnerAccess = async () => {
    setError("");
    setMessage("");
    try {
      const { data } = await api.post("/profile/request-owner-access");
      setOwnerAccessStatus(data.ownerAccessStatus || "pending");
      setMessage(data.message || "Owner access request submitted.");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to submit owner access request."));
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-500">Account Settings</p>
        <h2 className="mt-3 font-display text-3xl font-bold">Profile, security, and access</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
          Update your personal details, change your password, upload an avatar, and manage workspace access requests from one place.
        </p>
      </div>

      <div className="space-y-3">
        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="glass-panel rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Identity</p>
            <div className="mt-5 flex items-center gap-4">
              <img
                src={user?.avatar || "https://placehold.co/120x120"}
                alt={user?.name}
                className="h-24 w-24 rounded-3xl object-cover"
              />
              <div className="min-w-0">
                <h3 className="font-display text-2xl font-bold">{user?.name}</h3>
                <p className="mt-1 truncate text-sm text-slate-500">{user?.email}</p>
                <div className="mt-4 inline-flex rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300">
                  {roleLabels[role]}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={updateProfile} className="glass-panel rounded-[2rem] p-6">
            <h3 className="font-display text-2xl font-bold">Profile Details</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Keep your personal name and account identity up to date across the workspace.
            </p>
            <div className="mt-5">
              <label className="label-text">Name</label>
              <input value={name} onChange={(event) => setName(event.target.value)} className="input-field" />
            </div>
            <button type="submit" className="gradient-button mt-6 w-full">
              Save Profile
            </button>
          </form>
        </div>

        <div className="space-y-6">
          {canRequestOwnerAccess ? (
            <div className="glass-panel rounded-[2rem] p-6">
              <h3 className="font-display text-2xl font-bold">Access Settings</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Request project owner approval when you need to create projects, add managers, and control delivery.
              </p>
              <div className="mt-5 rounded-[1.5rem] bg-slate-100 p-4 dark:bg-slate-800/70">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    Status: {ownerAccessStatus}
                  </span>
                  <button
                    type="button"
                    onClick={requestOwnerAccess}
                    disabled={ownerAccessStatus === "pending"}
                    className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-brand-500 dark:hover:bg-brand-400"
                  >
                    {ownerAccessStatus === "pending" ? "Request Pending" : "Request Owner Access"}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <form onSubmit={changePassword} className="glass-panel rounded-[2rem] p-6">
            <h3 className="font-display text-2xl font-bold">Security</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Change your password to keep your account secure.
            </p>
            <div className="mt-5 space-y-4">
              <input
                type="password"
                className="input-field"
                placeholder="Current password"
                value={passwords.currentPassword}
                onChange={(event) =>
                  setPasswords((current) => ({ ...current, currentPassword: event.target.value }))
                }
              />
              <input
                type="password"
                className="input-field"
                placeholder="New password"
                value={passwords.newPassword}
                onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))}
              />
            </div>
            <button type="submit" className="gradient-button mt-6 w-full">
              Update Password
            </button>
          </form>

          <form onSubmit={uploadAvatar} className="glass-panel rounded-[2rem] p-6">
            <h3 className="font-display text-2xl font-bold">Avatar & Appearance</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Upload a profile image so teammates can recognize you across comments, boards, and dashboards.
            </p>
            <input
              type="file"
              accept="image/*"
              className="mt-5 block w-full text-sm"
              onChange={(event) => setAvatarFile(event.target.files?.[0] || null)}
            />
            <button type="submit" className="gradient-button mt-6 w-full">
              Upload Avatar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
