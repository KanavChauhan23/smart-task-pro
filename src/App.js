import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { TaskProvider } from './context/TaskContext';
import './styles/App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') === 'true') setIsAuthenticated(true);
    // Set initial theme
    const dm = localStorage.getItem('stp_darkmode');
    document.documentElement.setAttribute('data-theme', (dm === null || JSON.parse(dm)) ? 'dark' : 'light');
  }, []);

  const handleLogin = () => { setIsAuthenticated(true); localStorage.setItem('isAuthenticated', 'true'); };
  const handleLogout = () => { setIsAuthenticated(false); localStorage.removeItem('isAuthenticated'); };

  return (
    <Router>
      <TaskProvider>
        <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false}
          newestOnTop closeOnClick draggable pauseOnHover theme="colored" />
        <Routes>
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />} />
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </TaskProvider>
    </Router>
  );
}

export default App;
