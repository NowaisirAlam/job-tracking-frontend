// ─── Rezzap API Client ────────────────────────────────────────────────────────
// All backend calls go through this file.
// Usage: include <script src="api.js"></script> in any HTML page that needs it.

const BASE_URL = "http://localhost:8000";

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": "Bearer " + getToken(),
  };
}

function saveSession(data) {
  localStorage.setItem("token", data.access_token);
  if (data.refresh_token) localStorage.setItem("refresh_token", data.refresh_token);
  if (data.user_id)       localStorage.setItem("user_id", data.user_id);
  if (data.email)         localStorage.setItem("user_email", data.email);
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("user_email");
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

const api = {

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Login failed");
    saveSession(data);
    return data;
  },

  async signup(email, password) {
    // Step 1 — create account
    const signupRes = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const signupData = await signupRes.json();
    if (!signupRes.ok) throw new Error(signupData.detail || "Signup failed");

    // Step 2 — auto login to get token
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.detail || "Login after signup failed");
    saveSession(loginData);
    return loginData;
  },

  async logout() {
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: authHeaders(),
      });
    } catch (_) {
      // logout always clears session even if request fails
    }
    clearSession();
  },

  async me() {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Not authenticated");
    return data;
  },

  // ─── Job endpoints ───────────────────────────────────────────────────────────

  async searchJobs(query, location = "Kitchener Ontario") {
    const params = new URLSearchParams({ query, location });
    const res = await fetch(`${BASE_URL}/api/jobs/search?${params}`, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Search failed");
    return data.jobs || [];
  },

  async saveJob(jobData) {
    const res = await fetch(`${BASE_URL}/api/jobs/save`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(jobData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Save failed");
    return data;
  },

  async getTrackedJobs() {
    const res = await fetch(`${BASE_URL}/api/jobs/tracked`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to load tracked jobs");
    return data.jobs || [];
  },

  async updateStatus(jobId, status) {
    const res = await fetch(`${BASE_URL}/api/jobs/${jobId}/status`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Status update failed");
    return data;
  },

  async generateResume(jobId, file) {
    const form = new FormData();
    if (file) form.append("resume", file);
    const res = await fetch(`${BASE_URL}/api/jobs/${jobId}/resume`, {
      method: "POST",
      headers: { "Authorization": "Bearer " + getToken() }, // no Content-Type — let browser set multipart boundary
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Resume generation failed");
    return data;
  },

  async getResumeStatus(jobId) {
    const res = await fetch(`${BASE_URL}/api/jobs/${jobId}/resume/status`, {
      headers: authHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to get resume status");
    return data;
  },
};
