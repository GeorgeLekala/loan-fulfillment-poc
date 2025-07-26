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
        Description = "Temporal workflow orchestrator for managing loan application lifecycles and coordinating microservices."
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
    
    // Map the comprehensive BFF request to the simpler orchestrator model
    var loanApplicationData = new LoanApplicationData
    {
        ApplicantName = input.GetProperty("applicantProfile").GetProperty("fullName").GetString() ?? "",
        SSN = input.GetProperty("applicantProfile").GetProperty("ssn").GetString() ?? "",
        Email = input.GetProperty("applicantProfile").GetProperty("email").GetString() ?? "",
        PhoneNumber = input.GetProperty("applicantProfile").GetProperty("primaryPhone").GetString() ?? "",
        AnnualIncome = input.GetProperty("applicantProfile").GetProperty("employment").GetProperty("annualIncome").GetDecimal(),
        EmploymentStatus = input.GetProperty("applicantProfile").GetProperty("employment").GetProperty("employmentStatus").GetString() ?? "",
        RequestedAmount = input.GetProperty("requestedAmount").GetDecimal(),
        LoanPurpose = input.GetProperty("loanPreferences").GetProperty("loanPurpose").GetString() ?? "",
        PreferredTermMonths = input.GetProperty("loanPreferences").GetProperty("preferredTermMonths").GetInt32(),
        MaxMonthlyPayment = input.TryGetProperty("loanPreferences", out var loanPrefs) && 
                          loanPrefs.TryGetProperty("maxMonthlyPayment", out var maxPayment) && 
                          maxPayment.ValueKind != JsonValueKind.Null ? 
                          maxPayment.GetDecimal() : null,
        ProductType = input.GetProperty("loanPreferences").GetProperty("productType").GetString(),
        AutoPayEnrollment = input.GetProperty("loanPreferences").GetProperty("autoPayEnrollment").GetBoolean()
    };
    
    Console.WriteLine($"[ORCHESTRATOR] Starting workflow for applicant: {loanApplicationData.ApplicantName}, Amount: {loanApplicationData.RequestedAmount}");
    
    var options = new WorkflowOptions(appId, "LoanTaskQueue");
    await client.StartWorkflowAsync((ILoanWorkflow wf) => wf.RunAsync(appId, loanApplicationData), options);
    return Results.Ok(new { applicationId = appId });
})
.WithName("StartLoanWorkflow")
.WithSummary("Start a new loan application workflow")
.WithDescription("Initiates a new Temporal workflow for processing a loan application with the provided applicant data.");

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
.WithDescription("Sends a signal to the workflow indicating that the applicant's documents have been verified.");

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
.WithDescription("Sends a signal to the workflow indicating that the applicant has accepted the loan offer.");

app.Run();