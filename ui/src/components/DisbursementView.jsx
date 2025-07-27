import React from 'react';

const DisbursementView = ({ account, payment, applicationId }) => {
  // Debug logging to see what data we're receiving
  console.log('DisbursementView Props:', { account, payment, applicationId });
  console.log('Account Details:', account?.Details);
  console.log('Account Schedule:', account?.Schedule);
  console.log('Account Configuration:', account?.Configuration);
  console.log('Account ServiceLevels:', account?.ServiceLevels);

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

  const accountData = {
    loanAccountId: account?.LoanAccountId || account?.loanAccountId || 'N/A',
    agreementId: account?.AgreementId || account?.agreementId || 'N/A',
    customerRef: account?.CustomerReference || account?.customerReference || 'N/A',
    details: {
      ProductType: account?.Details?.ProductType || 'Personal Loan',
      OriginalPrincipal: account?.Details?.OriginalPrincipal || payment?.Amount || payment?.amount || 50000,
      CurrentBalance: account?.Details?.CurrentBalance || payment?.Amount || payment?.amount || 50000,
      InterestRate: account?.Details?.InterestRate || 0.12,
      OriginalTermMonths: account?.Details?.OriginalTermMonths || 24,
      FirstPaymentDate: account?.Details?.FirstPaymentDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      MaturityDate: account?.Details?.MaturityDate || new Date(new Date().setMonth(new Date().getMonth() + 25)).toISOString(),
      LoanPurpose: account?.Details?.LoanPurpose || 'Personal Use'
    },
    schedule: {
      MonthlyPayment: account?.Schedule?.MonthlyPayment || ((payment?.Amount || payment?.amount || 50000) / 24),
      PaymentDay: account?.Schedule?.PaymentDay || 1,
      UpcomingPayments: account?.Schedule?.UpcomingPayments || []
    },
    configuration: {
      AutoPayEnabled: account?.Configuration?.AutoPayEnabled || false,
      StatementDelivery: account?.Configuration?.StatementDelivery || 'Electronic',
      PaperlessEnrolled: account?.Configuration?.PaperlessEnrolled || true
    },
    serviceLevels: {
      CustomerSegment: account?.ServiceLevels?.CustomerSegment || 'Standard',
      SupportLevel: account?.ServiceLevels?.SupportLevel || 'Standard',
      AvailableServices: account?.ServiceLevels?.AvailableServices || [
        'Online Account Management',
        'Mobile App Access', 
        '24/7 Customer Support',
        'Payment Deferrals',
        'Statement Download'
      ]
    },
    status: account?.Status || account?.status || {},
    createdAt: account?.CreatedAt || account?.createdAt
  };

  const paymentData = {
    paymentId: payment?.PaymentId || payment?.paymentId || 'N/A',
    amount: payment?.Amount || payment?.amount || accountData.details.OriginalPrincipal,
    status: payment?.Status || payment?.status || 'Completed',
    processingDate: payment?.ProcessingDate || payment?.processingDate || new Date().toISOString(),
    method: payment?.Method || payment?.method || 'Electronic Transfer'
  };

  return (
    <div className="disbursement-view fade-in">
      {/* Success Header */}
      <div className="success-header">
        <div className="success-icon">🎉</div>
        <h1>Loan Successfully Disbursed!</h1>
        <p>Your loan has been approved and funds have been transferred to your account.</p>
      </div>

      {/* Disbursement Summary */}
      <div className="disbursement-summary">
        <div className="summary-card">
          <h2>Disbursement Details</h2>
          <div className="summary-details">
            <div className="detail-item">
              <span className="detail-label">Application ID</span>
              <span className="detail-value">{applicationId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Loan Account ID</span>
              <span className="detail-value">{accountData.loanAccountId}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Payment Reference</span>
              <span className="detail-value">{paymentData.paymentId}</span>
            </div>
            <div className="detail-item highlight">
              <span className="detail-label">Amount Disbursed</span>
              <span className="detail-value amount">{formatCurrency(paymentData.amount)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Processing Date</span>
              <span className="detail-value">{formatDate(paymentData.processingDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Transfer Method</span>
              <span className="detail-value">{paymentData.method}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loan Account Information */}
      <div className="account-section">
        <h2>📊 Your Loan Account</h2>
        <div className="account-details">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Product Type</span>
              <span className="detail-value">{accountData.details.ProductType}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Original Principal</span>
              <span className="detail-value">{formatCurrency(accountData.details.OriginalPrincipal)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Current Balance</span>
              <span className="detail-value">{formatCurrency(accountData.details.CurrentBalance)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Interest Rate</span>
              <span className="detail-value">{((accountData.details.InterestRate || 0) * 100).toFixed(2)}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Term</span>
              <span className="detail-value">{accountData.details.OriginalTermMonths} months</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">First Payment Due</span>
              <span className="detail-value">{formatDate(accountData.details.FirstPaymentDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Maturity Date</span>
              <span className="detail-value">{formatDate(accountData.details.MaturityDate)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Customer Segment</span>
              <span className="detail-value">{accountData.serviceLevels.CustomerSegment}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      {accountData.schedule.UpcomingPayments && accountData.schedule.UpcomingPayments.length > 0 && (
        <div className="schedule-section">
          <h2>📅 Payment Schedule (Next 6 Payments)</h2>
          <div className="payment-schedule">
            <div className="schedule-header">
              <div className="schedule-item">
                <span className="schedule-label">Monthly Payment</span>
                <span className="schedule-value">{formatCurrency(accountData.schedule.MonthlyPayment)}</span>
              </div>
              <div className="schedule-item">
                <span className="schedule-label">Payment Day</span>
                <span className="schedule-value">{accountData.schedule.PaymentDay}</span>
              </div>
            </div>
            
            <div className="schedule-table">
              <div className="table-header">
                <span>Payment #</span>
                <span>Due Date</span>
                <span>Payment Amount</span>
                <span>Principal</span>
                <span>Interest</span>
                <span>Balance</span>
              </div>
              {accountData.schedule.UpcomingPayments.map((payment, index) => (
                <div key={index} className="table-row">
                  <span>{payment.PaymentNumber}</span>
                  <span>{formatDate(payment.DueDate)}</span>
                  <span>{formatCurrency(payment.PaymentAmount)}</span>
                  <span>{formatCurrency(payment.PrincipalAmount)}</span>
                  <span>{formatCurrency(payment.InterestAmount)}</span>
                  <span>{formatCurrency(payment.RemainingBalance)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account Configuration */}
      <div className="config-section">
        <h2>⚙️ Account Configuration</h2>
        <div className="config-details">
          <div className="config-grid">
            <div className="config-item">
              <span className="config-label">AutoPay Enabled</span>
              <span className="config-value">
                {accountData.configuration.AutoPayEnabled ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="config-item">
              <span className="config-label">Statement Delivery</span>
              <span className="config-value">{accountData.configuration.StatementDelivery}</span>
            </div>
            <div className="config-item">
              <span className="config-label">Paperless Enrolled</span>
              <span className="config-value">
                {accountData.configuration.PaperlessEnrolled ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div className="config-item">
              <span className="config-label">Support Level</span>
              <span className="config-value">{accountData.serviceLevels.SupportLevel}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisbursementView;
