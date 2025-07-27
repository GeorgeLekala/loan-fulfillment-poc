# Loan Fulfillment System - Comprehensive API Documentation

This document provides detailed Swagger/OpenAPI documentation for all microservices with comprehensive examples and usage patterns.

## Service Architecture

The system consists of 7 microservices, each with detailed Swagger documentation and interactive examples:

### 1. **BFF (Backend-for-Frontend)** - Port 5001
**Swagger URL:** `http://localhost:5001/swagger`

Main interface for the React UI, handling loan applications and real-time events.

#### Key Endpoints:
- `POST /api/loan-applications` - Create new loan application
- `POST /api/loan-applications/{id}/verify-documents` - Signal document verification
- `POST /api/loan-applications/{id}/accept-offer` - Accept loan offer
- `GET /api/loan-applications/{id}/events` - Real-time SSE events

#### Example Request (Create Application):
```json
{
  "FullName": "John Smith",
  "IdNumber": "8501015009087",
  "EmailAddress": "john.smith@email.com",
  "MobileNumber": "+27821234567",
  "MonthlyIncome": 15000,
  "EmploymentType": "Permanent",
  "RequestedAmount": 50000,
  "MaxMonthlyPayment": 2500
}
```

#### Example Response:
```json
{
  "applicationId": "12345678-1234-1234-1234-123456789012"
}
```

---

### 2. **Orchestrator Service** - Port 5002
**Swagger URL:** `http://localhost:5002/swagger`

Manages Temporal workflows for loan processing orchestration.

#### Key Endpoints:
- `POST /api/loan-applications` - Start loan workflow
- `POST /api/loan-applications/{id}/verify-documents` - Document verification signal
- `POST /api/loan-applications/{id}/accept-offer` - Offer acceptance signal

#### Workflow Process:
1. **Eligibility Assessment** → 2. **Offer Generation** → 3. **Document Verification** → 4. **Agreement Creation** → 5. **Account Creation** → 6. **Fund Disbursement**

---

### 3. **Eligibility Service** - Port 5003
**Swagger URL:** `http://localhost:5003/swagger`

Assesses loan eligibility based on credit criteria and applicant information.

#### Key Endpoint:
- `POST /eligibility-assessments` - Assess loan eligibility

#### Example Request:
```json
{
  "ApplicantId": "CUST-123456",
  "RequestedAmount": 50000,
  "ApplicantProfile": {
    "CustomerReference": "CUST-123456",
    "FullName": "John Smith",
    "DateOfBirth": "1985-01-15",
    "EmploymentStatus": "Employed",
    "AnnualIncome": 180000,
    "EmployerName": "Tech Solutions Ltd",
    "YearsOfEmployment": 3,
    "ContactInfo": {
      "Email": "john.smith@email.com",
      "PrimaryPhone": "+27821234567"
    },
    "Address": {
      "StreetAddress": "123 Main Street",
      "City": "Johannesburg",
      "State": "Gauteng",
      "PostalCode": "2000",
      "Country": "ZAR"
    },
    "Identification": {
      "SSN": "8501015009087"
    }
  }
}
```

#### Example Response:
```json
{
  "ApplicantId": "CUST-123456",
  "EligibilityReference": "ELG-20250127-ABC12345",
  "Eligible": true,
  "MaxAmount": 60000.00,
  "Assessment": {
    "CreditScore": 745,
    "CreditGrade": "Good",
    "DebtToIncomeRatio": 0.32,
    "LoanToValueRatio": 0.8,
    "CriteriaMet": [
      {
        "CriteriaType": "MinimumIncome",
        "Met": true,
        "Description": "Annual income must be at least $30,000",
        "ThresholdValue": 30000,
        "ActualValue": 180000
      }
    ],
    "RiskFactors": [],
    "Compliance": {
      "KYCCompliant": true,
      "AMLCompliant": true,
      "RegulationCompliant": true,
      "ComplianceNotes": ["Customer verified through automated systems"]
    }
  },
  "AssessmentDate": "2025-01-27T10:00:00Z",
  "Status": "Completed"
}
```

---

### 4. **Customer Offer Service** - Port 5004
**Swagger URL:** `http://localhost:5004/swagger`

Generates personalized loan offers with terms and pricing.

#### Key Endpoints:
- `POST /customer-offers` - Create loan offer
- `GET /customer-offers/{id}` - Retrieve offer by ID

#### Example Request:
```json
{
  "ApplicantId": "CUST-123456",
  "Amount": 50000,
  "Preferences": {
    "PreferredTermMonths": 24,
    "RateType": "Fixed",
    "AutoPayEnrollment": true,
    "ProductType": "Personal Loan"
  },
  "EligibilityData": {
    "CreditScore": 745,
    "MaxAmount": 60000,
    "RiskGrade": "Good"
  }
}
```

