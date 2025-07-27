import React from 'react';

const LoanPreferencesForm = ({ formData, setFormData }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">4</span>
        Loan Preferences
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Requested Amount (ZAR) *</label>
          <input
            type="number"
            className="form-input"
            value={formData.requestedAmount || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              requestedAmount: parseFloat(e.target.value) || 0
            }))}
            placeholder="25000"
            min="1000"
            max="100000"
            step="1000"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Loan Purpose *</label>
          <select
            className="form-select"
            value={formData.loanPreferences?.loanPurpose || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              loanPreferences: {
                ...prev.loanPreferences,
                loanPurpose: e.target.value
              }
            }))}
            required
          >
            <option value="">Select Purpose</option>
            <option value="Debt Consolidation">Debt Consolidation</option>
            <option value="Home Improvement">Home Improvement</option>
            <option value="Medical Expenses">Medical Expenses</option>
            <option value="Education">Education</option>
            <option value="Vehicle Purchase">Vehicle Purchase</option>
            <option value="Wedding">Wedding</option>
            <option value="Holiday">Holiday</option>
            <option value="Business">Business</option>
            <option value="Emergency">Emergency</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default LoanPreferencesForm;
