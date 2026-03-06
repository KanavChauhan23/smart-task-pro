import React, { useState } from 'react';
import { toast } from 'react-toastify';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (password === 'password') {
        toast.success('Welcome back! 👋');
        onLogin();
      } else {
        toast.error('Incorrect password. Hint: "password"');
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <div className="login-brand">
            <h1>Smart Task <span>Pro</span></h1>
            <p>Your intelligent productivity companion</p>
          </div>
        </div>

        <div className="login-features">
          {['AI-powered task suggestions','Priority & deadline tracking','Productivity analytics'].map((f,i) => (
            <div key={i} className="login-feature-item">
              <span className="login-feature-dot"></span>
              {f}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className={`login-input-group ${focused ? 'focused' : ''}`}>
            <label>Password</label>
            <div className="login-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
              <input
                type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                placeholder="Enter your password" required autoFocus
              />
            </div>
            <span className="login-hint">Hint: "password"</span>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? <span className="login-spinner"></span> : (
              <>
                <span>Sign In</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <p className="login-footer">Crafted by <strong>Kanav Chauhan</strong></p>
      </div>
    </div>
  );
};

export default Login;
