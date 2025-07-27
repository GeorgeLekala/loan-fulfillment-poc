import React from 'react';

const EmploymentForm = ({ formData, setFormData }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">2</span>
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
            <option value="Pensioner">Pensioner</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Monthly Income (ZAR) *</label>
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
            placeholder="25000"
            min="5000"
            step="1000"
            required
          />
          <small className="form-hint">Gross monthly income before deductions</small>
        </div>
      </div>
    </div>
  );
};

export default EmploymentForm;
