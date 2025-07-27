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
    <div className="form-container">
      <div className="form-header">
        <h2>Bank Account Details</h2>
        <p className="form-description">
          Please provide your bank account details for loan disbursement. 
          Funds will be transferred to this account upon approval.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bank-details-form">
        <div className="form-section">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Bank Name *</label>
              <select
                className={`form-input ${errors.bankName ? 'error' : ''}`}
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
              {errors.bankName && <span className="error-message">{errors.bankName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Account Type *</label>
              <select
                className="form-input"
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
            </div>

            <div className="form-group">
              <label className="form-label">Account Number *</label>
              <input
                type="text"
                className={`form-input ${errors.accountNumber ? 'error' : ''}`}
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
              {errors.accountNumber && <span className="error-message">{errors.accountNumber}</span>}
              <small className="form-hint">9-11 digit bank account number</small>
            </div>

            <div className="form-group">
              <label className="form-label">Branch Code *</label>
              <input
                type="text"
                className={`form-input ${errors.branchCode ? 'error' : ''}`}
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
              {errors.branchCode && <span className="error-message">{errors.branchCode}</span>}
              <small className="form-hint">
                {formData.bankAccount.bankName ? 'Auto-filled from selected bank' : '6-digit branch code'}
              </small>
            </div>
          </div>

          <div className="security-notice">
            <div className="security-icon">🔒</div>
            <div>
              <h4>Secure Banking Details</h4>
              <p>Your banking information is encrypted and securely stored. We only use this information for loan disbursement and will never share it with third parties.</p>
            </div>
          </div>

          {errors.submit && (
            <div className="error-message submit-error">
              {errors.submit}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Complete Setup'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BankDetailsForm;
