import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
} from "lucide-react";

import { loginUser } from "../api";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [selectedRole, setSelectedRole] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!selectedRole) {
      setError("Please select your role.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your username.");
      return;
    }

    if (!form.password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginUser({
        username: form.email.trim(),
        password: form.password,
      });

      if (data?.access) {
        localStorage.setItem("access_token", data.access);
      }

      if (data?.refresh) {
        localStorage.setItem("refresh_token", data.refresh);
      }

      if (data?.user) {
        localStorage.setItem(
          "current_user",
          JSON.stringify(data.user)
        );
      }

      if (data?.role) {
        localStorage.setItem("user_role", data.role);
      }

      const actualRole = String(data?.role || "").toLowerCase();

      // Check selected role against actual backend role
      if (selectedRole !== actualRole) {
        setError(
          `This account is not registered as ${selectedRole}.`
        );
        return;
      }

      // Role-based navigation
      if (actualRole === "admin") {
        navigate("/admin");
        return;
      }

      if (actualRole === "organizer") {
        navigate("/organizer");
        return;
      }

      if (actualRole === "student") {
        navigate("/student");
        return;
      }

      setError("Your account does not have a valid role.");
    } catch (e) {
      console.error("Login error:", e);

      const responseData = e?.data;

      if (typeof responseData === "string") {
        setError(responseData);
      } else if (responseData?.detail) {
        setError(responseData.detail);
      } else if (responseData?.message) {
        setError(responseData.message);
      } else if (responseData?.non_field_errors) {
        setError(
          Array.isArray(responseData.non_field_errors)
            ? responseData.non_field_errors[0]
            : responseData.non_field_errors
        );
      } else {
        setError(
          "Unable to login. Please check your username and password."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          E
        </div>

        {/* Header */}
        <div className="login-card-header">
          <h1>EventHub</h1>
          <h2>Welcome back</h2>
          <p>
            Sign in to continue to your college events
          </p>
        </div>

        {/* Role Selection */}
        <div className="login-role-section">
          <label>
            Sign in as
          </label>

          <div className="login-role-buttons">
            <button
              type="button"
              className={`login-role-button ${
                selectedRole === "organizer"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setSelectedRole("organizer");
                setError("");
              }}
              disabled={loading}
            >
              Organizer
            </button>

            <button
              type="button"
              className={`login-role-button ${
                selectedRole === "student"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setSelectedRole("student");
                setError("");
              }}
              disabled={loading}
            >
              Participant
            </button>

            <button
              type="button"
              className={`login-role-button ${
                selectedRole === "admin"
                  ? "active"
                  : ""
              }`}
              onClick={() => {
                setSelectedRole("admin");
                setError("");
              }}
              disabled={loading}
            >
              Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="login-form"
        >
          {/* Username */}
          <div className="login-field">
            <label htmlFor="email">
              Username
            </label>

            <div className="login-input-wrapper">
              <Mail size={18} />

              <input
                id="email"
                name="email"
                type="text"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your username"
                autoComplete="username"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password">
              Password
            </label>

            <div className="login-input-wrapper">
              <LockKeyhole size={18} />

              <input
                id="password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    (old) => !old
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign In
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <span>
            College Event Management System
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;