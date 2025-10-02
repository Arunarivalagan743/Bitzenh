import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();

  const handleLevelClick = (level) => {
    navigate(`/level/${level}`);
  };

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Sri Shakti Engineering Tech College</h1>
          <h2>Programming Questions & Answers Portal</h2>
          <p>
            Explore programming questions with their answers and solutions. 
            This portal provides instant access to answers for a wide range of programming problems 
            organized by difficulty levels to help students learn effectively.
          </p>
          <div className="level-cards">
            <div className="level-card" onClick={() => handleLevelClick(1)}>
              <h3>Level 1</h3>
              <p>Basic programming questions with answers</p>
              <span className="difficulty beginner">Beginner</span>
            </div>
            <div className="level-card" onClick={() => handleLevelClick(2)}>
              <h3>Level 2</h3>
              <p>Intermediate programming questions and solutions</p>
              <span className="difficulty intermediate">Intermediate</span>
            </div>
            <div className="level-card" onClick={() => handleLevelClick(3)}>
              <h3>Level 3</h3>
              <p>Advanced programming questions with detailed answers</p>
              <span className="difficulty advanced">Advanced</span>
            </div>
            <div className="level-card" onClick={() => handleLevelClick(4)}>
              <h3>Level 4</h3>
              <p>Expert level programming solutions</p>
              <span className="difficulty expert">Expert</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="features-section">
        <h2>What You'll Find Here</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>PROGRAMMING QUESTIONS</h3>
            <p>Instant access to programming questions organized by difficulty level</p>
          </div>
          <div className="feature">
            <h3>DETAILED ANSWERS</h3>
            <p>Direct answers with syntax-highlighted code and clear explanations</p>
          </div>
          <div className="feature">
            <h3>QUICK LEARNING</h3>
            <p>Learn effectively with question-answer format instead of structured course</p>
          </div>
          <div className="feature">
            <h3>CONTRIBUTE</h3>
            <p>Add new programming questions and answers to help the student community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
