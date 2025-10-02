import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './QuestionCard.css';

const QuestionCard = ({ question }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');

  // Set default language when component mounts
  useEffect(() => {
    if (question.answers && question.answers.length > 0) {
      setSelectedLanguage(question.answers[0].language);
    }
  }, [question]);

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const toggleImage = () => {
    setShowImage(!showImage);
  };

  const getCurrentAnswer = () => {
    if (!question.answers || question.answers.length === 0) return null;
    return question.answers.find(answer => answer.language === selectedLanguage) || question.answers[0];
  };

  const currentAnswer = getCurrentAnswer();

  return (
    <div className="question-card">
      <div className="question-header">
        <div className="title-section">
          <h3 className="question-title">{question.title}</h3>
          <div className="header-buttons">
            {question.imageUrl && (
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
          </div>
        </div>
        <span className="question-level">Level {question.level}</span>
      </div>
      
      <div className="question-content">
        <div className="question-statement">
          <h4>Question:</h4>
          <p>{question.statement}</p>
        </div>

        {question.imageUrl && showImage && (
          <div className="question-image">
            <img src={question.imageUrl} alt="Question illustration" />
          </div>
        )}

        {showAnswer && currentAnswer && (
          <div className="answer-section">
            {question.answers && question.answers.length > 1 && (
              <div className="language-selector">
                <label>Choose Language: </label>
                <select 
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="language-select"
                >
                  {question.answers.map(answer => (
                    <option key={answer.language} value={answer.language}>
                      {answer.language.charAt(0).toUpperCase() + answer.language.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <div className="code-section">
              <h4>Code Solution ({currentAnswer.language}):</h4>
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