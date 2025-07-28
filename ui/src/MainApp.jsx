import React, { useState } from 'react';
import './styles.css';
import './shop-front-styles.css';
import ShopFront from './ShopFront';
import CreditCardLeads from './CreditCardLeads';
import InsuranceLeads from './InsuranceLeads';
import App from './App'; // Import the existing loan application

function MainApp() {
  const [currentView, setCurrentView] = useState('shop'); // 'shop', 'loans', 'credit-cards', 'insurance'

  // Navigation functions
  const handleProductSelect = (product) => {
    setCurrentView(product);
  };

  const handleBackToShop = () => {
    setCurrentView('shop');
  };

  // Render different views based on currentView
  if (currentView === 'shop') {
    return <ShopFront onProductSelect={handleProductSelect} />;
  }

  if (currentView === 'credit-cards') {
    return <CreditCardLeads onBack={handleBackToShop} />;
  }

  if (currentView === 'insurance') {
    return <InsuranceLeads onBack={handleBackToShop} />;
  }

  if (currentView === 'loans') {
    // Render the existing loan application with a back button
    return (
      <div style={{ position: 'relative' }}>
        <button 
          className="back-button" 
          onClick={handleBackToShop}
          style={{
            position: 'fixed',
            top: '1rem',
            left: '1rem',
            background: 'rgba(0, 82, 144, 0.9)',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
        >
          ← Back to Shop
        </button>
        <App />
      </div>
    );
  }

  return null;
}

export default MainApp;
