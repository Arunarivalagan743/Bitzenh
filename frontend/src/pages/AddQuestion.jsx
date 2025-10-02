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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadedImagesData, setUploadedImagesData] = useState([]); // Stored after upload
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

  const validateAndSetFiles = (files) => {
    const validFiles = [];
    const previews = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: `${file.name} is not a valid image file` });
        continue;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: `${file.name} is too large. Maximum size is 5MB` });
        continue;
      }
      
      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previews.push({ file: file, preview: e.target.result });
        if (previews.length === validFiles.length) {
          setImagePreviews(prev => [...prev, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      setMessage({ type: '', text: '' });
    }
    
    return validFiles.length > 0;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      validateAndSetFiles(files);
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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndSetFiles(files);
    }
  };

  const removeImage = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setMessage({ type: '', text: '' });
  };

  const clearAllImages = () => {
    setSelectedFiles([]);
    setImagePreviews([]);
    setUploadedImagesData([]);
    setMessage({ type: '', text: '' });
  };

  const uploadImagesToServer = async (files) => {
    const uploadedImages = [];
    
    for (const file of files) {
      try {
        const result = await apiUpload('/upload', file, 'image');
        if (!result.success) throw new Error(result.message || 'Upload failed');
        uploadedImages.push({ url: result.imageUrl, publicId: result.publicId });
      } catch (error) {
        throw new Error(`Failed to upload ${file.name}: ${error.message}`);
      }
    }
    
    setUploadedImagesData(uploadedImages);
    return uploadedImages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.level || !formData.title) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    // Validate answers
    const validAnswers = answers.filter(answer => 
      answer.language && answer.code.trim()
    );
    
    if (validAnswers.length === 0) {
      setMessage({ type: 'error', text: 'Please provide at least one complete answer' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let imageUrls = [];
      let imagePublicIds = [];
      
      // If files are selected, upload them first
      if (selectedFiles.length > 0) {
        try {
          const imagesData = await uploadImagesToServer(selectedFiles);
          imageUrls = imagesData.map(img => img.url);
          imagePublicIds = imagesData.map(img => img.publicId);
        } catch (uploadError) {
          setMessage({ type: 'error', text: 'Failed to upload images. Please try again.' });
          setLoading(false);
          return;
        }
      }

      const questionData = {
        level: parseInt(formData.level),
        title: formData.title,
        statement: formData.statement,
        answers: validAnswers,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      };
      
      // Only add image arrays if there are images
      if (imageUrls.length > 0) {
        questionData.imageUrls = imageUrls;
        questionData.imagePublicIds = imagePublicIds;
      }
      
      console.log('Sending question data:', questionData);

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
      setSelectedFiles([]);
      setImagePreviews([]);
      setUploadedImagesData([]);

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
              Question Explanation <span className="optional">(optional)</span>
            </label>
            <textarea
              id="statement"
              name="statement"
              value={formData.statement}
              onChange={handleChange}
              placeholder="Describe the problem clearly and provide any necessary context..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">
              Images <span className="optional">(optional)</span>
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
                multiple
                onChange={handleFileChange}
                className="file-input-hidden"
                style={{ display: 'none' }}
              />
              <label htmlFor="imageFile" className="drag-drop-label">
                <div className="drag-drop-icon">📁</div>
                <div className="drag-drop-text">
                  <strong>
                    {selectedFiles.length > 0 
                      ? `Selected: ${selectedFiles.length} image(s)` 
                      : 'Drag & Drop your images here'
                    }
                  </strong>
                  <p>or click to browse files (multiple selection supported)</p>
                  <small>Max 5MB per image • JPG, PNG, GIF supported</small>
                </div>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="images-preview-container">
                <div className="images-preview-header">
                  <span>{imagePreviews.length} image(s) selected</span>
                  <button
                    type="button"
                    className="clear-all-images-btn"
                    onClick={clearAllImages}
                    title="Remove all images"
                  >
                    Clear All
                  </button>
                </div>
                <div className="images-preview-grid">
                  {imagePreviews.map((item, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={item.preview} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        title="Remove this image"
                      >
                        ✕
                      </button>
                      <div className="image-filename">
                        {selectedFiles[index]?.name}
                      </div>
                    </div>
                  ))}
                </div>
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
                    Explanation <span className="optional">(optional)</span>
                  </label>
                  <textarea
                    value={answer.explanation}
                    onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
                    placeholder="Explain how this solution works..."
                    rows={4}
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