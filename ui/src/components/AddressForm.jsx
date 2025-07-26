import React from 'react';

const AddressForm = ({ formData, setFormData }) => {
  return (
    <div className="form-section">
      <h3 className="section-title">
        <span className="section-icon">2</span>
        Address Information
      </h3>
      <div className="form-grid">
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
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
            placeholder="123 Main Street, Apt 4B"
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
            placeholder="New York"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">State *</label>
          <select
            className="form-select"
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
            <option value="">Select State</option>
            <option value="NY">New York</option>
            <option value="CA">California</option>
            <option value="TX">Texas</option>
            <option value="FL">Florida</option>
            <option value="IL">Illinois</option>
            <option value="PA">Pennsylvania</option>
            <option value="OH">Ohio</option>
            <option value="GA">Georgia</option>
            <option value="NC">North Carolina</option>
            <option value="MI">Michigan</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Postal Code *</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.primaryAddress?.postalCode || ''}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                primaryAddress: {
                  ...prev.applicantProfile?.primaryAddress,
                  postalCode: e.target.value
                }
              }
            }))}
            placeholder="10001"
            maxLength="10"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Country</label>
          <input
            type="text"
            className="form-input"
            value={formData.applicantProfile?.primaryAddress?.country || 'USA'}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              applicantProfile: {
                ...prev.applicantProfile,
                primaryAddress: {
                  ...prev.applicantProfile?.primaryAddress,
                  country: e.target.value
                }
              }
            }))}
            placeholder="USA"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
