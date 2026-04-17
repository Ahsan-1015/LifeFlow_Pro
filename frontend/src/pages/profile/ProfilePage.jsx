import { useState } from "react";
import api from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-3 space-y-3">
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
      <div className="glass-panel rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-brand-500">Identity</p>
        <img
          src={user?.avatar || "https://placehold.co/120x120"}
          alt={user?.name}
          className="mt-5 h-24 w-24 rounded-3xl object-cover"
        />
        <h3 className="mt-4 font-display text-2xl font-bold">{user?.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
      </div>

      <form onSubmit={updateProfile} className="glass-panel rounded-[2rem] p-6">
        <h3 className="font-display text-2xl font-bold">Update Profile</h3>
        <div className="mt-5">
          <label className="label-text">Name</label>
          <input value={name} onChange={(event) => setName(event.target.value)} className="input-field" />
        </div>
        <button type="submit" className="gradient-button mt-6 w-full">
          Save Profile
        </button>
      </form>

      <div className="space-y-6">
        <form onSubmit={changePassword} className="glass-panel rounded-[2rem] p-6">
          <h3 className="font-display text-2xl font-bold">Change Password</h3>
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
          <h3 className="font-display text-2xl font-bold">Upload Avatar</h3>
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
  );
};

export default ProfilePage;
