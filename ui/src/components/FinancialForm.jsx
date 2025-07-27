import React from 'react';

const FinancialForm = ({ formData, setFormData }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">3</span>
        Financial Information
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Monthly Expenses (ZAR) *</label>
          <input
            type="number"
            className="form-input"
            value={formData.applicantProfile?.finances?.monthlyExpenses || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                finances: {
                  ...prev.applicantProfile?.finances,
                  monthlyExpenses: parseFloat(e.target.value) || 0
                }
              }
            }))}
            placeholder="12000"
            min="0"
            step="500"
            required
          />
          <small className="form-hint">Include rent, groceries, transport, debt payments</small>
        </div>
      </div>
    </div>
  );
};

export default FinancialForm;
