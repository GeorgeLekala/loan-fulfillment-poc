import React from 'react';

const EmploymentForm = ({ formData, setFormData }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">3</span>
        Employment Information
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Employment Status *</label>
          <select
            className="form-select"
            value={formData.applicantProfile?.employment?.employmentStatus || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                employment: {
                  ...prev.applicantProfile?.employment,
                  employmentStatus: e.target.value
                }
              }
            }))}
            required
          >
            <option value="">Select Employment Status</option>
            <option value="Employed">Permanently Employed</option>
            <option value="Contract">Contract/Temporary</option>
            <option value="Self-Employed">Self-Employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Retired">Retired</option>
            <option value="Student">Student</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.employment?.jobTitle || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                employment: {
                  ...prev.applicantProfile?.employment,
                  jobTitle: e.target.value
                }
              }
            }))}
            placeholder="Software Engineer"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Employer Name *</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.employment?.employerName || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                employment: {
                  ...prev.applicantProfile?.employment,
                  employerName: e.target.value
                }
              }
            }))}
            placeholder="ABC Corporation"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Years of Employment *</label>
          <input
            type="number"
            className="form-input"
            value={formData.applicantProfile?.employment?.yearsOfEmployment || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                employment: {
                  ...prev.applicantProfile?.employment,
                  yearsOfEmployment: parseInt(e.target.value) || 0
                }
              }
            }))}
            placeholder="5"
            min="0"
            max="50"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Annual Income *</label>
          <input
            type="number"
            className="form-input"
            value={formData.applicantProfile?.employment?.annualIncome || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                employment: {
                  ...prev.applicantProfile?.employment,
                  annualIncome: parseFloat(e.target.value) || 0
                }
              }
            }))}
            placeholder="75000"
            min="0"
            step="1000"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Monthly Income *</label>
          <input
            type="number"
            className="form-input"
            value={formData.applicantProfile?.finances?.monthlyIncome || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                finances: {
                  ...prev.applicantProfile?.finances,
                  monthlyIncome: parseFloat(e.target.value) || 0
                }
              }
            }))}
            placeholder="6250"
            min="0"
            step="100"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default EmploymentForm;
