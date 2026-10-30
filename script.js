const SERVER_URL = "mtasa://144.225.189.145:22535";
const CONFIG = window.VBC_CONFIG || {};
const TIMEZONE = "America/Sao_Paulo";

let database = { categories: [] };

const $ = (id) => document.getElementById(id);
const rulesContainer = $("rulesContainer");
const ruleSearch = $("ruleSearch");
const clearSearch = $("clearSearch");
const searchInfo = $("searchInfo");
const emptyState = $("emptyState");
const connectButton = $("connectButton");
const adminButton = $("adminButton");
const openGitHubEditor = $("openGitHubEditor");
const adminRepoHint = $("adminRepoHint");
const repoInfo = $("repoInfo");

const urlCompilerButton = $("urlCompilerButton");
const urlForm = $("urlForm");
const rawUrl = $("rawUrl");
const repoPath = $("repoPath");
const urlError = $("urlError");
const compiledBox = $("compiledBox");
const compiledUrl = $("compiledUrl");
const copyCompiledUrl = $("copyCompiledUrl");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalize(value = "") {
  return String(value)
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--/--/---- --:--";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function highlight(text = "", search = "") {
  let safe = escapeHtml(text);
  if (!search.trim()) return safe;

  const words = search.trim().split(/\s+/).map(escapeRegExp).filter(Boolean);
  if (!words.length) return safe;

  return safe.replace(new RegExp(`(${words.join("|")})`, "gi"), "<mark>$1</mark>");
}

function formatRule(text = "", search = "") {
  let html = escapeHtml(String(text).trim())
    .replace(/:\s*/g, ":<br>")
    .replace(/;\s*/g, "<br><br>")
    .replace(/\r?\n/g, "<br>");

  if (!search.trim()) return html;

  const words = search.trim().split(/\s+/).map(escapeRegExp).filter(Boolean);
  if (!words.length) return html;

  return html.replace(new RegExp(`(${words.join("|")})`, "gi"), "<mark>$1</mark>");
}

async function loadRules() {
  try {
    const response = await fetch("./rules.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data || !Array.isArray(data.categories)) throw new Error("rules.json inválido");

    database = data;
    renderRules();
  } catch (error) {
    rulesContainer.innerHTML = `
      <div class="empty">
        <strong>Não foi possível carregar rules.json</strong>
        <span>Use GitHub Pages ou Live Server. Abrir index.html diretamente por file:// pode bloquear o JSON.</span>
      </div>
    `;
    toast("Erro ao carregar rules.json.", true);
  }
}

function renderRules() {
  const search = ruleSearch.value.trim();
  const q = normalize(search);

  rulesContainer.innerHTML = "";
  let categoriesFound = 0;
  let rulesFound = 0;

  for (const category of database.categories) {
    const catMatch =
      !q ||
      normalize(category.name).includes(q) ||
      normalize(category.description || "").includes(q);

    const matching = (category.rules || []).filter((rule) => {
      if (!q) return true;
      return normalize(
        `${category.name} ${category.description || ""} ${rule.title} ${rule.content}`
      ).includes(q);
    });

    if (q && !catMatch && !matching.length) continue;

    const rules = q && catMatch && !matching.length ? (category.rules || []) : matching;
    categoriesFound++;
    rulesFound += rules.length;

    const article = document.createElement("article");
    article.className = "category";

    const count = (category.rules || []).length;
    article.innerHTML = `
      <header class="category-head">
        <div>
          <div class="category-title-row">
            <h3>${highlight(category.name, search)}</h3>
            <span class="count">${count} ${count === 1 ? "REGRA" : "REGRAS"}</span>
          </div>
          ${category.description ? `<p class="category-desc">${highlight(category.description, search)}</p>` : ""}
        </div>
        <div class="category-date">
          <small>ÚLTIMA ATUALIZAÇÃO</small>
          <strong>${formatDate(category.updatedAt)}</strong>
        </div>
      </header>
      <div class="category-rules"></div>
    `;

    const target = article.querySelector(".category-rules");

    if (!rules.length) {
      target.innerHTML = `<div class="empty-category">Nenhuma regra cadastrada nesta categoria.</div>`;
    } else {
      for (const rule of rules) {
        const index = (category.rules || []).findIndex((item) => item.id === rule.id);
        const row = document.createElement("div");
        row.className = "rule";
        row.innerHTML = `
          <div class="rule-num">${index + 1}°</div>
          <div>
            <h4>${highlight(rule.title, search)}</h4>
            <div class="rule-text">${formatRule(rule.content, search)}</div>
          </div>
        `;
        target.appendChild(row);
      }
    }

    rulesContainer.appendChild(article);
  }

  emptyState.hidden = !(q && categoriesFound === 0);

  if (q && categoriesFound > 0) {
    searchInfo.hidden = false;
    searchInfo.textContent = `${rulesFound} regra(s) encontrada(s) em ${categoriesFound} categoria(s).`;
  } else {
    searchInfo.hidden = true;
  }

  clearSearch.classList.toggle("visible", Boolean(ruleSearch.value));
}

function openModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.add("open");
  document.body.classList.add("modal-open");
}

function closeModal(id) {
  const modal = $(id);
  if (!modal) return;
  modal.classList.remove("open");
  if (!document.querySelector(".modal.open")) document.body.classList.remove("modal-open");
}

