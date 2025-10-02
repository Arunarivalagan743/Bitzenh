import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddQuestion.css';
import { apiFetch, apiUpload } from '../api/client';

const AddQuestion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    level: '',
    title: '',
    statement: '',
    tags: ''
  });
  const [answers, setAnswers] = useState([
    { language: 'javascript', code: '', explanation: '' }
  ]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadedImageData, setUploadedImageData] = useState(null); // Stored after upload (optional use)
  const [isDragOver, setIsDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const availableLanguages = [
    'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 
    'php', 'ruby', 'go', 'rust', 'typescript', 'swift', 'kotlin'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnswerChange = (index, field, value) => {
    const newAnswers = [...answers];
    newAnswers[index][field] = value;
    setAnswers(newAnswers);
  };

  const addAnswer = () => {
    setAnswers([...answers, { language: 'javascript', code: '', explanation: '' }]);
  };

  const removeAnswer = (index) => {
    if (answers.length > 1) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
    }
  };

  const validateAndSetFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file' });
      return false;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image size should be less than 5MB' });
      return false;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
    setMessage({ type: '', text: '' });
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setUploadedImageData(null);
    setMessage({ type: '', text: '' });
  };

  const uploadImageToServer = async (file) => {
    try {
      const result = await apiUpload('/upload', file, 'image');
      if (!result.success) throw new Error(result.message || 'Upload failed');
      const imageData = { url: result.imageUrl, publicId: result.publicId };
      setUploadedImageData(imageData);
      return imageData;
    } catch (error) {
      throw new Error(error.message || 'Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.level || !formData.title || !formData.statement) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    // Validate answers
    const validAnswers = answers.filter(answer => 
      answer.language && answer.code.trim() && answer.explanation.trim()
    );
    
    if (validAnswers.length === 0) {
      setMessage({ type: 'error', text: 'Please provide at least one complete answer' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let imageUrl = null;
      let imagePublicId = null;
      
      // If file is selected, upload it first
      if (selectedFile) {
        try {
          const imageData = await uploadImageToServer(selectedFile);
          imageUrl = imageData.url;
          imagePublicId = imageData.publicId;
        } catch (uploadError) {
          setMessage({ type: 'error', text: 'Failed to upload image. Please try again.' });
          setLoading(false);
          return;
        }
      }

      const questionData = {
        level: parseInt(formData.level),
        title: formData.title,
        statement: formData.statement,
        imageUrl: imageUrl,
        imagePublicId: imagePublicId,
        answers: validAnswers,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      };

      const result = await apiFetch('/questions', {
        method: 'POST',
        body: JSON.stringify(questionData),
      });
      if (!result || !result._id) {
        throw new Error('Failed to add question');
      }
      setMessage({ type: 'success', text: 'Question added successfully!' });
      
      // Reset form
      setFormData({
        level: '',
        title: '',
        statement: '',
        tags: ''
      });
      setAnswers([{ language: 'javascript', code: '', explanation: '' }]);
      setSelectedFile(null);
      setImagePreview(null);
      setUploadedImageData(null);

      // Redirect to the level page after 2 seconds
      setTimeout(() => {
        navigate(`/level/${result.level}`);
      }, 2000);

    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-question-page">
      <div className="add-question-container">
        <div className="page-header">
          <h1>Add New Question</h1>
          <p>Contribute to the learning community by adding programming questions</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="add-question-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="level">
                Level <span className="required">*</span>
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
              >
                <option value="">Select Level</option>
                <option value="1">Level 1 - Beginner</option>
                <option value="2">Level 2 - Intermediate</option>
                <option value="3">Level 3 - Advanced</option>
                <option value="4">Level 4 - Expert</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">
              Question Title <span className="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a descriptive title for your question"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="statement">
              Question Statement <span className="required">*</span>
            </label>
            <textarea
              id="statement"
              name="statement"
              value={formData.statement}
              onChange={handleChange}
              placeholder="Describe the problem clearly and provide any necessary context..."
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">
              Image <span className="optional">(optional)</span>
            </label>
            
            <div 
              className={`drag-drop-area ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="imageFile"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input-hidden"
                style={{ display: 'none' }}
              />
              <label htmlFor="imageFile" className="drag-drop-label">
                <div className="drag-drop-icon">📁</div>
                <div className="drag-drop-text">
                  <strong>
                    {selectedFile 
                      ? `Selected: ${selectedFile.name}` 
                      : 'Drag & Drop your image here'
                    }
                  </strong>
                  <p>or click to browse files</p>
                  <small>Max 5MB • JPG, PNG, GIF supported</small>
                </div>
              </label>
            </div>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={clearImage}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tags">
              Tags (optional)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleChange}
              placeholder="Enter tags separated by commas (e.g., loops, arrays, sorting)"
            />
            <small className="form-help">
              Add relevant tags to help categorize the question
            </small>
          </div>

          <div className="answers-section">
            <div className="answers-header">
              <h3>Code Solutions</h3>
              <button
                type="button"
                onClick={addAnswer}
                className="add-answer-btn"
              >
                Add Another Language
              </button>
            </div>

            {answers.map((answer, index) => (
              <div key={index} className="answer-group">
                <div className="answer-header">
                  <h4>Solution {index + 1}</h4>
                  {answers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAnswer(index)}
                      className="remove-answer-btn"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="form-group">
                  <label>
                    Programming Language <span className="required">*</span>
                  </label>
                  <select
                    value={answer.language}
                    onChange={(e) => handleAnswerChange(index, 'language', e.target.value)}
                    required
                  >
                    {availableLanguages.map(lang => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Code Solution <span className="required">*</span>
                  </label>
                  <textarea
                    value={answer.code}
                    onChange={(e) => handleAnswerChange(index, 'code', e.target.value)}
                    placeholder="Enter the complete code solution here..."
                    rows={8}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    Explanation <span className="required">*</span>
                  </label>
                  <textarea
                    value={answer.explanation}
                    onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
                    placeholder="Explain how this solution works..."
                    rows={4}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Adding Question...' : 'Add Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQuestion;