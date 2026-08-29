import React from 'react';
import './ExtractionLoadingScreen.css';

const ExtractionLoadingScreen = () => {
  return (
    <div className="extraction-loading-container">
      <div className="sparkles-container">
        <svg width="120" height="120" viewBox="0 0 100 100" className="animated-sparkles">
          {/* Main big star */}
          <path d="M50 10 C50 35, 75 50, 90 50 C75 50, 50 65, 50 90 C50 65, 25 50, 10 50 C25 50, 50 35, 50 10 Z" fill="url(#grad1)" className="star-main" />
          
          {/* Smaller star bottom-left */}
          <path d="M25 55 C25 70, 40 80, 50 80 C40 80, 25 90, 25 105 C25 90, 10 80, 0 80 C10 80, 25 70, 25 55 Z" fill="url(#grad1)" className="star-small-1" />
          
          {/* Tiny star dot top-left */}
          <circle cx="20" cy="35" r="4" fill="#ff7043" className="star-dot" />
          
          {/* Tiny star right */}
          <path d="M80 60 C80 65, 85 70, 90 70 C85 70, 80 75, 80 80 C80 75, 75 70, 70 70 C75 70, 80 65, 80 60 Z" fill="#ffb74d" className="star-small-2" />
          
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{stopColor:'#ff8a65', stopOpacity:1}} />
              <stop offset="100%" style={{stopColor:'#f4511e', stopOpacity:1}} />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <h2 className="extracting-title">Extracting...</h2>
      <p className="extracting-subtitle">This may take a while</p>
    </div>
  );
};

export default ExtractionLoadingScreen;
