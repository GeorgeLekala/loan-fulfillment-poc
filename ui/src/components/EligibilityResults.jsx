import React from 'react';

const EligibilityResults = ({ eligibilityData }) => {
  if (!eligibilityData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const getRiskBadgeClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'risk-low';
      case 'medium': return 'risk-medium';
      case 'high': return 'risk-high';
      default: return 'risk-low';
    }
  };

  return (
    <div className="assessment-details fade-in">
      <h3>Eligibility Assessment Results</h3>
      
      {/* Credit Information */}
      <div style={{ marginTop: '1.5rem' }}>
        <h4>Credit Assessment</h4>
        <div className="offer-details" style={{ marginTop: '1rem' }}>
          <div className="detail-item">
            <div className="detail-label">Credit Score</div>
            <div className="detail-value">{eligibilityData.assessment?.creditScore || 'N/A'}</div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">Credit Grade</div>
            <div className="detail-value">{eligibilityData.assessment?.creditGrade || 'N/A'}</div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">Debt-to-Income Ratio</div>
            <div className="detail-value">
              {eligibilityData.assessment?.debtToIncomeRatio 
                ? `${(eligibilityData.assessment.debtToIncomeRatio * 100).toFixed(1)}%`
                : 'N/A'
              }
            </div>
          </div>
          
          <div className="detail-item">
            <div className="detail-label">Maximum Approved</div>
            <div className="detail-value">{formatCurrency(eligibilityData.maxAmount)}</div>
          </div>
        </div>
      </div>

      {/* Eligibility Criteria */}
      {eligibilityData.assessment?.criteriaMet && eligibilityData.assessment.criteriaMet.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4>Eligibility Criteria</h4>
          <div style={{ marginTop: '1rem' }}>
            {eligibilityData.assessment.criteriaMet.map((criteria, index) => (
              <div key={index} className="compliance-item">
                <div className={`compliance-icon ${criteria.met ? 'compliance-pass' : 'compliance-fail'}`}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '500' }}>{criteria.criteriaType}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {criteria.description}
                  </div>
                  {criteria.thresholdValue && criteria.actualValue && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Required: {criteria.thresholdValue} | Actual: {criteria.actualValue}
                    </div>
                  )}
                </div>
                <div style={{ fontWeight: '600', color: criteria.met ? 'var(--accent-color)' : 'var(--error-color)' }}>
                  {criteria.met ? 'PASS' : 'FAIL'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Factors */}
      {eligibilityData.assessment?.riskFactors && eligibilityData.assessment.riskFactors.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4>Risk Assessment</h4>
          <div className="risk-factors">
            {eligibilityData.assessment.riskFactors.map((risk, index) => (
              <div key={index} className={`risk-badge ${getRiskBadgeClass(risk.severity)}`}>
                {risk.riskType}: {risk.severity} Risk
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1rem' }}>
            {eligibilityData.assessment.riskFactors.map((risk, index) => (
              <div key={index} style={{ marginBottom: '0.5rem' }}>
                <strong>{risk.riskType}:</strong> {risk.description} 
                {risk.impactScore && ` (Impact: ${(risk.impactScore * 100).toFixed(0)}%)`}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Status */}
      {eligibilityData.assessment?.compliance && (
        <div style={{ marginTop: '2rem' }}>
          <h4>Compliance Verification</h4>
          <div className="compliance-grid">
            <div className="compliance-item">
              <div className={`compliance-icon ${eligibilityData.assessment.compliance.kycCompliant ? 'compliance-pass' : 'compliance-fail'}`}></div>
              <span>KYC Compliant</span>
            </div>
            
            <div className="compliance-item">
              <div className={`compliance-icon ${eligibilityData.assessment.compliance.amlCompliant ? 'compliance-pass' : 'compliance-fail'}`}></div>
              <span>AML Compliant</span>
            </div>
            
            <div className="compliance-item">
              <div className={`compliance-icon ${eligibilityData.assessment.compliance.regulationCompliant ? 'compliance-pass' : 'compliance-fail'}`}></div>
              <span>Regulation Compliant</span>
            </div>
          </div>
          
          {eligibilityData.assessment.compliance.complianceNotes && eligibilityData.assessment.compliance.complianceNotes.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <h5>Compliance Notes:</h5>
              <ul style={{ paddingLeft: '1.5rem' }}>
                {eligibilityData.assessment.compliance.complianceNotes.map((note, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Assessment Reference */}
      {eligibilityData.eligibilityReference && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: 'var(--secondary-color)', 
          borderRadius: 'var(--radius)',
          fontSize: '0.875rem' 
        }}>
          <strong>Assessment Reference:</strong> {eligibilityData.eligibilityReference}
          <br />
          <strong>Assessment Date:</strong> {new Date(eligibilityData.assessmentDate).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default EligibilityResults;
