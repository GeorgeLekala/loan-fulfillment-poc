import React from 'react';

const PersonalInfoForm = ({ formData, setFormData }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">1</span>
        Personal Information
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">South African ID Number *</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.ssn || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                ssn: e.target.value,
                fullName: e.target.value ? 'Auto-filled from ID' : '',
                dateOfBirth: e.target.value ? 'Auto-filled from ID' : ''
              }
            }))}
            placeholder="0000000000000"
            maxLength="13"
            required
          />
          <small className="form-hint">We'll use this to check your credit profile</small>
        </div>
        
        <div className="form-group">
          <label className="form-label">Mobile Number *</label>
          <input
            type="tel"
            className="form-input"
            value={formData.applicantProfile?.primaryPhone || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                primaryPhone: e.target.value
              }
            }))}
            placeholder="071 234 5678"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
