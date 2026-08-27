import React from 'react';
import { Home, Users, FileText, FileCheck, BookOpen, Settings, Sparkles } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">V</div>
          <span className="logo-text">VedaAI</span>
        </div>
        <button className="sidebar-toggle">
          <div className="toggle-icon"></div>
        </button>
      </div>
      
      <button className="toolkit-btn">
        <Sparkles size={16} />
        <span>AI Teacher's Toolkit</span>
      </button>

      <nav className="sidebar-nav">
        <ul>
          <li>
            <a href="#" className="nav-item">
              <Home size={18} />
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="#" className="nav-item">
              <Users size={18} />
              <span>My Classroom</span>
            </a>
          </li>
          <li>
            <a href="#" className="nav-item">
              <FileText size={18} />
              <span>Assignments</span>
            </a>
          </li>
          <li>
            <a href="#" className="nav-item active">
              <FileCheck size={18} />
              <span>Exams</span>
            </a>
          </li>
          <li>
            <a href="#" className="nav-item">
              <BookOpen size={18} />
              <span>My Library</span>
            </a>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <a href="#" className="nav-item settings-link">
          <Settings size={18} />
          <span>Settings</span>
        </a>
        
        <div className="school-profile">
          <div className="school-logo">
            {/* Using a placeholder for DPS logo */}
            <div className="placeholder-logo">DPS</div>
          </div>
          <div className="school-info">
            <span className="school-name">Delhi Public School</span>
            <span className="school-branch">Bokaro Steel City</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
