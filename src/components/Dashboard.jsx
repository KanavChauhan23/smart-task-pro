import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import Pagination from './Pagination';
import '../styles/Dashboard.css';

const Dashboard = ({ onLogout }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { 
    filterStatus, 
    setFilterStatus, 
    sortBy, 
    setSortBy, 
    filteredTasks,
    tasks
  } = useTaskContext();

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const getStatusCounts = () => {
    return {
      total: tasks.length,
      notStarted: tasks.filter(t => t.status === 'Not Started').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      finished: tasks.filter(t => t.status === 'Finished').length
    };
  };

  const counts = getStatusCounts();

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <div>
              <h1>Smart Task Management</h1>
              <p>Organize and track your tasks efficiently</p>
            </div>
          </div>
          <button onClick={onLogout} className="logout-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="stats-container">
        <div className="stat-card total">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{counts.total}</h3>
            <p>Total Tasks</p>
          </div>
        </div>
        <div className="stat-card not-started">
          <div className="stat-icon">⏸️</div>
          <div className="stat-info">
            <h3>{counts.notStarted}</h3>
            <p>Not Started</p>
          </div>
        </div>
        <div className="stat-card in-progress">
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>{counts.inProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card finished">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{counts.finished}</h3>
            <p>Finished</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-container">
        <button 
          onClick={() => setShowForm(true)} 
          className="add-task-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add New Task
        </button>

        <div className="filters">
          <div className="filter-group">
            <label>Filter:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Finished">Finished</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Sort:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="None">None</option>
              <option value="Ascending">Status (Asc)</option>
              <option value="Descending">Status (Desc)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <TaskList onEditTask={handleEditTask} />

      {/* Pagination */}
      {filteredTasks.length > 0 && <Pagination />}

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm 
          onClose={handleFormClose} 
          editingTask={editingTask}
        />
      )}
    </div>
  );
};

export default Dashboard;
