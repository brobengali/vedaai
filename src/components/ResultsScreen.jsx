import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Edit3, Download } from 'lucide-react';
import './ResultsScreen.css';
import ReportModal from './ReportModal';

const ResultsScreen = ({ data, onBack }) => {
  const [selectedQ, setSelectedQ] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const isPdf = data.fileName?.toLowerCase().endsWith('.pdf');
  const sheetImageSrc = data.answerSheetImageUrl || "https://placehold.co/600x800/f6f7fa/7b7b8a?text=Student+Answer+Sheet";

  return (
    <div className="results-container">
      {showReport && <ReportModal data={data} onClose={() => setShowReport(false)} />}
      
      <div className="results-header">
        <div className="header-left-actions">
          <button className="btn-back-text" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="student-info-badge">
            <span className="font-semibold">{data.studentName || 'Student Submission'}</span> • {data.className || 'Exam Review'}
          </div>
        </div>
        
        <div className="header-actions">
          <label className="toggle-switch">
            <input type="checkbox" checked={isEditMode} onChange={(e) => setIsEditMode(e.target.checked)} />
            <span className="slider"></span>
            <span className="toggle-label"><Edit3 size={14} /> Manual Corrections</span>
          </label>
          
          <button className="btn-secondary" onClick={() => setShowReport(true)}>
            <Download size={16} /> Export Report
          </button>
          
          <div className="summary-badge">
            <span>Score: {data.score}/{data.maxScore}</span>
          </div>
        </div>
      </div>

      <div className="split-view">
        {/* Left Side: Extracted Questions */}
        <div className="pane questions-pane">
          <div className="pane-header">
            <h2 className="pane-title">Extracted Questions ({data.questions?.length || 0})</h2>
          </div>
          <div className="questions-list">
            {data.questions && data.questions.map((q) => {
              const ans = data.answers?.find(a => String(a.qId).toLowerCase() === String(q.id).toLowerCase());
              const isSelected = selectedQ === q.id;
              
              // Determine warning state
              const needsReview = q.lowConfidence || (ans && ans.confidence === 'low');

              return (
                <div 
                  key={q.id} 
                  className={`question-card ${isSelected ? 'selected' : ''} ${isEditMode && needsReview ? 'needs-review' : ''}`}
                  onClick={() => setSelectedQ(q.id)}
                >
                  <div className="q-header">
                    <span className="q-number">Q{q.id}</span>
                    <span className="q-marks">[{q.marks} Marks]</span>
                  </div>
                  <p className="q-text">{q.text}</p>
                  
                  {isEditMode && needsReview && (
                    <div className="review-alert">
                      <AlertTriangle size={14} /> Low AI Confidence - Verify Mapping
                    </div>
                  )}
                  
                  {ans ? (
                    <div className="q-feedback">
                      <div className="feedback-status">
                        {ans.isCorrect ? <CheckCircle size={16} color="green" /> : <XCircle size={16} color="red" />}
                        <span className={ans.isCorrect ? 'text-green' : 'text-red'}>
                          {ans.marksGiven}/{q.marks} Scored
                        </span>
                      </div>
                      {isSelected && !isEditMode && (
                        <div className="ai-insight">
                          <p><strong>OCR Extracted Answer:</strong> "{ans.text}"</p>
                        </div>
                      )}
                      
                      {isEditMode && isSelected && (
                        <div className="edit-controls">
                          <div className="input-group">
                            <label>Marks Given:</label>
                            <input type="number" defaultValue={ans.marksGiven} max={q.marks} min="0" />
                          </div>
                          <button className="btn-text-small">Re-assign Region</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="q-feedback">
                      <span className="text-red">Not answered</span>
                      {isEditMode && isSelected && (
                        <button className="btn-text-small mt-2">Manually Map Answer</button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Side: Answer Sheet View with Highlights */}
        <div className={`pane answer-sheet-pane ${isEditMode ? 'edit-mode-active' : ''}`}>
          <div className="pane-header">
             <h2 className="pane-title">Student Answer Sheet</h2>
             {isEditMode && <span className="edit-badge">Edit Mode Active</span>}
          </div>
          
          <div className="sheet-viewer">
            <div className="sheet-image-wrapper">
              {isPdf ? (
                <iframe src={sheetImageSrc} title="Answer Sheet PDF" className="sheet-pdf-frame" />
              ) : (
                <img src={sheetImageSrc} alt="Answer Sheet" className="sheet-img" />
              )}
              
              {data.answers && data.answers.map(ans => {
                 const isThisSelected = selectedQ === ans.qId;
                 if (!ans.region) return null;
                 
                 return (
                   <div 
                     key={ans.qId}
                     className={`highlight-box ${isThisSelected ? 'active' : 'inactive'} ${isEditMode && ans.confidence === 'low' ? 'warning' : ''}`} 
                     style={ans.region}
                     onClick={(e) => {
                       e.stopPropagation();
                       setSelectedQ(ans.qId);
                     }}
                   >
                     {isThisSelected && (
                       <span className="highlight-label">
                         Q{ans.qId} Match
                         {isEditMode && <span className="drag-handle">✥</span>}
                       </span>
                     )}
                     
                     {isEditMode && isThisSelected && (
                       <>
                         <div className="resize-handle top-left"></div>
                         <div className="resize-handle bottom-right"></div>
                       </>
                     )}
                   </div>
                 );
              })}
              
              {!selectedQ && !isEditMode && (
                <div className="empty-state-overlay">
                  Select a question to view its mapped answer region
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
