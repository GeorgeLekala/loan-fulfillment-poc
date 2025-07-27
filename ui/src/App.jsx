import React, { useState, useEffect } from 'react';
import './styles.css';
import PersonalInfoForm from './components/PersonalInfoForm';
import EmploymentForm from './components/EmploymentForm';
import FinancialForm from './components/FinancialForm';
import LoanPreferencesForm from './components/LoanPreferencesForm';
import StatusTimeline from './components/StatusTimeline';
import LoanOfferCard from './components/LoanOfferCard';
import EligibilityResults from './components/EligibilityResults';
import AgreementView from './components/AgreementView';
import DisbursementView from './components/DisbursementView';
import BankDetailsForm from './components/BankDetailsForm';
import GlobalProgressBar from './components/GlobalProgressBar';

// Base URL for the BFF API
const API_BASE = 'http://localhost:5001/api';

export default function App() {
  const [applicationId, setApplicationId] = useState('');
  const [currentStage, setCurrentStage] = useState('application');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [offer, setOffer] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [account, setAccount] = useState(null);
  const [payment, setPayment] = useState(null);

  // Map workflow stages to progress bar stages
  const getProgressStage = (workflowStage) => {
    const stageMapping = {
      'application': 'application',
      'eligibility': 'processing',
      'offer': 'processing', 
      'documents': 'processing',
      'approval': 'processing',
      'agreement': 'agreement',
      'bank-details': 'bank-details',
      'account': 'disbursement',
      'disbursement': 'disbursement'
    };
    return stageMapping[workflowStage] || 'application';
  };
  const [formData, setFormData] = useState({
    applicantId: '',
    requestedAmount: 25000,
    applicantProfile: {
      // NCR Minimum Required Fields for South Africa
      fullName: 'John Doe',                 // Will be updated by user
      dateOfBirth: '1990-01-01',            // Default date  
      ssn: '',                              // SA ID Number (mandatory)
      email: 'customer@email.com',          // Contact information
      primaryPhone: '',                     // Mobile Number (mandatory)
      primaryAddress: {
        streetAddress: 'Not provided',       // Default for processing
        city: 'Johannesburg',               // Default SA city
        state: 'Gauteng',                   // Default SA province
        postalCode: '2000',                 // Default postal code
        country: 'ZAF',
        addressType: 'Residential'
      },
      employment: {
        employmentStatus: '',               // Employment Status (mandatory)
        employerName: 'Not specified',      // Optional - can be defaulted
        annualIncome: 0,                   // Will be calculated from monthly
        yearsOfEmployment: 2,              // Optional - can be defaulted
        jobTitle: 'Not specified'          // Optional - can be defaulted
      },
      finances: {
        monthlyIncome: 0,                  // Monthly Income (mandatory for affordability)
        monthlyExpenses: 0,                // Monthly Expenses (mandatory for affordability)
        existingDebt: 0,                   // Optional - can be defaulted
        numberOfDependents: 0,             // Optional - can be defaulted
        hasBankAccount: true,              // Required for disbursement
        bankName: 'Standard Bank'          // Default SA bank
      }
    },
    loanPreferences: {
      loanPurpose: '',                     // Loan Purpose (mandatory)
      preferredTermMonths: 24,             // Can be defaulted
      maxMonthlyPayment: null,             // Optional
      productType: 'Personal Loan',       // Defaulted
      autoPayEnrollment: false             // Optional
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
          setStatusMessage('Congratulations! Your offer has been accepted. Creating your loan agreement...');
        } else if (evt.stage === 'AgreementCreated') {
          setCurrentStage('agreement');
          setAgreement(evt.data);
          setStatusMessage('Loan agreement prepared. Please review and accept the terms.');
        } else if (evt.stage === 'AccountCreated') {
          setCurrentStage('bank-details');
          setAccount(evt.data);
          setStatusMessage('Account created successfully. Please provide your bank details for loan disbursement.');
        } else if (evt.stage === 'LoanDisbursed') {
          setCurrentStage('disbursement');
          
          // Debug logging
          console.log('LoanDisbursed event data:', evt.data);
          console.log('Current offer state:', offer);
          console.log('Offer amount:', offer?.Amount);
          console.log('Offer pricing:', offer?.Pricing);
          
          // Create comprehensive account object by combining offer data with disbursement data
          const comprehensiveAccount = {
            // Basic account info from disbursement event
            LoanAccountId: evt.data.LoanAccountId || evt.data.loanAccountId,
            AgreementId: evt.data.AgreementId || evt.data.agreementId,
            CustomerReference: `CUST-${Math.floor(Math.random() * 900000) + 100000}`,
            CreatedAt: evt.data.CreatedAt || evt.data.createdAt,
            
            // Rich loan details from the offer data
            Details: {
              ProductType: 'Personal Loan',
              OriginalPrincipal: offer?.Amount || 0,
              CurrentBalance: offer?.Amount || 0,
              InterestRate: offer?.Pricing?.InterestRate || 0,
              OriginalTermMonths: offer?.Terms?.TermMonths || 0,
              RemainingTermMonths: offer?.Terms?.TermMonths || 0,
              FirstPaymentDate: offer?.Terms?.FirstPaymentDate || null,
              MaturityDate: offer?.Terms?.FirstPaymentDate ? 
                new Date(new Date(offer.Terms.FirstPaymentDate).getTime() + (offer.Terms.TermMonths * 30.44 * 24 * 60 * 60 * 1000)).toISOString() : 
                null,
              InterestCalculationMethod: 'Daily Simple Interest'
            },
            
            // Payment schedule from offer data
            Schedule: {
              MonthlyPayment: offer?.Terms?.MonthlyPayment || 0,
              PrincipalPortion: offer?.Terms?.MonthlyPayment ? (offer.Terms.MonthlyPayment * 0.85) : 0,
              InterestPortion: offer?.Terms?.MonthlyPayment ? (offer.Terms.MonthlyPayment * 0.15) : 0,
              PaymentDay: offer?.Terms?.FirstPaymentDate ? new Date(offer.Terms.FirstPaymentDate).getDate() : 1,
              PaymentFrequency: 'Monthly',
              UpcomingPayments: []
            },
            
            // Account configuration defaults
            Configuration: {
              AutoPayEnabled: false,
              AutoPayAccount: null,
              StatementDelivery: 'Electronic',
              StatementDay: 1,
              PaperlessEnrolled: true,
              Notifications: {
                PaymentReminders: true,
                PaymentConfirmations: true,
                StatementAvailable: true,
                RateChanges: true,
                PreferredChannel: 'Email'
              }
            },
            
            // Service levels based on offer data
            ServiceLevels: {
              CustomerSegment: offer?.Pricing?.InterestRate <= 0.06 ? 'Prime' : 
                              offer?.Pricing?.InterestRate <= 0.10 ? 'Standard' : 'Subprime',
              RelationshipManager: 'Digital Service Team',
              SupportLevel: 'Standard',
              AvailableServices: [
                'Online Account Management',
                'Mobile App Access', 
                '24/7 Customer Support',
                'Payment Deferrals',
                'Statement Download'
              ]
            },
            
            // Account status
            Status: {
              CurrentStatus: 'Active',
              StatusDate: new Date().toISOString(),
              StatusReason: 'Account opened and funded',
              GoodStanding: true,
              History: [
                {
                  Status: 'Active',
                  EffectiveDate: new Date().toISOString(),
                  Reason: 'Account activated and funded',
                  UpdatedBy: 'Loan Operations'
                }
              ]
            }
          };
          
          // Create comprehensive payment object
          const comprehensivePayment = {
            PaymentId: `PAY-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            Amount: offer?.Amount || 0,
            Status: 'Completed',
            ProcessingDate: new Date().toISOString(),
            Method: 'Electronic Transfer'
          };
          
          setAccount(comprehensiveAccount);
          setPayment(comprehensivePayment);
          
          const acctId = evt.data.loanAccountId || evt.data.LoanAccountId;
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

  // Validate form data - streamlined for SA banking (only essential fields)
  const isFormValid = () => {
    const profile = formData.applicantProfile;
    const validation = {
      ssn: profile?.ssn,                                    // SA ID Number
      primaryPhone: profile?.primaryPhone,                  // Mobile Number
      employmentStatus: profile?.employment?.employmentStatus, // Employment Status
      monthlyIncome: profile?.finances?.monthlyIncome > 0,     // Monthly Income
      monthlyExpenses: profile?.finances?.monthlyExpenses > 0, // Monthly Expenses
      requestedAmount: formData.requestedAmount > 0,           // Loan Amount
      loanPurpose: formData.loanPreferences?.loanPurpose       // Loan Purpose
    };
    
    console.log('Form validation:', validation);
    console.log('Form data:', formData);
    
    return (
      validation.ssn &&
      validation.primaryPhone &&
      validation.employmentStatus &&
      validation.monthlyIncome &&
      validation.monthlyExpenses &&
      validation.requestedAmount &&
      validation.loanPurpose
    );
  };

  // Start a new loan application
  const startApplication = async () => {
    setLoading(true);
    setStatusMessage('Submitting your application...');
    
    try {
      // Create BIAN-compliant LoanApplicationRequest payload
      const requestPayload = {
        "ApplicantId": `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        "RequestedAmount": parseFloat(formData.requestedAmount) || 0,
        "ApplicantProfile": {
          "FullName": formData.applicantProfile?.fullName || "John Doe",
          "DateOfBirth": formData.applicantProfile?.dateOfBirth && formData.applicantProfile.dateOfBirth !== "Auto-filled from ID" 
            ? formData.applicantProfile.dateOfBirth 
            : "1990-01-01",
          "SSN": formData.applicantProfile?.ssn || "",
          "Email": formData.applicantProfile?.email || "customer@email.com",
          "PrimaryPhone": formData.applicantProfile?.primaryPhone || "",
          "PrimaryAddress": {
            "StreetAddress": formData.applicantProfile?.primaryAddress?.streetAddress || "Not provided",
            "City": formData.applicantProfile?.primaryAddress?.city || "Johannesburg",
            "State": formData.applicantProfile?.primaryAddress?.state || "Gauteng",
            "PostalCode": formData.applicantProfile?.primaryAddress?.postalCode || "2000",
            "Country": formData.applicantProfile?.primaryAddress?.country || "ZAF",
            "AddressType": formData.applicantProfile?.primaryAddress?.addressType || "Residential"
          },
          "Employment": {
            "EmploymentStatus": formData.applicantProfile?.employment?.employmentStatus || "",
            "EmployerName": formData.applicantProfile?.employment?.employerName || "Not specified",
            "AnnualIncome": (parseFloat(formData.applicantProfile?.finances?.monthlyIncome) || 0) * 12,
            "YearsOfEmployment": formData.applicantProfile?.employment?.yearsOfEmployment || 2,
            "JobTitle": formData.applicantProfile?.employment?.jobTitle || "Not specified"
          },
          "Finances": {
            "MonthlyIncome": parseFloat(formData.applicantProfile?.finances?.monthlyIncome) || 0,
            "MonthlyExpenses": parseFloat(formData.applicantProfile?.finances?.monthlyExpenses) || 0,
            "ExistingDebt": parseFloat(formData.applicantProfile?.finances?.existingDebt) || 0,
            "NumberOfDependents": parseInt(formData.applicantProfile?.finances?.numberOfDependents) || 0,
            "HasBankAccount": formData.applicantProfile?.finances?.hasBankAccount !== false,
            "BankName": formData.applicantProfile?.finances?.bankName || "Standard Bank"
          }
        },
        "LoanPreferences": {
          "LoanPurpose": formData.loanPreferences?.loanPurpose || "Personal Loan",
          "PreferredTermMonths": parseInt(formData.loanPreferences?.preferredTermMonths) || 24,
          "MaxMonthlyPayment": formData.loanPreferences?.maxMonthlyPayment ? parseFloat(formData.loanPreferences.maxMonthlyPayment) : null,
          "ProductType": formData.loanPreferences?.productType || "Personal Loan",
          "AutoPayEnrollment": formData.loanPreferences?.autoPayEnrollment || false
        }
      };

      console.log('Submitting BIAN-compliant application:', requestPayload);
      console.log('JSON payload:', JSON.stringify(requestPayload, null, 2));

      // Log the raw JSON that will be sent to BFF
      console.log('[UI] About to send to BFF:', JSON.stringify(requestPayload, null, 2));

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

  // Signal that the applicant has accepted the agreement
  const acceptAgreement = async () => {
    setLoading(true);
    try {
      // For now, we'll directly proceed to account creation
      // In a real system, this would send a specific agreement acceptance signal
      setCurrentStage('account');
      setStatusMessage('Agreement accepted. Creating your loan account...');
    } catch (err) {
      console.error(err);
      setStatusMessage('Error accepting agreement. Please try again.');
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

  // Handle completion of bank details and trigger final disbursement
  const handleBankDetailsComplete = async () => {
    setLoading(true);
    try {
      setStatusMessage('Processing loan disbursement...');
      
      // Trigger the disbursement workflow step
      const response = await fetch(`${API_BASE}/loan-applications/${applicationId}/disburse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        // The SSE will handle the stage update when disbursement completes
        setStatusMessage('Disbursement initiated. Please wait...');
      } else {
        throw new Error('Failed to initiate disbursement');
      }
    } catch (error) {
      console.error('Error initiating disbursement:', error);
      setStatusMessage('Error processing disbursement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>🏦 SA Banking Loan Application</h1>
        <p>Secure, NCR-compliant, and comprehensive loan processing</p>
      </div>

      {/* Global Progress Bar - Always Visible */}
      {applicationId && (
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <GlobalProgressBar currentStage={getProgressStage(currentStage)} />
        </div>
      )}

      {!applicationId ? (
        <div className="main-card">
          <div className="card-header">
            <h2>Personal Loan Application</h2>
            <p>Complete your application in compliance with National Credit Act standards</p>
          </div>
          
          <div className="card-content">
            <PersonalInfoForm formData={formData} setFormData={setFormData} />
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
      ) : currentStage === 'bank-details' ? (
        // Render BankDetailsForm for collecting bank account information
        <div style={{ width: '100%', maxWidth: '800px' }}>
          <BankDetailsForm
            applicationId={applicationId}
            onComplete={handleBankDetailsComplete}
          />
        </div>
      ) : currentStage === 'disbursement' || (account && currentStage === 'account') ? (
        // Render DisbursementView independently for a clean, celebratory layout
        <div style={{ width: '100%', maxWidth: '1000px' }}>
          <DisbursementView 
            account={account}
            payment={payment}
            applicationId={applicationId}
          />
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

              {agreement && currentStage === 'agreement' && (
                <AgreementView 
                  agreement={agreement}
                  onProceed={acceptAgreement}
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
