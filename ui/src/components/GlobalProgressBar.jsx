import React from 'react';

const GlobalProgressBar = ({ currentStage, applicationId }) => {
  // Detailed stages matching the original StatusTimeline - 8 stages for full detail
  const stages = [
    { 
      key: 'application', 
      label: 'Application Submitted', 
      description: 'Personal & Financial Info',
      icon: '📝' 
    },
    { 
      key: 'eligibility', 
      label: 'Eligibility Assessment', 
      description: 'Credit & Income Review',
      icon: '🔍' 
    },
    { 
      key: 'offer', 
      label: 'Offer Prepared', 
      description: 'Loan Terms & Conditions',
      icon: '💰' 
    },
    { 
      key: 'documents', 
      label: 'Document Verification', 
      description: 'Identity & Income Verification',
      icon: '📄' 
    },
    { 
      key: 'approval', 
      label: 'Offer Accepted', 
      description: 'Final Loan Approval',
      icon: '✅' 
    },
    { 
      key: 'agreement', 
      label: 'Loan Agreement', 
      description: 'Document Review & Signing',
      icon: '📋' 
    },
    { 
      key: 'bank-details', 
      label: 'Bank Details', 
      description: 'Account Information',
      icon: '🏦' 
    },
    { 
      key: 'disbursement', 
      label: 'Funds Disbursed', 
      description: 'Loan Disbursed',
      icon: '💸' 
    }
  ];

  const getStepStatus = (stepKey) => {
    const stageOrder = ['application', 'eligibility', 'offer', 'documents', 'approval', 'agreement', 'bank-details', 'disbursement'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stepIndex = stageOrder.indexOf(stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Completed';
      case 'active': return 'In Progress...';
      case 'pending': return 'Pending';
      default: return 'Pending';
    }
  };

  const getProgressPercentage = () => {
    const stageOrder = ['application', 'eligibility', 'offer', 'documents', 'approval', 'agreement', 'bank-details', 'disbursement'];
    const currentIndex = stageOrder.indexOf(currentStage);
    return ((currentIndex + 1) / stageOrder.length) * 100;
  };

  return (
    <div className="global-progress-container">
      <div className="progress-header">
        <h3 className="progress-title">Loan Application Progress</h3>
        <div className="progress-percentage">
          {Math.round(getProgressPercentage())}% Complete
        </div>
        {applicationId && (
          <div className="application-id">
            <strong>Application ID:</strong> {applicationId}
          </div>
        )}
      </div>
      
      <div className="progress-track">
        <div 
          className="progress-fill" 
          style={{ width: `${getProgressPercentage()}%` }}
        ></div>
      </div>
      
      <div className="progress-steps">
        {stages.map((stage, index) => {
          const status = getStepStatus(stage.key);
          return (
            <div key={stage.key} className={`progress-step-item ${status}`}>
              <div className="step-connector">
                {index < stages.length - 1 && (
                  <div className={`connector-line ${status === 'completed' ? 'completed' : ''}`}></div>
                )}
              </div>
              
              <div className="step-circle">
                <span className="step-icon">{stage.icon}</span>
                {status === 'completed' && (
                  <div className="completion-check">✓</div>
                )}
                {status === 'active' && (
                  <div className="active-indicator">⏳</div>
                )}
              </div>
              
              <div className="step-content">
                <div className="step-label">{stage.label}</div>
                <div className="step-description">{stage.description}</div>
                <div className="step-status">{getStatusText(status)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalProgressBar;
