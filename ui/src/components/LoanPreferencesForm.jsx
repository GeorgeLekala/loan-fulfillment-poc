import React from 'react';

const LoanPreferencesForm = ({ formData, setFormData }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">5</span>
        Loan Preferences
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Requested Amount *</label>
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
            <option value="Auto Purchase">Auto Purchase</option>
            <option value="Wedding">Wedding</option>
            <option value="Vacation">Vacation</option>
            <option value="Business">Business</option>
            <option value="Emergency">Emergency</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Preferred Term (Months) *</label>
          <select
            className="form-select"
            value={formData.loanPreferences?.preferredTermMonths || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              loanPreferences: {
                ...prev.loanPreferences,
                preferredTermMonths: parseInt(e.target.value) || 0
              }
            }))}
            required
          >
            <option value="">Select Term</option>
            <option value="12">12 months</option>
            <option value="24">24 months</option>
            <option value="36">36 months</option>
            <option value="48">48 months</option>
            <option value="60">60 months</option>
            <option value="72">72 months</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Maximum Monthly Payment</label>
          <input
            type="number"
            className="form-input"
            value={formData.loanPreferences?.maxMonthlyPayment || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              loanPreferences: {
                ...prev.loanPreferences,
                maxMonthlyPayment: parseFloat(e.target.value) || null
              }
            }))}
            placeholder="1000"
            min="100"
            step="50"
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Product Type</label>
          <select
            className="form-select"
            value={formData.loanPreferences?.productType || 'Personal Loan'}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              loanPreferences: {
                ...prev.loanPreferences,
                productType: e.target.value
              }
            }))}
          >
            <option value="Personal Loan">Personal Loan</option>
            <option value="Secured Loan">Secured Loan</option>
            <option value="Line of Credit">Line of Credit</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={formData.loanPreferences?.autoPayEnrollment || false}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                loanPreferences: {
                  ...prev.loanPreferences,
                  autoPayEnrollment: e.target.checked
                }
              }))}
            />
            Enroll in AutoPay (0.25% rate discount)
          </label>
        </div>
      </div>
    </div>
  );
};

export default LoanPreferencesForm;
