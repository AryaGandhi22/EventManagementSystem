import { useEffect, useState } from "react";
import {
  User,
  Shield,
  Bell,
  Save,
  LogOut,
} from "lucide-react";

import { getMe, logout, updateMe } from "../api";
import { errorMessage } from "../utils";

function AdminSettings() {
  const [form, setForm] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [notifications, setNotifications] = useState({
    registration_updates: true,
    event_reminders: true,
    feedback_notifications: false,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    loadAdminProfile();
  }, []);

  const loadAdminProfile = async () => {
    try {
      setError("");

      const data = await getMe();
      const preferences = data.preferences || {};

      setForm({
        username: data.username || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
      });

      setNotifications({
        registration_updates:
          preferences.registration_updates ?? true,
        event_reminders:
          preferences.event_reminders ?? true,
        feedback_notifications:
          preferences.feedback_notifications ?? false,
      });
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const setField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const setNotification = (field, value) => {
    setNotifications((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const save = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const currentUser = await getMe();

      const preferences = {
        ...(currentUser.preferences || {}),
        registration_updates:
          notifications.registration_updates,
        event_reminders:
          notifications.event_reminders,
        feedback_notifications:
          notifications.feedback_notifications,
      };

      const updated = await updateMe({
        username: form.username.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        preferences,
      });

      setForm({
        username: updated.username || "",
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
        email: updated.email || "",
        phone: updated.phone || "",
      });

      setMessage("Admin settings saved successfully.");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
  };

  return (
    <section className="page-content admin-settings-page">

      <div className="page-heading">
        <div>
          <p className="welcome-text">Administration</p>

          <h1>Admin Settings</h1>

          <p className="page-description">
            Manage your administrator profile, notifications, and account.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={save}
          disabled={saving}
        >
          <Save size={17} />

          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className="settings-message success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="settings-message error-message">
          {error}
        </div>
      )}

      <div className="settings-grid">

        {/* ADMIN PROFILE */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <User size={20} />
            </div>

            <div>
              <h2>Admin Profile</h2>

              <p>
                Update your administrator account information.
              </p>
            </div>

          </div>

          <div className="settings-form">

            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                value={form.username}
                onChange={(e) =>
                  setField("username", e.target.value)
                }
                placeholder="Enter username"
              />

              <small>
                Username must be unique.
              </small>
            </div>

            <div className="form-row">

              <div className="form-group">
                <label>First Name</label>

                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) =>
                    setField("first_name", e.target.value)
                  }
                  placeholder="Enter first name"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>

                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) =>
                    setField("last_name", e.target.value)
                  }
                  placeholder="Enter last name"
                />
              </div>

            </div>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setField("email", e.target.value)
                }
                placeholder="Enter email address"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="text"
                value={form.phone}
                onChange={(e) =>
                  setField("phone", e.target.value)
                }
                placeholder="Enter phone number"
              />
            </div>

          </div>
        </div>

        {/* SECURITY */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Shield size={20} />
            </div>

            <div>
              <h2>Account & Security</h2>

              <p>
                View your administrator account status.
              </p>
            </div>

          </div>

          <div className="account-info">

            <div className="account-info-row">
              <span>Role</span>
              <strong>Administrator</strong>
            </div>

            <div className="account-info-row">
              <span>Account Status</span>

              <strong className="status-active">
                Active
              </strong>
            </div>

            <div className="account-info-row">
              <span>Authentication</span>

              <strong>JWT Authentication</strong>
            </div>

          </div>

          <div className="security-note">
            Your administrator session is protected using
            token-based authentication.
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

        {/* NOTIFICATIONS */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-icon">
              <Bell size={20} />
            </div>

            <div>
              <h2>Notification Preferences</h2>

              <p>
                Choose which event-related notifications you prefer.
              </p>
            </div>

          </div>

          <div className="notification-list">

            <div className="notification-row">

              <div>
                <h3>Registration Updates</h3>

                <p>
                  Receive updates related to event registrations.
                </p>
              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications.registration_updates}
                  onChange={(e) =>
                    setNotification(
                      "registration_updates",
                      e.target.checked
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

            <div className="notification-row">

              <div>
                <h3>Event Reminders</h3>

                <p>
                  Keep event reminder preferences enabled or disabled.
                </p>
              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications.event_reminders}
                  onChange={(e) =>
                    setNotification(
                      "event_reminders",
                      e.target.checked
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

            <div className="notification-row">

              <div>
                <h3>Feedback Notifications</h3>

                <p>
                  Store your preference for feedback-related updates.
                </p>
              </div>

              <label className="switch">

                <input
                  type="checkbox"
                  checked={notifications.feedback_notifications}
                  onChange={(e) =>
                    setNotification(
                      "feedback_notifications",
                      e.target.checked
                    )
                  }
                />

                <span className="slider"></span>

              </label>

            </div>

          </div>

        </div>

      </div>

      {/* ── Logout confirmation modal ── */}
      {showLogoutConfirm && (
        <div className="logout-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="logout-confirm-card">
            <div className="logout-confirm-icon">
              <LogOut size={28} />
            </div>
            <h3 id="logout-title">Sign out?</h3>
            <p>You'll need to sign in again to access your account.</p>
            <div className="logout-confirm-actions">
              <button
                type="button"
                className="logout-confirm-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="logout-confirm-proceed"
                onClick={confirmLogout}
              >
                <LogOut size={15} /> Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

export default AdminSettings;