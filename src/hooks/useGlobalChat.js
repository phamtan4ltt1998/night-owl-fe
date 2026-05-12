import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api.js';

const POLL_MS = 30_000;

export function useGlobalChat() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [posting, setPosting]   = useState(false);
  const timerRef = useRef(null);

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.getGlobalComments({ limit: 50 });
      setComments(prev => {
        // Preserve optimistic pending items not yet confirmed
        const pending = prev.filter(c => c._pending);
        const real = res.data ?? [];
        const pendingIds = new Set(pending.map(c => c._tempContent));
        return [
          ...pending.filter(c => !real.some(r => r.content === c._tempContent)),
          ...real,
        ];
      });
    } catch {
      // Silently keep stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComments();
    timerRef.current = setInterval(fetchComments, POLL_MS);
    return () => clearInterval(timerRef.current);
  }, [fetchComments]);

  const post = useCallback(async (content, contextHint) => {
    if (!content.trim()) return;
    setPosting(true);

    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      content: content.trim(),
      context_hint: contextHint || null,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 2 * 86_400_000).toISOString(),
      is_own: true,
      username: 'Bạn',
      avatar_url: null,
      _pending: true,
      _tempContent: content.trim(),
    };
    setComments(prev => [optimistic, ...prev]);

    try {
      const real = await api.postGlobalComment({ content: content.trim(), context_hint: contextHint || null });
      setComments(prev => prev.map(c => c.id === tempId ? { ...real, _pending: false } : c));
    } catch (err) {
      setComments(prev => prev.filter(c => c.id !== tempId));
      throw err;
    } finally {
      setPosting(false);
    }
  }, []);

  const remove = useCallback(async (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
    try {
      await api.deleteGlobalComment(id);
    } catch {
      // Optimistic remove — silently ignore server error
    }
  }, []);

  return { comments, loading, posting, post, remove, refresh: fetchComments };
}
