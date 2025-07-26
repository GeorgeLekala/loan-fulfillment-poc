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
          <label className="form-label">Full Legal Name *</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.fullName || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                fullName: e.target.value
              }
            }))}
            placeholder="Enter your full legal name"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Date of Birth *</label>
          <input
            type="date"
            className="form-input"
            value={formData.applicantProfile?.dateOfBirth || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                dateOfBirth: e.target.value
              }
            }))}
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Social Security Number *</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.ssn || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                ssn: e.target.value
              }
            }))}
            placeholder="000-00-0000"
            maxLength="11"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            className="form-input"
            value={formData.applicantProfile?.email || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                email: e.target.value
              }
            }))}
            placeholder="your.email@example.com"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Primary Phone *</label>
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
            placeholder="(555) 123-4567"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
