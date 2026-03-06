import React from 'react';
import { useTaskContext, isToday } from '../context/TaskContext';
import Task from './Task';

const TaskList = ({ onEditTask, limit, todayOnly }) => {
  const { currentTasks, filteredTasks, tasks } = useTaskContext();

  let displayTasks = limit ? filteredTasks.slice(0, limit) : currentTasks;

  if (todayOnly) {
    displayTasks = tasks.filter(t =>
      isToday(t.deadline) || t.status === 'In Progress'
    ).slice(0, 20);
  }

  if (displayTasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          {todayOnly ? '📅' : '📭'}
        </div>
        <h3>{todayOnly ? "Nothing due today!" : "No tasks found"}</h3>
        <p>{todayOnly ? "You're all caught up. Enjoy your day!" : "Try adjusting your filters or create a new task."}</p>
      </div>
    );
  }

  return (
    <div className="task-grid">
      {displayTasks.map(task => (
        <Task key={task.id} task={task} onEdit={onEditTask} />
      ))}
    </div>
  );
};

export default TaskList;
