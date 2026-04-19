const BASE = 'http://localhost:8000';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function patch(path) {
  const res = await fetch(`${BASE}${path}`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

export const api = {
  getBooks: (genre) => get(genre ? `/books?genre=${encodeURIComponent(genre)}` : '/books'),
  getBook: (id) => get(`/books/${id}`),
  getChapters: (bookId) => get(`/books/${bookId}/chapters`),
  getChapterContent: (bookId, chapterNumber) => get(`/books/${bookId}/chapters/${chapterNumber}/content`),
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

  // User / Linh Thạch
  getUserProfile: (email) => get(`/user/profile/${encodeURIComponent(email)}`),
  updateUserProfile: (email, name, bio) => put('/user/profile', { email, name, bio }),
  purchaseLinhThach: (email, pkg) => post('/user/linh-thach/purchase', { email, ...pkg }),
  getLinhThachHistory: (email, limit = 20) =>
    get(`/user/linh-thach/history/${encodeURIComponent(email)}?limit=${limit}`),
  claimDailyReward: (email) => post('/user/linh-thach/daily', { email }),
};
