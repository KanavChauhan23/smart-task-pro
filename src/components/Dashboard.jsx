import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import TaskList from './TaskList';
import TaskForm from './TaskForm';

const NAV_ITEMS = [
  { id: 'dashboard', icon: '▦', label: 'Dashboard' },
  { id: 'tasks', icon: '✓', label: 'All Tasks' },
  { id: 'today', icon: '◷', label: "Today's Tasks" },
  { id: 'analytics', icon: '◈', label: 'Analytics' },
];

const CATEGORIES = ['All','Work','Study','Personal','Projects'];
const STATUSES = ['All','Not Started','In Progress','Finished'];
const PRIORITIES = ['All','High','Medium','Low'];
const DEADLINES = ['All','Today','Tomorrow','This Week','Overdue','No Deadline'];

const Ring = ({ pct, size=80, stroke=8, color='#6366f1' }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 1s ease' }}
      />
    </svg>
  );
};

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="stat-card" style={{ '--sc': color }}>
    <div className="stat-card-icon">{icon}</div>
    <div className="stat-card-info">
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  </div>
);

const Dashboard = ({ onLogout }) => {
  const {
    tasks, filteredTasks, currentPage, setCurrentPage, totalPages,
    searchQuery, setSearchQuery, filterStatus, setFilterStatus,
    filterPriority, setFilterPriority, filterCategory, setFilterCategory,
    filterDeadline, setFilterDeadline, sortBy, setSortBy, sortOrder, setSortOrder,
    darkMode, setDarkMode, activeView, setActiveView, getStats, getAISuggestion
  } = useTaskContext();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [aiVisible, setAiVisible] = useState(true);

  const stats = getStats();
  const aiSuggestion = getAISuggestion();

  const handleEdit = (task) => { setEditingTask(task); setShowForm(true); };
  const handleClose = () => { setShowForm(false); setEditingTask(null); };

  const resetFilters = () => {
    setFilterStatus('All'); setFilterPriority('All');
    setFilterCategory('All'); setFilterDeadline('All');
    setSearchQuery('');
  };

  const activeFiltersCount = [filterStatus, filterPriority, filterCategory, filterDeadline]
    .filter(f => f !== 'All').length + (searchQuery ? 1 : 0);

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            {sidebarOpen && <div className="brand-text"><span>Smart Task</span><strong>Pro</strong></div>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>}
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
              {item.id === 'today' && stats.todayTasks > 0 && sidebarOpen && (
                <span className="nav-badge">{stats.todayTasks}</span>
              )}
            </button>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-categories">
            <p className="sidebar-section-label">Categories</p>
            {stats.categories.map(cat => (
              <button key={cat.name} className={`cat-item ${filterCategory === cat.name ? 'active' : ''}`}
                onClick={() => { setFilterCategory(cat.name === filterCategory ? 'All' : cat.name); setActiveView('tasks'); }}>
                <span className="cat-dot"></span>
                <span className="cat-name">{cat.name}</span>
                <span className="cat-count">{cat.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)} title="Toggle theme">
            <span>{darkMode ? '☀️' : '🌙'}</span>
            {sidebarOpen && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button className="logout-btn" onClick={onLogout} title="Logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <h2 className="page-title">
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'tasks' && 'All Tasks'}
              {activeView === 'today' && "Today's Tasks"}
              {activeView === 'analytics' && 'Analytics'}
            </h2>
            <span className="task-count">{stats.total} task{stats.total !== 1 ? 's' : ''}</span>
          </div>
          <div className="topbar-right">
            <div className="search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="Search tasks..." value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="search-input" />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="search-clear">×</button>}
            </div>
            <button className="btn-add" onClick={() => setShowForm(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="dashboard-content">
            {/* AI Suggestion */}
            {aiVisible && (
              <div className={`ai-banner ai-${aiSuggestion.type}`}>
                <div className="ai-banner-icon">🤖</div>
                <div className="ai-banner-text">
                  <strong>Smart Suggestion</strong>
                  <p>{aiSuggestion.message}</p>
                </div>
                <button className="ai-banner-close" onClick={() => setAiVisible(false)}>×</button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
              <StatCard label="Total Tasks" value={stats.total} icon="📋" color="#6366f1" />
              <StatCard label="In Progress" value={stats.inProgress} icon="⚡" color="#6366f1" sub={`${stats.notStarted} not started`} />
              <StatCard label="Completed" value={stats.finished} icon="✅" color="#10b981" sub={`${stats.productivity}% productivity`} />
              <StatCard label="High Priority" value={stats.high} icon="🔥" color="#ef4444" sub="needs attention" />
              <StatCard label="Due Today" value={stats.todayTasks} icon="📅" color="#f59e0b" />
              <StatCard label="Overdue" value={stats.overdue} icon="⚠️" color="#ef4444" sub={stats.overdue > 0 ? 'action needed' : 'all caught up'} />
            </div>

            {/* Productivity + Categories Row */}
            <div className="dash-row">
              <div className="productivity-card">
                <h3>Overall Productivity</h3>
                <div className="productivity-ring">
                  <div className="ring-wrap">
                    <Ring pct={stats.productivity} size={120} stroke={10} color={stats.productivity >= 70 ? '#10b981' : stats.productivity >= 40 ? '#f59e0b' : '#ef4444'} />
                    <div className="ring-label">
                      <span className="ring-pct">{stats.productivity}%</span>
                      <span className="ring-sub">done</span>
                    </div>
                  </div>
                  <div className="productivity-legend">
                    {[
                      { label: 'Completed', val: stats.finished, color: '#10b981' },
                      { label: 'In Progress', val: stats.inProgress, color: '#6366f1' },
                      { label: 'Not Started', val: stats.notStarted, color: '#64748b' },
                    ].map(item => (
                      <div key={item.label} className="legend-item">
                        <span className="legend-dot" style={{ background: item.color }}></span>
                        <span className="legend-label">{item.label}</span>
                        <span className="legend-val">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="categories-card">
                <h3>By Category</h3>
                <div className="category-bars">
                  {stats.categories.map(cat => (
                    <div key={cat.name} className="cat-bar-row">
                      <div className="cat-bar-label">
                        <span>{cat.name}</span>
                        <span className="cat-bar-count">{cat.count}</span>
                      </div>
                      <div className="cat-bar-track">
                        <div className="cat-bar-fill" style={{ width: cat.count > 0 ? `${(cat.done/cat.count)*100}%` : '0%' }}></div>
                      </div>
                      <span className="cat-bar-pct">{cat.count > 0 ? Math.round((cat.done/cat.count)*100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="quick-stats-card">
                <h3>Task Status</h3>
                {[
                  { label: 'High Priority', val: tasks.filter(t=>t.priority==='High').length, color: '#ef4444' },
                  { label: 'Medium Priority', val: tasks.filter(t=>t.priority==='Medium').length, color: '#f59e0b' },
                  { label: 'Low Priority', val: tasks.filter(t=>t.priority==='Low').length, color: '#10b981' },
                ].map(item => (
                  <div key={item.label} className="quick-stat-row">
                    <div className="quick-stat-label">
                      <span className="quick-dot" style={{ background: item.color }}></span>
                      {item.label}
                    </div>
                    <div className="quick-stat-bar">
                      <div className="quick-bar-fill" style={{ width: stats.total > 0 ? `${(item.val/stats.total)*100}%` : '0', background: item.color }}></div>
                    </div>
                    <span className="quick-stat-val">{item.val}</span>
                  </div>
                ))}
                <div className="quick-cta">
                  <button className="btn-secondary" onClick={() => setActiveView('tasks')}>View All Tasks →</button>
                </div>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="recent-section">
              <div className="section-header">
                <h3>Recent Tasks</h3>
                <button className="btn-link" onClick={() => setActiveView('tasks')}>See all →</button>
              </div>
              <TaskList onEditTask={handleEdit} limit={6} />
            </div>
          </div>
        )}

        {/* Tasks View */}
        {activeView === 'tasks' && (
          <div className="tasks-content">
            <div className="filters-bar">
              <div className="filters-left">
                <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="filter-select">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
                <select value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setCurrentPage(1); }} className="filter-select">
                  {PRIORITIES.map(p => <option key={p}>{p === 'All' ? 'All Priorities' : p}</option>)}
                </select>
                <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="filter-select">
                  {CATEGORIES.map(c => <option key={c}>{c === 'All' ? 'All Categories' : c}</option>)}
                </select>
                <select value={filterDeadline} onChange={e => { setFilterDeadline(e.target.value); setCurrentPage(1); }} className="filter-select">
                  {DEADLINES.map(d => <option key={d}>{d === 'All' ? 'All Deadlines' : d}</option>)}
                </select>
                {activeFiltersCount > 0 && (
                  <button onClick={resetFilters} className="clear-filters">
                    Clear {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} ×
                  </button>
                )}
              </div>
              <div className="filters-right">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
                  <option value="createdAt">Sort: Newest</option>
                  <option value="deadline">Sort: Deadline</option>
                  <option value="priority">Sort: Priority</option>
                  <option value="title">Sort: Title</option>
                  <option value="status">Sort: Status</option>
                </select>
                <button className="sort-order-btn" onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}>
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>

            <div className="tasks-summary">
              Showing <strong>{filteredTasks.length}</strong> of <strong>{tasks.length}</strong> tasks
            </div>

            <TaskList onEditTask={handleEdit} />

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="page-btn">‹</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} className={`page-btn ${currentPage === n ? 'active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="page-btn">›</button>
              </div>
            )}
          </div>
        )}

        {/* Today View */}
        {activeView === 'today' && (
          <div className="tasks-content">
            <div className="today-header">
              <p>Tasks due today or currently in progress</p>
            </div>
            <TaskList onEditTask={handleEdit} todayOnly />
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="analytics-content">
            <div className="analytics-grid">
              <div className="analytics-card big-card">
                <h3>Productivity Overview</h3>
                <div className="analytics-ring-section">
                  <div className="ring-wrap large">
                    <Ring pct={stats.productivity} size={160} stroke={14} color={stats.productivity >= 70 ? '#10b981' : '#f59e0b'} />
                    <div className="ring-label">
                      <span className="ring-pct large">{stats.productivity}%</span>
                      <span className="ring-sub">Productivity</span>
                    </div>
                  </div>
                  <div className="analytics-stats-list">
                    {[
                      { label: '✅ Tasks Completed', val: stats.finished, color: '#10b981' },
                      { label: '⚡ In Progress', val: stats.inProgress, color: '#6366f1' },
                      { label: '⏸ Not Started', val: stats.notStarted, color: '#64748b' },
                      { label: '⚠️ Overdue', val: stats.overdue, color: '#ef4444' },
                      { label: '🔥 High Priority', val: stats.high, color: '#ef4444' },
                      { label: '📅 Due Today', val: stats.todayTasks, color: '#f59e0b' },
                    ].map(item => (
                      <div key={item.label} className="analytics-stat-row">
                        <span>{item.label}</span>
                        <strong style={{ color: item.color }}>{item.val}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="analytics-card">
                <h3>Category Breakdown</h3>
                {stats.categories.map(cat => (
                  <div key={cat.name} className="analytics-cat-row">
                    <div className="analytics-cat-header">
                      <span>{cat.name}</span>
                      <span>{cat.done}/{cat.count} done</span>
                    </div>
                    <div className="analytics-bar-track">
                      <div className="analytics-bar-fill" style={{ width: cat.count > 0 ? `${(cat.done/cat.count)*100}%` : '0' }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="analytics-card">
                <h3>Priority Distribution</h3>
                {[
                  { label: 'High Priority', val: tasks.filter(t=>t.priority==='High').length, color: '#ef4444', icon: '🔴' },
                  { label: 'Medium Priority', val: tasks.filter(t=>t.priority==='Medium').length, color: '#f59e0b', icon: '🟡' },
                  { label: 'Low Priority', val: tasks.filter(t=>t.priority==='Low').length, color: '#10b981', icon: '🟢' },
                ].map(item => (
                  <div key={item.label} className="analytics-priority-row">
                    <div className="analytics-priority-label">{item.icon} {item.label}</div>
                    <div className="analytics-priority-bar">
                      <div className="analytics-priority-fill" style={{ width: stats.total > 0 ? `${(item.val/stats.total)*100}%` : '0', background: item.color }}></div>
                    </div>
                    <span className="analytics-priority-val" style={{ color: item.color }}>{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="analytics-card ai-insights-card">
                <h3>🤖 AI Insights</h3>
                <div className="ai-insight-list">
                  <div className={`ai-insight ai-${aiSuggestion.type}`}>
                    <p>{aiSuggestion.message}</p>
                  </div>
                  {stats.productivity >= 70 && (
                    <div className="ai-insight ai-good"><p>🏆 Excellent productivity rate! You're in the top tier of task completion.</p></div>
                  )}
                  {stats.overdue > 0 && (
                    <div className="ai-insight ai-urgent"><p>📌 Consider scheduling dedicated time to clear {stats.overdue} overdue task{stats.overdue>1?'s':''}.</p></div>
                  )}
                  {stats.inProgress > 5 && (
                    <div className="ai-insight ai-priority"><p>💡 You have many tasks in progress. Consider finishing some before starting new ones.</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showForm && <TaskForm onClose={handleClose} editingTask={editingTask} />}
    </div>
  );
};

export default Dashboard;