function toast(message, error = false) {
  const node = document.createElement("div");
  node.className = `toast${error ? " error" : ""}`;
  node.textContent = message;
  $("toasts").appendChild(node);
  setTimeout(() => node.remove(), 3400);
}

function inferRepository() {
  const owner = String(CONFIG.githubOwner || "").trim();
  const repo = String(CONFIG.githubRepo || "").trim();

  if (owner && repo) {
    return { owner, repo, branch: CONFIG.githubBranch || "main" };
  }

  const host = location.hostname.toLowerCase();
  if (!host.endsWith(".github.io")) return null;

  const inferredOwner = host.replace(/\.github\.io$/, "");
  const parts = location.pathname.split("/").filter(Boolean);
  const inferredRepo = parts[0] || `${inferredOwner}.github.io`;

  return {
    owner: inferredOwner,
    repo: inferredRepo,
    branch: CONFIG.githubBranch || "main"
  };
}

function editorUrl() {
  const repo = inferRepository();
  if (!repo) return null;

  const file = CONFIG.rulesFile || "rules.json";
  return `https://github.com/${encodeURIComponent(repo.owner)}/${encodeURIComponent(repo.repo)}/edit/${encodeURIComponent(repo.branch)}/${file}`;
}

function siteBaseUrl() {
  const repo = inferRepository();

  if (
    repo &&
    location.hostname.toLowerCase().endsWith(".github.io") &&
    repo.repo !== `${repo.owner}.github.io`
  ) {
    return `${location.origin}/${encodeURIComponent(repo.repo)}/`;
  }

  const url = new URL(location.href);
  url.search = "";
  url.hash = "";

  if (url.pathname.endsWith("/")) return url.href;
  return `${url.origin}${url.pathname.slice(0, url.pathname.lastIndexOf("/") + 1)}`;
}

function safeRepoPath(value) {
  return String(value || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .split("/")
    .filter((part) => part && part !== "." && part !== "..")
    .join("/");
}

function filenameFromInput(value) {
  const raw = String(value || "").trim();

  try {
    if (/^file:/i.test(raw)) {
      const parsed = new URL(raw);
      return decodeURIComponent(parsed.pathname).replace(/\\/g, "/").split("/").filter(Boolean).at(-1) || "";
    }

    if (/^https?:/i.test(raw)) {
      const parsed = new URL(raw);
      return parsed.pathname.split("/").filter(Boolean).at(-1) || "";
    }
  } catch {}

  return raw.replace(/\\/g, "/").split("/").filter(Boolean).at(-1) || "";
}

function resolveImgur(img) {
  const id = img.dataset.id;
  const exts = String(img.dataset.exts || "png,jpg,jpeg,webp,gif")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  let index = 0;

  const next = () => {
    if (index >= exts.length) {
      img.hidden = true;
      return;
    }
    img.src = `https://i.imgur.com/${encodeURIComponent(id)}.${exts[index++]}`;
  };

  img.addEventListener("error", next);
  next();
}

connectButton.addEventListener("click", () => {
  location.href = SERVER_URL;
});

adminButton.addEventListener("click", () => {
  const repo = inferRepository();

  adminRepoHint.textContent = repo
    ? `Repositório detectado: ${repo.owner}/${repo.repo} • branch ${repo.branch}`
    : "Em domínio personalizado, preencha githubOwner e githubRepo em config.js.";

  openModal("adminModal");
});

openGitHubEditor.addEventListener("click", () => {
  const url = editorUrl();

  if (!url) {
    toast("Configure githubOwner e githubRepo em config.js.", true);
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
});

urlCompilerButton.addEventListener("click", () => {
  closeModal("adminModal");
  urlForm.reset();
  urlError.hidden = true;
  compiledBox.hidden = true;
  rawUrl.value = location.href;
  openModal("urlModal");
});

urlForm.addEventListener("submit", (event) => {
  event.preventDefault();
  urlError.hidden = true;
  compiledBox.hidden = true;

  const raw = rawUrl.value.trim();

  if (/^(javascript|data|vbscript):/i.test(raw)) {
    urlError.textContent = "Esse protocolo não é permitido.";
    urlError.hidden = false;
    return;
  }

  let file = safeRepoPath(repoPath.value);
  if (!file) file = safeRepoPath(filenameFromInput(raw));
  if (!file || /^index\.html?$/i.test(file)) file = "";

  compiledUrl.value = new URL(file, siteBaseUrl()).href;
  compiledBox.hidden = false;
});

copyCompiledUrl.addEventListener("click", async () => {
  if (!compiledUrl.value) return;

  try {
    await navigator.clipboard.writeText(compiledUrl.value);
    toast("URL copiada.");
  } catch {
    compiledUrl.select();
    document.execCommand("copy");
    toast("URL copiada.");
  }
});

ruleSearch.addEventListener("input", renderRules);

clearSearch.addEventListener("click", () => {
  ruleSearch.value = "";
  renderRules();
  ruleSearch.focus();
});

document.addEventListener("click", (event) => {
  const close = event.target.closest("[data-close]");
  if (close) closeModal(close.dataset.close);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal.open").forEach((modal) => closeModal(modal.id));
  }
});

document.querySelectorAll(".imgur-image").forEach(resolveImgur);

const repo = inferRepository();
if (repo) {
  repoInfo.hidden = false;
  repoInfo.textContent = `GitHub Pages • ${repo.owner}/${repo.repo}`;
}

loadRules();
