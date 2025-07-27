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
            placeholder="123 Church Street, Sandton"
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
            <option value="">Select Province</option>
            <option value="GP">Gauteng</option>
            <option value="WC">Western Cape</option>
            <option value="KZN">KwaZulu-Natal</option>
            <option value="EC">Eastern Cape</option>
            <option value="FS">Free State</option>
            <option value="LP">Limpopo</option>
            <option value="MP">Mpumalanga</option>
            <option value="NW">North West</option>
            <option value="NC">Northern Cape</option>
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
            placeholder="2196"
            maxLength="4"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default AddressForm;
