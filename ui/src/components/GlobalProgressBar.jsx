import React from 'react';

const GlobalProgressBar = ({ currentStage }) => {
  const stages = [
    {
      key: 'application',
      label: 'Application',
      description: 'Personal & Financial Info',
      icon: '📝'
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'Eligibility & Offer Review',
      icon: '⚙️'
    },
    {
      key: 'agreement',
      label: 'Agreement',
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
      label: 'Complete',
      description: 'Loan Disbursed',
      icon: '✅'
    }
  ];

  const getStepStatus = (stepKey) => {
    const currentIndex = stages.findIndex(stage => stage.key === currentStage);
    const stepIndex = stages.findIndex(stage => stage.key === stepKey);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getProgressPercentage = () => {
    const currentIndex = stages.findIndex(stage => stage.key === currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  return (
    <div className="global-progress-container">
      <div className="progress-header">
        <h3 className="progress-title">Loan Application Progress</h3>
        <div className="progress-percentage">
          {Math.round(getProgressPercentage())}% Complete
        </div>
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
              </div>
              
              <div className="step-content">
                <div className="step-label">{stage.label}</div>
                <div className="step-description">{stage.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalProgressBar;
