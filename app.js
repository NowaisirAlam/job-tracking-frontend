const PAGE_ROUTES = {
  home: "home.html",
  search: "search.html",
  tracker: "tracker.html",
  settings: "setting.html",
  generator: "generator.html",
  pricing: "pricing.html",
};

function ensureToast() {
  let toast = document.getElementById("app-toast");
  if (toast) return toast;

  toast = document.createElement("div");
  toast.id = "app-toast";
  toast.className =
    "fixed right-4 top-4 z-[100] hidden max-w-sm rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl";
  document.body.appendChild(toast);
  return toast;
}

function showToast(message) {
  const toast = ensureToast();
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timeoutId);
  showToast.timeoutId = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}

function wireNavigation() {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const page = link.dataset.nav;
      const target = PAGE_ROUTES[page];
      if (target) window.location.href = target;
    });
  });
}

function wirePlaceholderLinks() {
  document.querySelectorAll("[data-placeholder]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(`${link.dataset.placeholder} is not wired to backend yet.`);
    });
  });
}

function wireActionButtons() {
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const action = button.dataset.action;

      if (action === "go-generator") {
        window.location.href = PAGE_ROUTES.generator;
        return;
      }

      if (action === "go-search") {
        window.location.href = PAGE_ROUTES.search;
        return;
      }

      if (action === "save-draft") {
        localStorage.setItem("rezzap-generator-draft-saved-at", new Date().toISOString());
        showToast("Draft saved locally.");
        return;
      }

      if (action === "generate-resume") {
        localStorage.setItem("rezzap-last-generated-at", new Date().toISOString());
        showToast("Tailored resume generated.");
        return;
      }

      if (action === "download-resume") {
        const resume = document.querySelector(".resume-preview");
        if (!resume) return;
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@700;800&display=swap" rel="stylesheet"/>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
          <style>
            *{box-sizing:border-box;margin:0;padding:0;}
            body{font-family:'Inter',sans-serif;background:#fff;}
            .material-symbols-outlined{font-family:'Material Symbols Outlined';font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24;display:inline-block;line-height:1;text-transform:none;white-space:nowrap;}
            @page{size:A4;margin:0;}
          </style>
        </head><body>${resume.outerHTML}</body></html>`;
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");
        win.onload = () => { win.focus(); win.print(); URL.revokeObjectURL(url); };
        return;
      }

      if (action === "open-styles") {
        document.body.classList.toggle("contrast-preview");
        showToast("Preview style toggled.");
        return;
      }

      if (action === "zoom-resume") {
        const preview = document.querySelector(".resume-preview");
        if (!preview) return;
        preview.dataset.zoom = preview.dataset.zoom === "large" ? "normal" : "large";
        preview.style.transform = preview.dataset.zoom === "large" ? "scale(1.08)" : "scale(1)";
        preview.style.transformOrigin = "top center";
        showToast(preview.dataset.zoom === "large" ? "Zoomed to 108%." : "Zoom reset to 100%.");
        return;
      }

      showToast("Action connected.");
    });
  });
}

// --- Search filter/sort state ---
// BACKEND: pass activeFilters and activeSort as query params when fetching jobs
// e.g. GET /api/jobs?workType=remote&jobType=full-time&sort=salary_desc
let activeFilters = new Set();
let activeSort = "match";

function parseSalaryMax(salaryStr) {
  // Parses "$140k–$180k" → 180000. BACKEND: replace with numeric salary_max field from API.
  if (!salaryStr || salaryStr === "—") return 0;
  const range = salaryStr.match(/(\d+)k[^0-9]*(\d+)k/);
  if (range) return parseInt(range[2]) * 1000;
  const single = salaryStr.match(/(\d+)k/);
  return single ? parseInt(single[1]) * 1000 : 0;
}

function parsePostedHours(postedStr) {
  // Parses "Posted 4h ago" → 4, "Posted 2d ago" → 48. BACKEND: replace with numeric posted_at timestamp.
  if (!postedStr) return 9999;
  const h = postedStr.match(/(\d+)h/);
  if (h) return parseInt(h[1]);
  const d = postedStr.match(/(\d+)d/);
  if (d) return parseInt(d[1]) * 24;
  return 9999;
}

function applyFiltersAndSort() {
  const container = document.querySelector("[data-jobs-container]");
  if (!container) return;

  const cards = [...container.querySelectorAll("[data-job-id]")];

  // Filter: multi-select AND logic
  // BACKEND: when using server-side filtering, map these keys to API params:
  //   "Remote"       → workType=remote
  //   "Full-time"    → jobType=full-time
  //   "Part-time"    → jobType=part-time
  //   "Salary Range" → hasSalary=true
  const appliedIds = new Set(
    (JSON.parse(localStorage.getItem("bookmarkedJobs")) || []).map((j) => j.id)
  );

  cards.forEach((card) => {
    let show = true;
    if (activeFilters.has("Remote") && card.dataset.workType !== "remote") show = false;
    if (activeFilters.has("Full-time") && card.dataset.jobType !== "full-time") show = false;
    if (activeFilters.has("Part-time") && card.dataset.jobType !== "part-time") show = false;
    if (activeFilters.has("Salary Range") && (!card.dataset.salary || card.dataset.salary === "—")) show = false;
    // "Most Recent" hides jobs already applied to
    if (activeSort === "recent" && appliedIds.has(card.dataset.jobId)) show = false;
    card.style.display = show ? "" : "none";
  });

  // Sort visible cards
  // BACKEND: when using server-side sorting, map activeSort to API param:
  //   "match"        → sort=match_score_desc
  //   "recent"       → sort=posted_at_asc
  //   "salary-high"  → sort=salary_desc
  //   "salary-low"   → sort=salary_asc
  const visible = cards.filter((c) => c.style.display !== "none");
  visible.sort((a, b) => {
    if (activeSort === "salary-high") return parseSalaryMax(b.dataset.salary) - parseSalaryMax(a.dataset.salary);
    if (activeSort === "salary-low") return parseSalaryMax(a.dataset.salary) - parseSalaryMax(b.dataset.salary);
    if (activeSort === "recent") return parsePostedHours(a.dataset.posted) - parsePostedHours(b.dataset.posted);
    return parseInt(b.dataset.match || 0) - parseInt(a.dataset.match || 0); // "match" default
  });
  visible.forEach((card) => container.appendChild(card));
}

function wireSearchFilters() {
  const group = document.querySelector("[data-filter-group]");
  if (!group) return;

  // Initialise state from pre-styled active buttons
  group.querySelectorAll("[data-filter]").forEach((button) => {
    if (button.classList.contains("bg-primary")) activeFilters.add(button.dataset.filter);
  });

  group.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      if (activeFilters.has(filter)) {
        activeFilters.delete(filter);
        button.classList.remove("bg-primary", "text-on-primary");
        button.classList.add("bg-surface-container-low", "text-secondary");
      } else {
        activeFilters.add(filter);
        button.classList.remove("bg-surface-container-low", "text-secondary");
        button.classList.add("bg-primary", "text-on-primary");
      }
      applyFiltersAndSort();
    });
  });

  applyFiltersAndSort();
}

function wireSortDropdown() {
  const btn = document.getElementById("sort-btn");
  const dropdown = document.getElementById("sort-dropdown");
  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  });

  dropdown.querySelectorAll("[data-sort]").forEach((item) => {
    item.addEventListener("click", () => {
      activeSort = item.dataset.sort;
      dropdown.classList.add("hidden");

      // Update checkmark
      dropdown.querySelectorAll("[data-sort]").forEach((i) => i.querySelector(".sort-check")?.remove());
      const check = document.createElement("span");
      check.className = "material-symbols-outlined text-sm text-primary sort-check";
      check.textContent = "check";
      item.appendChild(check);

      // Update button label
      const label = btn.querySelector(".sort-label");
      if (label) label.textContent = item.textContent.replace("check", "").trim();

      applyFiltersAndSort();
    });
  });

  document.addEventListener("click", () => dropdown.classList.add("hidden"));
}

function wireBookmarks() {
  const saved = JSON.parse(localStorage.getItem("bookmarkedJobs")) || [];
  const savedIds = saved.map((j) => j.id);

  document.querySelectorAll("[data-bookmark]").forEach((button) => {
    const card = button.closest("[data-job-id]");
    if (card && savedIds.includes(card.dataset.jobId)) {
      setBookmarkState(button, true);
      const job = saved.find((j) => j.id === card.dataset.jobId);
      const label = card.querySelector(".posted-label");
      if (label && job?.appliedDate) {
        const d = new Date(job.appliedDate);
        label.textContent = `Applied ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      }
    }

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const isSaved = button.dataset.bookmark === "saved";
      setBookmarkState(button, !isSaved);

      const label = card?.querySelector(".posted-label");
      if (isSaved) {
        removeTrackedJob(card?.dataset.jobId);
        showToast("Removed from tracker.");
        if (label) label.textContent = card.dataset.posted || "Posted recently";
      } else {
        addTrackedJob(card);
        showToast("Added to tracker.");
        const today = new Date();
        if (label) label.textContent = `Applied ${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
      }
    });
  });
}

function setBookmarkState(button, active) {
  const icon = button.querySelector(".material-symbols-outlined");
  button.dataset.bookmark = active ? "saved" : "unsaved";
  button.classList.toggle("bg-blue-50", active);
  button.classList.toggle("text-primary", active);
  button.classList.toggle("text-outline", !active);
  if (icon) icon.style.fontVariationSettings = active ? "'FILL' 1" : "'FILL' 0";
}

function addTrackedJob(card) {
  if (!card) return;
  const jobs = JSON.parse(localStorage.getItem("bookmarkedJobs")) || [];
  if (!jobs.find((j) => j.id === card.dataset.jobId)) {
    jobs.push({
      id: card.dataset.jobId,
      title: card.dataset.title,
      company: card.dataset.company,
      location: card.dataset.location,
      logo: card.dataset.logo,
      salary: card.dataset.salary || "—",
      deadline: card.dataset.deadline || "",
      appliedDate: new Date().toISOString(),
    });
    localStorage.setItem("bookmarkedJobs", JSON.stringify(jobs));
  }
}

function removeTrackedJob(jobId) {
  if (!jobId) return;
  const jobs = JSON.parse(localStorage.getItem("bookmarkedJobs")) || [];
  localStorage.setItem("bookmarkedJobs", JSON.stringify(jobs.filter((j) => j.id !== jobId)));
}

function wireSearchInput() {
  const input = document.querySelector("[data-search-input]");
  if (!input) return;

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    localStorage.setItem("rezzap-last-search", input.value.trim());
    showToast(input.value.trim() ? `Searching for "${input.value.trim()}"` : "Enter a role or company.");
  });
}

function wireApplicationRows() {
  document.querySelectorAll("[data-application]").forEach((row) => {
    row.addEventListener("click", () => {
      showToast(`${row.dataset.application} opened.`);
    });
  });
}

function wireGeneratorTools() {
  const textarea = document.querySelector("[data-bullet-input]");
  const currentBullet = document.querySelector("[data-current-bullet]");
  const enhancedBullet = document.querySelector("[data-enhanced-bullet]");
  const scoreValue = document.querySelector("[data-score-value]");
  const autoSave = document.querySelector("[data-autosave-label]");
  const uploadTrigger = document.querySelector("[data-upload-trigger]");
  const uploadInput = document.querySelector("[data-resume-upload]");
  const uploadStatus = document.querySelector("[data-upload-status]");

  const samples = [
    "Led a cross-functional redesign that reduced drop-off by 18% and improved prototype-to-build speed across the product team.",
    "Built and maintained reusable UI patterns that shortened delivery timelines and improved consistency across mobile surfaces.",
    "Partnered with PM and engineering to ship design-system upgrades that improved experimentation velocity and UI quality."
  ];

  const refreshAutosave = () => {
    if (autoSave) autoSave.textContent = "Auto-saved just now";
  };

  const setUploadStatus = (message) => {
    if (uploadStatus) uploadStatus.textContent = message;
  };

  const saveDraftState = () => {
    localStorage.setItem(
      "rezzap-generator-state",
      JSON.stringify({
        bulletInput: textarea ? textarea.value : "",
        enhancedBullet: enhancedBullet ? enhancedBullet.textContent : "",
      })
    );
    refreshAutosave();
  };

  const restoreDraftState = () => {
    const raw = localStorage.getItem("rezzap-generator-state");
    if (!raw) return;
    try {
      const state = JSON.parse(raw);
      if (textarea && state.bulletInput) textarea.value = state.bulletInput;
      if (enhancedBullet && state.enhancedBullet) enhancedBullet.textContent = state.enhancedBullet;
    } catch {
      return;
    }
  };

  restoreDraftState();

  uploadTrigger?.addEventListener("click", () => {
    uploadInput?.click();
  });

  uploadInput?.addEventListener("change", () => {
    const file = uploadInput.files?.[0];
    if (!file) {
      setUploadStatus("No file selected.");
      return;
    }

    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);

    const validExtension = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!allowedTypes.has(file.type) && !validExtension) {
      uploadInput.value = "";
      setUploadStatus("Invalid file type. Use PDF, DOC, or DOCX.");
      showToast("Only PDF, DOC, or DOCX files are allowed.");
      return;
    }

    const sizeLabel =
      file.size >= 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    setUploadStatus(`${file.name} (${sizeLabel})`);
    localStorage.setItem(
      "rezzap-uploaded-resume",
      JSON.stringify({ name: file.name, size: file.size, type: file.type })
    );
    showToast(`Resume ready: ${file.name}`);
  });

  document.querySelector("[data-improve-bullet]")?.addEventListener("click", () => {
    if (!textarea || !enhancedBullet) return;
    const source = textarea.value.trim() || currentBullet?.textContent?.replace(/"/g, "").trim();
    if (!source) {
      showToast("Add a bullet point first.");
      return;
    }
    enhancedBullet.textContent = `"${source} Improved with measurable impact and sharper hiring language."`;
    if (scoreValue) scoreValue.textContent = "88";
    saveDraftState();
    showToast("Bullet improved.");
  });

  document.querySelector("[data-regenerate-bullet]")?.addEventListener("click", () => {
    if (!enhancedBullet) return;
    enhancedBullet.textContent = `"${samples[Math.floor(Math.random() * samples.length)]}"`;
    if (scoreValue) scoreValue.textContent = String(84 + Math.floor(Math.random() * 8));
    saveDraftState();
    showToast("New AI variation generated.");
  });

  document.querySelector("[data-replace-bullet]")?.addEventListener("click", () => {
    if (!currentBullet || !enhancedBullet) return;
    currentBullet.textContent = enhancedBullet.textContent;
    saveDraftState();
    showToast("Current bullet replaced.");
  });

  document.querySelector("[data-copy-bullet]")?.addEventListener("click", async () => {
    if (!enhancedBullet) return;
    try {
      await navigator.clipboard.writeText(enhancedBullet.textContent);
      showToast("Enhanced bullet copied.");
    } catch {
      showToast("Copy failed in this browser.");
    }
  });

  textarea?.addEventListener("input", saveDraftState);
}

function wireProfileEditor() {
  const modal = document.querySelector("[data-profile-modal]");
  const form = document.querySelector("[data-profile-form]");
  const openButton = document.querySelector("[data-open-profile-modal]");
  const closeButtons = document.querySelectorAll("[data-close-profile-modal]");

  if (!modal || !form || !openButton) return;

  const fields = {
    avatar: form.querySelector("[name='avatar']"),
    name: form.querySelector("[name='name']"),
    role: form.querySelector("[name='role']"),
    email: form.querySelector("[name='email']"),
    location: form.querySelector("[name='location']"),
  };

  const outputs = {
    avatar: document.querySelector("[data-profile-avatar]"),
    avatarPreview: document.querySelector("[data-profile-avatar-preview]"),
    name: document.querySelector("[data-profile-name]"),
    role: document.querySelector("[data-profile-role]"),
    email: document.querySelector("[data-profile-email]"),
    location: document.querySelector("[data-profile-location]"),
    locationLabel: document.querySelector("[data-profile-location-label]"),
  };

  const storageKey = "rezzap-profile";
  const defaultAvatar = outputs.avatar?.getAttribute("src") || outputs.avatarPreview?.getAttribute("src") || "";

  const openModal = () => {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };

  const closeModal = () => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  };

  const applyProfile = (profile) => {
    if (outputs.avatar && profile.avatar) outputs.avatar.src = profile.avatar;
    if (outputs.avatarPreview && profile.avatar) outputs.avatarPreview.src = profile.avatar;
    if (outputs.name) outputs.name.textContent = profile.name;
    if (outputs.role) outputs.role.textContent = profile.role;
    if (outputs.email) outputs.email.textContent = profile.email;
    if (outputs.location) outputs.location.textContent = profile.location;
    if (outputs.locationLabel) outputs.locationLabel.textContent = profile.location;
    if (fields.name) fields.name.value = profile.name;
    if (fields.role) fields.role.value = profile.role;
    if (fields.email) fields.email.value = profile.email;
    if (fields.location) fields.location.value = profile.location;
  };

  const defaultProfile = {
    avatar: defaultAvatar,
    name: fields.name?.value || outputs.name?.textContent?.trim() || "Alex Thompson",
    role: fields.role?.value || outputs.role?.textContent?.trim() || "Senior Product Designer",
    email: fields.email?.value || outputs.email?.textContent?.trim() || "alex.thompson@design.io",
    location: fields.location?.value || outputs.location?.textContent?.trim() || "San Francisco, CA",
  };

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved) {
      applyProfile({ ...defaultProfile, ...saved });
    } else {
      applyProfile(defaultProfile);
    }
  } catch {
    applyProfile(defaultProfile);
  }

  openButton.addEventListener("click", openModal);

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  fields.avatar?.addEventListener("change", () => {
    const file = fields.avatar.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please choose an image file.");
      fields.avatar.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : defaultAvatar;
      if (outputs.avatarPreview) outputs.avatarPreview.src = result;
      if (outputs.avatar) outputs.avatar.src = result;
      fields.avatar.dataset.uploadedImage = result;
    };
    reader.readAsDataURL(file);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const profile = {
      avatar: fields.avatar?.dataset.uploadedImage || outputs.avatar?.getAttribute("src") || defaultAvatar,
      name: fields.name?.value.trim() || defaultProfile.name,
      role: fields.role?.value.trim() || defaultProfile.role,
      email: fields.email?.value.trim() || defaultProfile.email,
      location: fields.location?.value.trim() || defaultProfile.location,
    };
    localStorage.setItem(storageKey, JSON.stringify(profile));
    applyProfile(profile);
    if (fields.avatar) {
      fields.avatar.value = "";
      delete fields.avatar.dataset.uploadedImage;
    }
    closeModal();
    showToast("Profile saved locally.");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  wireNavigation();
  wirePlaceholderLinks();
  wireActionButtons();
  wireSearchFilters();
  wireSortDropdown();
  wireBookmarks();
  wireSearchInput();
  wireApplicationRows();
  wireGeneratorTools();
  wireProfileEditor();
});
