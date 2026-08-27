import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import UploadScreen from './components/UploadScreen'
import ResultsScreen from './components/ResultsScreen'
import HistoryScreen from './components/HistoryScreen'
import { analyzeExamDocuments } from './services/geminiService'

function App() {
  const [currentView, setCurrentView] = useState('history');
  const [isMapping, setIsMapping] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [resultsData, setResultsData] = useState(null);
  const [reviewHistory, setReviewHistory] = useState([]);

  const handleStartMapping = async (qpFileObj, asFileObj) => {
    setIsMapping(true);
    setErrorMsg(null);
    setProgressMsg('Reading your documents…');

    try {
      // Create a preview URL for the uploaded answer sheet (for image files)
      const asImagePreview = URL.createObjectURL(asFileObj.file);

      // Call Gemini 3.6 Flash with progress updates
      const analysisResult = await analyzeExamDocuments(
        qpFileObj.file,
        asFileObj.file,
        (stage) => {
          const msgs = {
            encoding: 'Encoding documents…',
            sending: 'Sending to Gemini AI for analysis…',
            parsing: 'Parsing AI response…'
          };
          setProgressMsg(msgs[stage] || 'Processing…');
        }
      );

      // Attach the uploaded answer sheet preview and metadata
      analysisResult.answerSheetImageUrl = asImagePreview;
      analysisResult.fileName = asFileObj.name;

      // Save to history
      setReviewHistory(prev => [
        {
          ...analysisResult,
          id: Date.now(),
          date: new Date().toLocaleDateString()
        },
        ...prev
      ]);

      setResultsData(analysisResult);
      setCurrentView('results');
    } catch (err) {
      console.error("Analysis failed:", err);
      setErrorMsg(err.message || 'Unknown error during analysis. Please try again.');
    } finally {
      setIsMapping(false);
      setProgressMsg('');
    }
  };

  const openReview = (reviewData) => {
    setResultsData(reviewData);
    setCurrentView('results');
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Header />
        {errorMsg && (
          <div className="error-banner">
            <span>❌ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)}>✕</button>
          </div>
        )}
        {isMapping && progressMsg && (
          <div className="progress-banner">
            <span className="progress-spinner"></span>
            <span>{progressMsg}</span>
          </div>
        )}
        <div className="content-area">
          {currentView === 'history' && (
            <HistoryScreen 
              onNewUpload={() => { setErrorMsg(null); setCurrentView('upload'); }}
              onOpenReview={openReview}
              reviews={reviewHistory}
            />
          )}
          
          {currentView === 'upload' && (
             <UploadScreen 
               onStartMapping={handleStartMapping} 
               isMapping={isMapping}
               onBack={() => setCurrentView('history')}
             />
          )}

          {currentView === 'results' && resultsData && (
            <ResultsScreen 
              data={resultsData} 
              onBack={() => setCurrentView('history')} 
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