#### Example Response:
```json
{
  "OfferId": "LO-20250127-ABC12345",
  "ApplicantId": "CUST-123456",
  "Amount": 50000,
  "Terms": {
    "TermMonths": 24,
    "MonthlyPayment": 2134.89,
    "FirstPaymentDate": "2025-03-15T00:00:00Z",
    "TotalOfPayments": 51237.36,
    "RepaymentFrequency": "Monthly"
  },
  "Pricing": {
    "InterestRate": 0.065,
    "APR": 0.070,
    "RateType": "Fixed",
    "Fees": [
      {
        "FeeType": "Origination",
        "Amount": 500.00,
        "Description": "One-time loan origination fee"
      }
    ],
    "PromotionalRate": 0.045,
    "PromotionalPeriodMonths": 6
  },
  "Conditions": {
    "RequiredDocuments": ["Proof of Income", "Bank Statements"],
    "Stipulations": ["Maintain employment during loan term"],
    "IncomeVerificationRequired": true,
    "CollateralRequired": false
  },
  "ExpirationDate": "2025-02-26T10:00:00Z"
}
```

---

### 5. **Sales Agreement Service** - Port 5005
**Swagger URL:** `http://localhost:5005/swagger`

Creates formal sales agreements with contractual terms and compliance documentation.

#### Key Endpoint:
- `POST /sales-product-agreements` - Create sales agreement

#### Example Request:
```json
{
  "OfferId": "LO-20250127-ABC12345",
  "Instructions": {
    "PreferredContactMethod": "Email",
    "DeliveryMethod": "Electronic",
    "SignatureMethod": "Electronic"
  },
  "Preferences": {
    "AutoPayEnrollment": true,
    "AutoPayAccount": "CHK-123456789",
    "StatementDeliveryMethod": "Electronic",
    "PaperlessOptIn": true
  }
}
```

#### Example Response:
```json
{
  "AgreementId": "SA-20250127-XYZ789",
  "OfferId": "LO-20250127-ABC12345",
  "CustomerReference": "CUST-654321",
  "Details": {
    "ProductType": "Personal Loan",
    "PrincipalAmount": 50000,
    "InterestRate": 0.065,
    "TermMonths": 24,
    "MonthlyPayment": 2134.89,
    "FirstPaymentDate": "2025-03-15T00:00:00Z",
    "MaturityDate": "2027-03-15T00:00:00Z",
    "LoanPurpose": "Debt Consolidation"
  },
  "Terms": {
    "Default": {
      "GracePeriodDays": 10,
      "LateFeePercentage": 0.05,
      "DefaultInterestRate": "Prime + 5%"
    },
    "Prepayment": {
      "PrepaymentAllowed": true,
      "PrepaymentPenalty": null,
      "PrepaymentConditions": "No penalty after 12 months"
    }
  },
  "Compliance": {
    "TruthInLendingDisclosure": "TIL disclosure per Regulation Z",
    "RightOfRescission": "3-day rescission period applicable",
    "DisclosureDeliveryDate": "2025-01-27T10:00:00Z",
    "CreditReportingAuthorization": true
  },
  "Status": {
    "CurrentStatus": "Executed",
    "StatusDate": "2025-01-27T10:00:00Z",
    "StatusReason": "Customer acceptance completed"
  }
}
```

---

### 6. **Consumer Loan Service** - Port 5006
**Swagger URL:** `http://localhost:5006/swagger`

Creates and manages loan accounts in the core banking system.

#### Key Endpoint:
- `POST /consumer-loans` - Create loan account

#### Example Request:
```json
{
  "AgreementId": "SA-20250127-XYZ789",
  "Instructions": {
    "FundingMethod": "ACH",
    "DisbursementAccount": "CHK-987654321",
    "PreferredContactMethod": "Email"
  },
  "Preferences": {
    "AutoPayEnrollment": true,
    "AutoPayAccount": "CHK-123456789",
    "StatementDeliveryMethod": "Electronic",
    "PaperlessOptIn": true
  }
}
```

#### Example Response:
```json
{
  "LoanAccountId": "LA-20250127-1234567890",
  "AgreementId": "SA-20250127-XYZ789",
  "CustomerReference": "CUST-654321",
  "Details": {
    "ProductType": "Personal Loan",
    "OriginalPrincipal": 50000,
    "CurrentBalance": 50000,
    "InterestRate": 0.065,
    "OriginalTermMonths": 24,
    "RemainingTermMonths": 24,
    "FirstPaymentDate": "2025-03-15T00:00:00Z",
    "MaturityDate": "2027-03-15T00:00:00Z",
    "InterestCalculationMethod": "Daily Simple Interest"
  },
  "Schedule": {
    "MonthlyPayment": 2134.89,
    "PrincipalPortion": 1968.22,
    "InterestPortion": 166.67,
    "PaymentDay": 15,
    "PaymentFrequency": "Monthly"
  },
  "Configuration": {
    "AutoPayEnabled": true,
    "AutoPayAccount": "CHK-123456789",
    "StatementDelivery": "Electronic",
    "StatementDay": 1,
    "PaperlessEnrolled": true,
    "Notifications": {
      "PaymentReminders": true,
      "PaymentConfirmations": true,
      "StatementAvailable": true,
      "RateChanges": true,
      "PreferredChannel": "Email"
    }
  },
  "Status": {
    "CurrentStatus": "Active",
    "StatusDate": "2025-01-27T10:00:00Z",
    "StatusReason": "Account opened and funded",
    "GoodStanding": true
  }
}
```

