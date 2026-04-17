import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import AuthForm from "./AuthForm";
import { useAuth } from "../../context/AuthContext";

const getErrorMessage = (error) => {
  if (error.response?.status === 401) return "Invalid email or password.";
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ERR_NETWORK") {
    return "Backend server is not reachable on http://localhost:5000. Start the backend first and check your MongoDB connection string.";
  }
  return "Unable to log in right now. Please try again.";
};

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDemoLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await login({
        email: "testuser@example.com",
        password: "123456",
      });
      navigate("/");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || "Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await login(values);
      navigate("/");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Login"
      subtitle="Welcome back. Sign in to keep your team moving."
      fields={[
        { name: "email", label: "Email", type: "email", placeholder: "you@company.com" },
        { name: "password", label: "Password", type: "password", placeholder: "Enter your password" },
      ]}
      values={values}
      onChange={(event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      socialSlot={<GoogleAuthButton onClick={handleGoogleLogin} loading={loading} label="Continue with Google" />}
      footer={
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 font-semibold text-slate-700 transition hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100"
          >
            Continue With Demo Account
          </button>
          <span>
            New here? <Link to="/register" className="font-semibold text-brand-600">Create an account</Link>
          </span>
        </div>
      }
    />
  );
};

export default LoginPage;
