import { useEffect, useState } from "react";
import { User, Bell, CalendarDays, Shield, Save } from "lucide-react";
import { getMe, logout, updateMe } from "../api";
import { errorMessage } from "../utils";

function Settings() {
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", phone: "", interests: [], preferences: {} });
  const [capacity, setCapacity] = useState(200);
  const [category, setCategory] = useState("technical");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMe().then((data) => {
      setForm({ first_name: data.first_name || "", last_name: data.last_name || "", email: data.email || "", phone: data.phone || "", interests: data.interests || [], preferences: data.preferences || {} });
      setCapacity(data.preferences?.default_capacity || 200);
      setCategory(data.preferences?.default_category || "technical");
    }).catch((e) => setError(errorMessage(e)));
  }, []);

  const setField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const save = async () => {
    try {
      const updated = await updateMe({ ...form, preferences: { ...form.preferences, default_capacity: Number(capacity), default_category: category } });
      setForm((current) => ({ ...current, ...updated }));
      setMessage("Settings saved successfully."); setError("");
    } catch (e) { setError(errorMessage(e)); }
  };

  return (
    <section className="page-content">
      <div className="page-heading"><div><p className="welcome-text">College Events</p><h1>Settings</h1><p className="page-description">Manage your profile, preferences, notifications, and account settings.</p></div><button className="primary-button" type="button" onClick={save}><Save size={17} /> Save Changes</button></div>
      {message && <p className="page-description">{message}</p>}{error && <p className="page-description">{error}</p>}

      <div className="settings-card"><div className="settings-card-header"><div className="settings-icon blue"><User size={20} /></div><div><h2>Profile Settings</h2><p>Update your personal and contact information.</p></div></div><div className="settings-form">
        <div className="settings-field"><label>First Name</label><input value={form.first_name} onChange={(e) => setField("first_name", e.target.value)} placeholder="Enter your first name" /></div>
        <div className="settings-field"><label>Last Name</label><input value={form.last_name} onChange={(e) => setField("last_name", e.target.value)} placeholder="Enter your last name" /></div>
        <div className="settings-field"><label>Email Address</label><input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="Enter your email" /></div>
        <div className="settings-field"><label>Phone Number</label><input value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="Enter your phone number" /></div>
      </div></div>

      <div className="settings-card"><div className="settings-card-header"><div className="settings-icon green"><Bell size={20} /></div><div><h2>Notifications</h2><p>Choose which event updates you want to receive.</p></div></div><div className="settings-options">
        <div className="settings-option"><div><strong>Registration Updates</strong><span>Receive notifications when participants register.</span></div><label className="toggle"><input type="checkbox" defaultChecked /><span></span></label></div>
        <div className="settings-option"><div><strong>Event Reminders</strong><span>Receive reminders about upcoming events.</span></div><label className="toggle"><input type="checkbox" defaultChecked /><span></span></label></div>
        <div className="settings-option"><div><strong>Feedback Notifications</strong><span>Get notified when participants submit feedback.</span></div><label className="toggle"><input type="checkbox" /><span></span></label></div>
      </div></div>

      <div className="settings-card"><div className="settings-card-header"><div className="settings-icon purple"><CalendarDays size={20} /></div><div><h2>Event Preferences</h2><p>Configure default settings for college events.</p></div></div><div className="settings-form">
        <div className="settings-field"><label>Default Event Capacity</label><input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Enter capacity" /></div>
        <div className="settings-field"><label>Default Event Category</label><select value={category} onChange={(e) => setCategory(e.target.value)}><option value="technical">Technical</option><option value="cultural">Cultural</option><option value="sports">Sports</option><option value="workshop">Workshop</option><option value="academic">Academic</option></select></div>
      </div></div>

      <div className="settings-card"><div className="settings-card-header"><div className="settings-icon orange"><Shield size={20} /></div><div><h2>Security</h2><p>Manage your account security settings.</p></div></div><div className="security-content"><div><strong>Account</strong><span>JWT authentication is active.</span></div><button className="secondary-button" type="button" onClick={() => { logout(); }}>Log Out</button></div></div>
    </section>
  );
}

export default Settings;
