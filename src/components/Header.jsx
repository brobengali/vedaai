import React from 'react';
import { ArrowLeft, HelpCircle, Bell, Sparkles, Menu } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <button className="mobile-menu-btn d-md-none">
          <Menu size={24} />
        </button>
        <button className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <div className="breadcrumb">
          <span className="file-icon">📄</span>
          <span className="breadcrumb-text">Exams</span>
        </div>
      </div>
      
      <div className="header-right">
        <button className="icon-btn">
          <HelpCircle size={20} />
        </button>
        <button className="icon-btn notification-btn">
          <Bell size={20} />
          <span className="notification-dot"></span>
        </button>
        <button className="icon-btn">
          <Sparkles size={20} />
        </button>
        
        <div className="user-profile">
          <div className="user-avatar">
            <img src="https://ui-avatars.com/api/?name=Madhur+Rastogi&background=random" alt="Madhur Rastogi" />
          </div>
          <span className="user-name">Madhur Rastogi</span>
          <span className="chevron-down"></span>
        </div>
      </div>
    </header>
  );
};

export default Header;
