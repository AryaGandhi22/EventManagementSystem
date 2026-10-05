const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/events";

const ACCESS_KEY = "college_event_access";
const REFRESH_KEY = "college_event_refresh";
const USER_KEY = "college_event_user";

const DEMO_CREDENTIALS = {
  username: "demo_admin",
  password: "DemoPass123!",
};

function getAccessToken() {
  return sessionStorage.getItem(ACCESS_KEY);
}

function saveTokens(data) {
  if (data.access) sessionStorage.setItem(ACCESS_KEY, data.access);
  if (data.refresh) sessionStorage.setItem(REFRESH_KEY, data.refresh);
  if (data.user) sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

function clearTokens() {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    const userStr =
      sessionStorage.getItem(USER_KEY) ||
      localStorage.getItem(USER_KEY) ||
      localStorage.getItem("user");
    return JSON.parse(userStr || "null");
  } catch {
    return null;
  }
}

async function requestRaw(path, options = {}, token = getAccessToken()) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body !== undefined) {
    if (!(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(
      typeof data === "string" ? data : data?.detail || "Request failed"
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function loginDemo() {
  const data = await requestRaw(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify(DEMO_CREDENTIALS),
    },
    null
  );
  saveTokens(data);
  return data;
}

async function refreshAccessToken() {
  const refresh = sessionStorage.getItem(REFRESH_KEY);
  if (!refresh) return false;

  try {
    const data = await requestRaw(
      "/auth/token/refresh/",
      {
        method: "POST",
        body: JSON.stringify({ refresh }),
      },
      null
    );
    if (data.access) sessionStorage.setItem(ACCESS_KEY, data.access);
    if (data.refresh) sessionStorage.setItem(REFRESH_KEY, data.refresh);
    return true;
  } catch {
    return false;
  }
}
export async function api(path, options = {}) {
  try {
    return await requestRaw(path, options);
  } catch (error) {
    if (error.status === 401) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return requestRaw(path, options);
      }

      clearTokens();

      // Send the user back to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    throw error;
  }
}

export async function login(username, password) {
  const data = await requestRaw(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
    null
  );
  saveTokens(data);
  return data;
}

export async function registerUser(payload) {
  // payload should include: username, email, password, first_name, last_name, phone, role
  return requestRaw(
    "/auth/register/",
    { method: "POST", body: JSON.stringify(payload) },
    null
  );
}


export function logout() {
  clearTokens();
  window.location.href = "/login?signedout=1";
}

export async function getEvents(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      query.set(key, value);
    }
  });
  const data = await api(`/${query.toString() ? `?${query}` : ""}`);
  return data.results || data;
}

export async function getEvent(id) {
  return api(`/${id}/`);
}

export async function createEvent(payload) {
  let body = payload;
  if (!(payload instanceof FormData)) {
    body = JSON.stringify(payload);
  }
  return api("/", { method: "POST", body });
}

export async function updateEvent(id, payload) {
  let body = payload;
  if (!(payload instanceof FormData)) {
    body = JSON.stringify(payload);
  }
  return api(`/${id}/`, { method: "PATCH", body });
}

export async function deleteEvent(id) {
  return api(`/${id}/`, { method: "DELETE" });
}

export async function updateEventStatus(id, newStatus) {
  return api(`/admin/events/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus }),
  });
}

export async function getRegistrations(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "all") {
      query.set(key, value);
    }
  });
  const data = await api(`/registrations/${query.toString() ? `?${query}` : ""}`);
  return data.results || data;
}

export async function registerForEvent(eventId) {
  return api("/registrations/", {
    method: "POST",
    body: JSON.stringify({ event_id: eventId }),
  });
}

export async function cancelRegistration(id) {
  return api(`/registrations/${id}/`, { method: "DELETE" });
}

export async function toggleConnectOptIn(id, optIn) {
  return api(`/registrations/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ connect_opt_in: optIn })
  });
}

export async function getEventAttendees(eventId) {
  const data = await api(`/${eventId}/attendees/`);
  return data.results || data;
}

