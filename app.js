/**
 * Simple static "Game Hub" (no backend).
 * - Default games are hardcoded below.
 * - User-added games are stored in localStorage on this browser.
 */

const STORAGE_KEY = "gamehub:userGames:v1";

/** @typedef {{id:string,title:string,playUrl:string,sourceUrl?:string,tags?:string[],thumbnailUrl?:string,addedBy:"system"|"user",createdAt:number}} Game */

/** @returns {Game[]} */
function getDefaultGames() {
  return [
    {
      id: "football-io",
      title: "Basketball",
      playUrl: "https://shobhit-jain09.github.io/basketball.io/basketball_game.html",
      sourceUrl: "",
      tags: ["sports", "basketball"],
      thumbnailUrl: "",
      addedBy: "system",
      createdAt: Date.now(),
    },
    {
      id: "reflexruler-io",
      title: "Reflex Ruler",
      playUrl: "https://shobhit-jain09.github.io/Reflex-ruler.io/reflexruler.html",
      sourceUrl: "",
      tags: ["reflex", "arcade"],
      thumbnailUrl: "",
      addedBy: "system",
      createdAt: Date.now(),
    },
    {
      id: "football-supercup",
      title: "Football — Super Cup",
      playUrl: "https://shobhit-jain09.github.io/football.io/supercup.html",
      sourceUrl: "",
      tags: ["sports", "football"],
      thumbnailUrl: "",
      addedBy: "system",
      createdAt: Date.now(),
    },
  ];
}

/** @returns {Game[]} */
function loadUserGames() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidGame);
  } catch {
    return [];
  }
}

/** @param {Game[]} games */
function saveUserGames(games) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

/** @param {unknown} g @returns {g is Game} */
function isValidGame(g) {
  if (!g || typeof g !== "object") return false;
  const game = /** @type {any} */ (g);
  return (
    typeof game.id === "string" &&
    typeof game.title === "string" &&
    typeof game.playUrl === "string" &&
    typeof game.addedBy === "string"
  );
}

/** @param {string} value */
function normalize(value) {
  return value.trim().toLowerCase();
}

