import React from 'react';

const AgreementView = ({ agreement, onProceed, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const agreementData = {
    agreementId: agreement?.AgreementId || agreement?.agreementId || 'N/A',
    offerId: agreement?.OfferId || agreement?.offerId || 'N/A',
    customerRef: agreement?.CustomerReference || agreement?.customerReference || 'N/A',
    details: agreement?.Details || agreement?.details || {},
    terms: agreement?.Terms || agreement?.terms || {},
    compliance: agreement?.Compliance || agreement?.compliance || {},
    status: agreement?.Status || agreement?.status || {},
    createdAt: agreement?.CreatedAt || agreement?.createdAt
  };

  return (
    <div className="agreement-view fade-in">
      {/* Agreement Header */}
      <div className="agreement-header">
        <h2>📋 Loan Agreement</h2>
        <div className="agreement-meta">
          <div className="detail-item">
            <span className="detail-label">Agreement ID:</span>
            <span className="detail-value">{agreementData.agreementId}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Customer Reference:</span>
            <span className="detail-value">{agreementData.customerRef}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Created:</span>
            <span className="detail-value">{formatDate(agreementData.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Loan Details */}
      <div className="agreement-section">
        <h3>Loan Details</h3>
        <div className="agreement-details">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Product Type</span>
              <span className="detail-value">{agreementData.details.ProductType || 'Personal Loan'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Principal Amount</span>
              <span className="detail-value">{formatCurrency(agreementData.details.PrincipalAmount)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Interest Rate</span>
              <span className="detail-value">{((agreementData.details.InterestRate || 0) * 100).toFixed(2)}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Term</span>
              <span className="detail-value">{agreementData.details.TermMonths} months</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Monthly Payment</span>
              <span className="detail-value">{formatCurrency(agreementData.details.MonthlyPayment)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">First Payment</span>
              <span className="detail-value">{formatDate(agreementData.details.FirstPaymentDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Maturity Date</span>
              <span className="detail-value">{formatDate(agreementData.details.MaturityDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Loan Purpose</span>
              <span className="detail-value">{agreementData.details.LoanPurpose}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      {agreementData.terms.TermsAndConditions && (
        <div className="agreement-section">
          <h3>Terms and Conditions</h3>
          <div className="terms-list">
            {agreementData.terms.TermsAndConditions.map((term, index) => (
              <div key={index} className="term-item">
                <span className="term-number">{index + 1}.</span>
                <span className="term-text">{term}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NCR Compliance & Regulatory Disclosures */}
      <div className="agreement-section">
        <h3>🏛️ National Credit Regulator (NCR) Compliance</h3>
        <div className="compliance-info">
          <div className="compliance-item">
            <h4>Truth in Lending Disclosure</h4>
            <p>{agreementData.compliance?.TruthInLendingDisclosure || 'Full disclosure provided per National Credit Act requirements'}</p>
          </div>
          
          <div className="compliance-item">
            <h4>Right of Rescission</h4>
            <p>{agreementData.compliance?.RightOfRescission || 'You have 5 business days to cancel this agreement (cooling-off period)'}</p>
          </div>

          <div className="compliance-item">
            <h4>Credit Reporting Authorization</h4>
            <p>By signing this agreement, you authorize the lender to report payment history to credit bureaus in accordance with South African credit reporting regulations.</p>
          </div>

          <div className="compliance-item">
            <h4>Responsible Lending Assessment</h4>
            <p>This loan has been assessed in accordance with the National Credit Act's responsible lending provisions. The lender has confirmed your ability to meet repayment obligations.</p>
          </div>
        </div>
      </div>

      {/* Default Provisions */}
      {agreementData.terms.Default && (
        <div className="agreement-section">
          <h3>Default Provisions</h3>
          <div className="default-info">
            <div className="detail-item">
              <span className="detail-label">Grace Period</span>
              <span className="detail-value">{agreementData.terms.Default.GracePeriodDays} days</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Late Fee</span>
              <span className="detail-value">{(agreementData.terms.Default.LateFeePercentage * 100).toFixed(1)}%</span>
            </div>
          </div>
          {agreementData.terms.Default.RemedyActions && (
            <div className="remedy-actions">
              <h4>Remedy Actions</h4>
              <ul>
                {agreementData.terms.Default.RemedyActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Status */}
      <div className="agreement-section">
        <h3>Agreement Status</h3>
        <div className="status-info">
          <div className="status-badge">{agreementData.status.CurrentStatus}</div>
          <div className="status-details">
            <p><strong>Status Date:</strong> {formatDate(agreementData.status.StatusDate)}</p>
            <p><strong>Reason:</strong> {agreementData.status.StatusReason}</p>
          </div>
        </div>
      </div>

      {/* South African Consumer Rights */}
      <div className="agreement-section consumer-rights">
        <h3>🇿🇦 Your Rights as a South African Consumer</h3>
        <div className="rights-info">
          <ul>
            <li><strong>Cooling-off Period:</strong> You have 5 business days to cancel this credit agreement without reason or penalty</li>
            <li><strong>Early Settlement:</strong> You may settle this debt early and receive a reduction in charges</li>
            <li><strong>NCR Registration:</strong> This credit provider is registered with the National Credit Regulator</li>
            <li><strong>Complaint Resolution:</strong> You may lodge complaints with the NCR or the Credit Ombud</li>
            <li><strong>Credit Bureau Rights:</strong> You have the right to access your credit record and dispute incorrect information</li>
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="agreement-actions">
        <button 
          className="btn btn-primary"
          onClick={onProceed}
          disabled={loading}
          style={{ fontSize: '1.1rem', padding: '1rem 3rem' }}
        >
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Processing...
            </>
          ) : (
            <>
              ✅ Accept Agreement & Continue
            </>
          )}
        </button>
        
        <p style={{ 
          marginTop: '1rem', 
          fontSize: '0.875rem', 
          color: 'var(--text-secondary)',
          textAlign: 'center' 
        }}>
          By clicking "Accept Agreement", you confirm that you have read, understood, and agree to be bound by the terms and conditions of this loan agreement.
        </p>
      </div>
    </div>
  );
};

export default AgreementView;
