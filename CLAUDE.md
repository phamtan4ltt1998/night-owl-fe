# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (HTTPS on localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

No test runner configured.

## Architecture

**Stack**: React 18 + Vite. No TypeScript, no CSS framework, no React Router.

### Navigation model

`App.jsx` owns all top-level state and implements a custom screen router via a `screen` string + `detail` object. `navigate(screenName, book, chIdx)` is the only way to change screens — passed as `onNavigate` prop to every screen. Persisted to `localStorage` key `nightowl_web`.

Screens that render fullscreen (no Sidebar): `reader`, `audiobook`.  
Screens with Sidebar: `home`, `library`, `foreign`, `audio`, `profile`, `notifications`.

### API layer (`src/api.js`)

Single module. All requests go to `http://localhost:8000` directly (also proxied via Vite `/api` → `localhost:8000`). JWT stored in `localStorage` key `nightowl_token` via the `token` helper. On 401, fires `nightowl:unauthorized` custom event → App auto-logs out user.

Key API domains:
- Books: `getBooks`, `searchBooks`, `getBook`, `getChapters`, `getChapterContent`
- TTS/Audio: `getChapterAudioStatus`, `getChapterAudioUrl`, `generateChapterAudio`
- Auth: `googleLogin`, `facebookLogin`
- User/economy: `getUserProfile`, `updateUserProfile`, `purchaseLinhThach`, `claimDailyReward`, `unlockChapter`
- Reading history: `updateReadingProgress`, `getReadingHistory`

### In-app currency

"Linh Thạch" (💎) is the unlock currency. Locked chapters cost `UNLOCK_COST = 5` Linh Thạch (defined in `ReaderScreen.jsx`). Balance synced from `user.linh_thach` and updated optimistically on unlock.

### Auth

Google OAuth via `@react-oauth/google`. Facebook via SDK loaded globally in `index.html` (app ID `1858136881540163`, `FB.init` called on `window.fbAsyncInit`). Both flows call backend and receive a JWT, stored via `token.set()`.

### Styling

All styles are inline objects. Theme via CSS custom properties (`--accent`, `--surface`, `--border`, etc.) defined in `index.html` or a global stylesheet. Dark mode toggled by adding `class="dark"` to `<html>`. Fonts: Bricolage Grotesque (display), Inter (body), loaded from Google Fonts.

### Key files

| File | Role |
|------|------|
| `src/App.jsx` | Root state, screen router, localStorage persistence |
| `src/api.js` | All API calls + JWT management |
| `src/Sidebar.jsx` | Collapsible nav (248px expanded / 64px collapsed) |
| `src/components/shared.jsx` | `Pill`, `StarRating`, `Btn`, `BookCard`, `Section` |
| `src/components/Icons.jsx` | All SVG icons as functions: `Icons.compass(size)` etc. |
| `src/components/BookCover.jsx` | Book cover renderer |
| `src/TweaksPanel.jsx` | Dev edit-mode panel, activated via `postMessage({type:'__activate_edit_mode'})` |
| `src/data.js` | Static seed/fallback data |

### Reading progress sync

`readProgress` (map of `bookId → chapterIndex`) lives in App state and localStorage. On login, DB history is fetched and merged — DB wins only if its chapter index is higher. Progress synced to DB on chapter change via `api.updateReadingProgress`.

### SSL in dev

`@vitejs/plugin-basic-ssl` enables HTTPS — required for Google OAuth. Accept the self-signed cert on first load.
