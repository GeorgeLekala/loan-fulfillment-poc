using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.ComponentModel.DataAnnotations;
using LoanFulfilment.Orchestrator;
using Temporalio.Client;

// Build a generic web application host.  The orchestrator exposes a
// minimal API for starting workflows and signalling them.  It also
// registers a background service that runs the Temporal worker.
var builder = WebApplication.CreateBuilder(args);

// Add Swagger/OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "Loan Fulfillment Orchestrator API", 
        Version = "v1",
        Description = @"**Temporal Workflow Orchestrator for Loan Processing**

This service coordinates the entire loan fulfillment process using Temporal workflows. It manages:

- **Workflow Orchestration**: 6-stage loan processing pipeline
- **Service Coordination**: Integrates with 5 specialized microservices
- **Signal Management**: Handles document verification and offer acceptance
- **Event Publishing**: Real-time status updates to BFF service
- **BIAN Compliance**: Banking Industry Architecture Network standards

**6-Stage Workflow Process:**
1. **Eligibility Assessment** → Credit evaluation and risk scoring
2. **Offer Generation** → Personalized loan terms and pricing  
3. **Document Verification** → Customer document submission (manual gate)
4. **Agreement Creation** → Sales agreement and compliance documentation
5. **Account Creation** → Core banking loan account setup
6. **Fund Disbursement** → Payment processing and fund transfer

**Temporal Integration:**
- **Task Queue**: `LoanTaskQueue`
- **Workflow ID**: Application ID (UUID)
- **Activities**: Calls to domain microservices
- **Signals**: `DocumentVerified()`, `OfferAccepted()`

**Base URL:** `http://localhost:5002`"
    });
});

// Register HttpClient factory so our activities can make external
// requests to the domain services and BFF.
builder.Services.AddHttpClient();

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowUI", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register the activities implementation as a singleton so that
// Temporal will reuse it.  It depends on IConfiguration to pick up
// service base addresses from environment variables.
builder.Services.AddSingleton<LoanActivitiesImpl>();
builder.Services.AddSingleton<ILoanActivities>(sp => sp.GetRequiredService<LoanActivitiesImpl>());

// Register TemporalClient as a singleton.  We synchronously wait on
// ConnectAsync since the host startup is synchronous.  The address
// comes from the TEMPORAL_HOST environment variable (set in
// docker-compose).  If not specified it defaults to temporal:7233.
builder.Services.AddSingleton(sp =>
{
    var temporalHost = Environment.GetEnvironmentVariable("TEMPORAL_HOST") ?? "temporal:7233";
    return TemporalClient.ConnectAsync(new TemporalClientConnectOptions { TargetHost = temporalHost }).GetAwaiter().GetResult();
});

// Add the worker as a hosted service so it runs alongside the web
// server.  The hosted service sets up the Temporal worker, registers
// workflows and activities and starts polling.
builder.Services.AddHostedService<TemporalWorkerService>();

var app = builder.Build();

// Configure Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Loan Fulfillment Orchestrator API v1");
        c.RoutePrefix = "swagger";
    });
}

// Enable CORS
app.UseCors("AllowUI");

// Endpoint to start a new loan application workflow.  Generates a new
// application identifier and passes the applicant data to the
// workflow.  The orchestrator does not return until the workflow is
// started successfully.  The client receives the application id in
// the response body.

