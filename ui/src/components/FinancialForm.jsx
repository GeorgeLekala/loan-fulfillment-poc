import React from 'react';

const FinancialForm = ({ formData, setFormData }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">4</span>
        Financial Information
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Monthly Expenses *</label>
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
            placeholder="3500"
            min="0"
            step="100"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Existing Debt *</label>
          <input
            type="number"
            className="form-input"
            value={formData.applicantProfile?.finances?.existingDebt || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                finances: {
                  ...prev.applicantProfile?.finances,
                  existingDebt: parseFloat(e.target.value) || 0
                }
              }
            }))}
            placeholder="15000"
            min="0"
            step="500"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Number of Dependents</label>
          <input
            type="number"
            className="form-input"
            value={formData.applicantProfile?.finances?.numberOfDependents || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                finances: {
                  ...prev.applicantProfile?.finances,
                  numberOfDependents: parseInt(e.target.value) || 0
                }
              }
            }))}
            placeholder="2"
            min="0"
            max="10"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Primary Bank</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.finances?.bankName || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                finances: {
                  ...prev.applicantProfile?.finances,
                  bankName: e.target.value,
                  hasBankAccount: e.target.value.length > 0
                }
              }
            }))}
            placeholder="Bank of America"
          />
        </div>
      </div>
    </div>
  );
};

export default FinancialForm;
