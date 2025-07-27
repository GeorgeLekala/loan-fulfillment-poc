import React from 'react';

const StatusTimeline = ({ currentStage, applicationId }) => {
  const stages = [
    { id: 'application', name: 'Application Submitted', icon: '📝' },
    { id: 'eligibility', name: 'Eligibility Assessment', icon: '🔍' },
    { id: 'offer', name: 'Offer Prepared', icon: '💰' },
    { id: 'documents', name: 'Document Verification', icon: '📄' },
    { id: 'approval', name: 'Offer Accepted', icon: '✅' },
    { id: 'account', name: 'Account Created', icon: '🏦' },
    { id: 'bank-details', name: 'Bank Details', icon: '�' },
    { id: 'disbursement', name: 'Funds Disbursed', icon: '💸' }
  ];

  const getStageStatus = (stageId) => {
    const stageOrder = ['application', 'eligibility', 'offer', 'documents', 'approval', 'account', 'bank-details', 'disbursement'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stageIndex = stageOrder.indexOf(stageId);
    
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="status-card fade-in">
      <h3>Application Progress</h3>
      {applicationId && (
        <p><strong>Application ID:</strong> {applicationId}</p>
      )}
      
      <div className="status-timeline">
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);
          return (
            <div key={stage.id} className={`timeline-item ${status}`}>
              <div className={`timeline-icon ${status}`}>
                {status === 'completed' ? '✓' : status === 'current' ? '⏳' : '⏸'}
              </div>
              <div>
                <div style={{ fontWeight: '600' }}>{stage.name}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {status === 'completed' && 'Completed'}
                  {status === 'current' && 'In Progress...'}
                  {status === 'pending' && 'Pending'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusTimeline;
