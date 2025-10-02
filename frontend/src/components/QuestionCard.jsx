import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './QuestionCard.css';

const QuestionCard = ({ question, onUpdated, onDeleted }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editForm, setEditForm] = useState({ title: question.title, statement: question.statement, level: question.level, tags: (question.tags||[]).join(', ') });
  const [isAddingAnswer, setIsAddingAnswer] = useState(false);
  const [answerForm, setAnswerForm] = useState({ language: 'javascript', code: '', explanation: '' });
  const [pending, setPending] = useState(false);
  const [localQuestion, setLocalQuestion] = useState(question);
  const [message, setMessage] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Set default language when component mounts
  useEffect(() => {
    if (localQuestion.answers && localQuestion.answers.length > 0) {
      setSelectedLanguage(localQuestion.answers[0].language);
    }
  }, [localQuestion]);

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleImage = () => {
    setShowImage(!showImage);
  };

  const getCurrentAnswer = () => {
    if (!localQuestion.answers || localQuestion.answers.length === 0) return null;
    return localQuestion.answers.find(answer => answer.language === selectedLanguage) || localQuestion.answers[0];
  };

  const copyCodeToClipboard = async () => {
    const currentAnswer = getCurrentAnswer();
    if (!currentAnswer || !currentAnswer.code) return;
    
    try {
      await navigator.clipboard.writeText(currentAnswer.code);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy code: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentAnswer.code;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const currentAnswer = getCurrentAnswer();

  const availableLanguages = [
    'javascript','python','java','cpp','c','csharp','php','ruby','go','rust','typescript','swift','kotlin'
  ];

  const handleQuestionFieldChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAnswerFieldChange = (e) => {
    const { name, value } = e.target;
    setAnswerForm(prev => ({ ...prev, [name]: value }));
  };

  const submitQuestionEdit = async (e) => {
    e.preventDefault();
    setPending(true); setMessage(null);
    try {
      const payload = {
        level: parseInt(editForm.level,10),
        title: editForm.title,
        statement: editForm.statement,
        tags: editForm.tags ? editForm.tags.split(',').map(t=>t.trim()).filter(Boolean) : localQuestion.tags,
        answers: localQuestion.answers
      };
      const updated = await apiFetch(`/questions/${localQuestion._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setLocalQuestion(updated);
      setIsEditingQuestion(false);
      setMessage({ type: 'success', text: 'Question updated' });
      onUpdated && onUpdated(updated);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { setPending(false); }
  };

  const submitNewAnswer = async (e) => {
    e.preventDefault();
    if(!answerForm.language || !answerForm.code.trim()) {
      setMessage({ type: 'error', text: 'Fill all required answer fields' });
      return;
    }
    setPending(true); setMessage(null);
    try {
      const updated = await apiFetch(`/questions/${localQuestion._id}/answers`, { method: 'POST', body: JSON.stringify(answerForm) });
      setLocalQuestion(updated);
      setIsAddingAnswer(false);
      setAnswerForm({ language: 'javascript', code: '', explanation: '' });
      setSelectedLanguage(answerForm.language);
      setShowAnswer(true);
      setMessage({ type: 'success', text: 'Answer saved' });
      onUpdated && onUpdated(updated);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { setPending(false); }
  };

  const deleteQuestion = async () => {
    if(!window.confirm('Delete this question permanently?')) return;
    setPending(true); setMessage(null);
    try {
      await apiFetch(`/questions/${localQuestion._id}`, { method: 'DELETE' });
      setMessage({ type: 'success', text: 'Deleted' });
      onDeleted && onDeleted(localQuestion._id);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { setPending(false); }
  };

  const startEditAnswer = () => {
    // preload existing answer (if language selected)
    if(currentAnswer) {
      setAnswerForm({ language: currentAnswer.language, code: currentAnswer.code, explanation: currentAnswer.explanation });
    }
    setIsAddingAnswer(true);
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="title-section">
          <h3 className="question-title">{localQuestion.title}</h3>
          <div className="header-buttons">
            {localQuestion.imageUrl && (
              <button 
                className={`small-btn image-btn ${showImage ? 'active' : ''}`}
                onClick={toggleImage}
                title={showImage ? 'Hide Image' : 'Show Image'}
              >
               QUESTION
              </button>
            )}
            <button 
              className={`small-btn answer-btn ${showAnswer ? 'active' : ''}`}
              onClick={toggleAnswer}
              title={showAnswer ? 'Hide Answer' : 'Show Answer'}
            >
              ANSWER
            </button>
            <button
              className="small-btn edit-btn"
              onClick={() => {setIsEditingQuestion(v=>!v); setIsAddingAnswer(false);} }
              title={isEditingQuestion? 'Cancel Edit':'Edit Question'}
            >
              {isEditingQuestion? 'CANCEL':'EDIT'}
            </button>
            <button
              className="small-btn add-answer-btn"
              onClick={() => { setIsAddingAnswer(v=>!v); setIsEditingQuestion(false); if(!isAddingAnswer) setAnswerForm({ language: 'javascript', code:'', explanation:''}); }}
              title={isAddingAnswer? 'Close':'Add / Edit Answer'}
            >
              {isAddingAnswer? 'CLOSE':'ADD/EDIT ANSWER'}
            </button>
            <button
              className="small-btn delete-btn"
              onClick={deleteQuestion}
              disabled={pending}
              title="Delete Question"
            >
              DELETE
            </button>
          </div>
        </div>
        <span className="question-level">Level {localQuestion.level}</span>
      </div>
      
      <div className="question-content">
        {message && (
          <div className={`inline-message ${message.type}`}>{message.text}</div>
        )}

        {isEditingQuestion ? (
          <form className="edit-question-form" onSubmit={submitQuestionEdit}>
            <div className="form-row-inline">
              <label>Title:</label>
              <input name="title" value={editForm.title} onChange={handleQuestionFieldChange} required />
            </div>
            <div className="form-row-inline">
              <label>Level:</label>
              <select name="level" value={editForm.level} onChange={handleQuestionFieldChange} required>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div>
            <div className="form-row-inline">
              <label>Tags:</label>
              <input name="tags" value={editForm.tags} onChange={handleQuestionFieldChange} placeholder="comma,separated" />
            </div>
            <div className="form-row-inline">
              <label>Statement:</label>
              <textarea name="statement" value={editForm.statement} onChange={handleQuestionFieldChange} rows={3} required />
            </div>
            <div className="form-actions-inline">
              <button type="submit" className="small-btn save-btn" disabled={pending}>{pending? 'Saving...':'Save'}</button>
              <button type="button" className="small-btn cancel-btn" onClick={()=>setIsEditingQuestion(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="question-statement">
            <h4>Question:</h4>
            <p>{localQuestion.statement}</p>
          </div>
        )}

        {localQuestion.imageUrl && showImage && (
          <div className="question-image">
            <img src={localQuestion.imageUrl} alt="Question illustration" />
          </div>
        )}

        {isAddingAnswer && (
          <form className="add-answer-form" onSubmit={submitNewAnswer}>
            <div className="form-row-inline">
              <label>Language:</label>
              <select name="language" value={answerForm.language} onChange={handleAnswerFieldChange}>
                {availableLanguages.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div className="form-row-inline">
              <label>Code:</label>
              <textarea name="code" value={answerForm.code} onChange={handleAnswerFieldChange} rows={6} placeholder="Enter code..." />
            </div>
            <div className="form-row-inline">
              <label>Explanation:</label>
              <textarea name="explanation" value={answerForm.explanation} onChange={handleAnswerFieldChange} rows={3} placeholder="Explain solution..." />
            </div>
            <div className="form-actions-inline">
              <button type="submit" className="small-btn save-btn" disabled={pending}>{pending? 'Saving...':'Save Answer'}</button>
              <button type="button" className="small-btn cancel-btn" onClick={()=>setIsAddingAnswer(false)}>Cancel</button>
              {currentAnswer && (
                <button type="button" className="small-btn edit-btn" onClick={startEditAnswer}>Load Current</button>
              )}
            </div>
          </form>
        )}

        {showAnswer && currentAnswer && !isAddingAnswer && (
          <div className="answer-section">
            {localQuestion.answers && localQuestion.answers.length > 1 && (
              <div className="language-selector">
                <label>Choose Language: </label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="language-select"
                >
                  {localQuestion.answers.map(answer => (
                    <option key={answer.language} value={answer.language}>
                      {answer.language.charAt(0).toUpperCase() + answer.language.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="code-section">
              <div className="code-header">
                <h4>Code Solution ({currentAnswer.language}):</h4>
                <button 
                  className={`copy-btn ${copySuccess ? 'copy-success' : ''}`}
                  onClick={copyCodeToClipboard}
                  title="Copy code to clipboard"
                >
                  {copySuccess ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <SyntaxHighlighter 
                language={currentAnswer.language || 'javascript'} 
                style={tomorrow}
                customStyle={{
                  borderRadius: '8px',
                  padding: '1rem',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  backgroundColor: '#282c34',
                  color: '#abb2bf',
                  border: '1px solid #e1e5e9'
                }}
                codeTagProps={{
                  style: {
                    fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                    fontSize: '14px',
                    color: '#abb2bf'
                  }
                }}
              >
                {currentAnswer.code}
              </SyntaxHighlighter>
            </div>
            
            <div className="explanation-section">
              <h4>Explanation:</h4>
              <p>{currentAnswer.explanation}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;