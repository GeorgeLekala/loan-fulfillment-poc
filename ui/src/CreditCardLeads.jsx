import React, { useState } from 'react';

const CreditCardLeads = ({ onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    monthlyIncome: '',
    employmentStatus: '',
    preferredCardType: '',
    currentCards: '',
    preferredContactTime: '',
    specialRequests: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const creditCardTypes = [
    { value: 'platinum', label: 'Platinum Card - Premium benefits & high limits' },
    { value: 'gold', label: 'Gold Card - Great rewards & travel benefits' },
    { value: 'classic', label: 'Classic Card - Everyday spending & cashback' },
    { value: 'business', label: 'Business Card - Corporate benefits & expense management' }
  ];

  const employmentOptions = [
    { value: 'permanent', label: 'Permanent Employment' },
    { value: 'contract', label: 'Contract/Temporary' },
    { value: 'self-employed', label: 'Self Employed' },
    { value: 'retired', label: 'Retired' },
    { value: 'student', label: 'Student' }
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
        <div className="success-header credit-card-success">
          <div className="success-icon">💳</div>
          <h1>Thank You for Your Interest!</h1>
          <p>We've received your credit card application request</p>
        </div>

        <div className="lead-success-content">
          <div className="success-card">
            <h2>🎉 What happens next?</h2>
            
            <div className="next-steps-timeline">
              <div className="timeline-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Pre-qualification Review</h4>
                  <p>Our credit team will review your information within 2 hours</p>
                  <span className="step-time">Within 2 hours</span>
                </div>
              </div>

              <div className="timeline-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Specialist Call</h4>
                  <p>A credit card specialist will call you to discuss your options</p>
                  <span className="step-time">Within 24 hours</span>
                </div>
              </div>

              <div className="timeline-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Formal Application</h4>
                  <p>Complete your application with our specialist over the phone</p>
                  <span className="step-time">During call</span>
                </div>
              </div>

              <div className="timeline-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Card Delivery</h4>
                  <p>Your new credit card will be delivered to your address</p>
                  <span className="step-time">5-7 business days</span>
                </div>
              </div>
            </div>

            <div className="contact-info">
              <h3>📞 Need immediate assistance?</h3>
              <p>Call our Credit Card Hotline: <strong>0860 CREDIT (273348)</strong></p>
              <p>Reference: CC-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>

          <div className="actions-section">
            <button className="btn btn-primary" onClick={onBack}>
              <span>← Back to Shop</span>
            </button>
            
            <button className="btn btn-secondary" onClick={() => setSubmitted(false)}>
              Submit Another Request
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
          <div className="lead-logo-icon">💳</div>
          <div className="lead-brand-text">
            <h1>DirectAxis Credit Cards</h1>
            <span className="lead-tagline">Express Your Interest</span>
          </div>
        </div>
        <p>Complete this form and our credit card specialist will contact you with personalized offers</p>
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
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">Financial Information</h3>
              <p className="section-description">Help us understand your financial profile</p>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Monthly Income *</span>
                </label>
                <select
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select income range</option>
                  <option value="0-5000">R0 - R5,000</option>
                  <option value="5000-10000">R5,000 - R10,000</option>
                  <option value="10000-20000">R10,000 - R20,000</option>
                  <option value="20000-35000">R20,000 - R35,000</option>
                  <option value="35000-50000">R35,000 - R50,000</option>
                  <option value="50000+">R50,000+</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Employment Status *</span>
                </label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select employment status</option>
                  {employmentOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h3 className="section-title">Credit Card Preferences</h3>
              <p className="section-description">What type of credit card interests you?</p>
            </div>

            <div className="form-grid">
              <div className="form-group form-group-full">
                <label className="form-label">
                  <span className="label-text">Preferred Card Type *</span>
                </label>
                <select
                  name="preferredCardType"
                  value={formData.preferredCardType}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select card type</option>
                  {creditCardTypes.map(card => (
                    <option key={card.value} value={card.value}>
                      {card.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-text">Current Credit Cards</span>
                </label>
                <select
                  name="currentCards"
                  value={formData.currentCards}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select number</option>
                  <option value="0">No credit cards</option>
                  <option value="1">1 credit card</option>
                  <option value="2">2 credit cards</option>
                  <option value="3+">3 or more credit cards</option>
                </select>
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
                <span className="label-text">Special Requirements or Questions</span>
              </label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleChange}
                className="form-input"
                rows="4"
                placeholder="Tell us about any specific requirements or questions you have..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              <div className="btn-content">
                {loading && <div className="loading-spinner"></div>}
                <span>{loading ? 'Submitting...' : 'Request Call Back'}</span>
                {!loading && <span className="btn-arrow">📞</span>}
              </div>
            </button>
            
            <p className="action-note">
              By submitting this form, you consent to DirectAxis contacting you about our credit card products. 
              Your information is protected according to our privacy policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreditCardLeads;
