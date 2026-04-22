import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import './App.css';
import type { Task, TaskStatus } from './types/task';
import * as taskApi from './lib/taskApi';

type Filter = 'all' | TaskStatus;

function formatDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('pending');
  const [savingEdit, setSavingEdit] = useState(false);

  const visibleTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      const aT = new Date(a.createdAt).getTime();
      const bT = new Date(b.createdAt).getTime();
      return bT - aT;
    });
    if (filter === 'all') return sorted;
    return sorted.filter((t) => t.status === filter);
  }, [tasks, filter]);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    taskApi
      .getTasks(ac.signal)
      .then((data) => setTasks(data))
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Không thể tải danh sách task'),
      )
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) return;

    setCreating(true);
    setError(null);
    try {
      const created = await taskApi.createTask({ title: t, description: d });
      setTasks((prev) => [created, ...prev]);
      setTitle('');
      setDescription('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Tạo task thất bại');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(task: Task) {
    setEditingId(task._id);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditStatus('pending');
  }

  async function saveEdit(task: Task) {
    const t = editTitle.trim();
    const d = editDescription.trim();
    if (!t || !d) return;

    const nextCompletedAt =
      editStatus === 'completed'
        ? task.completedAt ?? new Date().toISOString()
        : null;

    setSavingEdit(true);
    setError(null);
    try {
      const updated = await taskApi.updateTask(task._id, {
        title: t,
        description: d,
        status: editStatus,
        completedAt: nextCompletedAt,
      });
      setTasks((prev) => prev.map((x) => (x._id === task._id ? updated : x)));
      cancelEdit();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Cập nhật task thất bại');
    } finally {
      setSavingEdit(false);
    }
  }

  async function toggleStatus(task: Task) {
    setError(null);
    const nextStatus: TaskStatus =
      task.status === 'completed' ? 'pending' : 'completed';
    const nextCompletedAt =
      nextStatus === 'completed' ? new Date().toISOString() : null;

    const optimistic: Task = {
      ...task,
      status: nextStatus,
      completedAt: nextCompletedAt,
    };
    setTasks((prev) => prev.map((x) => (x._id === task._id ? optimistic : x)));

    try {
      const updated = await taskApi.updateTask(task._id, {
        status: nextStatus,
        completedAt: nextCompletedAt,
      });
      setTasks((prev) => prev.map((x) => (x._id === task._id ? updated : x)));
    } catch (e: unknown) {
      setTasks((prev) => prev.map((x) => (x._id === task._id ? task : x)));
      setError(e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại');
    }
  }

  async function remove(task: Task) {
    setError(null);
    const snapshot = tasks;
    setTasks((prev) => prev.filter((x) => x._id !== task._id));
    try {
      await taskApi.deleteTask(task._id);
    } catch (e: unknown) {
      setTasks(snapshot);
      setError(e instanceof Error ? e.message : 'Xóa task thất bại');
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>TodoX</h1>
        </div>

        <div className="filters" role="tablist" aria-label="Bộ lọc">
          <button
            className={filter === 'all' ? 'chip active' : 'chip'}
            onClick={() => setFilter('all')}
            type="button"
          >
            Tất cả
          </button>
          <button
            className={filter === 'pending' ? 'chip active' : 'chip'}
            onClick={() => setFilter('pending')}
            type="button"
          >
            Chưa xong
          </button>
          <button
            className={filter === 'completed' ? 'chip active' : 'chip'}
            onClick={() => setFilter('completed')}
            type="button"
          >
            Hoàn thành
          </button>
        </div>
      </header>

      <main className="main">
        <section className="card">
          <h2>Tạo task</h2>
          <form className="form" onSubmit={onCreate}>
            <label className="field">
              <span className="label">Tiêu đề</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Học Vite"
                maxLength={140}
                required
              />
            </label>
            <label className="field">
              <span className="label">Mô tả</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chi tiết task..."
                rows={3}
                maxLength={2000}
                required
              />
            </label>
            <div className="row">
              <button className="btn primary" disabled={creating} type="submit">
                {creating ? 'Đang tạo...' : 'Thêm task'}
              </button>
              <div className="meta">
                {loading ? 'Đang tải...' : `${tasks.length} task`}
              </div>
            </div>
          </form>
          {error ? <div className="error">{error}</div> : null}
        </section>

        <section className="card">
          <h2>Danh sách</h2>

          {loading ? (
            <div className="empty">Đang tải danh sách...</div>
          ) : visibleTasks.length === 0 ? (
            <div className="empty">Chưa có task nào.</div>
          ) : (
            <ul className="list">
              {visibleTasks.map((t) => {
                const isEditing = editingId === t._id;
                return (
                  <li key={t._id} className="item">
                    <button
                      type="button"
                      className={
                        t.status === 'completed' ? 'check done' : 'check'
                      }
                      onClick={() => toggleStatus(t)}
                      aria-label="Đổi trạng thái"
                      title="Đổi trạng thái"
                    />

                    <div className="content">
                      {isEditing ? (
                        <div className="edit">
                          <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            maxLength={140}
                            required
                          />
                          <label className="field">
                            <span className="label">Trạng thái</span>
                            <select
                              value={editStatus}
                              onChange={(e) =>
                                setEditStatus(e.target.value as TaskStatus)
                              }
                            >
                              <option value="pending">pending</option>
                              <option value="completed">completed</option>
                            </select>
                          </label>
                          <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            rows={3}
                            maxLength={2000}
                            required
                          />
                          <div className="row">
                            <button
                              type="button"
                              className="btn primary"
                              onClick={() => saveEdit(t)}
                              disabled={savingEdit}
                            >
                              {savingEdit ? 'Đang lưu...' : 'Lưu'}
                            </button>
                            <button
                              type="button"
                              className="btn"
                              onClick={cancelEdit}
                              disabled={savingEdit}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="titleRow">
                            <div
                              className={
                                t.status === 'completed'
                                  ? 'title done'
                                  : 'title'
                              }
                            >
                              {t.title}
                            </div>
                            <span
                              className={
                                t.status === 'completed'
                                  ? 'badge completed'
                                  : 'badge pending'
                              }
                            >
                              {t.status}
                            </span>
                          </div>
                          <div className="desc">{t.description}</div>
                          <div className="dates">
                            <span>Created: {formatDate(t.createdAt)}</span>
                            <span>Done: {formatDate(t.completedAt)}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing ? (
                      <div className="actions">
                        <button
                          className="btn"
                          type="button"
                          onClick={() => startEdit(t)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn danger"
                          type="button"
                          onClick={() => remove(t)}
                        >
                          Xóa
                        </button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
