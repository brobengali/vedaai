import React, { useState, useRef } from 'react';
import { Upload, X, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import './UploadScreen.css';
import avatarImg from '../assets/teacher_avatar.png';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadScreen = ({ onStartMapping, isMapping, onBack }) => {
  const [qpFile, setQpFile] = useState(null);
  const [asFile, setAsFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  
  const qpInputRef = useRef(null);
  const asInputRef = useRef(null);

  const handleFileChange = (e, setFile) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate type
      const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|webp|gif)$/i)) {
        setFileError('Please upload a PDF or image file (PNG, JPG, WEBP).');
        e.target.value = ''; // reset input
        return;
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setFileError('File size exceeds 10MB limit.');
        e.target.value = ''; // reset input
        return;
      }

      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + 'MB';
      
      setFile({
        file,
        name: file.name,
        size: sizeStr,
        type: file.type.includes('pdf') ? 'PDF' : 'IMG'
      });
    }
    // Reset input value so the same file can be re-selected
    e.target.value = '';
  };

  const removeFile = (setFile, inputRef) => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const canStartMapping = qpFile !== null && asFile !== null && !isMapping;

  return (
    <div className="upload-container">
      {onBack && (
        <div className="upload-back-row">
          <button className="btn-back-text" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Reviews
          </button>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="main-title">
          Upload <span className="text-primary highlight-underline">Question Paper & Answer Sheets</span>
        </h1>
        <p className="subtitle">Upload both files to get started</p>
      </div>

      <div className="avatar-wrapper">
        <div className="avatar-circle">
          <img src={avatarImg} alt="AI Teacher" className="avatar-img" />
          <div className="float-dot top-left"></div>
          <div className="float-dot top-right"></div>
          <div className="float-dot bottom-left"></div>
          <div className="float-dot bottom-right"></div>
        </div>
      </div>

      {fileError && (
        <div className="file-error-msg">
          ⚠️ {fileError}
        </div>
      )}

      <div className="upload-cards-container">
        {/* Question Paper Upload Box */}
        <div className="upload-box" onClick={() => !qpFile && qpInputRef.current?.click()}>
          <input 
            type="file" 
            ref={qpInputRef} 
            onChange={(e) => handleFileChange(e, setQpFile)} 
            className="hidden-input"
            accept=".pdf,.png,.jpg,.jpeg,.webp,image/*"
          />
          
          {!qpFile ? (
            <div className="upload-content empty">
              <div className="upload-icon">
                <Upload size={24} />
              </div>
              <p className="upload-text">Upload <span className="text-primary font-semibold">Question Paper</span></p>
              <p className="upload-limit">Max 10MB (PNG/JPG recommended for highlighting)</p>
            </div>
          ) : (
            <div className="upload-content filled">
              <div className="file-type-badge">{qpFile.type}</div>
              <div className="file-info">
                <p className="file-name">{qpFile.name}</p>
                <p className="file-meta">{qpFile.size}</p>
              </div>
              <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeFile(setQpFile, qpInputRef); }}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Answer Sheet Upload Box */}
        <div className="upload-box" onClick={() => !asFile && asInputRef.current?.click()}>
          <input 
            type="file" 
            ref={asInputRef} 
            onChange={(e) => handleFileChange(e, setAsFile)} 
            className="hidden-input"
            accept=".pdf,.png,.jpg,.jpeg,.webp,image/*"
          />
          
          {!asFile ? (
            <div className="upload-content empty">
              <div className="upload-icon">
                <Upload size={24} />
              </div>
              <p className="upload-text">Upload <span className="text-primary font-semibold">Answer Sheet</span></p>
              <p className="upload-limit">Max 10MB (PNG/JPG recommended for highlighting)</p>
            </div>
          ) : (
            <div className="upload-content filled">
              <div className="file-type-badge">{asFile.type}</div>
              <div className="file-info">
                <p className="file-name">{asFile.name}</p>
                <p className="file-meta">{asFile.size}</p>
              </div>
              <button className="remove-btn" onClick={(e) => { e.stopPropagation(); removeFile(setAsFile, asInputRef); }}>
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="action-container">
        <button 
          className={`start-mapping-btn ${canStartMapping ? 'active' : ''}`}
          disabled={!canStartMapping}
          onClick={() => onStartMapping(qpFile, asFile)}
        >
          {isMapping ? (
            <>Analyzing with AI… <Loader2 size={18} className="spin" /></>
          ) : (
            <>Start Mapping <ArrowRight size={18} /></>
          )}
        </button>
        <p className="action-hint">
          {isMapping 
            ? 'Gemini is reading your documents. This may take 15-30 seconds…'
            : 'Once both files are uploaded, you\'ll be able to map answers with questions'
          }
        </p>
      </div>
    </div>
  );
};

export default UploadScreen;
