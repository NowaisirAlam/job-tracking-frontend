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

function wireSearchFilters() {
  const groups = document.querySelectorAll("[data-filter-group]");
  groups.forEach((group) => {
    group.querySelectorAll("[data-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        group.querySelectorAll("[data-filter]").forEach((item) => {
          item.classList.remove("bg-primary", "text-on-primary");
          item.classList.add("bg-surface-container-low", "text-secondary");
        });
        button.classList.remove("bg-surface-container-low", "text-secondary");
        button.classList.add("bg-primary", "text-on-primary");
        showToast(`Filter set to ${button.dataset.filter}.`);
      });
    });
  });
}

function wireBookmarks() {
  const saved = JSON.parse(localStorage.getItem("bookmarkedJobs")) || [];
  const savedIds = saved.map((j) => j.id);

  document.querySelectorAll("[data-bookmark]").forEach((button) => {
    const card = button.closest("[data-job-id]");
    if (card && savedIds.includes(card.dataset.jobId)) {
      setBookmarkState(button, true);
    }

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const isSaved = button.dataset.bookmark === "saved";
      setBookmarkState(button, !isSaved);

      if (isSaved) {
        removeTrackedJob(card?.dataset.jobId);
        showToast("Removed from tracker.");
      } else {
        addTrackedJob(card);
        showToast("Added to tracker.");
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

document.addEventListener("DOMContentLoaded", () => {
  wireNavigation();
  wirePlaceholderLinks();
  wireActionButtons();
  wireSearchFilters();
  wireBookmarks();
  wireSearchInput();
  wireApplicationRows();
  wireGeneratorTools();
});
