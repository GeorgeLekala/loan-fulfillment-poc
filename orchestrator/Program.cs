using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;
using System;
using System.Text.Json;
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

app.MapPost("/api/loan-applications", async (JsonElement input, TemporalClient client) =>
{
    var appId = Guid.NewGuid().ToString();

    Console.WriteLine($"[ORCH] Deserialized request: {JsonSerializer.Serialize(input, new JsonSerializerOptions { WriteIndented = true })}");

    // Map the BIAN-compliant request to the orchestrator model
    var applicantProfile = input.GetProperty("ApplicantProfile");
    var employment = applicantProfile.GetProperty("Employment");
    var finances = applicantProfile.GetProperty("Finances");
    var loanPreferences = input.GetProperty("LoanPreferences");
    
    var loanApplicationData = new LoanApplicationData
    {
        ApplicantName = applicantProfile.GetProperty("FullName").GetString() ?? "",
        SSN = applicantProfile.GetProperty("SSN").GetString() ?? "",
        Email = applicantProfile.GetProperty("Email").GetString() ?? "",
        PhoneNumber = applicantProfile.GetProperty("PrimaryPhone").GetString() ?? "",
        AnnualIncome = employment.GetProperty("AnnualIncome").GetDecimal(),
        EmploymentStatus = employment.GetProperty("EmploymentStatus").GetString() ?? "",
        RequestedAmount = input.GetProperty("RequestedAmount").GetDecimal(),
        LoanPurpose = loanPreferences.GetProperty("LoanPurpose").GetString() ?? "Personal Loan",
        PreferredTermMonths = loanPreferences.GetProperty("PreferredTermMonths").GetInt32(),
        MaxMonthlyPayment = loanPreferences.TryGetProperty("MaxMonthlyPayment", out var maxPayment) && 
                          maxPayment.ValueKind != JsonValueKind.Null ? 
                          maxPayment.GetDecimal() : null,
        ProductType = loanPreferences.GetProperty("ProductType").GetString() ?? "Personal Loan",
        AutoPayEnrollment = loanPreferences.GetProperty("AutoPayEnrollment").GetBoolean()
    };
    
    Console.WriteLine($"[ORCHESTRATOR] Starting workflow for applicant: {loanApplicationData.ApplicantName}, Amount: {loanApplicationData.RequestedAmount}");
    
    var options = new WorkflowOptions(appId, "LoanTaskQueue");
    await client.StartWorkflowAsync((ILoanWorkflow wf) => wf.RunAsync(appId, loanApplicationData), options);
    return Results.Ok(new { applicationId = appId });
})
.WithName("StartLoanWorkflow")
.WithSummary("Start a new loan application workflow")
.WithDescription(@"Initiates a new Temporal workflow for processing a loan application with the provided applicant data.

**Example Request:**
```json
{
  ""FullName"": ""John Smith"",
  ""IdNumber"": ""8501015009087"",
  ""EmailAddress"": ""john.smith@email.com"",
  ""MobileNumber"": ""+27821234567"",
  ""MonthlyIncome"": 15000,
  ""EmploymentType"": ""Permanent"",
  ""RequestedAmount"": 50000,
  ""MaxMonthlyPayment"": 2500
}
```

**Example Response:**
```json
{
  ""applicationId"": ""12345678-1234-1234-1234-123456789012""
}
```

**Workflow Process:**
1. **Eligibility Assessment**: Evaluates creditworthiness and loan capacity
2. **Offer Generation**: Creates personalized loan offer with terms
3. **Document Verification**: Waits for customer document submission
4. **Agreement Creation**: Generates sales agreement upon offer acceptance
5. **Account Creation**: Sets up loan account in core banking system
6. **Fund Disbursement**: Transfers approved funds to customer account

**Returns:** Unique application ID for tracking the workflow through completion.");

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
    var handle = client.GetWorkflowHandle<ILoanWorkflow>(id);
    await handle.SignalAsync(wf => wf.OfferAccepted());
    return Results.Accepted();
})
.WithName("SignalOfferAcceptance")
.WithSummary("Signal offer acceptance")
.WithDescription(@"Sends a signal to the workflow indicating that the applicant has accepted the loan offer.

**Example Request:**
```
POST /api/loan-applications/12345678-1234-1234-1234-123456789012/accept-offer
```

**Example Response:**
- **202 Accepted**: Signal sent successfully, workflow will proceed to next stage
- **404 Not Found**: Workflow not found or already completed  
- **500 Internal Server Error**: Temporal service error

**Process:** This signal transitions the workflow from the offer review stage to agreement creation, account setup, and fund disbursement stages.");

app.Run();