import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Lock,
  Save,
  Mail,
  Smartphone,
} from "lucide-react";
import { getMe } from "../api";

function StudentSettings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "Computer Engineering", // Not yet in backend model, kept as static for now
    year: "Final Year",
  });

  useEffect(() => {
    getMe().then((data) => {
      if (data && data.id) {
        setProfile((prev) => ({
          ...prev,
          name: `${data.first_name} ${data.last_name}`.trim() || data.username,
          email: data.email || "",
          phone: data.phone || "",
        }));
      }
    }).catch(() => {});
  }, []);

  const [notifications, setNotifications] = useState({
    eventReminders: true,
    registrationUpdates: true,
    newEvents: true,
    emailNotifications: true,
  });

  const [message, setMessage] = useState("");

  const handleProfileChange = (field, value) => {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    setMessage("Profile settings saved successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleNotificationChange = (field) => {
    setNotifications((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  return (
    <section className="student-settings-page">

      {/* HEADER */}
      <div className="student-page-heading">
        <div>
          <div className="student-welcome">
            STUDENT SETTINGS
          </div>

          <h1>Settings</h1>

          <p>
            Manage your profile, notifications,
            and account preferences.
          </p>
        </div>
      </div>

      {message && (
        <div className="student-settings-success">
          <Save size={16} />
          {message}
        </div>
      )}

      {/* PROFILE */}
      <div className="student-settings-card">

        <div className="student-settings-card-header">
          <div className="student-settings-icon blue">
            <User size={21} />
          </div>

          <div>
            <h2>Profile Information</h2>
            <p>
              Update your personal and academic
              information.
            </p>
          </div>
        </div>

        <div className="student-settings-form">

          <div className="student-settings-field">
            <label>Full Name</label>

            <input
              type="text"
              value={profile.name}
              onChange={(e) =>
                handleProfileChange(
                  "name",
                  e.target.value
                )
              }
            />
          </div>

          <div className="student-settings-field">
            <label>Email Address</label>

            <div className="student-settings-input-icon">
              <Mail size={15} />

              <input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  handleProfileChange(
                    "email",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="student-settings-field">
            <label>Phone Number</label>

            <div className="student-settings-input-icon">
              <Smartphone size={15} />

              <input
                type="tel"
                value={profile.phone}
                placeholder="Enter phone number"
                onChange={(e) =>
                  handleProfileChange(
                    "phone",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          <div className="student-settings-field">
            <label>Department</label>

            <select
              value={profile.department}
              onChange={(e) =>
                handleProfileChange(
                  "department",
                  e.target.value
                )
              }
            >
              <option>Computer Engineering</option>
              <option>Information Technology</option>
              <option>Electronics Engineering</option>
              <option>Mechanical Engineering</option>
              <option>Civil Engineering</option>
              <option>Other</option>
            </select>
          </div>

          <div className="student-settings-field">
            <label>Academic Year</label>

            <select
              value={profile.year}
              onChange={(e) =>
                handleProfileChange(
                  "year",
                  e.target.value
                )
              }
            >
              <option>First Year</option>
              <option>Second Year</option>
              <option>Third Year</option>
              <option>Final Year</option>
            </select>
          </div>

        </div>

        <div className="student-settings-actions">
          <button
            type="button"
            className="primary-button"
            onClick={handleSaveProfile}
          >
            <Save size={15} />
            Save Changes
          </button>
        </div>

      </div>

      {/* NOTIFICATIONS */}
      <div className="student-settings-card">

        <div className="student-settings-card-header">
          <div className="student-settings-icon purple">
            <Bell size={21} />
          </div>

          <div>
            <h2>Notification Preferences</h2>
            <p>
              Choose which notifications you want
              to receive.
            </p>
          </div>
        </div>

        <div className="student-settings-options">

          <div className="student-settings-option">
            <div>
              <strong>Event Reminders</strong>
              <span>
                Receive reminders before registered
                events.
              </span>
            </div>

            <label className="student-toggle">
              <input
                type="checkbox"
                checked={
                  notifications.eventReminders
                }
                onChange={() =>
                  handleNotificationChange(
                    "eventReminders"
                  )
                }
              />
              <span />
            </label>
          </div>

          <div className="student-settings-option">
            <div>
              <strong>Registration Updates</strong>
              <span>
                Get updates when your registration
                status changes.
              </span>
            </div>

            <label className="student-toggle">
              <input
                type="checkbox"
                checked={
                  notifications.registrationUpdates
                }
                onChange={() =>
                  handleNotificationChange(
                    "registrationUpdates"
                  )
                }
              />
              <span />
            </label>
          </div>

          <div className="student-settings-option">
            <div>
              <strong>New Events</strong>
              <span>
                Get notified when new campus events
                are published.
              </span>
            </div>

            <label className="student-toggle">
              <input
                type="checkbox"
                checked={
                  notifications.newEvents
                }
                onChange={() =>
                  handleNotificationChange(
                    "newEvents"
                  )
                }
              />
              <span />
            </label>
          </div>

          <div className="student-settings-option">
            <div>
              <strong>Email Notifications</strong>
              <span>
                Receive important event updates by
                email.
              </span>
            </div>

            <label className="student-toggle">
              <input
                type="checkbox"
                checked={
                  notifications.emailNotifications
                }
                onChange={() =>
                  handleNotificationChange(
                    "emailNotifications"
                  )
                }
              />
              <span />
            </label>
          </div>

        </div>

      </div>

      {/* SECURITY */}
      <div className="student-settings-card">

        <div className="student-settings-card-header">
          <div className="student-settings-icon green">
            <Lock size={21} />
          </div>

          <div>
            <h2>Account Security</h2>
            <p>
              Manage your account security.
            </p>
          </div>
        </div>

        <div className="student-security-row">

          <div>
            <strong>Password</strong>
            <span>
              Change your account password.
            </span>
          </div>

          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              alert(
                "Password change will be connected to the backend later."
              )
            }
          >
            Change Password
          </button>

        </div>

      </div>

    </section>
  );
}

export default StudentSettings;