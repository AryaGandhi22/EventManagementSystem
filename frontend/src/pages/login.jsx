import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  UserPlus,
  User,
  Phone,
} from "lucide-react";

import { loginUser, registerUser } from "../api";

/* ─────────────────────────────────────────────────────────────── */
/*  Helpers                                                         */
/* ─────────────────────────────────────────────────────────────── */
function clearOldSession() {
  [
    "access_token",
    "refresh_token",
    "current_user",
    "user_role",
    "college_event_access",
    "college_event_refresh",
    "college_event_user",
  ].forEach((k) => localStorage.removeItem(k));
}

function saveSession(data, role) {
  const pairs = [
    ["college_event_access", data.access],
    ["college_event_refresh", data.refresh],
    ["college_event_user", data.user ? JSON.stringify(data.user) : null],
    ["access_token", data.access],
    ["refresh_token", data.refresh],
    ["current_user", data.user ? JSON.stringify(data.user) : null],
    ["user_role", role],
  ];
  pairs.forEach(([k, v]) => {
    if (v) {
      sessionStorage.setItem(k, v);
      localStorage.setItem(k, v);
    }
  });
}

/* ─────────────────────────────────────────────────────────────── */
/*  Component                                                       */
/* ─────────────────────────────────────────────────────────────── */
function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // "signin" | "register"
  const [mode, setMode] = useState("signin");

  // Show signed-out banner if redirected from logout
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signedout") === "1") {
      setSignedOut(true);
      // Auto-dismiss after 5 seconds
      const t = setTimeout(() => setSignedOut(false), 5000);
      // Clean the URL
      window.history.replaceState({}, "", "/login");
      return () => clearTimeout(t);
    }
  }, [location.search]);

  /* ── Sign-in state ── */
  const [signIn, setSignIn] = useState({ email: "", password: "" });
  const [selectedRole, setSelectedRole] = useState("");

  /* ── Register state ── */
  const [reg, setReg] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student",           // "student" | "organizer"
  });

  /* ── Shared state ── */
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ── Handlers ── */
  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignIn((p) => ({ ...p, [name]: value }));
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setReg((p) => ({ ...p, [name]: value }));
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setSuccess("");
  };

  /* ── Sign-in submit ── */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedRole) return setError("Please select your role.");
    if (!signIn.email.trim()) return setError("Please enter your username.");
    if (!signIn.password) return setError("Please enter your password.");

    try {
      setLoading(true);
      clearOldSession();

      const data = await loginUser({
        username: signIn.email.trim(),
        password: signIn.password,
      });

      const actualRole = String(data?.role || "").toLowerCase();

      if (selectedRole !== actualRole) {
        clearOldSession();
        return setError(`This account is not registered as ${selectedRole}.`);
      }

      saveSession(data, actualRole);

      if (actualRole === "admin") return navigate("/admin", { replace: true });
      if (actualRole === "organizer") return navigate("/organizer", { replace: true });
      if (actualRole === "student") return navigate("/student", { replace: true });

      clearOldSession();
      setError("Your account does not have a valid role.");
    } catch (err) {
      clearOldSession();
      const d = err?.data;
      setError(
        typeof d === "string"
          ? d
          : d?.detail || d?.message || d?.non_field_errors?.[0]
          || "Unable to login. Please check your username and password."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Register submit ── */
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!reg.firstName.trim()) return setError("First name is required.");
    if (!reg.username.trim()) return setError("Username is required.");
    if (!reg.email.trim()) return setError("Email is required.");
    if (reg.password.length < 8) return setError("Password must be at least 8 characters.");
    if (reg.password !== reg.confirmPassword) return setError("Passwords do not match.");

    try {
      setLoading(true);

      // 1) Create the account
      await registerUser({
        username: reg.username.trim(),
        email: reg.email.trim(),
        password: reg.password,
        first_name: reg.firstName.trim(),
        last_name: reg.lastName.trim(),
        phone: reg.phone.trim(),
        role: reg.role,           // "student" or "organizer"
      });


      // 2) Auto-login after registration
      clearOldSession();
      const data = await loginUser({
        username: reg.username.trim(),
        password: reg.password,
      });

      const actualRole = String(data?.role || "").toLowerCase();

      // New accounts have no group yet — backend returns empty role.
      // Show a success message and redirect to login so they pick their role.
      if (!actualRole) {
        setSuccess(
          "Account created! Your account is pending role assignment by an admin. Please sign in once approved."
        );
        clearOldSession();
        return;
      }

      saveSession(data, actualRole);

      if (actualRole === "organizer") return navigate("/organizer", { replace: true });
      if (actualRole === "student") return navigate("/student", { replace: true });

      setSuccess("Account created! Please sign in.");
      clearOldSession();
      switchMode("signin");
    } catch (err) {
      const d = err?.data;
      if (d && typeof d === "object") {
        const first = Object.entries(d)[0];
        if (first) {
          const [field, msgs] = first;
          const msg = Array.isArray(msgs) ? msgs[0] : msgs;
          setError(`${field}: ${msg}`);
          return;
        }
      }
      setError(
        typeof d === "string"
          ? d
          : d?.detail || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────── UI ─────────────────────────────── */
  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: mode === "register" ? 480 : 420 }}>

        {/* Signed-out banner */}
        {signedOut && (
          <div className="login-signedout-banner" role="status">
            <span>✓</span>
            <span>You've been signed out successfully.</span>
          </div>
        )}

        {/* Logo */}
        <div className="login-logo">E</div>

        {/* Header */}
        <div className="login-card-header">
          <h1>EventHub</h1>
          <h2>{mode === "signin" ? "Welcome back" : "Create account"}</h2>
          <p>
            {mode === "signin"
              ? "Sign in to continue to your college events"
              : "Register to join college events"}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="login-mode-toggle">
          <button
            type="button"
            className={`login-mode-btn${mode === "signin" ? " active" : ""}`}
            onClick={() => switchMode("signin")}
            disabled={loading}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`login-mode-btn${mode === "register" ? " active" : ""}`}
            onClick={() => switchMode("register")}
            disabled={loading}
          >
            Create Account
          </button>
        </div>

        {/* ═══════════════ SIGN IN FORM ═══════════════ */}
        {mode === "signin" && (
          <>
            {/* Role Selection */}
            <div className="login-role-section">
              <label>Sign in as</label>
              <div className="login-role-buttons">
                {["organizer", "student", "admin"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`login-role-button${selectedRole === r ? " active" : ""}`}
                    onClick={() => { setSelectedRole(r); setError(""); }}
                    disabled={loading}
                  >
                    {r === "student" ? "Participant" : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSignIn} className="login-form">
              {/* Username */}
              <div className="login-field">
                <label htmlFor="si-email">Username</label>
                <div className="login-input-wrapper">
                  <Mail size={18} />
                  <input
                    id="si-email"
                    name="email"
                    type="text"
                    value={signIn.email}
                    onChange={handleSignInChange}
                    placeholder="Enter your username"
                    autoComplete="username"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="login-field">
                <label htmlFor="si-password">Password</label>
                <div className="login-input-wrapper">
                  <LockKeyhole size={18} />
                  <input
                    id="si-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={signIn.password}
                    onChange={handleSignInChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((p) => !p)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="login-error" role="alert">{error}</div>}
              {success && <div className="login-success" role="status">{success}</div>}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Signing in…" : <><span>Sign In</span><ArrowRight size={17} /></>}
              </button>
            </form>

            <div className="login-footer">
              <span>Don't have an account? </span>
              <button
                type="button"
                className="login-link-btn"
                onClick={() => switchMode("register")}
                disabled={loading}
              >
                Create one
              </button>
            </div>
          </>
        )}

        {/* ═══════════════ REGISTER FORM ═══════════════ */}
        {mode === "register" && (
          <form onSubmit={handleRegister} className="login-form">

            {/* Role picker */}
            <div className="login-role-section">
              <label>Register as</label>
              <div className="login-role-buttons">
                {[
                  { value: "student", label: "Participant" },
                  { value: "organizer", label: "Organizer" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    className={`login-role-button${reg.role === value ? " active" : ""}`}
                    onClick={() => { setReg((p) => ({ ...p, role: value })); setError(""); }}
                    disabled={loading}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "0.75rem", color: "#888", marginTop: 4 }}>
                Admin accounts are created by an existing admin.
              </p>
            </div>

            {/* Name row */}
            <div style={{ display: "flex", gap: 10 }}>
              <div className="login-field" style={{ flex: 1 }}>
                <label htmlFor="reg-fname">First Name *</label>
                <div className="login-input-wrapper">
                  <User size={16} />
                  <input
                    id="reg-fname"
                    name="firstName"
                    type="text"
                    value={reg.firstName}
                    onChange={handleRegChange}
                    placeholder="First name"
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="login-field" style={{ flex: 1 }}>
                <label htmlFor="reg-lname">Last Name</label>
                <div className="login-input-wrapper">
                  <User size={16} />
                  <input
                    id="reg-lname"
                    name="lastName"
                    type="text"
                    value={reg.lastName}
                    onChange={handleRegChange}
                    placeholder="Last name"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Username */}
            <div className="login-field">
              <label htmlFor="reg-username">Username *</label>
              <div className="login-input-wrapper">
                <User size={18} />
                <input
                  id="reg-username"
                  name="username"
                  type="text"
                  value={reg.username}
                  onChange={handleRegChange}
                  placeholder="Choose a username"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="login-field">
              <label htmlFor="reg-email">Email *</label>
              <div className="login-input-wrapper">
                <Mail size={18} />
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  value={reg.email}
                  onChange={handleRegChange}
                  placeholder="your@email.com"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="login-field">
              <label htmlFor="reg-phone">Phone</label>
              <div className="login-input-wrapper">
                <Phone size={18} />
                <input
                  id="reg-phone"
                  name="phone"
                  type="tel"
                  value={reg.phone}
                  onChange={handleRegChange}
                  placeholder="+91 98765 43210"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="reg-password">Password * (min 8 chars)</label>
              <div className="login-input-wrapper">
                <LockKeyhole size={18} />
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={reg.password}
                  onChange={handleRegChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? "Hide" : "Show"}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="login-field">
              <label htmlFor="reg-confirm">Confirm Password *</label>
              <div className="login-input-wrapper">
                <LockKeyhole size={18} />
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={reg.confirmPassword}
                  onChange={handleRegChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm((p) => !p)}
                  aria-label={showConfirm ? "Hide" : "Show"}
                  disabled={loading}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="login-error" role="alert">{error}</div>}
            {success && <div className="login-success" role="status">{success}</div>}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading
                ? "Creating account…"
                : <><UserPlus size={17} /><span>Create Account</span></>}
            </button>

            <div className="login-footer">
              <span>Already have an account? </span>
              <button
                type="button"
                className="login-link-btn"
                onClick={() => switchMode("signin")}
                disabled={loading}
              >
                Sign in
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

export default Login;