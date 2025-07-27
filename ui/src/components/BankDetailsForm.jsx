import React, { useState } from 'react';

const BankDetailsForm = ({ applicationId, onComplete }) => {
  const [formData, setFormData] = useState({
    bankAccount: {
      accountNumber: '',
      accountType: 'Savings',
      bankName: '',
      branchCode: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // South African major banks
  const banks = [
    { name: 'ABSA Bank', code: '632005' },
    { name: 'Standard Bank', code: '051001' },
    { name: 'First National Bank (FNB)', code: '250655' },
    { name: 'Nedbank', code: '198765' },
    { name: 'Capitec Bank', code: '470010' },
    { name: 'Discovery Bank', code: '679000' },
    { name: 'Investec Bank', code: '580105' },
    { name: 'African Bank', code: '430000' },
    { name: 'Bidvest Bank', code: '462005' },
    { name: 'Sasfin Bank', code: '683000' }
  ];

  // Validation functions
  const validateBankAccount = (accountNumber) => {
    // SA bank account numbers are typically 9-11 digits
    return /^\d{9,11}$/.test(accountNumber);
  };

  const validateBranchCode = (branchCode) => {
    // SA branch codes are typically 6 digits
    return /^\d{6}$/.test(branchCode);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bankAccount.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!validateBankAccount(formData.bankAccount.accountNumber)) {
      newErrors.accountNumber = 'Please enter a valid 9-11 digit account number';
    }

    if (!formData.bankAccount.bankName) {
      newErrors.bankName = 'Please select your bank';
    }

    if (!formData.bankAccount.branchCode) {
      newErrors.branchCode = 'Branch code is required';
    } else if (!validateBranchCode(formData.bankAccount.branchCode)) {
      newErrors.branchCode = 'Please enter a valid 6-digit branch code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBankChange = (e) => {
    const selectedBank = banks.find(bank => bank.name === e.target.value);
    setFormData(prev => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        bankName: e.target.value,
        branchCode: selectedBank ? selectedBank.code : ''
      }
    }));
    
    // Clear branch code error when bank is selected
    if (errors.branchCode && selectedBank) {
      setErrors(prev => ({ ...prev, branchCode: '', bankName: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:5001/api/loan-applications/${applicationId}/disbursement-details`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bankAccountInformation: {
            accountNumber: formData.bankAccount.accountNumber,
            accountType: formData.bankAccount.accountType,
            bankName: formData.bankAccount.bankName,
            branchCode: formData.bankAccount.branchCode
          }
        }),
      });

      if (response.ok) {
        onComplete();
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Failed to submit bank details' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bank-details-container">
      <div className="bank-details-header">
        <div className="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 8h20l-2-4H4L2 8z" fill="currentColor"/>
            <path d="M2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8H2z" fill="currentColor" opacity="0.7"/>
            <rect x="6" y="12" width="4" height="1" fill="white"/>
          </svg>
        </div>
        <h2 className="header-title">Bank Account Details</h2>
        <p className="header-subtitle">
          Secure your loan disbursement by providing your banking information. 
          All details are encrypted and protected.
        </p>
        <div className="progress-indicator">
          <div className="progress-step completed">1</div>
          <div className="progress-line completed"></div>
          <div className="progress-step completed">2</div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">3</div>
          <div className="progress-line"></div>
          <div className="progress-step">4</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bank-details-form">
        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title">Banking Information</h3>
            <p className="section-description">Select your preferred bank and account type for disbursement</p>
          </div>
          
          <div className="form-grid">
            <div className="form-group bank-selection">
              <label className="form-label required">
                <span className="label-text">Bank Name</span>
                <span className="label-icon">🏦</span>
              </label>
              <div className="select-wrapper">
                <select
                  className={`form-input select-input ${errors.bankName ? 'error' : ''}`}
                  value={formData.bankAccount.bankName}
                  onChange={handleBankChange}
                  required
                >
                  <option value="">Select your bank</option>
                  {banks.map(bank => (
                    <option key={bank.name} value={bank.name}>
                      {bank.name}
                    </option>
                  ))}
                </select>
                <div className="select-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
              {errors.bankName && <span className="error-message">{errors.bankName}</span>}
            </div>

            <div className="form-group account-type">
              <label className="form-label required">
                <span className="label-text">Account Type</span>
                <span className="label-icon">📋</span>
              </label>
              <div className="select-wrapper">
                <select
                  className="form-input select-input"
                  value={formData.bankAccount.accountType}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bankAccount: {
                      ...prev.bankAccount,
                      accountType: e.target.value
                    }
                  }))}
                  required
                >
                  <option value="Savings">Savings Account</option>
                  <option value="Current">Current Account</option>
                  <option value="Transmission">Transmission Account</option>
                </select>
                <div className="select-arrow">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3 className="section-title">Account Details</h3>
            <p className="section-description">Provide your account number and branch information</p>
          </div>

          <div className="form-grid account-details">
            <div className="form-group account-number">
              <label className="form-label required">
                <span className="label-text">Account Number</span>
                <span className="label-icon">🔢</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className={`form-input number-input ${errors.accountNumber ? 'error' : ''}`}
                  value={formData.bankAccount.accountNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only digits
                    setFormData(prev => ({
                      ...prev,
                      bankAccount: {
                        ...prev.bankAccount,
                        accountNumber: value
                      }
                    }));
                    if (errors.accountNumber) {
                      setErrors(prev => ({ ...prev, accountNumber: '' }));
                    }
                  }}
                  placeholder="1234567890"
                  maxLength="11"
                  required
                />
                <div className="input-length-indicator">
                  <span className={`length-count ${formData.bankAccount.accountNumber.length >= 9 ? 'valid' : ''}`}>
                    {formData.bankAccount.accountNumber.length}/11
                  </span>
                </div>
              </div>
              {errors.accountNumber && <span className="error-message">{errors.accountNumber}</span>}
              <small className="form-hint">9-11 digit bank account number</small>
            </div>

            <div className="form-group branch-code">
              <label className="form-label required">
                <span className="label-text">Branch Code</span>
                <span className="label-icon">🏢</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="text"
                  className={`form-input branch-input ${errors.branchCode ? 'error' : ''}`}
                  value={formData.bankAccount.branchCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Only digits
                    setFormData(prev => ({
                      ...prev,
                      bankAccount: {
                        ...prev.bankAccount,
                        branchCode: value
                      }
                    }));
                    if (errors.branchCode) {
                      setErrors(prev => ({ ...prev, branchCode: '' }));
                    }
                  }}
                  placeholder="632005"
                  maxLength="6"
                  required
                />
                <div className="branch-status">
                  {formData.bankAccount.bankName ? (
                    <span className="auto-filled">✓ Auto-filled</span>
                  ) : (
                    <span className="manual">Manual entry</span>
                  )}
                </div>
              </div>
              {errors.branchCode && <span className="error-message">{errors.branchCode}</span>}
              <small className="form-hint">
                {formData.bankAccount.bankName ? 'Auto-filled from selected bank' : '6-digit branch code'}
              </small>
            </div>
          </div>

        </div>

        <div className="security-section">
          <div className="security-notice enhanced">
            <div className="security-header">
              <div className="security-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v5c0 5.25 3.99 10.18 9 11 5.01-.82 9-5.75 9-11V7l-9-5z" fill="currentColor"/>
                  <path d="m9 12 2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="security-content">
                <h4 className="security-title">Bank-Grade Security</h4>
                <p className="security-description">
                  Your banking information is protected with 256-bit encryption and stored securely. 
                  We only use this information for loan disbursement and comply with all banking regulations.
                </p>
              </div>
            </div>
            <div className="security-features">
              <div className="feature">
                <span className="feature-icon">🛡️</span>
                <span>256-bit SSL encryption</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🔐</span>
                <span>Bank-level security</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🏛️</span>
                <span>Regulatory compliant</span>
              </div>
            </div>
          </div>
        </div>

        {errors.submit && (
          <div className="error-alert">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <strong>Submission Error</strong>
              <p>{errors.submit}</p>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn-primary submit-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            <span className="btn-content">
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Complete Bank Setup</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </span>
          </button>
          <p className="action-note">
            Once submitted, your bank details will be verified and your loan will be processed for disbursement.
          </p>
        </div>
      </form>
    </div>
  );
};

export default BankDetailsForm;
