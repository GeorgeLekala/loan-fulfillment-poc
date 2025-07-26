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
        Title = "Payment Order Service API", 
        Version = "v1",
        Description = "Microservice for processing payment orders and disbursing loan funds to customers."
    });
});

var app = builder.Build();

// Configure Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Payment Order Service API v1");
        c.RoutePrefix = "swagger";
    });
}

// Enhanced payment order execution with comprehensive BIAN-compliant data
app.MapPost("/payment-orders", (PaymentRequest request) =>
{
    var paymentId = $"PMT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpper()}";
    var orderReference = $"PO-{DateTime.UtcNow:yyyyMMddHHmmss}-{Random.Shared.Next(1000, 9999)}";
    
    var currentTime = DateTime.UtcNow;
    var executionTime = currentTime.AddSeconds(Random.Shared.Next(1, 5));
    var completionTime = executionTime.AddSeconds(Random.Shared.Next(1, 3));
    
    var result = new PaymentResult
    {
        PaymentId = paymentId,
        PaymentOrderReference = orderReference,
        Transaction = new TransactionDetails(
            SourceAccount: request.SourceAccount,
            DestinationAccount: request.DestinationAccount,
            Amount: request.Amount,
            Currency: "USD",
            PaymentMethod: request.Instructions?.PaymentMethod ?? "ACH",
            TransactionType: request.Purpose?.PurposeCode ?? "LoanDisbursement",
            ReferenceNumber: request.Purpose?.ReferenceNumber
        ),
        Execution = new PaymentExecution(
            InitiationTime: currentTime,
            ExecutionTime: executionTime,
            CompletionTime: completionTime,
            ProcessingStatus: "Completed",
            ProcessingSteps: GenerateProcessingSteps(currentTime, executionTime, completionTime),
            FailureReason: null
        ),
        Compliance = new PaymentCompliance(
            AMLScreeningPassed: true,
            OFACScreeningPassed: true,
            FraudCheckPassed: true,
            Checks: GenerateComplianceChecks(currentTime),
            ComplianceNotes: null
        ),
        Status = new PaymentStatus(
            CurrentStatus: "Completed",
            StatusTime: completionTime,
            StatusReason: "Payment processed successfully",
            History: GeneratePaymentStatusHistory(currentTime, executionTime, completionTime)
        ),
        Settlement = new SettlementDetails(
            SettlementMethod: "FedWire",
            SettlementDate: DateTime.UtcNow.Date.AddDays(1),
            ClearingSystemReference: $"FW{DateTime.UtcNow:yyyyMMdd}{Random.Shared.Next(100000, 999999)}",
            SettlementAmount: request.Amount,
            CorrespondentBank: "Federal Reserve Bank"
        )
    };
    
    return Results.Ok(result);
})
.WithName("ExecutePaymentOrder")
.WithSummary("Execute a payment order")
.WithDescription("Processes a payment order to disburse loan funds from the source account to the customer's destination account.");

app.Run();

// Helper functions for generating BIAN-compliant payment data
static List<ExecutionStep> GenerateProcessingSteps(DateTime initiation, DateTime execution, DateTime completion)
{
    return new List<ExecutionStep>
    {
        new(1, "Payment Initiated", initiation, "Completed", "Payment order received and validated"),
        new(2, "Fraud Check", initiation.AddSeconds(1), "Completed", "Fraud screening passed"),
        new(3, "AML Screening", initiation.AddSeconds(2), "Completed", "Anti-money laundering check passed"),
        new(4, "Funds Verification", execution.AddSeconds(-1), "Completed", "Source account funds verified"),
        new(5, "Payment Execution", execution, "Completed", "Payment processed through clearing system"),
        new(6, "Settlement", completion, "Completed", "Payment settled successfully")
    };
}

static List<ComplianceCheck> GenerateComplianceChecks(DateTime checkTime)
{
    return new List<ComplianceCheck>
    {
        new("AML", "Passed", checkTime.AddSeconds(1), "No suspicious activity detected"),
        new("OFAC", "Passed", checkTime.AddSeconds(2), "No match with sanctions lists"),
        new("Fraud", "Passed", checkTime.AddSeconds(3), "Transaction patterns normal"),
        new("KYC", "Passed", checkTime.AddSeconds(4), "Customer identity verified")
    };
}

static List<PaymentStatusHistory> GeneratePaymentStatusHistory(DateTime initiation, DateTime execution, DateTime completion)
{
    return new List<PaymentStatusHistory>
    {
        new("Initiated", initiation, "Payment order created", "Payment System"),
        new("Processing", initiation.AddSeconds(2), "Compliance checks in progress", "Compliance Engine"),
        new("Executing", execution, "Payment being processed", "Payment Processor"),
        new("Completed", completion, "Payment successfully processed", "Settlement System")
    };
}

// BIAN-compliant models for Payment Order Management

// Enhanced request model following BIAN Payment Order domain
record PaymentRequest(
    string SourceAccount,
    string DestinationAccount,
    decimal Amount,
    PaymentInstructions? Instructions = null,
    PaymentPurpose? Purpose = null
);

record PaymentInstructions(
    string PaymentMethod, // ACH, Wire, Check
    string ProcessingPriority, // Standard, Expedited, SameDay
    DateTime? RequestedExecutionDate,
    string? SpecialInstructions,
    NotificationRequirements? Notifications
);

record NotificationRequirements(
    bool NotifyPayer,
    bool NotifyPayee,
    string NotificationMethod, // Email, SMS, Phone
    string? PayerNotificationAddress,
    string? PayeeNotificationAddress
);

record PaymentPurpose(
    string PurposeCode, // LoanDisbursement, LoanPayment, RefundPayment
    string Description,
    string? ReferenceNumber,
    string BusinessFunction
);

// Comprehensive payment result following BIAN standards
record PaymentResult
{
    public string PaymentId { get; set; } = default!;
    public string PaymentOrderReference { get; set; } = default!;
    public TransactionDetails Transaction { get; set; } = default!;
    public PaymentExecution Execution { get; set; } = default!;
    public PaymentCompliance Compliance { get; set; } = default!;
    public PaymentStatus Status { get; set; } = default!;
    public SettlementDetails Settlement { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

record TransactionDetails(
    string SourceAccount,
    string DestinationAccount,
    decimal Amount,
    string Currency,
    string PaymentMethod,
    string TransactionType,
    string? ReferenceNumber
);

record PaymentExecution(
    DateTime InitiationTime,
    DateTime? ExecutionTime,
    DateTime? CompletionTime,
    string ProcessingStatus,
    List<ExecutionStep> ProcessingSteps,
    string? FailureReason
);

record ExecutionStep(
    int StepNumber,
    string StepName,
    DateTime Timestamp,
    string Status,
    string? Notes
);

record PaymentCompliance(
    bool AMLScreeningPassed,
    bool OFACScreeningPassed,
    bool FraudCheckPassed,
    List<ComplianceCheck> Checks,
    string? ComplianceNotes
);

record ComplianceCheck(
    string CheckType,
    string Result,
    DateTime CheckTime,
    string? Details
);

record PaymentStatus(
    string CurrentStatus, // Initiated, Processing, Completed, Failed, Cancelled
    DateTime StatusTime,
    string? StatusReason,
    List<PaymentStatusHistory> History
);

record PaymentStatusHistory(
    string Status,
    DateTime Timestamp,
    string Reason,
    string UpdatedBy
);

record SettlementDetails(
    string SettlementMethod,
    DateTime? SettlementDate,
    string? ClearingSystemReference,
    decimal? SettlementAmount,
    string? CorrespondentBank
);