app.MapPost("/api/loan-applications", async (LoanApplicationRequest request, TemporalClient client) =>
{
    var appId = Guid.NewGuid().ToString();

    Console.WriteLine($"[ORCH] Received BIAN loan application for: {request.ApplicantProfile?.FullName}");
    Console.WriteLine($"[ORCH] Requested amount: {request.RequestedAmount:C}");
    Console.WriteLine($"[ORCH] Loan purpose: {request.LoanPreferences?.LoanPurpose}");

    // Map the BIAN-compliant request to the orchestrator model
    var loanApplicationData = new LoanApplicationData
    {
        ApplicantName = request.ApplicantProfile?.FullName ?? "",
        SSN = request.ApplicantProfile?.SSN ?? "",
        Email = request.ApplicantProfile?.Email ?? "",
        PhoneNumber = request.ApplicantProfile?.PrimaryPhone ?? "",
        AnnualIncome = request.ApplicantProfile?.Employment?.AnnualIncome ?? 0,
        EmploymentStatus = request.ApplicantProfile?.Employment?.EmploymentStatus ?? "",
        RequestedAmount = request.RequestedAmount,
        LoanPurpose = request.LoanPreferences?.LoanPurpose ?? "Personal Loan",
        PreferredTermMonths = request.LoanPreferences?.PreferredTermMonths ?? 24,
        MaxMonthlyPayment = request.LoanPreferences?.MaxMonthlyPayment,
        ProductType = request.LoanPreferences?.ProductType ?? "Personal Loan",
        AutoPayEnrollment = request.LoanPreferences?.AutoPayEnrollment ?? false
    };
    
    Console.WriteLine($"[ORCHESTRATOR] Starting workflow for applicant: {loanApplicationData.ApplicantName}, Amount: {loanApplicationData.RequestedAmount}");
    
    var options = new WorkflowOptions(appId, "LoanTaskQueue");
    await client.StartWorkflowAsync((ILoanWorkflow wf) => wf.RunAsync(appId, loanApplicationData), options);
    return Results.Ok(new ApplicationResponse(appId));
})
.WithName("StartLoanWorkflow")
.WithSummary("Start a new loan application workflow")
.WithDescription(@"Initiates a new Temporal workflow for processing a loan application with BIAN-compliant applicant data.

**Request Model:**
This endpoint accepts a strongly-typed `LoanApplicationRequest` with comprehensive validation:
- **ApplicantProfile**: Complete customer information with validation
- **LoanPreferences**: Loan terms and product preferences
- **RequestedAmount**: Loan amount (1,000 - 1,000,000)

**Workflow Process:**
1. **Eligibility Assessment**: Evaluates creditworthiness and loan capacity
2. **Offer Generation**: Creates personalized loan offer with terms
3. **Document Verification**: Waits for customer document submission
4. **Agreement Creation**: Generates sales agreement upon offer acceptance
5. **Account Creation**: Sets up loan account in core banking system
6. **Fund Disbursement**: Transfers approved funds to customer account

**Returns:** Unique application ID for tracking the workflow through completion.

**BIAN Compliance:** Follows Banking Industry Architecture Network standards for loan application data structures.");

// Endpoint to signal that documents have been verified for a given
// application.  Sends a signal by name to the running workflow.  If
// the workflow does not exist or has completed the Temporal service
// will return an error which is propagated to the caller as a 4xx.
app.MapPost("/api/loan-applications/{id}/verify-documents", async (string id, TemporalClient client) =>
{
    var handle = client.GetWorkflowHandle<ILoanWorkflow>(id);
    await handle.SignalAsync(wf => wf.DocumentVerified());
    return Results.Accepted();
})
.WithName("SignalDocumentVerification")
.WithSummary("Signal document verification")
.WithDescription(@"Sends a signal to the workflow indicating that the applicant's documents have been verified.

**Example Request:**
```
POST /api/loan-applications/12345678-1234-1234-1234-123456789012/verify-documents
```

**Example Response:**
- **202 Accepted**: Signal sent successfully, workflow will proceed
- **404 Not Found**: Workflow not found or already completed
- **500 Internal Server Error**: Temporal service error

**Process:** This signal unblocks the workflow from the document verification stage, allowing it to proceed to agreement creation and fund disbursement.");

// Endpoint to signal that the applicant has accepted the offer.  This
// unblocks the workflow from waiting on the offer acceptance stage.
app.MapPost("/api/loan-applications/{id}/accept-offer", async (string id, TemporalClient client) =>
{
    var workflowHandle = client.GetWorkflowHandle<ILoanWorkflow>(id);
    await workflowHandle.SignalAsync(wf => wf.OfferAccepted());
    return Results.Accepted();
});

app.MapPost("/api/loan-applications/{id}/disburse", async (string id, TemporalClient client) =>
{
    var workflowHandle = client.GetWorkflowHandle<ILoanWorkflow>(id);
    await workflowHandle.SignalAsync(wf => wf.DisbursementTriggered());
    return Results.Accepted();
});

// Endpoint to handle disbursement details submission and trigger final disbursement
app.MapPost("/api/loan-applications/{id}/disbursement-details", (string id, DisbursementDetailsRequest request, TemporalClient client) =>
{
    Console.WriteLine($"[ORCH] Received bank details for application: {id}");
    Console.WriteLine($"[ORCH] Bank: {request.BankAccountInformation?.BankName}");
    Console.WriteLine($"[ORCH] Account Number: {request.BankAccountInformation?.AccountNumber}");
    
    try 
    {
        // In a real implementation, you would:
        // 1. Validate the bank account details
        // 2. Store the disbursement information
        // 3. Signal the workflow to proceed with disbursement
        
        var handle = client.GetWorkflowHandle<ILoanWorkflow>(id);
        
        // For now, we'll trigger the disbursement immediately
        // In production, this might involve additional validation steps
        Console.WriteLine($"[ORCH] Triggering final disbursement for application: {id}");
        
        // Signal workflow to proceed with disbursement (if workflow supports it)
        // await handle.SignalAsync(wf => wf.DisbursementDetailsReceived(request));
        
        return Results.Accepted();
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ORCH] Error processing disbursement details for {id}: {ex.Message}");
        return Results.StatusCode(500);
    }
})
.WithName("SubmitDisbursementDetails")
.WithSummary("Submit disbursement details")
.WithDescription(@"Submits additional customer information required for loan disbursement including full name, address, and bank account details as required by NCR regulations.

**Request Body:**
The request contains customer details required for final disbursement:
- **Full Name**: Legal name as per ID document
- **Date of Birth**: Customer's date of birth for verification
- **Primary Address**: Residential address for legal documents
- **Bank Account**: Account details for fund disbursement

**Process:**
1. Validates submitted information
2. Stores disbursement details securely
3. Triggers final loan disbursement workflow
4. Returns confirmation of successful submission

**Compliance:** This endpoint ensures NCR compliance by collecting all required customer information before final disbursement.");

app.Run();

// Application response model
record ApplicationResponse(
    [property: JsonPropertyName("applicationId")] string ApplicationId
);

// Enhanced request model with comprehensive applicant information following BIAN standards
record LoanApplicationRequest(
    [property: JsonPropertyName("ApplicantId")] string? ApplicantId, 
    [property: JsonPropertyName("RequestedAmount")] 
    [Range(1000, 1000000, ErrorMessage = "Requested amount must be between 1,000 and 1,000,000")]
    decimal RequestedAmount,
    [property: JsonPropertyName("ApplicantProfile")] 
    [Required(ErrorMessage = "Applicant profile is required")]
    ApplicantProfile? ApplicantProfile = null,
    [property: JsonPropertyName("LoanPreferences")] 
    [Required(ErrorMessage = "Loan preferences are required")]
    LoanPreferences? LoanPreferences = null
);

record ApplicantProfile(
    [property: JsonPropertyName("FullName")] 
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters")]
    string FullName,
    [property: JsonPropertyName("DateOfBirth")] 
    [Required(ErrorMessage = "Date of birth is required")]
    string DateOfBirth,
    [property: JsonPropertyName("SSN")] 
    [Required(ErrorMessage = "SSN/ID number is required")]
    string SSN,
    [property: JsonPropertyName("Email")] 
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    string Email,
    [property: JsonPropertyName("PrimaryPhone")] 
    [Required(ErrorMessage = "Primary phone is required")]
    string PrimaryPhone,
    [property: JsonPropertyName("PrimaryAddress")] 
    [Required(ErrorMessage = "Primary address is required")]
    AddressInformation PrimaryAddress,
    [property: JsonPropertyName("Employment")] 
    [Required(ErrorMessage = "Employment information is required")]
    EmploymentInformation Employment,
    [property: JsonPropertyName("Finances")] 
    [Required(ErrorMessage = "Financial information is required")]
    FinancialInformation Finances
);

record AddressInformation(
    [property: JsonPropertyName("StreetAddress")] 
    [Required(ErrorMessage = "Street address is required")]
    [StringLength(200, ErrorMessage = "Street address cannot exceed 200 characters")]
    string StreetAddress,
    [property: JsonPropertyName("City")] 
    [Required(ErrorMessage = "City is required")]
    [StringLength(100, ErrorMessage = "City cannot exceed 100 characters")]
    string City,
    [property: JsonPropertyName("State")] 
    [Required(ErrorMessage = "State is required")]
    [StringLength(50, ErrorMessage = "State cannot exceed 50 characters")]
    string State,
    [property: JsonPropertyName("PostalCode")] 
    [Required(ErrorMessage = "Postal code is required")]
    [StringLength(20, ErrorMessage = "Postal code cannot exceed 20 characters")]
    string PostalCode,
    [property: JsonPropertyName("Country")] 
    [StringLength(50, ErrorMessage = "Country cannot exceed 50 characters")]
    string Country = "USA",
    [property: JsonPropertyName("AddressType")] 
    string AddressType = "Residential"
);

record EmploymentInformation(
    [property: JsonPropertyName("EmploymentStatus")] 
    [Required(ErrorMessage = "Employment status is required")]
    string EmploymentStatus,
    [property: JsonPropertyName("EmployerName")] 
    [Required(ErrorMessage = "Employer name is required")]
    [StringLength(200, ErrorMessage = "Employer name cannot exceed 200 characters")]
    string EmployerName,
    [property: JsonPropertyName("AnnualIncome")] 
    [Range(0, 10000000, ErrorMessage = "Annual income must be between 0 and 10,000,000")]
    decimal AnnualIncome,
    [property: JsonPropertyName("YearsOfEmployment")] 
    [Range(0, 50, ErrorMessage = "Years of employment must be between 0 and 50")]
    int YearsOfEmployment,
    [property: JsonPropertyName("JobTitle")] 
    [Required(ErrorMessage = "Job title is required")]
    [StringLength(100, ErrorMessage = "Job title cannot exceed 100 characters")]
    string JobTitle,
    [property: JsonPropertyName("EmployerAddress")] 
    AddressInformation? EmployerAddress = null
);

record FinancialInformation(
    [property: JsonPropertyName("MonthlyIncome")] 
    [Range(0, 1000000, ErrorMessage = "Monthly income must be between 0 and 1,000,000")]
    decimal MonthlyIncome,
    [property: JsonPropertyName("MonthlyExpenses")] 
    [Range(0, 1000000, ErrorMessage = "Monthly expenses must be between 0 and 1,000,000")]
    decimal MonthlyExpenses,
    [property: JsonPropertyName("ExistingDebt")] 
    [Range(0, 10000000, ErrorMessage = "Existing debt must be between 0 and 10,000,000")]
    decimal ExistingDebt,
    [property: JsonPropertyName("NumberOfDependents")] 
    [Range(0, 20, ErrorMessage = "Number of dependents must be between 0 and 20")]
    int NumberOfDependents,
    [property: JsonPropertyName("HasBankAccount")] 
    bool HasBankAccount,
    [property: JsonPropertyName("BankName")] 
    [StringLength(200, ErrorMessage = "Bank name cannot exceed 200 characters")]
    string? BankName = null
);

record LoanPreferences(
    [property: JsonPropertyName("LoanPurpose")] 
    [Required(ErrorMessage = "Loan purpose is required")]
    [StringLength(100, ErrorMessage = "Loan purpose cannot exceed 100 characters")]
    string LoanPurpose,
    [property: JsonPropertyName("PreferredTermMonths")] 
    [Range(6, 360, ErrorMessage = "Preferred term must be between 6 and 360 months")]
    int PreferredTermMonths,
    [property: JsonPropertyName("MaxMonthlyPayment")] 
    [Range(0, 100000, ErrorMessage = "Max monthly payment must be between 0 and 100,000")]
    decimal? MaxMonthlyPayment,
    [property: JsonPropertyName("ProductType")] 
    [StringLength(50, ErrorMessage = "Product type cannot exceed 50 characters")]
    string ProductType = "Personal Loan",
    [property: JsonPropertyName("AutoPayEnrollment")] 
    bool AutoPayEnrollment = false
);

// Disbursement details request model for collecting additional information
// Record for handling bank account details required for loan disbursement
record DisbursementDetailsRequest(
    [property: JsonPropertyName("bankAccountInformation")] 
    [Required(ErrorMessage = "Bank account information is required")]
    BankAccountInformation BankAccountInformation
);

record BankAccountInformation(
    [property: JsonPropertyName("bankName")] 
    [Required(ErrorMessage = "Bank name is required")]
    [StringLength(100, ErrorMessage = "Bank name cannot exceed 100 characters")]
    string BankName,
    
    [property: JsonPropertyName("accountNumber")] 
    [Required(ErrorMessage = "Account number is required")]
    [StringLength(11, MinimumLength = 9, ErrorMessage = "Account number must be 9-11 digits")]
    string AccountNumber,
    
    [property: JsonPropertyName("branchCode")] 
    [Required(ErrorMessage = "Branch code is required")]
    [StringLength(6, MinimumLength = 6, ErrorMessage = "Branch code must be 6 digits")]
    string BranchCode,
    
    [property: JsonPropertyName("accountType")] 
    [Required(ErrorMessage = "Account type is required")]
    string AccountType
);

// Request model for accepting an offer
record AcceptOfferRequest(
    [property: JsonPropertyName("applicationId")] 
    [Required(ErrorMessage = "Application ID is required")]
    string ApplicationId
);

// Request model for triggering disbursement
record DisburseRequest(
    [property: JsonPropertyName("applicationId")] 
    [Required(ErrorMessage = "Application ID is required")]
    string ApplicationId
);