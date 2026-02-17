import React, { createContext, useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('None');
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 6;

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks);
      setTasks(parsedTasks);
      setFilteredTasks(parsedTasks);
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem('tasks')) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);

  // Apply filtering and sorting
  useEffect(() => {
    let result = [...tasks];

    // Filter by status
    if (filterStatus !== 'All') {
      result = result.filter(task => task.status === filterStatus);
    }

    // Sort by status
    if (sortBy !== 'None') {
      const statusOrder = { 'Not Started': 1, 'In Progress': 2, 'Finished': 3 };
      result.sort((a, b) => {
        if (sortBy === 'Ascending') {
          return statusOrder[a.status] - statusOrder[b.status];
        } else {
          return statusOrder[b.status] - statusOrder[a.status];
        }
      });
    }

    setFilteredTasks(result);
    setCurrentPage(1); // Reset to first page when filtering/sorting
  }, [tasks, filterStatus, sortBy]);

  const addTask = (task) => {
    const newTask = {
      id: Date.now(),
      ...task,
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    toast.success('Task created successfully!');
  };

  const updateTask = (id, updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    ));
    toast.success('Task updated successfully!');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast.success('Task deleted successfully!');
  };

  // Pagination
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const value = {
    tasks,
    filteredTasks,
    currentTasks,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    currentPage,
    totalPages,
    paginate,
    addTask,
    updateTask,
    deleteTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
