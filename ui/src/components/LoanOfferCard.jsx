import React from 'react';

const LoanOfferCard = ({ offer, onVerifyDocuments, onAcceptOffer, loading }) => {
  if (!offer) return null;

  // Debug logging to see what we're receiving
  console.log('LoanOfferCard received offer:', JSON.stringify(offer, null, 2));

  // Handle both old and new API response formats
  const offerData = {
    amount: offer.amount || offer.Amount,
    interestRate: offer.pricing?.interestRate || offer.Pricing?.InterestRate || offer.interestRate || offer.InterestRate,
    apr: offer.pricing?.apr || offer.Pricing?.APR || offer.APR,
    termMonths: offer.terms?.termMonths || offer.Terms?.TermMonths || offer.termMonths || offer.TermMonths,
    monthlyPayment: offer.terms?.monthlyPayment || offer.Terms?.MonthlyPayment || offer.monthlyPayment || offer.MonthlyPayment,
    totalOfPayments: offer.terms?.totalOfPayments || offer.Terms?.TotalOfPayments || offer.TotalOfPayments,
    firstPaymentDate: offer.terms?.firstPaymentDate || offer.Terms?.FirstPaymentDate || offer.FirstPaymentDate,
    fees: offer.pricing?.fees || offer.Pricing?.Fees || [],
    conditions: offer.conditions || offer.Conditions || {},
    disclosures: offer.disclosures || offer.Disclosures || {}
  };

  // Debug logging to see what we extracted
  console.log('LoanOfferCard extracted offerData:', JSON.stringify(offerData, null, 2));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="offer-card fade-in">
      <div className="offer-header">
        <h2>🎉 Loan Offer Approved!</h2>
        <div className="offer-amount">{formatCurrency(offerData.amount)}</div>
        <p>Your personalized loan offer is ready for review</p>
      </div>

      <div className="offer-details">
        <div className="detail-item">
          <div className="detail-label">Interest Rate</div>
          <div className="detail-value">{((offerData.interestRate || 0) * 100).toFixed(2)}%</div>
        </div>
        
        {offerData.apr && (
          <div className="detail-item">
            <div className="detail-label">APR</div>
            <div className="detail-value">{(offerData.apr * 100).toFixed(2)}%</div>
          </div>
        )}
        
        <div className="detail-item">
          <div className="detail-label">Term</div>
          <div className="detail-value">{offerData.termMonths} months</div>
        </div>
        
        <div className="detail-item">
          <div className="detail-label">Monthly Payment</div>
          <div className="detail-value">{formatCurrency(offerData.monthlyPayment)}</div>
        </div>
        
        {offerData.totalOfPayments && (
          <div className="detail-item">
            <div className="detail-label">Total of Payments</div>
            <div className="detail-value">{formatCurrency(offerData.totalOfPayments)}</div>
          </div>
        )}
        
        <div className="detail-item">
          <div className="detail-label">First Payment</div>
          <div className="detail-value">{formatDate(offerData.firstPaymentDate)}</div>
        </div>
      </div>

      {/* Fees Section */}
      {offerData.fees && offerData.fees.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4>Fees & Charges</h4>
          <div style={{ marginTop: '1rem' }}>
            {offerData.fees.map((fee, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.5rem 0',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <div style={{ fontWeight: '500' }}>{fee.FeeType || fee.feeType}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {fee.Description || fee.description} ({fee.Frequency || fee.frequency})
                  </div>
                </div>
                <div style={{ fontWeight: '600' }}>{formatCurrency(fee.Amount || fee.amount)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conditions Section */}
      {(offerData.conditions.RequiredDocuments || offerData.conditions.requiredDocuments) && 
       (offerData.conditions.RequiredDocuments || offerData.conditions.requiredDocuments).length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h4>Required Documents</h4>
          <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
            {(offerData.conditions.RequiredDocuments || offerData.conditions.requiredDocuments).map((doc, index) => (
              <li key={index} style={{ marginBottom: '0.5rem' }}>{doc}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Important Disclosures */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: 'var(--secondary-color)', 
        borderRadius: 'var(--radius)',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        <h5 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Important Information</h5>
        <p>• This offer is subject to final underwriting approval</p>
        <p>• Interest rate is based on creditworthiness and may vary</p>
        <p>• You have the right to cancel within 3 business days</p>
        {(offerData.disclosures.TruthInLendingAct || offerData.disclosures.truthInLendingAct) && (
          <p>• {offerData.disclosures.TruthInLendingAct || offerData.disclosures.truthInLendingAct}</p>
        )}
      </div>

      <div className="offer-actions">
        <button 
          className="btn btn-secondary"
          onClick={onVerifyDocuments}
          disabled={loading}
        >
          {loading ? <span className="loading-spinner"></span> : null}
          📄 Verify Documents
        </button>
        <button 
          className="btn btn-success"
          onClick={onAcceptOffer}
          disabled={loading}
        >
          {loading ? <span className="loading-spinner"></span> : null}
          ✅ Accept Offer
        </button>
      </div>
    </div>
  );
};

export default LoanOfferCard;
