import React, { useState, useEffect } from 'react';

const DisbursementDetailsForm = ({ 
  formData, 
  onUpdateFormData, 
  onProceedToDisbursement, 
  loading 
}) => {
  const [localFormData, setLocalFormData] = useState({
    fullName: formData?.applicantProfile?.fullName || '',
    dateOfBirth: formData?.applicantProfile?.dateOfBirth || '',
    primaryAddress: {
      streetAddress: formData?.applicantProfile?.primaryAddress?.streetAddress || '',
      city: formData?.applicantProfile?.primaryAddress?.city || 'Johannesburg',
      state: formData?.applicantProfile?.primaryAddress?.state || 'Gauteng',
      postalCode: formData?.applicantProfile?.primaryAddress?.postalCode || '',
      country: 'ZAF'
    },
    bankAccount: {
      accountHolderName: formData?.applicantProfile?.fullName || '',
      bankName: '',
      accountNumber: '',
      branchCode: '',
      accountType: 'Savings'
    }
  });

  const [errors, setErrors] = useState({});

  // Auto-populate full name from SA ID if available
  useEffect(() => {
    if (formData?.applicantProfile?.ssn && !localFormData.fullName) {
      // In a real implementation, you would call an API to get name from SA ID
      // For demo, we'll use the existing name
      setLocalFormData(prev => ({
        ...prev,
        fullName: formData.applicantProfile.fullName || '',
        bankAccount: {
          ...prev.bankAccount,
          accountHolderName: formData.applicantProfile.fullName || ''
        }
      }));
    }
  }, [formData]);

  const handleInputChange = (field, value) => {
    setLocalFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleNestedInputChange = (parent, field, value) => {
    setLocalFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
    
    // Clear errors when user starts typing
    const errorKey = `${parent}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!localFormData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (localFormData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Date of Birth validation
    if (!localFormData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(localFormData.dateOfBirth);
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    // Address validation
    if (!localFormData.primaryAddress.streetAddress.trim()) {
      newErrors['primaryAddress.streetAddress'] = 'Street address is required';
    }
    if (!localFormData.primaryAddress.city.trim()) {
      newErrors['primaryAddress.city'] = 'City is required';
    }
    if (!localFormData.primaryAddress.state.trim()) {
      newErrors['primaryAddress.state'] = 'Province is required';
    }
    if (!localFormData.primaryAddress.postalCode.trim()) {
      newErrors['primaryAddress.postalCode'] = 'Postal code is required';
    } else if (!/^\d{4}$/.test(localFormData.primaryAddress.postalCode)) {
      newErrors['primaryAddress.postalCode'] = 'Postal code must be 4 digits';
    }

    // Bank Account validation
    if (!localFormData.bankAccount.accountHolderName.trim()) {
      newErrors['bankAccount.accountHolderName'] = 'Account holder name is required';
    }
    if (!localFormData.bankAccount.bankName.trim()) {
      newErrors['bankAccount.bankName'] = 'Bank name is required';
    }
    if (!localFormData.bankAccount.accountNumber.trim()) {
      newErrors['bankAccount.accountNumber'] = 'Account number is required';
    } else if (!/^\d{8,11}$/.test(localFormData.bankAccount.accountNumber)) {
      newErrors['bankAccount.accountNumber'] = 'Account number must be 8-11 digits';
    }
    if (!localFormData.bankAccount.branchCode.trim()) {
      newErrors['bankAccount.branchCode'] = 'Branch code is required';
    } else if (!/^\d{6}$/.test(localFormData.bankAccount.branchCode)) {
      newErrors['bankAccount.branchCode'] = 'Branch code must be 6 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Update the main form data with additional details
    const updatedFormData = {
      ...formData,
      applicantProfile: {
        ...formData.applicantProfile,
        fullName: localFormData.fullName,
        dateOfBirth: localFormData.dateOfBirth,
        primaryAddress: {
          ...formData.applicantProfile.primaryAddress,
          ...localFormData.primaryAddress
        },
        bankAccount: localFormData.bankAccount
      }
    };

    onUpdateFormData(updatedFormData);
    onProceedToDisbursement(updatedFormData);
  };

  const southAfricanProvinces = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ];

  const southAfricanBanks = [
    'ABSA Bank',
    'African Bank',
    'Bidvest Bank',
    'Capitec Bank',
    'Discovery Bank',
    'FNB (First National Bank)',
    'Grindrod Bank',
    'Investec',
    'Nedbank',
    'Standard Bank',
    'TymeBank',
    'Other'
  ];

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>📋 Disbursement Details Required</h2>
        <p>To complete your loan disbursement, we need to collect some additional information as required by NCR regulations.</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        {/* Personal Information Section */}
        <div className="form-section">
          <h3>👤 Personal Information</h3>
          
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              value={localFormData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              placeholder="Enter your full name as per SA ID"
              className={errors.fullName ? 'error' : ''}
              maxLength={100}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">
              Date of Birth <span className="required">*</span>
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={localFormData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              className={errors.dateOfBirth ? 'error' : ''}
              max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            />
            {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
          </div>
        </div>

        {/* Address Information Section */}
        <div className="form-section">
          <h3>🏠 Residential Address</h3>
          
          <div className="form-group">
            <label htmlFor="streetAddress">
              Street Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="streetAddress"
              value={localFormData.primaryAddress.streetAddress}
              onChange={(e) => handleNestedInputChange('primaryAddress', 'streetAddress', e.target.value)}
              placeholder="123 Main Street, Suburb"
              className={errors['primaryAddress.streetAddress'] ? 'error' : ''}
              maxLength={200}
            />
            {errors['primaryAddress.streetAddress'] && <span className="error-message">{errors['primaryAddress.streetAddress']}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="city">
                City <span className="required">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={localFormData.primaryAddress.city}
                onChange={(e) => handleNestedInputChange('primaryAddress', 'city', e.target.value)}
                placeholder="Johannesburg"
                className={errors['primaryAddress.city'] ? 'error' : ''}
                maxLength={100}
              />
              {errors['primaryAddress.city'] && <span className="error-message">{errors['primaryAddress.city']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="state">
                Province <span className="required">*</span>
              </label>
              <select
                id="state"
                value={localFormData.primaryAddress.state}
                onChange={(e) => handleNestedInputChange('primaryAddress', 'state', e.target.value)}
                className={errors['primaryAddress.state'] ? 'error' : ''}
              >
                <option value="">Select Province</option>
                {southAfricanProvinces.map(province => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
              {errors['primaryAddress.state'] && <span className="error-message">{errors['primaryAddress.state']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="postalCode">
                Postal Code <span className="required">*</span>
              </label>
              <input
                type="text"
                id="postalCode"
                value={localFormData.primaryAddress.postalCode}
                onChange={(e) => handleNestedInputChange('primaryAddress', 'postalCode', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="2000"
                className={errors['primaryAddress.postalCode'] ? 'error' : ''}
                maxLength={4}
              />
              {errors['primaryAddress.postalCode'] && <span className="error-message">{errors['primaryAddress.postalCode']}</span>}
            </div>
          </div>
        </div>

        {/* Bank Account Information Section */}
        <div className="form-section">
          <h3>🏦 Bank Account for Disbursement</h3>
          
          <div className="form-group">
            <label htmlFor="accountHolderName">
              Account Holder Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="accountHolderName"
              value={localFormData.bankAccount.accountHolderName}
              onChange={(e) => handleNestedInputChange('bankAccount', 'accountHolderName', e.target.value)}
              placeholder="Full name as per bank account"
              className={errors['bankAccount.accountHolderName'] ? 'error' : ''}
              maxLength={100}
            />
            {errors['bankAccount.accountHolderName'] && <span className="error-message">{errors['bankAccount.accountHolderName']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="bankName">
              Bank Name <span className="required">*</span>
            </label>
            <select
              id="bankName"
              value={localFormData.bankAccount.bankName}
              onChange={(e) => handleNestedInputChange('bankAccount', 'bankName', e.target.value)}
              className={errors['bankAccount.bankName'] ? 'error' : ''}
            >
              <option value="">Select Your Bank</option>
              {southAfricanBanks.map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
            {errors['bankAccount.bankName'] && <span className="error-message">{errors['bankAccount.bankName']}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="accountNumber">
                Account Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="accountNumber"
                value={localFormData.bankAccount.accountNumber}
                onChange={(e) => handleNestedInputChange('bankAccount', 'accountNumber', e.target.value.replace(/\D/g, '').slice(0, 11))}
                placeholder="12345678901"
                className={errors['bankAccount.accountNumber'] ? 'error' : ''}
                maxLength={11}
              />
              {errors['bankAccount.accountNumber'] && <span className="error-message">{errors['bankAccount.accountNumber']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="branchCode">
                Branch Code <span className="required">*</span>
              </label>
              <input
                type="text"
                id="branchCode"
                value={localFormData.bankAccount.branchCode}
                onChange={(e) => handleNestedInputChange('bankAccount', 'branchCode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className={errors['bankAccount.branchCode'] ? 'error' : ''}
                maxLength={6}
              />
              {errors['bankAccount.branchCode'] && <span className="error-message">{errors['bankAccount.branchCode']}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="accountType">
                Account Type <span className="required">*</span>
              </label>
              <select
                id="accountType"
                value={localFormData.bankAccount.accountType}
                onChange={(e) => handleNestedInputChange('bankAccount', 'accountType', e.target.value)}
              >
                <option value="Savings">Savings Account</option>
                <option value="Current">Current Account</option>
                <option value="Cheque">Cheque Account</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? '⏳ Processing...' : '💰 Complete Disbursement Setup'}
          </button>
        </div>

        <div className="compliance-notice">
          <p><strong>🔒 NCR Compliance Notice:</strong></p>
          <p>This information is collected in compliance with the National Credit Act and FICA regulations. 
             Your personal information is protected and will only be used for loan disbursement and regulatory compliance.</p>
        </div>
      </form>
    </div>
  );
};

export default DisbursementDetailsForm;
