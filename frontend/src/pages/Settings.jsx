import { useEffect, useState } from "react";
import {
  User,
  Bell,
  CalendarDays,
  Shield,
  Save,
} from "lucide-react";
import { getMe, logout, updateMe } from "../api";
import { errorMessage } from "../utils";

function Settings() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    interests: [],
    preferences: {},
  });

  const [capacity, setCapacity] = useState(200);
  const [category, setCategory] = useState("technical");

  const [notifications, setNotifications] = useState({
    registration_updates: true,
    event_reminders: true,
    feedback_notifications: false,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then((data) => {
        const preferences = data.preferences || {};

        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          interests: data.interests || [],
          preferences,
        });

        setCapacity(
          preferences.default_capacity || 200
        );

        setCategory(
          preferences.default_category || "technical"
        );

        setNotifications({
          registration_updates:
            preferences.registration_updates ?? true,

          event_reminders:
            preferences.event_reminders ?? true,

          feedback_notifications:
            preferences.feedback_notifications ?? false,
        });
      })
      .catch((e) => setError(errorMessage(e)));
  }, []);

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
  console.log("SAVE BUTTON CLICKED");

  try {
    setMessage("");
    setError("");

    const preferences = {
      ...form.preferences,

      default_capacity: Number(capacity),
      default_category: category,

      registration_updates:
        notifications.registration_updates,

      event_reminders:
        notifications.event_reminders,

      feedback_notifications:
        notifications.feedback_notifications,
    };

    const updated = await updateMe({
      ...form,
      preferences,
    });

    setForm((current) => ({
      ...current,
      ...updated,
      preferences:
        updated.preferences || preferences,
    }));

    setMessage("Settings saved successfully.");
  } catch (e) {
    setError(errorMessage(e));
  }
};

  return (
    <section className="page-content admin-settings-page">
      <div className="page-heading">
        <div>
          <p className="welcome-text">College Events</p>

          <h1>Settings</h1>

          <p className="page-description">
            Manage your profile, preferences, notifications, and account
            settings.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={save}
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {message && (
        <p className="page-description">
          {message}
        </p>
      )}

      {error && (
        <p className="page-description">
          {error}
        </p>
      )}

      {/* Profile Settings */}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon blue">
            <User size={20} />
          </div>

          <div>
            <h2>Profile Settings</h2>

            <p>
              Update your personal and contact information.
            </p>
          </div>
        </div>

        <div className="settings-form">
          <div className="settings-field">
            <label>First Name</label>

            <input
              value={form.first_name}
              onChange={(e) =>
                setField("first_name", e.target.value)
              }
              placeholder="Enter your first name"
            />
          </div>

          <div className="settings-field">
            <label>Last Name</label>

            <input
              value={form.last_name}
              onChange={(e) =>
                setField("last_name", e.target.value)
              }
              placeholder="Enter your last name"
            />
          </div>

          <div className="settings-field">
            <label>Email Address</label>

            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setField("email", e.target.value)
              }
              placeholder="Enter your email"
            />
          </div>

          <div className="settings-field">
            <label>Phone Number</label>

            <input
              value={form.phone}
              onChange={(e) =>
                setField("phone", e.target.value)
              }
              placeholder="Enter your phone number"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon green">
            <Bell size={20} />
          </div>

          <div>
            <h2>Notifications</h2>

            <p>
              Choose which event updates you want to receive.
            </p>
          </div>
        </div>

        <div className="settings-options">
          <div className="settings-option">
            <div>
              <strong>Registration Updates</strong>

              <span>
                Receive notifications when participants register.
              </span>
            </div>

            <label className="toggle">
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

              <span></span>
            </label>
          </div>

          <div className="settings-option">
            <div>
              <strong>Event Reminders</strong>

              <span>
                Receive reminders about upcoming events.
              </span>
            </div>

            <label className="toggle">
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

              <span></span>
            </label>
          </div>

          <div className="settings-option">
            <div>
              <strong>Feedback Notifications</strong>

              <span>
                Get notified when participants submit feedback.
              </span>
            </div>

            <label className="toggle">
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

              <span></span>
            </label>
          </div>
        </div>
      </div>

      {/* Event Preferences */}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon purple">
            <CalendarDays size={20} />
          </div>

          <div>
            <h2>Event Preferences</h2>

            <p>
              Configure default settings for college events.
            </p>
          </div>
        </div>

        <div className="settings-form">
          <div className="settings-field">
            <label>Default Event Capacity</label>

            <input
              type="number"
              min="1"
              value={capacity}
              onChange={(e) =>
                setCapacity(e.target.value)
              }
              placeholder="Enter capacity"
            />
          </div>

          <div className="settings-field">
            <label>Default Event Category</label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              <option value="technical">
                Technical
              </option>

              <option value="cultural">
                Cultural
              </option>

              <option value="sports">
                Sports
              </option>

              <option value="workshop">
                Workshop
              </option>

              <option value="academic">
                Academic
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-icon orange">
            <Shield size={20} />
          </div>

          <div>
            <h2>Security</h2>

            <p>
              Manage your account security settings.
            </p>
          </div>
        </div>

        <div className="security-content">
          <div>
            <strong>Account</strong>

            <span>
              JWT authentication is active.
            </span>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </div>
    </section>
  );
}

export default Settings;