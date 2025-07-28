import React, { useState } from 'react';

const InsuranceLeads = ({ onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    smoker: '',
    coverageType: '',
    coverageAmount: '',
    beneficiaries: '',
    currentInsurance: '',
    medicalConditions: '',
    preferredContactTime: '',
    additionalInfo: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const coverageTypes = [
    { value: 'term', label: 'Term Life Insurance - Affordable temporary coverage' },
    { value: 'whole', label: 'Whole Life Insurance - Permanent coverage with savings' },
    { value: 'family', label: 'Family Life Insurance - Coverage for whole family' },
    { value: 'income', label: 'Income Protection - Replace income if unable to work' },
    { value: 'funeral', label: 'Funeral Cover - Comprehensive funeral expenses' }
  ];

  const coverageAmounts = [
    { value: '100000', label: 'R100,000 - Basic coverage' },
    { value: '250000', label: 'R250,000 - Standard coverage' },
    { value: '500000', label: 'R500,000 - Enhanced coverage' },
    { value: '1000000', label: 'R1,000,000 - Premium coverage' },
    { value: '2000000+', label: 'R2,000,000+ - Maximum coverage' },
    { value: 'unsure', label: 'Not sure - Help me decide' }
  ];

  const contactTimes = [
    { value: 'morning', label: 'Morning (8AM - 12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)' },
    { value: 'evening', label: 'Evening (5PM - 8PM)' },
    { value: 'anytime', label: 'Anytime' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="app-container">
        <div className="success-header insurance-success">
          <div className="success-icon">🛡️</div>
          <h1>Thank You for Your Interest!</h1>
          <p>We've received your life insurance quote request</p>
        </div>

        <div className="lead-success-content">
          <div className="success-card">
            <h2>🎉 What happens next?</h2>
            
            <div className="next-steps-timeline">
              <div className="timeline-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Quote Preparation</h4>
                  <p>Our underwriters will prepare personalized quotes based on your profile</p>
                  <span className="step-time">Within 4 hours</span>
                </div>
              </div>

              <div className="timeline-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Insurance Advisor Call</h4>
                  <p>A certified life insurance advisor will present your quote options</p>
                  <span className="step-time">Within 24 hours</span>
                </div>
              </div>

              <div className="timeline-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Health Assessment</h4>
                  <p>Complete a simple health questionnaire (may require medical exam)</p>
                  <span className="step-time">As needed</span>
                </div>
              </div>

              <div className="timeline-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Policy Activation</h4>
                  <p>Your policy becomes active after approval and first premium payment</p>
                  <span className="step-time">2-5 business days</span>
                </div>
              </div>
            </div>

            <div className="contact-info">
              <h3>🏥 Free Health Check Benefit</h3>
              <p>All our life insurance clients receive an annual health check worth R2,500!</p>
              
              <h3>📞 Need immediate assistance?</h3>
              <p>Call our Life Insurance Hotline: <strong>0860 INSURE (467873)</strong></p>
              <p>Reference: LI-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>

          <div className="actions-section">
            <button className="btn btn-primary" onClick={onBack}>
              <span>← Back to Shop</span>
            </button>
            
            <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>
              Request Another Quote
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="lead-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Shop
        </button>
        
        <div className="lead-logo-container">
          <div className="lead-logo-icon">🛡️</div>
          <div className="lead-brand-text">
            <h1>DirectAxis Life Insurance</h1>
            <span className="lead-tagline">Get Your Free Quote</span>
          </div>
        </div>
        <p>Protect your family's future with comprehensive life insurance coverage</p>
      </div>

      {/* Lead Generation Form */}
      <div className="lead-form-container">
        <form onSubmit={handleSubmit} className="lead-form">
          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">Personal Information</h3>
              <p className="section-description">Tell us about yourself</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">First Name *</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Last Name *</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="Enter your last name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Email Address *</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Phone Number *</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input"
                  required
                  placeholder="083 123 4567"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Date of Birth *</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Gender *</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Do you smoke? *</span>
                </label>
                <select
                  name="smoker"
                  value={formData.smoker}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select option</option>
                  <option value="no">No, I don't smoke</option>
                  <option value="yes">Yes, I smoke</option>
                  <option value="former">Former smoker</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">Coverage Requirements</h3>
              <p className="section-description">What type of coverage do you need?</p>
            </div>

            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">
                  <span className="label-text">Type of Coverage *</span>
                </label>
                <select
                  name="coverageType"
                  value={formData.coverageType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select coverage type</option>
                  {coverageTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Coverage Amount *</span>
                </label>
                <select
                  name="coverageAmount"
                  value={formData.coverageAmount}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select amount</option>
                  {coverageAmounts.map(amount => (
                    <option key={amount.value} value={amount.value}>
                      {amount.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Number of Beneficiaries</span>
                </label>
                <select
                  name="beneficiaries"
                  value={formData.beneficiaries}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select number</option>
                  <option value="1">1 beneficiary</option>
                  <option value="2">2 beneficiaries</option>
                  <option value="3">3 beneficiaries</option>
                  <option value="4+">4 or more beneficiaries</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Current Life Insurance</span>
                </label>
                <select
                  name="currentInsurance"
                  value={formData.currentInsurance}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select option</option>
                  <option value="none">No current insurance</option>
                  <option value="employer">Through employer only</option>
                  <option value="personal">Personal policy</option>
                  <option value="both">Both employer and personal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">Health Information</h3>
              <p className="section-description">Help us provide accurate quotes</p>
            </div>

            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">
                  <span className="label-text">Any Medical Conditions or Health Concerns?</span>
                </label>
                <textarea
                  name="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={handleChange}
                  className="form-input"
                  rows="3"
                  placeholder="Please list any chronic conditions, surgeries, or medications (this helps us provide accurate quotes)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Preferred Contact Time *</span>
                </label>
                <select
                  name="preferredContactTime"
                  value={formData.preferredContactTime}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select time</option>
                  {contactTimes.map(time => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-group form-group-full">
              <label className="form-label">
                <span className="label-text">Additional Information</span>
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                className="form-input"
                rows="4"
                placeholder="Any specific questions or requirements you'd like to discuss with our advisor..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              <div className="btn-content">
                {loading && <div className="loading-spinner"></div>}
                <span>{loading ? 'Preparing Quote...' : 'Get My Free Quote'}</span>
                {!loading && <span className="btn-arrow">🛡️</span>}
              </div>
            </button>
            
            <p className="action-note">
              By submitting this form, you consent to DirectAxis contacting you about life insurance products. 
              Your health information is protected under our strict privacy policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsuranceLeads;
