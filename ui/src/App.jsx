import React, { useState, useEffect } from 'react';
import './styles.css';
import PersonalInfoForm from './components/PersonalInfoForm';
import AddressForm from './components/AddressForm';
import EmploymentForm from './components/EmploymentForm';
import FinancialForm from './components/FinancialForm';
import LoanPreferencesForm from './components/LoanPreferencesForm';
import StatusTimeline from './components/StatusTimeline';
import LoanOfferCard from './components/LoanOfferCard';
import EligibilityResults from './components/EligibilityResults';

// Base URL for the BFF API
const API_BASE = 'http://localhost:5001/api';

export default function App() {
  const [applicationId, setApplicationId] = useState('');
  const [currentStage, setCurrentStage] = useState('application');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [offer, setOffer] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [formData, setFormData] = useState({
    applicantId: '',
    requestedAmount: 25000,
    applicantProfile: {
      fullName: '',
      dateOfBirth: '',
      ssn: '',
      email: '',
      primaryPhone: '',
      primaryAddress: {
        streetAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'USA',
        addressType: 'Residential'
      },
      employment: {
        employmentStatus: '',
        employerName: '',
        annualIncome: 0,
        yearsOfEmployment: 0,
        jobTitle: ''
      },
      finances: {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        existingDebt: 0,
        numberOfDependents: 0,
        hasBankAccount: false,
        bankName: ''
      }
    },
    loanPreferences: {
      loanPurpose: '',
      preferredTermMonths: 24,
      maxMonthlyPayment: null,
      productType: 'Personal Loan',
      autoPayEnrollment: false
    }
  });

  // Establish an SSE connection once an application id is assigned
  useEffect(() => {
    if (!applicationId) return;
    
    const source = new EventSource(`${API_BASE}/loan-applications/${applicationId}/events`);
    
    source.onmessage = (event) => {
      try {
        const evt = JSON.parse(event.data);
        console.log('Received event:', evt);
        
        // Update UI based on the stage of the workflow
        if (evt.stage === 'EligibilityAssessed') {
          setCurrentStage('eligibility');
          setEligibilityData(evt.data);
          setStatusMessage('Eligibility assessment completed. Preparing your offer...');
        } else if (evt.stage === 'OfferPrepared') {
          setCurrentStage('offer');
          setOffer(evt.data);
          setStatusMessage('Great news! Your loan offer is ready for review.');
        } else if (evt.stage === 'DocumentsVerified') {
          setCurrentStage('documents');
          setStatusMessage('Documents verified successfully. You can now accept your offer.');
        } else if (evt.stage === 'OfferAccepted') {
          setCurrentStage('approval');
          setStatusMessage('Congratulations! Your offer has been accepted. Creating your loan account...');
        } else if (evt.stage === 'AccountCreated') {
          setCurrentStage('account');
          setStatusMessage('Loan account created successfully. Preparing fund disbursement...');
        } else if (evt.stage === 'LoanDisbursed') {
          setCurrentStage('disbursement');
          const account = evt.data;
          const acctId = account.loanAccountId || account.LoanAccountId;
          setStatusMessage(`🎉 Success! Your loan has been disbursed. Account ID: ${acctId}`);
        }
      } catch (err) {
        console.error('Error parsing SSE event', err);
      }
    };
    
    source.onerror = (err) => {
      console.error('SSE error', err);
      source.close();
    };
    
    return () => source.close();
  }, [applicationId]);

  // Validate form data
  const isFormValid = () => {
    const profile = formData.applicantProfile;
    return (
      profile?.fullName &&
      profile?.dateOfBirth &&
      profile?.ssn &&
      profile?.email &&
      profile?.primaryPhone &&
      profile?.primaryAddress?.streetAddress &&
      profile?.primaryAddress?.city &&
      profile?.primaryAddress?.state &&
      profile?.primaryAddress?.postalCode &&
      profile?.employment?.employmentStatus &&
      profile?.employment?.employerName &&
      profile?.employment?.annualIncome > 0 &&
      profile?.employment?.jobTitle &&
      profile?.finances?.monthlyIncome > 0 &&
      formData.requestedAmount > 0 &&
      formData.loanPreferences?.loanPurpose &&
      formData.loanPreferences?.preferredTermMonths > 0
    );
  };

  // Start a new loan application
  const startApplication = async () => {
    setLoading(true);
    setStatusMessage('Submitting your application...');
    
    try {
      // Generate applicant ID from SSN
      const applicantId = formData.applicantProfile.ssn.replace(/\D/g, '');
      
      const requestPayload = {
        ...formData,
        applicantId: applicantId
      };

      console.log('Submitting application:', requestPayload);

      const res = await fetch(`${API_BASE}/loan-applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload)
      });
      
      if (!res.ok) {
        throw new Error(`Failed to start application: ${res.status}`);
      }
      
      const json = await res.json();
      setApplicationId(json.applicationId);
      setCurrentStage('eligibility');
      setStatusMessage('Application submitted successfully! Assessing your eligibility...');
    } catch (err) {
      console.error(err);
      setStatusMessage('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Signal that documents have been verified
  const verifyDocuments = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/loan-applications/${applicationId}/verify-documents`, { 
        method: 'POST' 
      });
      setStatusMessage('Document verification initiated...');
    } catch (err) {
      console.error(err);
      setStatusMessage('Error verifying documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Signal that the applicant has accepted the offer
  const acceptOffer = async () => {
    setLoading(true);
    try {
      await fetch(`${API_BASE}/loan-applications/${applicationId}/accept-offer`, { 
        method: 'POST' 
      });
      setStatusMessage('Offer acceptance confirmed. Processing your loan...');
    } catch (err) {
      console.error(err);
      setStatusMessage('Error accepting offer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>🏦 BIAN Loan Application</h1>
        <p>Secure, compliant, and comprehensive loan processing</p>
      </div>

      {!applicationId ? (
        <div className="main-card">
          <div className="card-header">
            <h2>Personal Loan Application</h2>
            <p>Complete your application following banking industry standards</p>
          </div>
          
          <div className="card-content">
            <PersonalInfoForm formData={formData} setFormData={setFormData} />
            <AddressForm formData={formData} setFormData={setFormData} />
            <EmploymentForm formData={formData} setFormData={setFormData} />
            <FinancialForm formData={formData} setFormData={setFormData} />
            <LoanPreferencesForm formData={formData} setFormData={setFormData} />
            
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                className="btn btn-primary"
                onClick={startApplication}
                disabled={!isFormValid() || loading}
                style={{ fontSize: '1.1rem', padding: '1rem 3rem' }}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Processing Application...
                  </>
                ) : (
                  <>
                    🚀 Submit Loan Application
                  </>
                )}
              </button>
              
              {!isFormValid() && (
                <p style={{ marginTop: '1rem', color: 'var(--error-color)', fontSize: '0.875rem' }}>
                  Please complete all required fields marked with *
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <div className="main-card">
            <div className="card-header">
              <h2>Application Status</h2>
              <p><strong>Applicant:</strong> {formData.applicantProfile?.fullName}</p>
              <p><strong>Requested Amount:</strong> {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(formData.requestedAmount)}</p>
            </div>
            
            <div className="card-content">
              {statusMessage && (
                <div style={{ 
                  padding: '1rem', 
                  background: 'var(--secondary-color)', 
                  borderRadius: 'var(--radius)',
                  marginBottom: '2rem',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  {statusMessage}
                </div>
              )}
              
              <StatusTimeline currentStage={currentStage} applicationId={applicationId} />
              
              {eligibilityData && (
                <EligibilityResults eligibilityData={eligibilityData} />
              )}
              
              {offer && (
                <LoanOfferCard 
                  offer={offer} 
                  onVerifyDocuments={verifyDocuments}
                  onAcceptOffer={acceptOffer}
                  loading={loading}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
