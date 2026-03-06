import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';

const CATEGORIES = ['Work','Study','Personal','Projects'];
const PRIORITIES = ['High','Medium','Low'];
const STATUSES = ['Not Started','In Progress','Finished'];

const TaskForm = ({ onClose, editingTask }) => {
  const { addTask, updateTask } = useTaskContext();
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'Not Started',
    priority: 'Medium', category: 'Personal', deadline: '', tags: ''
  });
  const [errors, setErrors] = useState({});


  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        status: editingTask.status || 'Not Started',
        priority: editingTask.priority || 'Medium',
        category: editingTask.category || 'Personal',
        deadline: editingTask.deadline || '',
        tags: editingTask.tags || ''
      });
    }
  }, [editingTask]);

  const validate = () => {
    const e = {};
    if (!formData.title.trim()) e.title = 'Title is required';
    if (formData.title.length > 80) e.title = 'Title too long (max 80 chars)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (editingTask) updateTask(editingTask.id, formData);
    else addTask(formData);
    onClose();
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const priorityColors = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };
  const categoryIcons = { Work: '💼', Study: '📚', Personal: '🏠', Projects: '🚀' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="modal-title-icon">{editingTask ? '✏️' : '➕'}</div>
            <div>
              <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <p>{editingTask ? 'Update task details' : 'Fill in the details below'}</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label>Task Title <span className="required">*</span></label>
            <input
              type="text" name="title" value={formData.title}
              onChange={handleChange} placeholder="What needs to be done?" autoFocus
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
            <span className="char-count">{formData.title.length}/80</span>
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea name="description" value={formData.description}
              onChange={handleChange} placeholder="Add more details..." rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Category</label>
              <div className="btn-group">
                {CATEGORIES.map(cat => (
                  <button key={cat} type="button"
                    className={`btn-option ${formData.category === cat ? 'active' : ''}`}
                    onClick={() => setFormData(p => ({ ...p, category: cat }))}>
                    <span>{categoryIcons[cat]}</span> {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-field">
              <label>Priority</label>
              <div className="priority-group">
                {PRIORITIES.map(p => (
                  <button key={p} type="button"
                    className={`priority-btn ${formData.priority === p ? 'active' : ''}`}
                    style={formData.priority === p ? { '--pc': priorityColors[p] } : {}}
                    onClick={() => setFormData(prev => ({ ...prev, priority: p }))}>
                    <span className="priority-dot" style={{ background: priorityColors[p] }}></span>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-field">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="select-field">
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row two-col">
            <div className="form-field">
              <label>Deadline</label>
              <input type="date" name="deadline" value={formData.deadline}
                onChange={handleChange} min={new Date().toISOString().split('T')[0]}
                className="date-field"
              />
            </div>
            <div className="form-field">
              <label>Tags <span className="optional">(optional)</span></label>
              <input type="text" name="tags" value={formData.tags}
                onChange={handleChange} placeholder="design, urgent, review" />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">
              {editingTask ? 'Update Task' : 'Create Task'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
