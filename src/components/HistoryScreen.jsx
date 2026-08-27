import React from 'react';
import { Upload, FileText, CheckCircle, Clock, FolderOpen } from 'lucide-react';
import './HistoryScreen.css';

const HistoryScreen = ({ onNewUpload, onOpenReview, reviews = [] }) => {
  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h1 className="main-title">Recent <span className="text-primary highlight-underline">Exam Reviews</span></h1>
          <p className="subtitle">View past grading reports or start a new review</p>
        </div>
        <button className="btn-primary" onClick={onNewUpload}>
          <Upload size={18} /> New Upload
        </button>
      </div>

      {reviews.length === 0 ? (
        <div className="empty-history">
          <FolderOpen size={48} className="empty-icon" />
          <h3>No reviews yet</h3>
          <p>Upload a question paper and answer sheet to get started</p>
          <button className="btn-primary" onClick={onNewUpload}>
            <Upload size={18} /> Upload Documents
          </button>
        </div>
      ) : (
        <div className="history-grid">
          {reviews.map((review) => (
            <div key={review.id} className="history-card" onClick={() => onOpenReview(review)}>
              <div className="card-top">
                <div className="status-badge graded">
                  <CheckCircle size={14} /> Graded
                </div>
                <span className="review-date">
                  <Clock size={14} /> {review.date}
                </span>
              </div>
              
              <h3 className="student-name">{review.studentName || 'Student Submission'}</h3>
              <p className="class-name"><FileText size={14} /> {review.className || 'Exam Review'}</p>
              
              <div className="card-bottom">
                <div className="score-block">
                  <span className="score-value">{review.score}</span>
                  <span className="score-max">/{review.maxScore}</span>
                </div>
                <span className="q-count">{review.questions?.length || 0} Questions</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryScreen;
