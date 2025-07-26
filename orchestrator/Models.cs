using System;

namespace LoanFulfilment.Orchestrator
{
    // Data structures shared between the orchestrator and activities.  These
    // are intentionally simple and could be replaced with more
    // comprehensive models in a real system.

    public record LoanApplicationData
    {
        // Customer Identity Information (BIAN Customer Reference Data)
        public string ApplicantName { get; init; } = default!;
        public string SSN { get; init; } = default!;
        public string Email { get; init; } = default!;
        public string PhoneNumber { get; init; } = default!;
        
        // Financial Information
        public decimal AnnualIncome { get; init; }
        public string EmploymentStatus { get; init; } = default!;
        
        // Loan Request Details
        public decimal RequestedAmount { get; init; }
        public string LoanPurpose { get; init; } = default!;
        
        // Loan Preferences
        public int PreferredTermMonths { get; init; } = 24;
        public decimal? MaxMonthlyPayment { get; init; }
        public string? ProductType { get; init; } = "Personal Loan";
        public bool AutoPayEnrollment { get; init; } = false;
        
        // Legacy field for backward compatibility
        public string ApplicantId => SSN; // Use SSN as unique identifier
    }

    public record EligibilityResult
    {
        public string ApplicantId { get; init; } = default!;
        public bool Eligible { get; init; }
        public decimal MaxAmount { get; init; }
        public string EligibilityReference { get; init; } = default!;
        public EligibilityAssessment? Assessment { get; init; }
    }

    public record EligibilityAssessment
    {
        public decimal CreditScore { get; init; }
        public string CreditGrade { get; init; } = default!;
        public decimal DebtToIncomeRatio { get; init; }
    }

    public record LoanOffer
    {
        public string OfferId { get; init; } = default!;
        public string ApplicantId { get; init; } = default!;
        public decimal Amount { get; init; }
        public LoanTerms Terms { get; init; } = default!;
        public PricingStructure Pricing { get; init; } = default!;
        public OfferConditions Conditions { get; init; } = default!;
        public RegulatoryDisclosure Disclosures { get; init; } = default!;
        public DateTime OfferDate { get; init; } = DateTime.UtcNow;
        public DateTime ExpirationDate { get; init; } = DateTime.UtcNow.AddDays(30);
        public string Status { get; init; } = "Active";
    }

    public record LoanTerms(
        int TermMonths,
        decimal MonthlyPayment,
        DateTime FirstPaymentDate,
        decimal TotalOfPayments,
        string RepaymentFrequency = "Monthly"
    );

    public record PricingStructure(
        decimal InterestRate,
        decimal APR, // Annual Percentage Rate
        string RateType,
        List<Fee> Fees,
        decimal? PromotionalRate = null,
        int? PromotionalPeriodMonths = null
    );

    public record Fee(
        string FeeType,
        string Description,
        decimal Amount,
        string Frequency // One-time, Monthly, Annual
    );

    public record OfferConditions(
        List<string> RequiredDocuments,
        List<string> Stipulations,
        bool IncomeVerificationRequired,
        bool CollateralRequired,
        string? CoSignerRequired = null
    );

    public record RegulatoryDisclosure(
        string TruthInLendingAct,
        string FairCreditReportingAct,
        string EqualCreditOpportunityAct,
        List<string> StateSpecificDisclosures,
        DateTime DisclosureDate
    );

    public record AgreementResult
    {
        public string AgreementId { get; init; } = default!;
        public string OfferId { get; init; } = default!;
        public DateTime CreatedAt { get; init; }
    }

    public record LoanAccountResult
    {
        public string LoanAccountId { get; init; } = default!;
        public string AgreementId { get; init; } = default!;
        public DateTime CreatedAt { get; init; }
    }

    public record PaymentResult
    {
        public string PaymentId { get; init; } = default!;
        public string PaymentOrderReference { get; init; } = default!;
        public TransactionDetails Transaction { get; init; } = default!;
        public PaymentExecution Execution { get; init; } = default!;
        public PaymentCompliance Compliance { get; init; } = default!;
        public PaymentStatus Status { get; init; } = default!;
        public SettlementDetails Settlement { get; init; } = default!;
        public DateTime CreatedAt { get; init; }
    }

    public record TransactionDetails(
        string SourceAccount,
        string DestinationAccount,
        decimal Amount,
        string Currency,
        string PaymentMethod,
        string TransactionType,
        string? ReferenceNumber
    );

    public record PaymentExecution(
        DateTime InitiationTime,
        DateTime ExecutionTime,
        DateTime CompletionTime,
        string ProcessingStatus,
        List<ExecutionStep> ProcessingSteps,
        string? FailureReason
    );

    public record ExecutionStep(
        int StepNumber,
        string Description,
        DateTime Timestamp,
        string Status,
        string Notes
    );

    public record PaymentCompliance(
        bool AMLScreeningPassed,
        bool OFACScreeningPassed,
        bool FraudCheckPassed,
        List<ComplianceCheck> Checks,
        string? ComplianceNotes
    );

    public record ComplianceCheck(
        string CheckType,
        string Result,
        DateTime CheckTime,
        string Details
    );

    public record PaymentStatus(
        string CurrentStatus,
        DateTime StatusTime,
        string StatusReason,
        List<PaymentStatusHistory> History
    );

    public record PaymentStatusHistory(
        string Status,
        DateTime Timestamp,
        string Reason,
        string? SystemNote
    );

    public record SettlementDetails(
        string SettlementMethod,
        DateTime SettlementDate,
        string ClearingSystemReference,
        decimal SettlementAmount,
        string CorrespondentBank
    );

    public record WorkflowEvent
    {
        public string Stage { get; init; } = default!;
        public object? Data { get; init; }
    }
}