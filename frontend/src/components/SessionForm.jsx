import React, { useState } from 'react';
import '../styles/SessionForm.css';

const SessionForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sessionDate: ''
  });

  const [errors, setErrors] = useState({
    title: '',
    description: '',
    sessionDate: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear the specific error when the user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Hide success message on new input changes
    if (isSubmitted) {
      setIsSubmitted(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    if (!formData.sessionDate) {
      newErrors.sessionDate = 'Session Date & Time is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log('Session Form Data Submitted:', formData);
      setIsSubmitted(true);
      // NOTE: DO NOT call any backend API yet as per requirements
    }
  };

  // Evaluate whether the submit button should be disabled
  const isSubmitDisabled = !formData.title.trim() || !formData.description.trim() || !formData.sessionDate;

  return (
    <div className="session-form-container">
      <div className="session-form-card">
        <h2 className="session-form-title">Create Study Session</h2>
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="session-form-group">
            <label htmlFor="title" className="session-form-label">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Math Revision, Java Practice"
              className={`session-form-input ${errors.title ? 'error' : ''}`}
            />
            <span className="session-form-error-text">{errors.title}</span>
          </div>

          <div className="session-form-group">
            <label htmlFor="description" className="session-form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What will you study in this session?"
              className={`session-form-textarea ${errors.description ? 'error' : ''}`}
            />
            <span className="session-form-error-text">{errors.description}</span>
          </div>

          <div className="session-form-group">
            <label htmlFor="sessionDate" className="session-form-label">Session Date & Time</label>
            <input
              type="datetime-local"
              id="sessionDate"
              name="sessionDate"
              value={formData.sessionDate}
              onChange={handleChange}
              className={`session-form-input ${errors.sessionDate ? 'error' : ''}`}
            />
            <span className="session-form-error-text">{errors.sessionDate}</span>
          </div>

          <button 
            type="submit" 
            className="session-form-submit"
            disabled={isSubmitDisabled}
          >
            Create Session
          </button>
          
          {isSubmitted && (
            <div className="session-form-success">
              Session created successfully! (Check console for data)
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SessionForm;
