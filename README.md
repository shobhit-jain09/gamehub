# Game Hub (static)

A simple **static website** that lists your games and lets visitors **add their own games** (saved to their browser via `localStorage`).

## Files

- `index.html`: UI
- `styles.css`: styling
- `app.js`: game list logic + add/play modals + storage

## Add your own GitHub game

Edit the placeholder entry inside `app.js` in `getDefaultGames()`:

- Replace:
  - `https://YOUR-USERNAME.github.io/YOUR-REPO/` (your GitHub Pages game URL)
  - `https://github.com/YOUR-USERNAME/YOUR-REPO` (your repo URL)

## Run locally

This is a static site. You can open `index.html` directly, but it’s best to run a small local server:

- If you have Python:
  - `python -m http.server 5173`
  - then open `http://localhost:5173`

## Deploy to GitHub Pages

1. Create a GitHub repo and push these files to the repo root.
2. In GitHub: **Settings → Pages**
3. Set:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or `master`) / **root**
4. Save, then wait for the Pages URL.

## Notes about embedding games

Some sites block being embedded in an `<iframe>` (security headers).  
If a game doesn’t load inside the Play modal, use **“Open in new tab”**.

