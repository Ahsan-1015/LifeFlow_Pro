import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import AuthForm from "./AuthForm";
import { useAuth } from "../../context/AuthContext";

const getErrorMessage = (error) => {
  if (error.response?.status === 409) return "This email is already registered. Please log in instead.";
  if (error.response?.status === 400) return "Please fill in all fields correctly and use a password with at least 6 characters.";
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === "ERR_NETWORK") {
    return "Backend server is not reachable on http://localhost:5000. Start the backend first and check your MongoDB connection string.";
  }
  return "Unable to register right now. Please try again.";
};

const RegisterPage = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await register(values);
      navigate("/");
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message || "Google sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Register"
      subtitle="Set up your account and launch your first workspace."
      fields={[
        { name: "name", label: "Full name", type: "text", placeholder: "Rahim Ahmed" },
        { name: "email", label: "Email", type: "email", placeholder: "you@company.com" },
        { name: "password", label: "Password", type: "password", placeholder: "Minimum 6 characters" },
      ]}
      values={values}
      onChange={(event) => setValues((current) => ({ ...current, [event.target.name]: event.target.value }))}
      onSubmit={onSubmit}
      loading={loading}
      error={error}
      socialSlot={<GoogleAuthButton onClick={handleGoogleRegister} loading={loading} label="Sign up with Google" />}
      footer={
        <span>
          Already have an account? <Link to="/login" className="font-semibold text-brand-600">Sign in</Link>
        </span>
      }
    />
  );
};

export default RegisterPage;
