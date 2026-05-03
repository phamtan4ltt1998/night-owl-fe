const BASE = '/api';
const TOKEN_KEY = 'nightowl_token';

export const token = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

function authHeaders(extra = {}) {
  const t = token.get();
  return t
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${t}`, ...extra }
    : { 'Content-Type': 'application/json', ...extra };
}

function handle401(res) {
  if (res.status === 401) {
    token.clear();
    window.dispatchEvent(new CustomEvent('nightowl:unauthorized'));
  }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  handle401(res);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function patch(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'PATCH', headers: authHeaders() });
  handle401(res);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  handle401(res);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  handle401(res);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers: authHeaders() });
  handle401(res);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  getBooks: (genre) => get(genre ? `/books?genre=${encodeURIComponent(genre)}` : '/books'),
  getBooksPaged: ({ page = 1, pageSize = 24, genre, sortBy = 'read_count', sortOrder = 'desc' } = {}) => {
    const params = new URLSearchParams({ page, page_size: pageSize, sort_by: sortBy, sort_order: sortOrder });
    if (genre && genre !== 'Tất cả') params.set('genre', genre);
    return get(`/books/paged?${params}`);
  },
  searchBooks: (q, { genre, limit = 20, offset = 0 } = {}) => {
    const params = new URLSearchParams({ q, limit, offset });
    if (genre && genre !== 'Tất cả') params.set('genre', genre);
    return get(`/books/search?${params}`);
  },
  getBook: (id) => get(`/books/${id}`),
  getChapters: (bookId) => get(`/books/${bookId}/chapters`),
  getChapterContent: (bookId, chapterNumber, sessionToken) =>
    get(`/books/${bookId}/chapters/${chapterNumber}/content?session_token=${encodeURIComponent(sessionToken)}`),
  getGenres: () => get('/genres'),
  getNotifications: () => get('/notifications'),
  markRead: (id) => patch(`/notifications/${id}/read`),
  markAllRead: () => patch('/notifications/read-all'),
  getChapterAudioStatus: (storyName, chapterNumber) =>
    get(`/tts/story/${encodeURIComponent(storyName)}/chapters/${chapterNumber}/status`),
  getChapterAudioUrl: (storyName, chapterNumber) =>
    `${BASE}/tts/story/${encodeURIComponent(storyName)}/chapters/${chapterNumber}/audio`,
  generateChapterAudio: (storyName, chapterNumber, mode = 'turbo') =>
    post('/tts/story', { story_name: storyName, chapters: [chapterNumber], mode }),

  // Auth
  googleLogin: (info) => post('/auth/google', info),
  facebookLogin: (info) => post('/auth/facebook', info),

  // User / Linh Thạch
  getUserProfile: (email) => get(`/user/profile/${encodeURIComponent(email)}`),
  updateUserProfile: (email, name, bio) => put('/user/profile', { email, name, bio }),
  purchaseLinhThach: (email, pkg) => post('/user/linh-thach/purchase', { email, ...pkg }),
  getLinhThachHistory: (email, limit = 20) =>
    get(`/user/linh-thach/history/${encodeURIComponent(email)}?limit=${limit}`),
  claimDailyReward: (email) => post('/user/linh-thach/daily', { email }),
  unlockChapter: (bookId, chapterNumber) =>
    post(`/books/${bookId}/chapters/${chapterNumber}/unlock`, {}),

  // Reading history
  updateReadingProgress: (email, bookId, chapterNumber) =>
    post('/user/reading-progress', { email, book_id: bookId, chapter_number: chapterNumber }),
  getReadingHistory: (email) =>
    get(`/user/reading-history/${encodeURIComponent(email)}`),

  // Inline comments (Wattpad-style paragraph comments)
  getCommentCounts: (bookId, chapterNumber) =>
    get(`/books/${bookId}/chapters/${chapterNumber}/comment-counts`),
  getParagraphComments: (bookId, chapterNumber, paragraphId, { page = 1, limit = 10 } = {}) => {
    const params = new URLSearchParams({ page, limit });
    return get(`/books/${bookId}/chapters/${chapterNumber}/paragraphs/${encodeURIComponent(paragraphId)}/comments?${params}`);
  },
  postInlineComment: (chapterId, paragraphId, content, parentId = null) =>
    post('/comments/inline', { chapter_id: chapterId, paragraph_id: paragraphId, content, parent_id: parentId }),
  deleteInlineComment: (commentId) =>
    del(`/comments/inline/${commentId}`),
};
