import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiFetch } from '../api/client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  FaEye, FaEyeSlash, FaEdit, FaTrash, FaPlus, FaSave, FaTimes, 
  FaCopy, FaCheck, FaImage, FaCode, FaTag 
} from 'react-icons/fa';
import './QuestionCard.css';

const QuestionCard = ({ question, onUpdated, onDeleted }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editForm, setEditForm] = useState({ title: question.title, statement: question.statement, level: question.level, tags: (question.tags||[]).join(', ') });
  const [isAddingAnswer, setIsAddingAnswer] = useState(false);
  const [answerForm, setAnswerForm] = useState({ language: 'javascript', code: '', explanation: '' });
  const [isEditingAnswerLanguage, setIsEditingAnswerLanguage] = useState(false);
  const [editingLanguageForm, setEditingLanguageForm] = useState({ oldLanguage: '', newLanguage: '' });
  const [isEditingAnswerContent, setIsEditingAnswerContent] = useState(false);
  const [editingAnswerForm, setEditingAnswerForm] = useState({ language: '', code: '', explanation: '' });
  const [pending, setPending] = useState(false);
  const [localQuestion, setLocalQuestion] = useState(question);
  const [message, setMessage] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [answerModalLanguage, setAnswerModalLanguage] = useState('');

  // Helper function to get image URLs - handles both old and new formats
  const getImageUrls = () => {
    if (localQuestion.imageUrls && Array.isArray(localQuestion.imageUrls)) {
      return localQuestion.imageUrls;
    } else if (localQuestion.imageUrl) {
      return [localQuestion.imageUrl];
    }
    return [];
  };

  const imageUrls = getImageUrls();

  // Debug logging
  useEffect(() => {
    console.log('QuestionCard Debug:', {
      localQuestion: localQuestion,
      imageUrls: imageUrls,
      hasImages: imageUrls.length > 0,
      title: localQuestion.title,
      statement: localQuestion.statement
    });
  }, [localQuestion, imageUrls]);

  // Set default language when component mounts
  useEffect(() => {
    if (localQuestion.answers && localQuestion.answers.length > 0) {
      setSelectedLanguage(localQuestion.answers[0].language);
    }
  }, [localQuestion]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        if (isImageModalOpen) {
          closeImageModal();
        } else if (isAnswerModalOpen) {
          closeAnswerModal();
        } else if (isQuestionModalOpen) {
          closeQuestionModal();
        }
      }
    };

    if (isImageModalOpen || isAnswerModalOpen || isQuestionModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isImageModalOpen, isAnswerModalOpen, isQuestionModalOpen]);

  const incrementQuestionView = useCallback(async () => {
    try {
      const response = await apiFetch(`/questions/${localQuestion._id}/views`, { method: 'POST' });
      if (response && typeof response.viewCount === 'number') {
        setLocalQuestion(prev => ({ ...prev, viewCount: response.viewCount }));
      }
    } catch (error) {
      console.error('Failed to increment question views', error);
    }
  }, [localQuestion._id]);

  const openImageModal = () => {
    console.log('Opening image modal with imageUrls:', imageUrls);
    incrementQuestionView();
    setIsImageModalOpen(true);
  };

  const closeImageModal = () => {
    console.log('Closing image modal');
    setIsImageModalOpen(false);
  };

  const openAnswerModal = (language = '') => {
    const langToUse = language || selectedLanguage || (localQuestion.answers && localQuestion.answers[0]?.language) || '';
    setAnswerModalLanguage(langToUse);
    incrementQuestionView();
    setIsAnswerModalOpen(true);
  };

  const closeAnswerModal = () => {
    setAnswerModalLanguage('');
    setIsAnswerModalOpen(false);
  };

  const openQuestionModal = () => {
    console.log('Opening question modal with localQuestion:', localQuestion);
    incrementQuestionView();
    setIsQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
    console.log('Closing question modal');
    setIsQuestionModalOpen(false);
  };

  const handleImageModalClick = (e) => {
    // Close modal if clicking on backdrop (not the image itself)
    if (e.target.classList.contains('image-modal-backdrop')) {
      closeImageModal();
    }
  };

  const handleAnswerModalClick = (e) => {
    // Close modal if clicking on backdrop (not the content itself)
    if (e.target.classList.contains('answer-modal-backdrop')) {
      closeAnswerModal();
    }
  };

  const handleQuestionModalClick = (e) => {
    // Close modal if clicking on backdrop (not the content itself)
    if (e.target.classList.contains('question-modal-backdrop')) {
      closeQuestionModal();
    }
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

  const copyModalCodeToClipboard = async () => {
    // Use the modal's selected language instead of selectedLanguage
    const currentAnswer = localQuestion.answers.find(answer => answer.language === answerModalLanguage) || localQuestion.answers[0];
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

  const answerLanguages = useMemo(() => {
    if (!localQuestion.answers || localQuestion.answers.length === 0) return [];
    const uniqueLanguages = new Set(localQuestion.answers.map(answer => answer.language));
    return Array.from(uniqueLanguages);
  }, [localQuestion.answers]);

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
        imageUrls: localQuestion.imageUrls || [],
        imagePublicIds: localQuestion.imagePublicIds || [],
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
    
    // Prompt for delete password
    const password = window.prompt('Enter the admin password to delete this question:');
    if (!password) {
      setMessage({ type: 'error', text: 'Password is required to delete questions' });
      return;
    }
    
    setPending(true); setMessage(null);
    try {
      await apiFetch(`/questions/${localQuestion._id}`, { 
        method: 'DELETE',
        body: JSON.stringify({ password }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
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

  const startEditAnswerLanguage = () => {
    if(currentAnswer) {
      setEditingLanguageForm({ oldLanguage: currentAnswer.language, newLanguage: currentAnswer.language });
      setIsEditingAnswerLanguage(true);
    }
  };

  const cancelEditAnswerLanguage = () => {
    setIsEditingAnswerLanguage(false);
    setEditingLanguageForm({ oldLanguage: '', newLanguage: '' });
  };

  const startEditAnswerContent = () => {
    if(currentAnswer) {
      setEditingAnswerForm({ 
        language: currentAnswer.language, 
        code: currentAnswer.code, 
        explanation: currentAnswer.explanation 
      });
      setIsEditingAnswerContent(true);
    }
  };

  const cancelEditAnswerContent = () => {
    setIsEditingAnswerContent(false);
    setEditingAnswerForm({ language: '', code: '', explanation: '' });
  };

  const handleEditingAnswerFieldChange = (e) => {
    const { name, value } = e.target;
    setEditingAnswerForm(prev => ({ ...prev, [name]: value }));
  };

  const saveAnswerContent = async () => {
    if (!editingAnswerForm.code.trim()) {
      setMessage({ type: 'error', text: 'Code cannot be empty' });
      return;
    }

    if (!editingAnswerForm.explanation.trim()) {
      setMessage({ type: 'error', text: 'Explanation cannot be empty' });
      return;
    }

    setPending(true); 
    setMessage(null);
    
    try {
      const response = await apiFetch(`/questions/${localQuestion._id}/answers/${editingAnswerForm.language}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: editingAnswerForm.code,
          explanation: editingAnswerForm.explanation
        })
      });
      
      setLocalQuestion(response);
      setMessage({ type: 'success', text: 'Answer updated successfully!' });
      setIsEditingAnswerContent(false);
      setEditingAnswerForm({ language: '', code: '', explanation: '' });
      
      // Explicitly keep the edit modal open and update edit form
      setIsEditingQuestion(true);
      setEditForm(prev => ({ 
        ...prev, 
        title: response.title, 
        statement: response.statement, 
        level: response.level, 
        tags: (response.tags||[]).join(', ') 
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
      // Call onUpdated without letting it affect our edit state
      if (onUpdated) {
        setTimeout(() => {
          onUpdated(response);
        }, 100);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { 
      setPending(false); 
    }
  };

  const saveAnswerLanguage = async () => {
    if (!editingLanguageForm.newLanguage.trim()) {
      setMessage({ type: 'error', text: 'Please select a new language' });
      return;
    }

    if (editingLanguageForm.oldLanguage === editingLanguageForm.newLanguage) {
      setMessage({ type: 'error', text: 'Please select a different language' });
      return;
    }

    // Check if the new language already exists
    const existingAnswer = localQuestion.answers.find(answer => answer.language === editingLanguageForm.newLanguage);
    if (existingAnswer) {
      setMessage({ type: 'error', text: 'An answer with this language already exists' });
      return;
    }

    setPending(true); 
    setMessage(null);
    
    try {
      const response = await apiFetch(`/questions/${localQuestion._id}/answers/language`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldLanguage: editingLanguageForm.oldLanguage,
          newLanguage: editingLanguageForm.newLanguage
        })
      });
      
      setLocalQuestion(response);
      setSelectedLanguage(editingLanguageForm.newLanguage);
      setMessage({ type: 'success', text: 'Language updated successfully!' });
      setIsEditingAnswerLanguage(false); // Only close the language editing form
      setEditingLanguageForm({ oldLanguage: '', newLanguage: '' });
      
      // Explicitly keep the edit modal open and update edit form
      setIsEditingQuestion(true);
      setEditForm(prev => ({ 
        ...prev, 
        title: response.title, 
        statement: response.statement, 
        level: response.level, 
        tags: (response.tags||[]).join(', ') 
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
      
      // Call onUpdated without letting it affect our edit state
      if (onUpdated) {
        setTimeout(() => {
          onUpdated(response);
        }, 100);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally { 
      setPending(false); 
    }
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="title-row">
          <h3 className="question-title">{localQuestion.title}</h3>
          <div className="question-meta">
            <span className="question-level">Level {localQuestion.level}</span>
            <span className="question-views" title="Total views for this question">
              <FaEye />
              <span className="question-views-count">{(localQuestion.viewCount ?? 0).toLocaleString()}</span>
            </span>
          </div>
        </div>
        <div className="header-buttons">
          <button
            className="small-btn question-btn"
            onClick={openQuestionModal}
            title="View Full Question"
          >
            <FaEye /> <span className="btn-text">QUESTION</span>
          </button>
          {imageUrls && imageUrls.length > 0 && (
            <button
              className="small-btn image-btn"
              onClick={openImageModal}
              title="View Images in Modal"
            >
              <FaImage /> <span className="btn-text">IMAGES ({imageUrls.length})</span>
            </button>
          )}
          {localQuestion.answers && localQuestion.answers.length > 0 && (
            <button 
              className="small-btn answer-btn"
              onClick={() => openAnswerModal()}
              title="View Answer in Modal"
            >
              <FaCode /> <span className="btn-text">ANSWER</span>
            </button>
          )}
          <button
            className={`small-btn edit-btn ${isEditingQuestion ? 'active' : ''}`}
            onClick={() => {setIsEditingQuestion(v=>!v); setIsAddingAnswer(false);} }
            title={isEditingQuestion? 'Cancel Edit':'Edit Question'}
          >
            <FaEdit /> <span className="btn-text">{isEditingQuestion? 'CANCEL':'EDIT'}</span>
          </button>
          <button
            className={`small-btn add-answer-btn ${isAddingAnswer ? 'active' : ''}`}
            onClick={() => { setIsAddingAnswer(v=>!v); setIsEditingQuestion(false); if(!isAddingAnswer) setAnswerForm({ language: 'javascript', code:'', explanation:''}); }}
            title={isAddingAnswer? 'Close':'Add / Edit Answer'}
          >
            <FaPlus /> <span className="btn-text">{isAddingAnswer? 'CLOSE':'ADD'}</span>
          </button>
          <button
            className="small-btn delete-btn"
            onClick={deleteQuestion}
            disabled={pending}
            title="Delete Question"
          >
            <FaTrash /> <span className="btn-text">DEL</span>
          </button>
        </div>
      </div>
      
      <div className="question-content">
        {message && (
          <div className={`inline-message ${message.type}`}>{message.text}</div>
        )}

        {answerLanguages.length > 0 && (
          <div className="language-badges">
            {answerLanguages.map(language => (
              <button
                key={language}
                type="button"
                className={`language-badge ${selectedLanguage === language ? 'active' : ''}`}
                onClick={() => {
                  setSelectedLanguage(language);
                  openAnswerModal(language);
                }}
              >
                {language}
              </button>
            ))}
          </div>
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
            
            {/* Language Editing Section */}
            {localQuestion.answers && localQuestion.answers.length > 0 && (
              <div className="form-row-inline">
                <label>Edit Answer Languages & Content:</label>
                <div className="edit-section-help">
                  <small>Edit individual answer languages or content below. Changes are saved immediately.</small>
                </div>
                <div className="language-edit-section">
                  {localQuestion.answers.map((answer, index) => (
                    <div key={answer.language} className="language-item">
                      <span className="language-name">{answer.language.charAt(0).toUpperCase() + answer.language.slice(1)}</span>
                      <button 
                        type="button"
                        className="small-btn edit-language-btn"
                        onClick={() => {
                          setEditingLanguageForm({ oldLanguage: answer.language, newLanguage: answer.language });
                          setIsEditingAnswerLanguage(true);
                        }}
                        title={`Edit ${answer.language} language`}
                      >
                        <FaEdit /> Language
                      </button>
                      <button 
                        type="button"
                        className="small-btn edit-btn"
                        onClick={() => {
                          setEditingAnswerForm({ 
                            language: answer.language, 
                            code: answer.code, 
                            explanation: answer.explanation 
                          });
                          setIsEditingAnswerContent(true);
                        }}
                        title={`Edit ${answer.language} code and explanation`}
                      >
                        <FaCode /> Content
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Language Editing Form - show when editing language */}
            {isEditingAnswerLanguage && (
              <div className="edit-language-form">
                <div className="form-row-inline">
                  <label>Change Language From:</label>
                  <span className="current-language">{editingLanguageForm.oldLanguage}</span>
                  <label>To:</label>
                  <select 
                    value={editingLanguageForm.newLanguage}
                    onChange={(e) => setEditingLanguageForm(prev => ({ ...prev, newLanguage: e.target.value }))}
                    className="language-select"
                  >
                    {availableLanguages.map(l => (
                      <option key={l} value={l}>
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions-inline">
                  <button 
                    type="button"
                    className="small-btn save-btn" 
                    onClick={() => {
                      saveAnswerLanguage();
                    }}
                    disabled={pending}
                  >
                    <FaSave /> {pending ? 'Saving...' : 'Update Language'}
                  </button>
                  <button 
                    type="button"
                    className="small-btn cancel-btn" 
                    onClick={cancelEditAnswerLanguage}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Answer Content Editing Form - show when editing answer content */}
            {isEditingAnswerContent && (
              <div className="edit-answer-content-form">
                <div className="form-row-inline">
                  <label>Editing Answer for:</label>
                  <span className="current-language">{editingAnswerForm.language}</span>
                </div>
                <div className="form-row-inline">
                  <label>Code:</label>
                  <textarea 
                    name="code" 
                    value={editingAnswerForm.code} 
                    onChange={handleEditingAnswerFieldChange} 
                    rows={8} 
                    placeholder="Enter code..." 
                    className="code-textarea"
                  />
                </div>
                <div className="form-row-inline">
                  <label>Explanation:</label>
                  <textarea 
                    name="explanation" 
                    value={editingAnswerForm.explanation} 
                    onChange={handleEditingAnswerFieldChange} 
                    rows={4} 
                    placeholder="Explain the solution..." 
                    className="explanation-textarea"
                  />
                </div>
                <div className="form-actions-inline">
                  <button 
                    type="button"
                    className="small-btn save-btn" 
                    onClick={() => {
                      saveAnswerContent();
                    }}
                    disabled={pending}
                  >
                    <FaSave /> {pending ? 'Updating...' : 'Update Answer'}
                  </button>
                  <button 
                    type="button"
                    className="small-btn cancel-btn" 
                    onClick={cancelEditAnswerContent}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Main Save Actions - Only show when not editing individual items */}
            {!isEditingAnswerLanguage && !isEditingAnswerContent && (
              <div className="main-form-actions">
                <hr className="form-separator" />
                <div className="form-actions-inline">
                  <button type="submit" className="small-btn save-question-btn" disabled={pending}>
                    <FaSave /> {pending? 'Saving Question...':'Save Question Details'}
                  </button>
                  <button type="button" className="small-btn cancel-btn" onClick={()=>setIsEditingQuestion(false)}>
                    <FaTimes /> Close Edit Mode
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : null}

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
              <button type="submit" className="small-btn save-btn" disabled={pending}>
                <FaSave /> {pending? 'Saving...':'Save Answer'}
              </button>
              <button type="button" className="small-btn cancel-btn" onClick={()=>setIsAddingAnswer(false)}>
                <FaTimes /> Cancel
              </button>
              {currentAnswer && (
                <button type="button" className="small-btn edit-btn" onClick={startEditAnswer}>
                  <FaEdit /> Load Current
                </button>
              )}
            </div>
          </form>
        )}

      {/* Content now displays in modals */}
      </div>

      {/* Image Modal */}
      {isImageModalOpen && imageUrls.length > 0 && (
        <div className="image-modal-backdrop" onClick={handleImageModalClick}>
          <div className="image-modal-content">
            <button 
              className="modal-close-btn" 
              onClick={closeImageModal}
              title="Close (ESC)"
            >
              ✕
            </button>
            <div className="modal-header">
              <h3>Question Images</h3>
            </div>
            <div className="images-carousel">
              {imageUrls.map((imageUrl, index) => (
                <div key={index} className="carousel-image-item">
                  <img 
                    src={imageUrl} 
                    alt={`Question illustration ${index + 1}`}
                    className="modal-image"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Answer Modal */}
      {isAnswerModalOpen && localQuestion.answers && localQuestion.answers.length > 0 && (
        <div className="answer-modal-backdrop" onClick={handleAnswerModalClick}>
          <div className="answer-modal-content">
            <button 
              className="modal-close-btn" 
              onClick={closeAnswerModal}
              title="Close (ESC)"
            >
              ✕
            </button>
            <div className="modal-header">
              <h3>Question Answer</h3>
              {localQuestion.answers.length > 1 && (
                <div className="modal-language-selector">
                  <label>Language:</label>
                  <select 
                    value={answerModalLanguage} 
                    onChange={(e) => setAnswerModalLanguage(e.target.value)}
                  >
                    {localQuestion.answers.map(answer => (
                      <option key={answer.language} value={answer.language}>
                        {answer.language}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-answer-content" onClick={(e) => e.stopPropagation()}>
              {(() => {
                const currentAnswer = localQuestion.answers.find(answer => answer.language === answerModalLanguage) || localQuestion.answers[0];
                return (
                  <>
                    <div className="modal-code-section">
                      <div className="code-header">
                        <h4>Code ({currentAnswer.language}):</h4>
                        <button
                          className={`copy-btn ${copySuccess ? 'copy-success' : ''}`}
                          onClick={copyModalCodeToClipboard}
                          title="Copy code to clipboard"
                        >
                          {copySuccess ? <FaCheck /> : <FaCopy />} 
                          {copySuccess ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language={currentAnswer.language}
                        style={tomorrow}
                        customStyle={{
                          margin: 0,
                          borderRadius: '0',
                          border: '2px solid #000000',
                          fontSize: '14px',
                          background: '#1a1a1a'
                        }}
                        codeTagProps={{
                          style: {
                            fontSize: '14px',
                            color: '#abb2bf'
                          }
                        }}
                      >
                        {currentAnswer.code}
                      </SyntaxHighlighter>
                    </div>
                    
                    {currentAnswer.explanation && (
                      <div className="modal-explanation-section">
                        <h4>Explanation:</h4>
                        <p>{currentAnswer.explanation}</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Question Statement Modal */}
      {isQuestionModalOpen && (
        <div className="modal-overlay" onClick={handleQuestionModalClick}>
          <div className="modal-container">
            <div className="modal-header">
              <h3>
                <FaEye /> Question Details
              </h3>
              <button onClick={closeQuestionModal} className="modal-close-btn">
                <FaTimes />
              </button>
            </div>
            <div className="modal-content">
              <div className="question-modal-content">
                <div className="question-details">
                  <h4 className="question-title">{localQuestion.title}</h4>
                  <div className="question-meta">
                    <span className="question-level-badge">Level {localQuestion.level}</span>
                    {localQuestion.tags && localQuestion.tags.length > 0 && (
                      <div className="question-tags">
                        {localQuestion.tags.map((tag, idx) => (
                          <span key={idx} className="tag-badge">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="question-statement-section">
                  <h4>Problem Statement:</h4>
                  <div className="question-statement-text">
                    {localQuestion.statement}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionCard;