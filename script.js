/* ============================================================
   Toolbench — shared front-end logic
   Works for both index.html (all tools) and category pages
   (page sets window.TOOLBENCH_CATEGORY = "slug" before this loads)
   ============================================================ */

(function () {
  "use strict";

  const DATA_URL = window.TOOLBENCH_DATA_URL || "/tools-data.json";
  const grid = document.getElementById("tools-grid");
  const searchInput = document.getElementById("search-input");
  const pegboardNav = document.getElementById("pegboard-nav");
  const resultCount = document.getElementById("result-count");

  let allTools = [];
  let allCategories = [];
  let activeCategory = window.TOOLBENCH_CATEGORY || "all";

  function toolCardHTML(tool) {
    const tags = (tool.tags || [])
      .map((t) => `<span class="tag">${t}</span>`)
      .join("");
    return `
      <a class="tool-card" href="${tool.url}" target="_blank" rel="noopener noreferrer">
        <span class="icon">${tool.icon || "◆"}</span>
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
        <div class="tags">${tags}</div>
      </a>`;
  }

  function render() {
    if (!grid) return;
    const q = (searchInput && searchInput.value.trim().toLowerCase()) || "";

    const filtered = allTools.filter((tool) => {
      const inCategory = activeCategory === "all" || tool.category === activeCategory;
      if (!inCategory) return false;
      if (!q) return true;
      const haystack = (
        tool.name + " " + tool.description + " " + (tool.tags || []).join(" ")
      ).toLowerCase();
      return haystack.includes(q);
    });

    grid.innerHTML = filtered.length
      ? filtered.map(toolCardHTML).join("")
      : `<div class="empty-state">No tools match "${q}". Try another term.</div>`;

    if (resultCount) {
      resultCount.textContent = `${filtered.length} tool${filtered.length === 1 ? "" : "s"}`;
    }
  }

  function renderPegboardNav() {
    if (!pegboardNav) return;
    const pills = [{ slug: "all", name: "All tools" }, ...allCategories];
    pegboardNav.innerHTML = pills
      .map((c) => {
        const isActive = c.slug === activeCategory;
        const href = c.slug === "all" ? "/" : `/category/${c.slug}.html`;
        // On the homepage, pills filter in place; on category pages, pills navigate.
        const isHomepage = !window.TOOLBENCH_CATEGORY;
        if (isHomepage) {
          return `<button class="pill ${isActive ? "active" : ""}" data-slug="${c.slug}">${c.name}</button>`;
        }
        return `<a class="pill ${isActive ? "active" : ""}" href="${href}">${c.name}</a>`;
      })
      .join("");

    if (!window.TOOLBENCH_CATEGORY) {
      pegboardNav.querySelectorAll(".pill").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeCategory = btn.dataset.slug;
          renderPegboardNav();
          render();
        });
      });
    }
  }

  function initTheme() {
    const toggle = document.getElementById("theme-toggle");
    const stored = localStorage.getItem("toolbench-theme");
    const preferred = stored || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    document.documentElement.setAttribute("data-theme", preferred);
    if (toggle) {
      toggle.textContent = preferred === "light" ? "◑ dark" : "◐ light";
      toggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("toolbench-theme", next);
        toggle.textContent = next === "light" ? "◑ dark" : "◐ light";
      });
    }
  }

  function init() {
    initTheme();
    if (!grid) return; // page has no tools grid (e.g. a static page)

    fetch(DATA_URL)
      .then((r) => r.json())
      .then((data) => {
        allTools = data.tools || [];
        allCategories = data.categories || [];
        renderPegboardNav();
        render();
      })
      .catch(() => {
        grid.innerHTML = `<div class="empty-state">Could not load tools-data.json</div>`;
      });

    if (searchInput) {
      searchInput.addEventListener("input", render);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
