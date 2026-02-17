import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import Task from './Task';

const TaskList = ({ onEditTask }) => {
  const { currentTasks, filteredTasks } = useTaskContext();

  if (filteredTasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h2>No tasks found</h2>
        <p>Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {currentTasks.map(task => (
        <Task 
          key={task.id} 
          task={task} 
          onEdit={onEditTask}
        />
      ))}
    </div>
  );
};

export default TaskList;