---

### 7. **Payment Order Service** - Port 5007
**Swagger URL:** `http://localhost:5007/swagger`

Processes payment orders for loan fund disbursement.

#### Key Endpoint:
- `POST /payment-orders` - Execute payment order

#### Example Request:
```json
{
  "SourceAccount": "LOAN-FUNDING-001",
  "DestinationAccount": "CHK-987654321",
  "Amount": 50000,
  "Instructions": {
    "PaymentMethod": "ACH",
    "Priority": "Normal",
    "ValueDate": "2025-01-27",
    "ProcessingInstructions": "Standard same-day ACH"
  },
  "Purpose": {
    "PurposeCode": "LoanDisbursement",
    "ReferenceNumber": "LA-20250127-1234567890",
    "Description": "Personal loan disbursement to customer account"
  }
}
```

#### Example Response:
```json
{
  "PaymentId": "PMT-20250127-XYZ12345",
  "PaymentOrderReference": "PO-20250127101530-5678",
  "Transaction": {
    "SourceAccount": "LOAN-FUNDING-001",
    "DestinationAccount": "CHK-987654321",
    "Amount": 50000,
    "Currency": "USD",
    "PaymentMethod": "ACH",
    "TransactionType": "LoanDisbursement",
    "ReferenceNumber": "LA-20250127-1234567890"
  },
  "Execution": {
    "InitiationTime": "2025-01-27T10:15:30Z",
    "ExecutionTime": "2025-01-27T10:15:33Z",
    "CompletionTime": "2025-01-27T10:15:35Z",
    "ProcessingStatus": "Completed",
    "ProcessingSteps": [
      {
        "StepNumber": 1,
        "StepName": "Payment Initiated",
        "Timestamp": "2025-01-27T10:15:30Z",
        "Status": "Completed",
        "Description": "Payment order received and validated"
      }
    ]
  },
  "Compliance": {
    "AMLScreeningPassed": true,
    "OFACScreeningPassed": true,
    "FraudCheckPassed": true
  },
  "Status": {
    "CurrentStatus": "Completed",
    "StatusTime": "2025-01-27T10:15:35Z",
    "StatusReason": "Payment processed successfully"
  },
  "Settlement": {
    "SettlementMethod": "FedWire",
    "SettlementDate": "2025-01-28",
    "ClearingSystemReference": "FW20250127654321",
    "SettlementAmount": 50000,
    "CorrespondentBank": "Federal Reserve Bank"
  }
}
```

---

## Standards Compliance

### BIAN (Banking Industry Architecture Network)
All services follow BIAN standards:
- **Customer Eligibility Domain** - Eligibility assessment
- **Customer Offer Domain** - Offer generation and management
- **Sales Product Agreement Domain** - Contract creation
- **Consumer Loan Domain** - Account management
- **Payment Order Domain** - Fund disbursement

### Regulatory Compliance
- **Truth in Lending Act (TILA)** - Complete APR and payment disclosures
- **Fair Credit Reporting Act (FCRA)** - Credit reporting compliance
- **AML/OFAC** - Anti-money laundering and sanctions screening
- **NCR (National Credit Regulator)** - South African market compliance

---

## Real-time Updates

The system provides real-time status updates via Server-Sent Events (SSE):

#### Event Stream Example:
```
data: {"stage":"eligibility","data":{"status":"approved","maxAmount":75000}}

data: {"stage":"offer","data":{"offerId":"LO-20250127-ABC123","amount":50000,"rate":6.5}}

data: {"stage":"agreement","data":{"agreementId":"SA-20250127-XYZ789"}}

data: {"stage":"disbursement","data":{"accountId":"LA-20250127-DEF456","status":"completed"}}
```

---

## Getting Started

### 1. Start All Services
```bash
docker-compose up -d
```

### 2. Access Swagger Documentation
Each service provides interactive Swagger UI at:
- BFF: http://localhost:5001/swagger
- Orchestrator: http://localhost:5002/swagger
- Eligibility: http://localhost:5003/swagger
- Customer Offer: http://localhost:5004/swagger
- Sales Agreement: http://localhost:5005/swagger
- Consumer Loan: http://localhost:5006/swagger
- Payment Order: http://localhost:5007/swagger

### 3. Test Complete Workflow
1. Use BFF to create loan application
2. Monitor progress via SSE events
3. Signal document verification and offer acceptance
4. Verify account creation and fund disbursement

---

## Error Handling

All APIs return standardized HTTP status codes:

- **200 OK** - Successful operation
- **202 Accepted** - Async operation initiated successfully
- **400 Bad Request** - Invalid input data or request format
- **404 Not Found** - Resource not found or workflow completed
- **500 Internal Server Error** - System error or service unavailable

#### Example Error Response:
```json
{
  "error": "Invalid request body",
  "details": "Missing required field: EmailAddress",
  "correlationId": "abc123-def456-ghi789",
  "timestamp": "2025-01-27T10:00:00Z"
}
```
