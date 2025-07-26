using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON options to use PascalCase naming to match orchestrator expectations
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = null; // Use PascalCase (default C# naming)
});

// Add Swagger/OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "Customer Offer Service API", 
        Version = "v1",
        Description = "Microservice for generating and managing personalized loan offers based on eligibility assessments."
    });
});

var app = builder.Build();

// Configure Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Customer Offer Service API v1");
        c.RoutePrefix = "swagger";
    });
}

// Store offers in memory so they can be retrieved later.  In a real
// system this would be persisted in a database.  The key is the
// generated OfferId.
var offers = new ConcurrentDictionary<string, LoanOffer>();

// Enhanced customer offer creation with comprehensive BIAN-compliant data
app.MapPost("/customer-offers", (OfferRequest request) =>
{
    Console.WriteLine($"[CUSTOMER OFFER SERVICE] Received request: Amount={request.Amount}, ApplicantId={request.ApplicantId}");
    Console.WriteLine($"[CUSTOMER OFFER SERVICE] Preferences: {System.Text.Json.JsonSerializer.Serialize(request.Preferences)}");
    Console.WriteLine($"[CUSTOMER OFFER SERVICE] EligibilityData: {System.Text.Json.JsonSerializer.Serialize(request.EligibilityData)}");
    
    var offerId = $"LO-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    
    // Determine loan terms based on preferences or defaults
    var termMonths = request.Preferences?.PreferredTermMonths ?? 24;
    var interestRate = CalculateInterestRate(request.EligibilityData?.CreditScore ?? 720);
    var apr = interestRate + 0.005m; // Add fees to get APR
    
    // Calculate monthly payment using amortization formula
    var monthlyRate = interestRate / 12m;
    var monthlyPayment = request.Amount * (monthlyRate / (1 - (decimal)Math.Pow((double)(1 + monthlyRate), -termMonths)));
    var totalOfPayments = monthlyPayment * termMonths;
    
    // Generate offer with comprehensive terms
    var offer = new LoanOffer
    {
        OfferId = offerId,
        ApplicantId = request.ApplicantId,
        Amount = request.Amount,
        Terms = new LoanTerms(
            TermMonths: termMonths,
            MonthlyPayment: decimal.Round(monthlyPayment, 2),
            FirstPaymentDate: DateTime.UtcNow.AddDays(45),
            TotalOfPayments: decimal.Round(totalOfPayments, 2),
            RepaymentFrequency: "Monthly"
        ),
        Pricing = new PricingStructure(
            InterestRate: interestRate,
            APR: apr,
            RateType: request.Preferences?.RateType ?? "Fixed",
            Fees: GenerateStandardFees(request.Amount),
            PromotionalRate: interestRate >= 0.08m ? interestRate - 0.02m : null,
            PromotionalPeriodMonths: interestRate >= 0.08m ? 6 : null
        ),
        Conditions = new OfferConditions(
            RequiredDocuments: GenerateRequiredDocuments(request.Amount),
            Stipulations: GenerateStipulations(request.EligibilityData?.CreditScore ?? 720),
            IncomeVerificationRequired: request.Amount > 25000,
            CollateralRequired: request.Amount > 75000,
            CoSignerRequired: request.EligibilityData?.CreditScore < 650 ? "Required" : null
        ),
        Disclosures = new RegulatoryDisclosure(
            TruthInLendingAct: "This loan is subject to Truth in Lending Act disclosures. APR and payment terms are clearly disclosed.",
            FairCreditReportingAct: "Credit information may be reported to credit agencies in accordance with FCRA.",
            EqualCreditOpportunityAct: "This lender does not discriminate on the basis of race, color, religion, national origin, sex, marital status, or age.",
            StateSpecificDisclosures: new List<string> { "Licensed lender in all 50 states", "Right to cancel within 3 business days" },
            DisclosureDate: DateTime.UtcNow
        ),
        ExpirationDate = DateTime.UtcNow.AddDays(30)
    };
    
    // Debug: Log the generated fees
    Console.WriteLine($"[CUSTOMER OFFER SERVICE] Generated fees: {System.Text.Json.JsonSerializer.Serialize(offer.Pricing.Fees)}");
    
    offers[offerId] = offer;
    return Results.Ok(offer);
})
.WithName("CreateOffer")
.WithSummary("Create a loan offer")
.WithDescription("Generates a personalized loan offer with calculated monthly payments based on the applicant's eligible amount.");

// Retrieve an existing offer by its id.  This endpoint is optional but
// useful for debugging.  If the offer does not exist a 404 is
// returned.
app.MapGet("/customer-offers/{id}", (string id) =>
    offers.TryGetValue(id, out var offer) ? Results.Ok(offer) : Results.NotFound())
