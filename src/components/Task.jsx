import React, { useState } from 'react';
import { useTaskContext, isOverdue, isToday, isTomorrow } from '../context/TaskContext';

const priorityConfig = {
  High: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'High' },
  Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Medium' },
  Low: { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Low' },
};
const categoryIcons = { Work: '💼', Study: '📚', Personal: '🏠', Projects: '🚀' };
const statusConfig = {
  'Not Started': { color: '#64748b', icon: '○', label: 'Not Started' },
  'In Progress': { color: '#6366f1', icon: '◑', label: 'In Progress' },
  'Finished': { color: '#10b981', icon: '●', label: 'Done' },
};

const formatDeadline = (dateStr) => {
  if (!dateStr) return null;
  if (isToday(dateStr)) return { text: 'Today', urgent: true };
  if (isTomorrow(dateStr)) return { text: 'Tomorrow', urgent: true };
  const d = new Date(dateStr);
  return { text: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), urgent: false };
};

const Task = ({ task, onEdit }) => {
  const { deleteTask, toggleComplete } = useTaskContext();
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const overdue = isOverdue(task.deadline, task.status);
  const deadline = formatDeadline(task.deadline);
  const pc = priorityConfig[task.priority] || priorityConfig.Medium;
  const sc = statusConfig[task.status] || statusConfig['Not Started'];
  const isFinished = task.status === 'Finished';

  const handleDelete = () => {
    setDeleting(true);
    setTimeout(() => deleteTask(task.id), 200);
  };

  const tags = task.tags ? task.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className={`task-card ${isFinished ? 'task-finished' : ''} ${overdue ? 'task-overdue' : ''} ${deleting ? 'task-deleting' : ''}`}>
      <div className="task-card-accent" style={{ background: pc.color }}></div>

      <div className="task-top">
        <button className={`task-check ${isFinished ? 'checked' : ''}`} onClick={() => toggleComplete(task.id)} title={isFinished ? 'Mark incomplete' : 'Mark complete'}>
          {isFinished ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : <span></span>}
        </button>
        <div className="task-badges">
          {task.category && (
            <span className="badge badge-category">{categoryIcons[task.category]} {task.category}</span>
          )}
          {task.priority && (
            <span className="badge badge-priority" style={{ color: pc.color, background: pc.bg }}>
              {task.priority}
            </span>
          )}
        </div>
        <div className="task-actions">
          <button onClick={() => onEdit(task)} className="task-action-btn" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          {showConfirm ? (
            <div className="delete-confirm">
              <span>Delete?</span>
              <button onClick={handleDelete} className="confirm-yes">Yes</button>
              <button onClick={() => setShowConfirm(false)} className="confirm-no">No</button>
            </div>
          ) : (
            <button onClick={() => setShowConfirm(true)} className="task-action-btn task-delete-btn" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="task-body">
        <h3 className={`task-title ${isFinished ? 'struck' : ''}`}>{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}
        {tags.length > 0 && (
          <div className="task-tags">
            {tags.slice(0,3).map((tag,i) => <span key={i} className="task-tag">#{tag}</span>)}
          </div>
        )}
      </div>

      <div className="task-footer">
        <div className="task-status-pill" style={{ color: sc.color }}>
          <span className="status-dot" style={{ background: sc.color }}></span>
          {sc.label}
        </div>
        {deadline && (
          <div className={`task-deadline ${deadline.urgent ? 'deadline-urgent' : ''} ${overdue ? 'deadline-overdue' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {overdue ? 'Overdue' : deadline.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Task;
