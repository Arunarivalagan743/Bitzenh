import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = ({ siteViewCount, onRefreshSiteViews }) => {
  const navigate = useNavigate();
  const [displayViews, setDisplayViews] = useState(siteViewCount ?? null);
  const [viewsLoading, setViewsLoading] = useState(false);
  const [viewsError, setViewsError] = useState(null);

  useEffect(() => {
    setDisplayViews(siteViewCount ?? null);
  }, [siteViewCount]);

  useEffect(() => {
    let ignore = false;

    if (!onRefreshSiteViews || siteViewCount != null) {
      return () => {
        ignore = true;
      };
    }

    const fetchViews = async () => {
      setViewsLoading(true);
      setViewsError(null);
      try {
        const data = await onRefreshSiteViews();
        if (!ignore && data && typeof data.totalViews === 'number') {
          setDisplayViews(data.totalViews);
        }
      } catch (error) {
        if (!ignore) {
          setViewsError('Unable to load visitor stats right now.');
        }
      } finally {
        if (!ignore) {
          setViewsLoading(false);
        }
      }
    };

    fetchViews();

    return () => {
      ignore = true;
    };
  }, [onRefreshSiteViews, siteViewCount]);

  const handleLevelClick = (level) => {
    navigate(`/level/${level}`);
  };

  const viewsValue = displayViews != null
    ? displayViews.toLocaleString()
    : viewsLoading
      ? 'Loading…'
      : '—';

  return (
    <div className="home">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Programming Q&amp;A</h1>
          <h2>Practice by Levels • Learn by Doing</h2>
          <p>
            Explore programming questions and solutions. Browse by difficulty,
            search by topic, and learn with concise, syntax‑highlighted answers.
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
            <p>Learn effectively with a focused question–answer format</p>
          </div>
          <div className="feature">
            <h3>CONTRIBUTE</h3>
            <p>Add new questions and answers to help the community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
