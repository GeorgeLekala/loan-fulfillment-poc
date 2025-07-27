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
        Title = "Eligibility Service API", 
        Version = "v1",
        Description = "Microservice for assessing loan eligibility based on applicant information and credit criteria."
    });
});

var app = builder.Build();

// Configure Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Eligibility Service API v1");
        c.RoutePrefix = "swagger";
    });
}

// Enhanced eligibility assessment endpoint following BIAN standards
app.MapPost("/eligibility-assessments", (EligibilityRequest request) =>
{
    // Generate a unique eligibility reference
    var eligibilityRef = $"ELG-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    
    // Simulate credit scoring and risk assessment
    var creditScore = Random.Shared.Next(600, 850);
    var creditGrade = creditScore >= 750 ? "Excellent" : creditScore >= 700 ? "Good" : creditScore >= 650 ? "Fair" : "Poor";
    var debtToIncomeRatio = (decimal)(Random.Shared.NextDouble() * 0.4); // 0-40%
    
    // Simulate eligibility criteria assessment
    var criteriaMet = new List<EligibilityCriteria>
    {
        new("MinimumIncome", request.ApplicantProfile?.AnnualIncome >= 30000, "Annual income must be at least $30,000", 30000, request.ApplicantProfile?.AnnualIncome),
        new("CreditScore", creditScore >= 620, "Credit score must be at least 620", 620, creditScore),
        new("DebtToIncome", debtToIncomeRatio <= 0.43m, "Debt-to-income ratio must be below 43%", 0.43m, Math.Round(debtToIncomeRatio, 3)),
        new("Employment", request.ApplicantProfile?.EmploymentStatus == "Employed", "Applicant must be employed", null, null),
        new("LoanAmount", request.RequestedAmount <= 100000, "Loan amount must not exceed $100,000", 100000, request.RequestedAmount)
    };
    
    // Determine eligibility based on criteria
    var isEligible = criteriaMet.All(c => c.Met);
    var maxAmount = isEligible ? Math.Min(request.RequestedAmount * 1.2m, request.ApplicantProfile?.AnnualIncome * 0.3m ?? 50000m) : 0;
    
    // Generate risk factors
    var riskFactors = new List<RiskFactor>();
    if (creditScore < 650) riskFactors.Add(new("Credit", "High", "Below average credit score", 0.8m));
    if (debtToIncomeRatio > 0.35m) riskFactors.Add(new("DTI", "Medium", "High debt-to-income ratio", 0.6m));
    if (request.RequestedAmount > 50000) riskFactors.Add(new("LoanSize", "Low", "Large loan amount requested", 0.3m));
    
    var result = new EligibilityResult
    {
        ApplicantId = request.ApplicantId,
        EligibilityReference = eligibilityRef,
        Eligible = isEligible,
        MaxAmount = Math.Round(maxAmount, 2),
        Assessment = new EligibilityAssessment(
            CreditScore: creditScore,
            CreditGrade: creditGrade,
            DebtToIncomeRatio: debtToIncomeRatio,
            LoanToValueRatio: 0.8m, // Standard LTV
            CriteriaMet: criteriaMet,
            RiskFactors: riskFactors,
            Compliance: new ComplianceCheck(
                KYCCompliant: true,
                AMLCompliant: true,
                RegulationCompliant: true,
                LastKYCUpdate: DateTime.UtcNow.AddDays(-30),
                ComplianceNotes: new List<string> { "Customer verified through automated systems", "AML screening passed" }
            )
        )
    };
    
    return Results.Ok(result);
})
.WithName("AssessEligibility")
.WithSummary("Assess loan eligibility")
.WithDescription(@"Evaluates whether an applicant is eligible for a loan and determines the maximum amount they can borrow.

**Example Request:**
```json
{
  ""ApplicantId"": ""CUST-123456"",
  ""RequestedAmount"": 50000,
  ""ApplicantProfile"": {
    ""CustomerReference"": ""CUST-123456"",
    ""FullName"": ""John Smith"",
    ""DateOfBirth"": ""1985-01-15"",
    ""EmploymentStatus"": ""Employed"",
    ""AnnualIncome"": 180000,
    ""EmployerName"": ""Tech Solutions Ltd"",
    ""YearsOfEmployment"": 3,
    ""ContactInfo"": {
      ""Email"": ""john.smith@email.com"",
      ""PrimaryPhone"": ""+27821234567""
    },
    ""Address"": {
      ""StreetAddress"": ""123 Main Street"",
      ""City"": ""Johannesburg"",
      ""State"": ""Gauteng"",
      ""PostalCode"": ""2000"",
      ""Country"": ""ZAR""
    },
    ""Identification"": {
      ""SSN"": ""8501015009087""
    }
  },
  ""LoanDetails"": {
    ""LoanPurpose"": ""Debt Consolidation"",
    ""RequestedTermMonths"": 24,
    ""DownPayment"": 0,
    ""ProductType"": ""Personal Loan""
  }
}
```

**Example Response:**
```json
{
  ""ApplicantId"": ""CUST-123456"",
  ""EligibilityReference"": ""ELG-20250127-ABC12345"",
  ""Eligible"": true,
  ""MaxAmount"": 60000.00,
  ""Assessment"": {
    ""CreditScore"": 745,
    ""CreditGrade"": ""Good"",
    ""DebtToIncomeRatio"": 0.32,
    ""LoanToValueRatio"": 0.8,
    ""CriteriaMet"": [
      {
        ""CriteriaType"": ""MinimumIncome"",
        ""Met"": true,
        ""Description"": ""Annual income must be at least $30,000"",
        ""ThresholdValue"": 30000,
        ""ActualValue"": 180000
      }
    ],
    ""RiskFactors"": [],
    ""Compliance"": {
      ""KYCCompliant"": true,
      ""AMLCompliant"": true,
      ""RegulationCompliant"": true,
      ""LastKYCUpdate"": ""2025-01-15T10:00:00Z"",
      ""ComplianceNotes"": [""Customer verified through automated systems""]
    }
  },
  ""AssessmentDate"": ""2025-01-27T10:00:00Z"",
  ""Status"": ""Completed""
}
```

**Assessment Criteria:**
- Minimum annual income: R360,000 (R30,000/month)
- Credit score: Minimum 620
- Debt-to-income ratio: Maximum 43%
- Employment status: Must be employed
- Maximum loan amount: R1,200,000

**Returns:** Comprehensive eligibility assessment with risk factors and compliance checks.");

app.Run();

// BIAN-compliant models for Eligibility Assessment

// Input model following BIAN Customer Eligibility domain
record EligibilityRequest(
    string ApplicantId,
    decimal RequestedAmount,
    ApplicantProfile? ApplicantProfile = null,
    LoanDetails? LoanDetails = null
);

record ApplicantProfile(
    string CustomerReference,
    string FullName,
    DateTime DateOfBirth,
    string EmploymentStatus,
    decimal AnnualIncome,
    string EmployerName,
    int YearsOfEmployment,
    ContactInformation ContactInfo,
    AddressInformation Address,
    IdentificationDetails Identification
);

record ContactInformation(
    string Email,
    string PrimaryPhone,
    string? SecondaryPhone = null
);

record AddressInformation(
    string StreetAddress,
    string City,
    string State,
    string PostalCode,
    string Country,
    string AddressType = "Residential"
);

record IdentificationDetails(
    string SSN,
    string? DriversLicense = null,
    string? PassportNumber = null
);

record LoanDetails(
    string LoanPurpose,
    int RequestedTermMonths,
    decimal DownPayment,
    string ProductType = "Personal Loan"
);

// Enhanced response model with comprehensive eligibility assessment
record EligibilityResult
{
    public string ApplicantId { get; set; } = default!;
    public string EligibilityReference { get; set; } = default!;
    public bool Eligible { get; set; }
    public decimal MaxAmount { get; set; }
    public EligibilityAssessment Assessment { get; set; } = default!;
    public DateTime AssessmentDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Completed";
}

record EligibilityAssessment(
    decimal CreditScore,
    string CreditGrade,
    decimal DebtToIncomeRatio,
    decimal LoanToValueRatio,
    List<EligibilityCriteria> CriteriaMet,
    List<RiskFactor> RiskFactors,
    ComplianceCheck Compliance
);

record EligibilityCriteria(
    string CriteriaType,
    bool Met,
    string Description,
    decimal? ThresholdValue = null,
    decimal? ActualValue = null
);

record RiskFactor(
    string RiskType,
    string Severity, // Low, Medium, High
    string Description,
    decimal ImpactScore
);

record ComplianceCheck(
    bool KYCCompliant,
    bool AMLCompliant,
    bool RegulationCompliant,
    DateTime LastKYCUpdate,
    List<string> ComplianceNotes
);