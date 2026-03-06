import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTaskContext must be used within a TaskProvider');
  return context;
};

export const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr); const t = new Date();
  return d.toDateString() === t.toDateString();
};
export const isTomorrow = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr); const t = new Date();
  t.setDate(t.getDate() + 1);
  return d.toDateString() === t.toDateString();
};
export const isThisWeek = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr); const now = new Date(); const end = new Date();
  end.setDate(now.getDate() + 7);
  return d >= now && d <= end;
};
export const isOverdue = (dateStr, status) => {
  if (!dateStr || status === 'Finished') return false;
  const d = new Date(dateStr); d.setHours(23, 59, 59, 999);
  return d < new Date();
};

// ── Browser Notification helpers ──────────────────────────
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
};

const sendNotification = (title, body, icon = '📋') => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico' });
  } catch (e) { /* silently fail */ }
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loaded, setLoaded] = useState(false); // ← FIX: guard flag
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDeadline, setFilterDeadline] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const notifiedRef = useRef(new Set()); // track already-notified task ids
  const tasksPerPage = 9;

  // ── Load from localStorage ONCE on mount ──────────────────
  useEffect(() => {
    const saved = localStorage.getItem('stp_tasks');
    if (saved) {
      try { setTasks(JSON.parse(saved)); } catch (e) { /* corrupted data */ }
    }
    const dm = localStorage.getItem('stp_darkmode');
    if (dm !== null) {
      try { setDarkMode(JSON.parse(dm)); } catch (e) {}
    }
    setLoaded(true); // mark load as complete
  }, []);

  // ── Save to localStorage ONLY after initial load ───────────
  useEffect(() => {
    if (!loaded) return; // ← FIX: don't overwrite with [] on first render
    localStorage.setItem('stp_tasks', JSON.stringify(tasks));
  }, [tasks, loaded]);

  useEffect(() => {
    localStorage.setItem('stp_darkmode', JSON.stringify(darkMode));
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // ── Request notification permission on load ────────────────
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // ── Check for due/overdue tasks every 60s ─────────────────
  useEffect(() => {
    if (!loaded) return;

    const checkNotifications = () => {
      const overdue = tasks.filter(t => isOverdue(t.deadline, t.status));
      const dueToday = tasks.filter(t => isToday(t.deadline) && t.status !== 'Finished');

      overdue.forEach(t => {
        const key = `overdue-${t.id}`;
        if (!notifiedRef.current.has(key)) {
          notifiedRef.current.add(key);
          sendNotification('⚠️ Overdue Task', `"${t.title}" is past its deadline!`);
          toast.warn(`⚠️ "${t.title}" is overdue!`, { toastId: key });
        }
      });

      dueToday.forEach(t => {
        const key = `today-${t.id}`;
        if (!notifiedRef.current.has(key)) {
          notifiedRef.current.add(key);
          sendNotification('📅 Due Today', `"${t.title}" is due today.`);
          toast.info(`📅 "${t.title}" is due today!`, { toastId: key });
        }
      });
    };

    checkNotifications(); // run immediately on load
    const interval = setInterval(checkNotifications, 60000); // then every 60s
    return () => clearInterval(interval);
  }, [tasks, loaded]);

  const getFilteredTasks = useCallback(() => {
    let result = [...tasks];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'All') result = result.filter(t => t.status === filterStatus);
    if (filterPriority !== 'All') result = result.filter(t => t.priority === filterPriority);
    if (filterCategory !== 'All') result = result.filter(t => t.category === filterCategory);
    if (filterDeadline !== 'All') {
      if (filterDeadline === 'Today') result = result.filter(t => isToday(t.deadline));
      else if (filterDeadline === 'Tomorrow') result = result.filter(t => isTomorrow(t.deadline));
      else if (filterDeadline === 'This Week') result = result.filter(t => isThisWeek(t.deadline));
      else if (filterDeadline === 'Overdue') result = result.filter(t => isOverdue(t.deadline, t.status));
      else if (filterDeadline === 'No Deadline') result = result.filter(t => !t.deadline);
    }
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'priority') cmp = (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      else if (sortBy === 'deadline') {
        if (!a.deadline && !b.deadline) cmp = 0;
        else if (!a.deadline) cmp = 1;
        else if (!b.deadline) cmp = -1;
        else cmp = new Date(a.deadline) - new Date(b.deadline);
      } else if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
      else if (sortBy === 'status') {
        const so = { 'Not Started': 1, 'In Progress': 2, 'Finished': 3 };
        cmp = so[a.status] - so[b.status];
      } else cmp = new Date(a.createdAt) - new Date(b.createdAt);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [tasks, searchQuery, filterStatus, filterPriority, filterCategory, filterDeadline, sortBy, sortOrder]);

  const getStats = useCallback(() => {
    const total = tasks.length;
    const finished = tasks.filter(t => t.status === 'Finished').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const notStarted = tasks.filter(t => t.status === 'Not Started').length;
    const overdue = tasks.filter(t => isOverdue(t.deadline, t.status)).length;
    const high = tasks.filter(t => t.priority === 'High' && t.status !== 'Finished').length;
    const todayTasks = tasks.filter(t => isToday(t.deadline) && t.status !== 'Finished').length;
    const productivity = total > 0 ? Math.round((finished / total) * 100) : 0;
    const categories = ['Work', 'Study', 'Personal', 'Projects'].map(cat => ({
      name: cat,
      count: tasks.filter(t => t.category === cat).length,
      done: tasks.filter(t => t.category === cat && t.status === 'Finished').length
    }));
    return { total, finished, inProgress, notStarted, overdue, high, todayTasks, productivity, categories };
  }, [tasks]);

  const getAISuggestion = useCallback(() => {
    const overdueTasks = tasks.filter(t => isOverdue(t.deadline, t.status));
    const todayDue = tasks.filter(t => isToday(t.deadline) && t.status !== 'Finished');
    const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Finished');
    if (overdueTasks.length > 0) return { type: 'urgent', message: `⚠️ You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Tackle "${overdueTasks[0].title}" first!` };
    if (todayDue.length > 0) return { type: 'today', message: `📅 ${todayDue.length} task${todayDue.length > 1 ? 's' : ''} due today. Start with "${todayDue[0].title}".` };
    if (highPriority.length > 0) return { type: 'priority', message: `🎯 Focus on high-priority: "${highPriority[0].title}" for maximum impact.` };
    const stats = getStats();
    if (stats.productivity >= 70) return { type: 'good', message: `🔥 Impressive ${stats.productivity}% productivity! You're crushing it today.` };
    if (tasks.length === 0) return { type: 'start', message: `👋 Add your first task to get started. Let's build some momentum!` };
    return { type: 'good', message: `✨ You're making progress! ${stats.finished} tasks completed so far.` };
  }, [tasks, getStats]);

  const addTask = (task) => {
    const newTask = { id: Date.now(), ...task, createdAt: new Date().toISOString() };
    setTasks(prev => [newTask, ...prev]);
    toast.success('✅ Task created!');
    // notify if due today
    if (isToday(task.deadline)) {
      sendNotification('📅 New Task Due Today', `"${task.title}" is due today!`);
    }
  };

  const updateTask = (id, updated) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updated } : t));
    toast.success('✏️ Task updated!');
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.error('🗑️ Task deleted.');
  };

  const toggleComplete = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const ns = t.status === 'Finished' ? 'Not Started' : 'Finished';
      if (ns === 'Finished') {
        toast.success('🎉 Task completed!');
        sendNotification('🎉 Task Done!', `"${t.title}" marked as complete.`);
      } else {
        toast.info('↩️ Task reopened.');
      }
      return { ...t, status: ns };
    }));
  };

  const ft = getFilteredTasks();
  const currentTasks = ft.slice((currentPage - 1) * tasksPerPage, currentPage * tasksPerPage);
  const totalPages = Math.ceil(ft.length / tasksPerPage);

  return (
    <TaskContext.Provider value={{
      tasks, filteredTasks: ft, currentTasks, totalPages, currentPage, setCurrentPage,
      searchQuery, setSearchQuery, filterStatus, setFilterStatus, filterPriority, setFilterPriority,
      filterCategory, setFilterCategory, filterDeadline, setFilterDeadline,
      sortBy, setSortBy, sortOrder, setSortOrder, darkMode, setDarkMode,
      activeView, setActiveView, addTask, updateTask, deleteTask, toggleComplete,
      getStats, getAISuggestion, loaded
    }}>
      {children}
    </TaskContext.Provider>
  );
};