/** @param {string} maybeUrl */
function isProbablyUrl(maybeUrl) {
  try {
    const u = new URL(maybeUrl);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** @param {string} maybeUrl */
function safeUrl(maybeUrl) {
  if (!maybeUrl) return "";
  if (maybeUrl.startsWith("data:image/")) return maybeUrl;
  if (!isProbablyUrl(maybeUrl)) return "";
  return maybeUrl;
}

/** @param {string} title */
function makeSvgThumb(title) {
  const safeTitle = title.trim().slice(0, 30) || "Game";
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#7c5cff"/>
      <stop offset="0.5" stop-color="#30d5c8"/>
      <stop offset="1" stop-color="#111827"/>
    </linearGradient>
    <radialGradient id="r" cx="0.15" cy="0.1" r="0.9">
      <stop offset="0" stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="22"/>
    </filter>
  </defs>
  <rect width="1200" height="600" fill="url(#g)"/>
  <circle cx="180" cy="120" r="240" fill="url(#r)"/>
  <circle cx="1020" cy="110" r="220" fill="rgba(0,0,0,0.22)" filter="url(#blur)"/>
  <circle cx="980" cy="420" r="260" fill="rgba(0,0,0,0.18)" filter="url(#blur)"/>
  <g fill="rgba(255,255,255,0.92)">
    <text x="70" y="360" font-family="ui-sans-serif, system-ui, Segoe UI, Arial" font-size="66" font-weight="800">
      ${esc(safeTitle)}
    </text>
    <text x="72" y="415" font-family="ui-sans-serif, system-ui, Segoe UI, Arial" font-size="28" font-weight="600" opacity="0.85">
      Click Play
    </text>
  </g>
</svg>`;

  // Inline SVG as data URL (no external image hosting needed)
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** @param {string} tagsText */
function parseTags(tagsText) {
  return tagsText
    .split(",")
    .map((t) => {
      const v = t.trim();
      // Strip common domain suffix from tags (ex: "game.io" -> "game")
      return v.toLowerCase().endsWith(".io") ? v.slice(0, -3) : v;
    })
    .filter(Boolean)
    .slice(0, 10);
}

/** @returns {string} */
function makeId() {
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** @param {HTMLElement} el */
function show(el) {
  el.hidden = false;
}

/** @param {HTMLElement} el */
function hide(el) {
  el.hidden = true;
}

function esc(text) {
  return text.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#039;";
      default:
        return ch;
    }
  });
}

/** @param {Game} game */
function renderCard(game) {
  const tags = (game.tags ?? []).slice(0, 6);
  const tagHtml = tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("");
  const badge = game.addedBy === "user" ? "User added" : "Featured";
  const thumb = safeUrl(game.thumbnailUrl ?? "") || makeSvgThumb(game.title);

  return `
    <article class="card" data-id="${esc(game.id)}">
      <div class="card__thumb">
        <img src="${esc(thumb)}" alt="" loading="lazy" />
        <div class="badge">${badge}</div>
      </div>
      <div class="card__body">
        <div class="card__title">${esc(game.title)}</div>
        <div class="tags">${tagHtml}</div>
      </div>
      <div class="card__actions">
        <button class="button" type="button" data-action="play">Play</button>
        ${
          safeUrl(game.sourceUrl ?? "")
            ? `<button class="button button--secondary" type="button" data-action="source">Source</button>`
            : `<span></span>`
        }
        ${
          game.addedBy === "user"
            ? `<button class="linkButton danger" type="button" data-action="remove">Remove</button>`
            : ``
        }
      </div>
    </article>
  `;
}

function main() {
  /** @type {HTMLInputElement} */
  const searchInput = document.getElementById("searchInput");
  /** @type {HTMLDivElement} */
  const gamesGrid = document.getElementById("gamesGrid");
  /** @type {HTMLDivElement} */
  const resultsMeta = document.getElementById("resultsMeta");
  /** @type {HTMLDivElement} */
  const emptyState = document.getElementById("emptyState");

  /** @type {HTMLButtonElement} */
  const btnOpenAddGame = document.getElementById("btnOpenAddGame");
  /** @type {HTMLButtonElement | null} */
  const btnOpenAddGameHero = document.getElementById("btnOpenAddGameHero");
  /** @type {HTMLDialogElement} */
  const addGameModal = document.getElementById("addGameModal");
  /** @type {HTMLFormElement} */
  const addGameForm = document.getElementById("addGameForm");
  /** @type {HTMLButtonElement} */
  const btnCloseAddGame = document.getElementById("btnCloseAddGame");
  /** @type {HTMLButtonElement} */
  const btnCancelAddGame = document.getElementById("btnCancelAddGame");
  /** @type {HTMLDivElement} */
  const addGameError = document.getElementById("addGameError");

  /** @type {HTMLDialogElement} */
  const playModal = document.getElementById("playModal");
  /** @type {HTMLIFrameElement} */
  const playFrame = document.getElementById("playFrame");
  /** @type {HTMLButtonElement} */
  const playOpenNewTab = document.getElementById("playOpenNewTab");
  /** @type {HTMLDivElement} */
  const playTitle = document.getElementById("playTitle");
  /** @type {HTMLButtonElement} */
  const btnClosePlay = document.getElementById("btnClosePlay");

  /** @type {HTMLButtonElement} */
  const btnClearUserGames = document.getElementById("btnClearUserGames");

  let userGames = loadUserGames();
  const defaultGames = getDefaultGames();
  let currentPlayUrl = "";

  /** @type {Map<string, Game>} */
  const gameIndex = new Map();

  function rebuildIndex() {
    gameIndex.clear();
    for (const g of defaultGames) gameIndex.set(g.id, g);
    for (const g of userGames) gameIndex.set(g.id, g);
  }

  /** @returns {Game[]} */
  function getAllGames() {
    rebuildIndex();
    return [...defaultGames, ...userGames];
  }

  function render() {
    const q = normalize(searchInput.value || "");
    const all = getAllGames();
    const filtered = q
      ? all.filter((g) => {
          const blob = [
            g.title,
            ...(g.tags ?? []),
            g.addedBy,
          ]
            .join(" ")
            .toLowerCase();
          return blob.includes(q);
        })
      : all;

    gamesGrid.innerHTML = filtered.map(renderCard).join("");
    resultsMeta.textContent = `${filtered.length} game${filtered.length === 1 ? "" : "s"}`;

    if (filtered.length === 0) show(emptyState);
    else hide(emptyState);
  }

  function openAddModal() {
    hide(addGameError);
    addGameForm.reset();
    addGameModal.showModal();
    const titleInput = /** @type {HTMLInputElement} */ (document.getElementById("gameTitle"));
    titleInput?.focus();
  }

  function closeAddModal() {
    addGameModal.close();
  }

  /** @param {string} message */
  function showAddError(message) {
    addGameError.textContent = message;
    show(addGameError);
  }

  /** @param {Game} game */
  function openPlay(game) {
    playTitle.textContent = `Play: ${game.title}`;
    currentPlayUrl = game.playUrl;
    // Reset iframe then set src (helps when switching games quickly)
    playFrame.src = "about:blank";
    // Use a microtask to avoid some browsers ignoring src changes
    Promise.resolve().then(() => {
      playFrame.src = game.playUrl;
    });
    playModal.showModal();
  }

  function closePlay() {
    playModal.close();
    playFrame.src = "about:blank";
    currentPlayUrl = "";
  }

  function removeUserGame(id) {
    userGames = userGames.filter((g) => g.id !== id);
    saveUserGames(userGames);
    render();
  }

  // Events
  searchInput.addEventListener("input", render);
  btnOpenAddGame.addEventListener("click", openAddModal);
  btnOpenAddGameHero?.addEventListener("click", openAddModal);
  btnCloseAddGame.addEventListener("click", closeAddModal);
  btnCancelAddGame.addEventListener("click", closeAddModal);
  addGameModal.addEventListener("click", (e) => {
    // Click on the backdrop (dialog itself) closes
    if (e.target === addGameModal) closeAddModal();
  });

  addGameForm.addEventListener("submit", (e) => {
    e.preventDefault();
    hide(addGameError);

    const fd = new FormData(addGameForm);
    const title = String(fd.get("title") ?? "").trim();
    const playUrl = String(fd.get("playUrl") ?? "").trim();
    const sourceUrl = String(fd.get("sourceUrl") ?? "").trim();
    const tagsText = String(fd.get("tags") ?? "").trim();
    const thumbnailUrl = String(fd.get("thumbnailUrl") ?? "").trim();

    if (!title) return showAddError("Please enter a game name.");
    if (title.length > 60) return showAddError("Game name is too long (max 60 chars).");

    if (!isProbablyUrl(playUrl)) return showAddError("Play URL must be a valid http(s) URL.");
    if (sourceUrl && !isProbablyUrl(sourceUrl))
      return showAddError("Source URL must be a valid http(s) URL (or leave it empty).");
    if (thumbnailUrl && !isProbablyUrl(thumbnailUrl))
      return showAddError("Thumbnail URL must be a valid http(s) URL (or leave it empty).");

    const tags = parseTags(tagsText);

    const game = /** @type {Game} */ ({
      id: makeId(),
      title,
      playUrl,
      sourceUrl,
      tags,
      thumbnailUrl,
      addedBy: "user",
      createdAt: Date.now(),
    });

    userGames = [game, ...userGames].slice(0, 200);
    saveUserGames(userGames);
    closeAddModal();
    render();
  });

  gamesGrid.addEventListener("click", (e) => {
    const target = /** @type {HTMLElement} */ (e.target);
    const action = target?.getAttribute?.("data-action");
    if (!action) return;

    const card = target.closest?.(".card");
    const id = card?.getAttribute?.("data-id");
    if (!id) return;

    const game = gameIndex.get(id);
    if (!game) return;

    if (action === "play") openPlay(game);
    if (action === "source" && safeUrl(game.sourceUrl ?? "")) {
      window.open(game.sourceUrl, "_blank", "noopener,noreferrer");
    }
    if (action === "remove" && game.addedBy === "user") removeUserGame(game.id);
  });

  playOpenNewTab.addEventListener("click", () => {
    if (!currentPlayUrl) return;
    window.open(currentPlayUrl, "_blank", "noopener,noreferrer");
  });
  btnClosePlay.addEventListener("click", closePlay);
  playModal.addEventListener("click", (e) => {
    // Click on the backdrop (dialog itself) closes
    if (e.target === playModal) closePlay();
  });

  btnClearUserGames.addEventListener("click", () => {
    const ok = confirm("Remove all games you added on this browser?");
    if (!ok) return;
    userGames = [];
    saveUserGames(userGames);
    render();
  });

  // Initial render
  render();
}

document.addEventListener("DOMContentLoaded", main);
