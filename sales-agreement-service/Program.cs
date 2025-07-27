using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add Swagger/OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "Sales Agreement Service API", 
        Version = "v1",
        Description = "Microservice for creating and managing sales product agreements for approved loan offers."
    });
});

var app = builder.Build();

// Configure Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sales Agreement Service API v1");
        c.RoutePrefix = "swagger";
    });
}

// Enhanced sales agreement creation with comprehensive BIAN-compliant data
app.MapPost("/sales-product-agreements", (AgreementRequest request) =>
{
    var agreementId = $"SA-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    var customerRef = $"CUST-{Random.Shared.Next(100000, 999999)}";
    
    // Simulate loan terms (in real system, would fetch from offer service)
    var principalAmount = 25000m;
    var interestRate = 0.065m;
    var termMonths = 24;
    var monthlyPayment = 1134.89m;
    var firstPaymentDate = DateTime.UtcNow.AddDays(45);
    var maturityDate = firstPaymentDate.AddMonths(termMonths);
    
    var agreement = new AgreementResult
    {
        AgreementId = agreementId,
        OfferId = request.OfferId,
        CustomerReference = customerRef,
        Details = new AgreementDetails(
            ProductType: "Personal Loan",
            PrincipalAmount: principalAmount,
            InterestRate: interestRate,
            TermMonths: termMonths,
            MonthlyPayment: monthlyPayment,
            FirstPaymentDate: firstPaymentDate,
            MaturityDate: maturityDate,
            LoanPurpose: "Debt Consolidation"
        ),
        Terms = new ContractualTerms(
            TermsAndConditions: GenerateTermsAndConditions(),
            Warranties: GenerateWarranties(),
            Representations: GenerateRepresentations(),
            Default: new DefaultProvisions(
                GracePeriodDays: 10,
                LateFeePercentage: 0.05m,
                DefaultInterestRate: "Prime + 5%",
                RemedyActions: new List<string> { "Late fee assessment", "Credit reporting", "Collection agency referral", "Legal action" }
            ),
            Prepayment: new PrepaymentTerms(
                PrepaymentAllowed: true,
                PrepaymentPenalty: null,
                PrepaymentPenaltyPeriodMonths: null,
                PrepaymentConditions: "No penalty for prepayment after 12 months"
            ),
            Covenants: new List<string> { "Maintain insurance coverage", "Notify of address changes", "Use loan proceeds as stated" }
        ),
        Compliance = new ComplianceRecord(
            TruthInLendingDisclosure: "TIL disclosure provided per Regulation Z requirements",
            RightOfRescission: "3-day right of rescission period applicable",
            DisclosureDeliveryDate: DateTime.UtcNow,
            CreditReportingAuthorization: true,
            RegulatoryItems: GenerateRegulatoryCompliance()
        ),
        Status = new AgreementStatus(
            CurrentStatus: "Executed",
            StatusDate: DateTime.UtcNow,
            StatusReason: "Customer acceptance and execution completed",
            History: new List<StatusHistory>
            {
                new("Pending", DateTime.UtcNow.AddMinutes(-30), "Agreement created", "System"),
                new("Executed", DateTime.UtcNow, "Customer signed agreement", "Customer Portal")
            }
        )
    };
    
    return Results.Ok(agreement);
})
.WithName("CreateSalesAgreement")
.WithSummary("Create a sales product agreement")
.WithDescription(@"Creates a formal sales agreement based on an accepted loan offer, establishing the contractual terms.

**Example Request:**
```json
{
  ""OfferId"": ""LO-20250127-ABC12345"",
  ""Instructions"": {
    ""PreferredContactMethod"": ""Email"",
    ""DeliveryMethod"": ""Electronic"",
    ""SignatureMethod"": ""Electronic"",
    ""NotificationPreferences"": {
      ""PaymentReminders"": true,
      ""StatementNotifications"": true,
      ""RateChangeNotices"": true
    }
  },
  ""Preferences"": {
    ""AutoPayEnrollment"": true,
    ""AutoPayAccount"": ""CHK-123456789"",
    ""StatementDeliveryMethod"": ""Electronic"",
    ""PaperlessOptIn"": true
  }
}
```

**Example Response:**
```json
{
  ""AgreementId"": ""SA-20250127-XYZ789"",
  ""OfferId"": ""LO-20250127-ABC12345"",
  ""CustomerReference"": ""CUST-654321"",
  ""Details"": {
    ""ProductType"": ""Personal Loan"",
    ""PrincipalAmount"": 50000,
    ""InterestRate"": 0.065,
    ""TermMonths"": 24,
    ""MonthlyPayment"": 2134.89,
    ""FirstPaymentDate"": ""2025-03-15T00:00:00Z"",
    ""MaturityDate"": ""2027-03-15T00:00:00Z"",
    ""LoanPurpose"": ""Debt Consolidation""
  },
  ""Terms"": {
    ""TermsAndConditions"": [
      ""Borrower agrees to repay according to payment schedule"",
      ""Interest accrues daily on outstanding balance""
    ],
    ""Default"": {
      ""GracePeriodDays"": 10,
      ""LateFeePercentage"": 0.05,
      ""DefaultInterestRate"": ""Prime + 5%""
    },
    ""Prepayment"": {
      ""PrepaymentAllowed"": true,
      ""PrepaymentPenalty"": null,
      ""PrepaymentConditions"": ""No penalty after 12 months""
    }
  },
  ""Compliance"": {
    ""TruthInLendingDisclosure"": ""TIL disclosure per Regulation Z"",
    ""RightOfRescission"": ""3-day rescission period applicable"",
    ""DisclosureDeliveryDate"": ""2025-01-27T10:00:00Z"",
    ""CreditReportingAuthorization"": true
  },
  ""Status"": {
    ""CurrentStatus"": ""Executed"",
    ""StatusDate"": ""2025-01-27T10:00:00Z"",
    ""StatusReason"": ""Customer acceptance completed""
  }
}
```

**Agreement Process:**
- Creates legally binding loan contract
- Includes all regulatory disclosures (Truth in Lending Act)
- Establishes repayment terms and default provisions
- Records customer preferences for account management

**Returns:** Complete agreement with all terms, conditions, and compliance documentation.");

app.Run();

// Helper functions for generating BIAN-compliant agreement data
static List<string> GenerateTermsAndConditions()
{
    return new List<string>
    {
        "Borrower agrees to repay the loan according to the payment schedule",
        "Interest will accrue daily on the outstanding principal balance",
        "Late payments will incur fees and may affect credit score",
        "Loan may be accelerated upon default",
        "Borrower has the right to prepay without penalty after 12 months",
        "All communications may be conducted electronically",
        "Governing law shall be the state where the loan was originated"
    };
}

static List<string> GenerateWarranties()
{
    return new List<string>
    {
        "Borrower warrants that all information provided is accurate and complete",
        "Borrower warrants they have legal capacity to enter into this agreement",
        "Borrower warrants they are not in default on any other obligations",
        "Borrower warrants the intended use of loan proceeds is as stated"
    };
}

static List<string> GenerateRepresentations()
{
    return new List<string>
    {
        "Borrower represents they understand the terms and conditions",
        "Borrower represents they have received all required disclosures",
        "Borrower represents their financial information is current and accurate",
        "Borrower represents they are not subject to any legal restrictions"
    };
}

static List<RegulatoryCompliance> GenerateRegulatoryCompliance()
{
    return new List<RegulatoryCompliance>
    {
        new("Truth in Lending Act", "Compliant", DateTime.UtcNow, "TILA disclosures provided"),
        new("Fair Credit Reporting Act", "Compliant", DateTime.UtcNow, "Credit authorization obtained"),
        new("Equal Credit Opportunity Act", "Compliant", DateTime.UtcNow, "Non-discrimination policies followed"),
        new("State Banking Regulations", "Compliant", DateTime.UtcNow, "Licensed lender compliance verified")
    };
}

// BIAN-compliant models for Sales Product Agreement Management

// Enhanced request model following BIAN Sales Product Agreement domain
record AgreementRequest(
    string OfferId,
    CustomerAcceptance? CustomerAcceptance = null,
    AgreementTerms? SpecialTerms = null
);

record CustomerAcceptance(
    DateTime AcceptanceDate,
    string AcceptanceMethod, // Electronic, Physical, Verbal
    string CustomerSignature,
    string IPAddress,
    bool TermsAndConditionsAccepted,
    bool PrivacyPolicyAccepted,
    bool ElectronicDisclosuresAccepted
);

record AgreementTerms(
    List<string> SpecialConditions,
    DateTime? ModifiedFirstPaymentDate,
    bool? AutoPayEnrollment,
    string? PreferredPaymentMethod
);

// Comprehensive sales agreement following BIAN standards  
record AgreementResult
{
    public string AgreementId { get; set; } = default!;
    public string OfferId { get; set; } = default!;
    public string CustomerReference { get; set; } = default!;
    public AgreementDetails Details { get; set; } = default!;
    public ContractualTerms Terms { get; set; } = default!;
    public ComplianceRecord Compliance { get; set; } = default!;
    public AgreementStatus Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

record AgreementDetails(
    string ProductType,
    decimal PrincipalAmount,
    decimal InterestRate,
    int TermMonths,
    decimal MonthlyPayment,
    DateTime FirstPaymentDate,
    DateTime MaturityDate,
    string LoanPurpose
);

record ContractualTerms(
    List<string> TermsAndConditions,
    List<string> Warranties,
    List<string> Representations,
    DefaultProvisions Default,
    PrepaymentTerms Prepayment,
    List<string> Covenants
);

record DefaultProvisions(
    int GracePeriodDays,
    decimal LateFeePercentage,
    string DefaultInterestRate,
    List<string> RemedyActions
);

record PrepaymentTerms(
    bool PrepaymentAllowed,
    decimal? PrepaymentPenalty,
    int? PrepaymentPenaltyPeriodMonths,
    string PrepaymentConditions
);

record ComplianceRecord(
    string TruthInLendingDisclosure,
    string RightOfRescission,
    DateTime DisclosureDeliveryDate,
    bool CreditReportingAuthorization,
    List<RegulatoryCompliance> RegulatoryItems
);

record RegulatoryCompliance(
    string RegulationType,
    string ComplianceStatus,
    DateTime ComplianceDate,
    string Description
);

record AgreementStatus(
    string CurrentStatus, // Active, Pending, Executed, Cancelled
    DateTime StatusDate,
    string? StatusReason,
    List<StatusHistory> History
);

record StatusHistory(
    string Status,
    DateTime EffectiveDate,
    string Reason,
    string UpdatedBy
);