.WithName("GetOffer")
.WithSummary("Get loan offer by ID")
.WithDescription("Retrieves an existing loan offer by its unique identifier.");

app.Run();

// Helper functions for generating BIAN-compliant offer data
static decimal CalculateInterestRate(decimal creditScore)
{
    return creditScore switch
    {
        >= 750 => 0.049m, // Excellent credit
        >= 700 => 0.065m, // Good credit  
        >= 650 => 0.085m, // Fair credit
        >= 600 => 0.105m, // Poor credit
        _ => 0.125m        // Very poor credit
    };
}

static List<Fee> GenerateStandardFees(decimal loanAmount)
{
    var fees = new List<Fee>
    {
        new("Origination", "Loan processing and underwriting fee", Math.Max(50m, loanAmount * 0.01m), "One-time"),
        new("Documentation", "Document preparation and recording fee", 25m, "One-time")
    };
    
    if (loanAmount > 50000)
        fees.Add(new("LargeBalance", "Additional processing for large loans", 100m, "One-time"));
    
    return fees;
}

static List<string> GenerateRequiredDocuments(decimal loanAmount)
{
    var docs = new List<string>
    {
        "Government-issued photo ID",
        "Proof of income (pay stubs, tax returns)",
        "Bank statements (last 3 months)",
        "Employment verification letter"
    };
    
    if (loanAmount > 25000)
    {
        docs.Add("Additional income documentation");
        docs.Add("Asset verification");
    }
    
    if (loanAmount > 75000)
    {
        docs.Add("Collateral documentation");
        docs.Add("Property appraisal");
    }
    
    return docs;
}

static List<string> GenerateStipulations(decimal creditScore)
{
    var stipulations = new List<string>
    {
        "Loan approval subject to final underwriting review",
        "Interest rate subject to credit verification",
        "Borrower must maintain adequate insurance coverage"
    };
    
    if (creditScore < 700)
    {
        stipulations.Add("Additional income verification required");
        stipulations.Add("Debt-to-income ratio must not exceed 40%");
    }
    
    if (creditScore < 650)
    {
        stipulations.Add("Co-signer may be required");
        stipulations.Add("Additional collateral may be required");
    }
    
    return stipulations;
}

// BIAN-compliant models for Customer Offer Management

// Enhanced request model following BIAN Product & Service Offering domain
record OfferRequest(
    string ApplicantId,
    decimal Amount,
    LoanPreferences? Preferences = null,
    EligibilityContext? EligibilityData = null
);

record LoanPreferences(
    int PreferredTermMonths,
    decimal? MaxMonthlyPayment,
    string LoanPurpose,
    string ProductType = "Personal Loan",
    bool AutoPayEnrollment = false,
    string RateType = "Fixed" // Fixed or Variable
);

record EligibilityContext(
    string EligibilityReference,
    decimal CreditScore,
    string CreditGrade,
    decimal MaxEligibleAmount
);

// Comprehensive loan offer following BIAN standards
record LoanOffer
{
    public string OfferId { get; set; } = default!;
    public string ApplicantId { get; set; } = default!;
    public decimal Amount { get; set; }
    public LoanTerms Terms { get; set; } = default!;
    public PricingStructure Pricing { get; set; } = default!;
    public OfferConditions Conditions { get; set; } = default!;
    public RegulatoryDisclosure Disclosures { get; set; } = default!;
    public DateTime OfferDate { get; set; } = DateTime.UtcNow;
    public DateTime ExpirationDate { get; set; } = DateTime.UtcNow.AddDays(30);
    public string Status { get; set; } = "Active";
}

record LoanTerms(
    int TermMonths,
    decimal MonthlyPayment,
    DateTime FirstPaymentDate,
    decimal TotalOfPayments,
    string RepaymentFrequency = "Monthly"
);

record PricingStructure(
    decimal InterestRate,
    decimal APR, // Annual Percentage Rate
    string RateType,
    List<Fee> Fees,
    decimal? PromotionalRate = null,
    int? PromotionalPeriodMonths = null
);

record Fee(
    string FeeType,
    string Description,
    decimal Amount,
    string Frequency // One-time, Monthly, Annual
);

record OfferConditions(
    List<string> RequiredDocuments,
    List<string> Stipulations,
    bool IncomeVerificationRequired,
    bool CollateralRequired,
    string? CoSignerRequired = null
);

record RegulatoryDisclosure(
    string TruthInLendingAct,
    string FairCreditReportingAct,
    string EqualCreditOpportunityAct,
    List<string> StateSpecificDisclosures,
    DateTime DisclosureDate
);