export async function createFeedback(payload) {
  return api("/feedback/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createPlatformFeedback(payload) {
  // Use FormData if there is a screenshot
  if (payload instanceof FormData) {
    return api("/platform-feedback/", {
      method: "POST",
      body: payload,
    });
  }
  return api("/platform-feedback/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPlatformFeedbacks() {
  const data = await api("/platform-feedback/");
  return data.results || data;
}


export async function checkInRegistration(id) {
  return api(`/registrations/${id}/check-in/`, { method: "POST" });
}

export async function checkInByQrToken(qrToken) {
  return api("/registrations/check-in/", {
    method: "POST",
    body: JSON.stringify({ qr_token: qrToken }),
  });
}

export async function getEventAttendance(eventId) {
  return api(`/${eventId}/attendance/`);
}

export async function exportAttendanceCSV(eventId, eventTitle = "attendance") {
  const token = getAccessToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}/${eventId}/attendance/`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch attendance data for export.");
  }

  const data = await response.json();
  const attendees = data.attendees || [];

  const rows = [
    ["#", "Name", "Email", "Username", "Roll No.", "Status", "Checked In", "Check-In Time", "Registered At"],
    ...attendees.map((a, i) => [
      i + 1,
      a.student?.name || "",
      a.student?.email || "",
      a.student?.username || "",
      a.student?.registration_number || "",
      a.status,
      a.checked_in ? "Yes" : "No",
      a.checked_in_at ? new Date(a.checked_in_at).toLocaleString("en-IN") : "",
      a.registered_at ? new Date(a.registered_at).toLocaleString("en-IN") : "",
    ]),
  ];

  const csvContent = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${eventTitle.replace(/\s+/g, "_")}_attendance.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function getParticipants(search = "") {
  const data = await api(`/participants/${search ? `?search=${encodeURIComponent(search)}` : ""}`);
  return data.results || data;
}

export async function getVenues(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const data = await api(`/venues/${query.toString() ? `?${query}` : ""}`);
  return data.results || data;
}

export async function createVenue(payload) {
  let body = payload;
  if (!(payload instanceof FormData)) {
    body = JSON.stringify(payload);
  }
  return api("/venues/", { method: "POST", body });
}

export async function updateVenue(id, payload) {
  let body = payload;
  if (!(payload instanceof FormData)) {
    body = JSON.stringify(payload);
  }
  return api(`/venues/${id}/`, { method: "PATCH", body });
}

export async function deleteVenue(id) {
  return api(`/venues/${id}/`, { method: "DELETE" });
}

export async function getDashboard() {
  return api("/dashboard/");
}

export async function getReports() {
  return api("/reports/");
}

export async function getMe() {
  const user = await api("/auth/me/");
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function updateMe(payload) {
  const user = await api("/auth/me/", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}
export async function loginUser(credentials) {
  const data = await requestRaw(
    "/auth/login/",
    {
      method: "POST",
      body: JSON.stringify(credentials),
    },
    null
  );

  saveTokens(data);

  return data;
}
export async function updateUserStatus(id, isActive) {
  return api(`/admin/users/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ is_active: isActive }),
  });
}

export async function verifyOrganizer(id, isVerified) {
  return api(`/admin/verify-organizer/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ is_verified_organizer: isVerified }),
  });
}

export async function getAdminUsers(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, value);
    }
  });

  const data = await api(
    `/admin/users/${
      query.toString()
        ? `?${query.toString()}`
        : ""
    }`
  );

  return data.results || data;
}
export async function getFeedback(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      query.set(key, value);
    }
  });

  const data = await api(
    `/feedback/${query.toString() ? `?${query.toString()}` : ""}`
  );

  return data.results || data;
}

export async function deleteFeedback(id) {
  return api(`/feedback/${id}/`, {
    method: "DELETE",
  });
}

export async function getNotifications() {
  const data = await api(`/notifications/`);
  return data.results || data;
}

export async function markNotificationRead(id) {
  return api(`/notifications/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ is_read: true }),
  });
}

export async function clearNotifications() {
  return api(`/notifications/`, {
    method: "DELETE",
  });
}

export async function exportEventsCSV() {
  const token = getAccessToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}/admin/export/events/`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    console.error("CSV Export failed", await response.text());
    alert("Failed to export CSV");
    return;
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "events_export.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
}