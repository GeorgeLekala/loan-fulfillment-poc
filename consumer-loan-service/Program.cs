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
        Title = "Consumer Loan Service API", 
        Version = "v1",
        Description = "Microservice for creating and managing consumer loan accounts in the core banking system."
    });
});

var app = builder.Build();

// Configure Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Consumer Loan Service API v1");
        c.RoutePrefix = "swagger";
    });
}

// Enhanced consumer loan account creation with comprehensive BIAN-compliant data
app.MapPost("/consumer-loans", (LoanAccountRequest request) =>
{
    var loanAccountId = $"LA-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..10].ToUpper()}";
    var customerRef = $"CUST-{Random.Shared.Next(100000, 999999)}";
    
    // Simulate loan parameters (in real system, would fetch from agreement)
    var originalPrincipal = 25000m;
    var interestRate = 0.065m;
    var termMonths = 24;
    var monthlyPayment = 1134.89m;
    var firstPaymentDate = DateTime.UtcNow.AddDays(45);
    var maturityDate = firstPaymentDate.AddMonths(termMonths);
    
    var account = new LoanAccountResult
    {
        LoanAccountId = loanAccountId,
        AgreementId = request.AgreementId,
        CustomerReference = customerRef,
        Details = new AccountDetails(
            ProductType: "Personal Loan",
            OriginalPrincipal: originalPrincipal,
            CurrentBalance: originalPrincipal,
            InterestRate: interestRate,
            OriginalTermMonths: termMonths,
            RemainingTermMonths: termMonths,
            FirstPaymentDate: firstPaymentDate,
            MaturityDate: maturityDate,
            InterestCalculationMethod: "Daily Simple Interest"
        ),
        Schedule = new LoanSchedule(
            MonthlyPayment: monthlyPayment,
            PrincipalPortion: 1051.22m,
            InterestPortion: 83.67m,
            PaymentDay: firstPaymentDate.Day,
            PaymentFrequency: "Monthly",
            UpcomingPayments: GeneratePaymentSchedule(originalPrincipal, interestRate, termMonths, monthlyPayment, firstPaymentDate)
        ),
        Configuration = new AccountConfiguration(
            AutoPayEnabled: request.Preferences?.AutoPayEnrollment ?? false,
            AutoPayAccount: request.Preferences?.AutoPayAccount,
            StatementDelivery: request.Preferences?.StatementDeliveryMethod ?? "Electronic",
            StatementDay: request.Preferences?.StatementDay ?? 1,
            PaperlessEnrolled: request.Preferences?.PaperlessOptIn ?? true,
            Notifications: new NotificationPreferences(
                PaymentReminders: true,
                PaymentConfirmations: true,
                StatementAvailable: true,
                RateChanges: true,
                PreferredChannel: request.Instructions?.PreferredContactMethod ?? "Email"
            )
        ),
        ServiceLevels = new ServiceLevels(
            CustomerSegment: DetermineCustomerSegment(interestRate),
            RelationshipManager: "Digital Service Team",
            SupportLevel: "Standard",
            AvailableServices: new List<string> 
            { 
                "Online Account Management", 
                "Mobile App Access", 
                "24/7 Customer Support", 
                "Payment Deferrals", 
                "Statement Download" 
            }
        ),
        Status = new AccountStatus(
            CurrentStatus: "Active",
            StatusDate: DateTime.UtcNow,
            StatusReason: "Account opened and funded",
            GoodStanding: true,
            History: new List<AccountStatusHistory>
            {
                new("Pending", DateTime.UtcNow.AddMinutes(-15), "Account creation initiated", "System"),
                new("Active", DateTime.UtcNow, "Account activated and funded", "Loan Operations")
            }
        )
    };
    
    return Results.Ok(account);
})
.WithName("CreateLoanAccount")
.WithSummary("Create a consumer loan account")
.WithDescription(@"Creates a new loan account in the core banking system based on an approved sales agreement.

**Example Request:**
```json
{
  ""AgreementId"": ""SA-20250127-XYZ789"",
  ""Instructions"": {
    ""FundingMethod"": ""ACH"",
    ""DisbursementAccount"": ""CHK-987654321"",
    ""PreferredContactMethod"": ""Email"",
    ""TimeZone"": ""America/New_York""
  },
  ""Preferences"": {
    ""AutoPayEnrollment"": true,
    ""AutoPayAccount"": ""CHK-123456789"",
    ""StatementDeliveryMethod"": ""Electronic"",
    ""StatementDay"": 1,
    ""PaperlessOptIn"": true
  }
}
```

**Example Response:**
```json
{
  ""LoanAccountId"": ""LA-20250127-1234567890"",
  ""AgreementId"": ""SA-20250127-XYZ789"",
  ""CustomerReference"": ""CUST-654321"",
  ""Details"": {
    ""ProductType"": ""Personal Loan"",
    ""OriginalPrincipal"": 50000,
    ""CurrentBalance"": 50000,
    ""InterestRate"": 0.065,
    ""OriginalTermMonths"": 24,
    ""RemainingTermMonths"": 24,
    ""FirstPaymentDate"": ""2025-03-15T00:00:00Z"",
    ""MaturityDate"": ""2027-03-15T00:00:00Z"",
    ""InterestCalculationMethod"": ""Daily Simple Interest""
  },
  ""Schedule"": {
    ""MonthlyPayment"": 2134.89,
    ""PrincipalPortion"": 1968.22,
    ""InterestPortion"": 166.67,
    ""PaymentDay"": 15,
    ""PaymentFrequency"": ""Monthly"",
    ""UpcomingPayments"": [
      {
        ""PaymentNumber"": 1,
        ""DueDate"": ""2025-03-15T00:00:00Z"",
        ""PaymentAmount"": 2134.89,
        ""PrincipalAmount"": 1968.22,
        ""InterestAmount"": 166.67,
        ""RemainingBalance"": 48031.78
      }
    ]
  },
  ""Configuration"": {
    ""AutoPayEnabled"": true,
    ""AutoPayAccount"": ""CHK-123456789"",
    ""StatementDelivery"": ""Electronic"",
    ""StatementDay"": 1,
    ""PaperlessEnrolled"": true,
    ""Notifications"": {
      ""PaymentReminders"": true,
      ""PaymentConfirmations"": true,
      ""StatementAvailable"": true,
      ""RateChanges"": true,
      ""PreferredChannel"": ""Email""
    }
  },
  ""ServiceLevels"": {
    ""CustomerSegment"": ""Prime"",
    ""RelationshipManager"": ""Digital Service Team"",
    ""SupportLevel"": ""Standard"",
    ""AvailableServices"": [
      ""Online Account Management"",
      ""Mobile App Access"",
      ""24/7 Customer Support""
    ]
  },
  ""Status"": {
    ""CurrentStatus"": ""Active"",
    ""StatusDate"": ""2025-01-27T10:00:00Z"",
    ""StatusReason"": ""Account opened and funded"",
    ""GoodStanding"": true
  }
}
```

**Account Creation Process:**
- Creates core banking loan account
- Establishes payment schedule with amortization
- Sets up customer preferences and notifications
- Configures automatic payment enrollment
- Assigns appropriate service levels

**Returns:** Complete loan account details with payment schedule and configuration.");

app.Run();

// Helper functions for generating BIAN-compliant account data
static List<PaymentScheduleItem> GeneratePaymentSchedule(decimal principal, decimal rate, int termMonths, decimal payment, DateTime startDate)
{
    var schedule = new List<PaymentScheduleItem>();
    var remainingBalance = principal;
    var monthlyRate = rate / 12m;
    
    for (int i = 1; i <= Math.Min(6, termMonths); i++) // Show next 6 payments
    {
        var interestPayment = remainingBalance * monthlyRate;
        var principalPayment = payment - interestPayment;
        remainingBalance -= principalPayment;
        
        schedule.Add(new PaymentScheduleItem(
            PaymentNumber: i,
            DueDate: startDate.AddMonths(i - 1),
            PaymentAmount: Math.Round(payment, 2),
            PrincipalAmount: Math.Round(principalPayment, 2),
            InterestAmount: Math.Round(interestPayment, 2),
            RemainingBalance: Math.Round(remainingBalance, 2)
        ));
    }
    
    return schedule;
}

static string DetermineCustomerSegment(decimal interestRate)
{
    return interestRate switch
    {
        <= 0.06m => "Prime",
        <= 0.10m => "Standard", 
        _ => "Subprime"
    };
}

// BIAN-compliant models for Consumer Loan Account Management

// Enhanced request model following BIAN Consumer Loan domain
record LoanAccountRequest(
    string AgreementId,
    AccountSetupPreferences? Preferences = null,
    CustomerInstructions? Instructions = null
);

record AccountSetupPreferences(
    string StatementDeliveryMethod, // Electronic, Physical, Both
    int StatementDay, // 1-28
    bool AutoPayEnrollment,
    string? AutoPayAccount,
    bool PaperlessOptIn
);

record CustomerInstructions(
    string? SpecialInstructions,
    string PreferredContactMethod,
    bool MarketingOptIn,
    string TimeZone
);

// Comprehensive loan account following BIAN standards
record LoanAccountResult
{
    public string LoanAccountId { get; set; } = default!;
    public string AgreementId { get; set; } = default!;
    public string CustomerReference { get; set; } = default!;
    public AccountDetails Details { get; set; } = default!;
    public LoanSchedule Schedule { get; set; } = default!;
    public AccountConfiguration Configuration { get; set; } = default!;
    public ServiceLevels ServiceLevels { get; set; } = default!;
    public AccountStatus Status { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

record AccountDetails(
    string ProductType,
    decimal OriginalPrincipal,
    decimal CurrentBalance,
    decimal InterestRate,
    int OriginalTermMonths,
    int RemainingTermMonths,
    DateTime FirstPaymentDate,
    DateTime MaturityDate,
    string InterestCalculationMethod
);

record LoanSchedule(
    decimal MonthlyPayment,
    decimal PrincipalPortion,
    decimal InterestPortion,
    int PaymentDay,
    string PaymentFrequency,
    List<PaymentScheduleItem> UpcomingPayments
);

record PaymentScheduleItem(
    int PaymentNumber,
    DateTime DueDate,
    decimal PaymentAmount,
    decimal PrincipalAmount,
    decimal InterestAmount,
    decimal RemainingBalance
);

record AccountConfiguration(
    bool AutoPayEnabled,
    string? AutoPayAccount,
    string StatementDelivery,
    int StatementDay,
    bool PaperlessEnrolled,
    NotificationPreferences Notifications
);

record NotificationPreferences(
    bool PaymentReminders,
    bool PaymentConfirmations,
    bool StatementAvailable,
    bool RateChanges,
    string PreferredChannel // Email, SMS, Phone, Mail
);

record ServiceLevels(
    string CustomerSegment, // Prime, Standard, Subprime
    string RelationshipManager,
    string SupportLevel, // Basic, Premium, Private
    List<string> AvailableServices
);

record AccountStatus(
    string CurrentStatus, // Active, Delinquent, ChargedOff, PaidInFull
    DateTime StatusDate,
    string? StatusReason,
    bool GoodStanding,
    List<AccountStatusHistory> History
);

record AccountStatusHistory(
    string Status,
    DateTime EffectiveDate,
    string Reason,
    string UpdatedBy
);