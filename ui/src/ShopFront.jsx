import React, { useState } from 'react';
import LoanApplication from './App';
import CreditCardLeads from './CreditCardLeads';
import InsuranceLeads from './InsuranceLeads';

const ShopFront = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);

  const products = [
    {
      id: 'loans',
      title: 'Personal Loans',
      subtitle: 'Get instant loan approval',
      description: 'Quick and easy personal loans from R1,000 to R350,000. Apply now and get approved within minutes.',
      icon: '💰',
      buttonText: 'Apply for Loan',
      buttonClass: 'btn-primary',
      features: [
        'Instant approval process',
        'Competitive interest rates',
        'Flexible repayment terms',
        'No hidden fees',
        'Same-day disbursement'
      ],
      loanRange: 'R1,000 - R350,000',
      interestRate: 'From 12.5% p.a.',
      maxTerm: 'Up to 72 months'
    },
    {
      id: 'credit-cards',
      title: 'Credit Cards',
      subtitle: 'Coming Soon - Express Interest',
      description: 'Premium credit cards with exclusive benefits. Leave your details and we\'ll call you back with the best offers.',
      icon: '💳',
      buttonText: 'Get Call Back',
      buttonClass: 'btn-secondary',
      features: [
        'Exclusive rewards program',
        'Worldwide acceptance',
        'Fraud protection',
        'Online banking',
        'Contactless payments'
      ],
      creditLimit: 'Up to R500,000',
      annualFee: 'From R0',
      rewards: 'Up to 3% cashback'
    },
    {
      id: 'insurance',
      title: 'Life Insurance',
      subtitle: 'Coming Soon - Express Interest',
      description: 'Comprehensive life insurance to protect your family\'s future. Get a personalized quote and consultation.',
      icon: '🛡️',
      buttonText: 'Get Quote',
      buttonClass: 'btn-success',
      features: [
        'Comprehensive life cover',
        'Disability benefits',
        'Critical illness cover',
        'Family protection',
        'Affordable premiums'
      ],
      coverage: 'Up to R10 million',
      premiums: 'From R150/month',
      benefits: 'Multiple cover options'
    }
  ];

  const handleProductSelect = (productId) => {
    setSelectedProduct(productId);
  };

  const handleBackToShop = () => {
    setSelectedProduct(null);
  };

  // Render specific product flows
  if (selectedProduct === 'loans') {
    return <LoanApplication onBack={handleBackToShop} />;
  }

  if (selectedProduct === 'credit-cards') {
    return <CreditCardLeads onBack={handleBackToShop} />;
  }

  if (selectedProduct === 'insurance') {
    return <InsuranceLeads onBack={handleBackToShop} />;
  }

  // Main shop front
  return (
    <div className="app-container">
      {/* DirectAxis Shop Header */}
      <div className="shop-header">
        <div className="shop-logo-container">
          <div className="shop-logo-icon">🏪</div>
          <div className="shop-brand-text">
            <h1>DirectAxis Shop</h1>
            <span className="shop-tagline">Your Financial Solutions Store</span>
          </div>
        </div>
        <p>Discover our complete range of financial products designed to meet your needs</p>
      </div>

      {/* Product Grid */}
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card" data-product={product.id}>
            <div className="product-header">
              <div className="product-icon">{product.icon}</div>
              <div className="product-title-section">
                <h2>{product.title}</h2>
                <p className="product-subtitle">{product.subtitle}</p>
              </div>
            </div>

            <div className="product-content">
              <p className="product-description">{product.description}</p>

              <div className="product-highlights">
                {product.id === 'loans' && (
                  <>
                    <div className="highlight-item">
                      <span className="highlight-label">Loan Amount</span>
                      <span className="highlight-value">{product.loanRange}</span>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-label">Interest Rate</span>
                      <span className="highlight-value">{product.interestRate}</span>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-label">Repayment Term</span>
                      <span className="highlight-value">{product.maxTerm}</span>
                    </div>
                  </>
                )}

                {product.id === 'credit-cards' && (
                  <>
                    <div className="highlight-item">
                      <span className="highlight-label">Credit Limit</span>
                      <span className="highlight-value">{product.creditLimit}</span>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-label">Annual Fee</span>
                      <span className="highlight-value">{product.annualFee}</span>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-label">Rewards</span>
                      <span className="highlight-value">{product.rewards}</span>
                    </div>
                  </>
                )}

                {product.id === 'insurance' && (
                  <>
                    <div className="highlight-item">
                      <span className="highlight-label">Coverage</span>
                      <span className="highlight-value">{product.coverage}</span>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-label">Premiums</span>
                      <span className="highlight-value">{product.premiums}</span>
                    </div>
                    <div className="highlight-item">
                      <span className="highlight-label">Benefits</span>
                      <span className="highlight-value">{product.benefits}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="product-features">
                <h4>Key Features</h4>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>
                      <span className="feature-check">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="product-actions">
              <button
                className={`btn ${product.buttonClass} product-btn`}
                onClick={() => handleProductSelect(product.id)}
              >
                {product.buttonText}
                <span className="btn-arrow">→</span>
              </button>
              
              {product.id !== 'loans' && (
                <p className="call-back-note">
                  Our specialist will contact you within 24 hours
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Shop Footer */}
      <div className="shop-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Why Choose DirectAxis?</h4>
            <ul>
              <li>✓ Trusted by over 1 million customers</li>
              <li>✓ NCR registered and compliant</li>
              <li>✓ Award-winning customer service</li>
              <li>✓ Transparent pricing, no hidden fees</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Need Help?</h4>
            <p>📞 Call us: 0860 555 777</p>
            <p>📧 Email: info@directaxis.co.za</p>
            <p>🕒 Mon-Fri: 8AM-6PM, Sat: 8AM-1PM</p>
          </div>
        </div>
        
        <div className="footer-legal">
          <p>DirectAxis is an authorised financial services provider (FSP 36019) and registered credit provider (NCRCP 6023). 
             Terms and conditions apply. Interest rates quoted are subject to change without notice.</p>
        </div>
      </div>
    </div>
  );
};

export default ShopFront;
