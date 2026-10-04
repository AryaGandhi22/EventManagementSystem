const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/events";

const ACCESS_KEY = "college_event_access";
const REFRESH_KEY = "college_event_refresh";
const USER_KEY = "college_event_user";

const DEMO_CREDENTIALS = {
  username: "demo_admin",
  password: "DemoPass123!",
};

function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

function saveTokens(data) {
  if (data.access) localStorage.setItem(ACCESS_KEY, data.access);
  if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
  if (data.user) localStorage.setItem(USER_KEY, JSON.stringify(data.user));
}

function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

async function requestRaw(path, options = {}, token = getAccessToken()) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body !== undefined) {
    headers.set("Content-Type", "application/json");
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
  const refresh = localStorage.getItem(REFRESH_KEY);
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
    if (data.access) localStorage.setItem(ACCESS_KEY, data.access);
    if (data.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
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
  return requestRaw(
    "/auth/register/",
    { method: "POST", body: JSON.stringify(payload) },
    null
  );
}

export function logout() {
  clearTokens();
  window.location.reload();
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
  return api("/", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateEvent(id, payload) {
  return api(`/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteEvent(id) {
  return api(`/${id}/`, { method: "DELETE" });
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
    body: JSON.stringify({ event: eventId }),
  });
}

export async function cancelRegistration(id) {
  return api(`/registrations/${id}/`, { method: "DELETE" });
}

export async function checkInRegistration(id) {
  return api(`/registrations/${id}/check-in/`, { method: "POST" });
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
  return api("/venues/", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateVenue(id, payload) {
  return api(`/venues/${id}/`, { method: "PATCH", body: JSON.stringify(payload) });
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