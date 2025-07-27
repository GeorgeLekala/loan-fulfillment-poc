import React from 'react';

const PersonalInfoForm = ({ formData, setFormData }) => {
  // SA Province options for address
  const provinces = [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal',
    'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ];

  // Validation functions
  const validateSAId = (id) => {
    if (!id || id.length !== 13) return false;
    // Basic SA ID validation - all digits
    return /^\d{13}$/.test(id);
  };

  const validatePostalCode = (code) => {
    return /^\d{4}$/.test(code);
  };

  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">1</span>
        Personal Information
      </h3>
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
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
            placeholder="Enter your full name"
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
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
            required
          />
          <small className="form-hint">You must be at least 18 years old</small>
        </div>

        <div className="form-group">
          <label className="form-label">South African ID Number *</label>
          <input
            type="text"
            className={`form-input ${formData.applicantProfile?.ssn && !validateSAId(formData.applicantProfile.ssn) ? 'error' : ''}`}
            value={formData.applicantProfile?.ssn || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                ssn: e.target.value
              }
            }))}
            placeholder="0000000000000"
            maxLength="13"
            required
          />
          <small className="form-hint">13-digit SA ID number for credit verification</small>
        </div>
        
        <div className="form-group">
          <label className="form-label">Mobile Number *</label>
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
            placeholder="071 234 5678"
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

        <div className="form-group form-group-full">
          <label className="form-label">Street Address *</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.primaryAddress?.streetAddress || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                primaryAddress: {
                  ...prev.applicantProfile?.primaryAddress,
                  streetAddress: e.target.value
                }
              }
            }))}
            placeholder="123 Main Street, Suburb"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">City *</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.primaryAddress?.city || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                primaryAddress: {
                  ...prev.applicantProfile?.primaryAddress,
                  city: e.target.value
                }
              }
            }))}
            placeholder="Johannesburg"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Province *</label>
          <select
            className="form-input"
            value={formData.applicantProfile?.primaryAddress?.state || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                primaryAddress: {
                  ...prev.applicantProfile?.primaryAddress,
                  state: e.target.value
                }
              }
            }))}
            required
          >
            <option value="">Select Province</option>
            {provinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Postal Code *</label>
          <input
            type="text"
            className={`form-input ${formData.applicantProfile?.primaryAddress?.postalCode && !validatePostalCode(formData.applicantProfile.primaryAddress.postalCode) ? 'error' : ''}`}
            value={formData.applicantProfile?.primaryAddress?.postalCode || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                primaryAddress: {
                  ...prev.applicantProfile?.primaryAddress,
                  postalCode: e.target.value,
                  country: 'ZAF'
                }
              }
            }))}
            placeholder="2000"
            maxLength="4"
            required
          />
          <small className="form-hint">4-digit postal code</small>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
