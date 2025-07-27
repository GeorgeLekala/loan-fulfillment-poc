using System.Collections.Concurrent;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Hosting;
using Microsoft.OpenApi.Models;

// This service acts as a backend‑for‑frontend (BFF) for the React UI.
// It proxies requests to the orchestrator to start workflows and
// deliver signals.  It also exposes a server‑sent events (SSE)
// endpoint that streams workflow status updates to the UI.  Events are
// enqueued by the orchestrator via the internal /internal/notify
// endpoint.

var builder = WebApplication.CreateBuilder(args);

// Add Swagger/OpenAPI services
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "Loan Fulfillment BFF API", 
        Version = "v1",
        Description = @"**Backend-for-Frontend API for the Loan Fulfillment System**

This service acts as the primary interface between the React UI and the backend microservices. It provides:

- **Loan Application Management**: Create and track loan applications
- **Real-time Updates**: Server-Sent Events for workflow progress monitoring  
- **Document Verification**: Signal document completion to workflow
- **Offer Management**: Accept loan offers and proceed with application
- **BIAN Compliance**: Banking Industry Architecture Network compliant data structures

**Architecture:**
- Proxies requests to the Temporal-based orchestrator
- Maintains event queues for real-time UI updates
- Handles BIAN-compliant loan applications with comprehensive data models
- Supports concurrent client connections via SSE

**Base URL:** `http://localhost:5001`

**Real-time Events:** Connect to `/api/loan-applications/{id}/events` for live workflow updates"
    });
});

// Allow CORS so that the UI (served on port 3000) can call this API.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin();
        policy.AllowAnyHeader();
        policy.AllowAnyMethod();
    });
});

// Register a singleton event queue manager.  Each application id
// maintains its own queue of workflow events.
builder.Services.AddSingleton<EventQueue>();

var app = builder.Build();
app.UseCors();

// Configure Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Loan Fulfillment BFF API v1");
        c.RoutePrefix = "swagger";
    });
}

// Get orchestrator base URL from environment or default to the
// orchestrator service name.  This value is captured into the
// delegates below.
var orchestratorBaseUrl = Environment.GetEnvironmentVariable("ORCHESTRATOR_URL") ?? "http://orchestrator:5002";

// Start a new loan application.  The request body contains the
// comprehensive applicant data.  The BFF forwards this to the
// orchestrator and returns the generated application id to the
// frontend.  Any errors from the orchestrator (for example if
// Temporal is unavailable) propagate to the caller.
app.MapPost("/api/loan-applications", async (HttpContext context) =>
{
    // Read raw JSON to debug what we're actually receiving
    var body = await new StreamReader(context.Request.Body).ReadToEndAsync();
    Console.WriteLine($"[BFF] Raw JSON received: {body}");
    
    try {
        // Manually deserialize with options to see what happens
        var request = JsonSerializer.Deserialize<LoanApplicationRequest>(body, new JsonSerializerOptions 
        { 
            PropertyNameCaseInsensitive = true,
            WriteIndented = true 
        });
        
        Console.WriteLine($"[BFF] Deserialized request: {JsonSerializer.Serialize(request, new JsonSerializerOptions { WriteIndented = true })}");
        
        using var http = new HttpClient { BaseAddress = new Uri(orchestratorBaseUrl) };
        var response = await http.PostAsJsonAsync("/api/loan-applications", request);
        if (!response.IsSuccessStatusCode)
        {
            return Results.StatusCode((int)response.StatusCode);
        }
        var result = await response.Content.ReadFromJsonAsync<JsonElement>();
        return Results.Ok(result);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[BFF] Deserialization error: {ex.Message}");
        Console.WriteLine($"[BFF] Stack trace: {ex.StackTrace}");
        return Results.BadRequest($"Invalid request format: {ex.Message}");
    }
})
.WithName("CreateLoanApplication")
.WithSummary("Create a new loan application")
.WithDescription(@"Submits a new loan application with comprehensive applicant details following BIAN standards.

**Example Request:**
```json
{
  ""ApplicantId"": ""CUST-123456"",
  ""RequestedAmount"": 50000,
  ""ApplicantProfile"": {
    ""FullName"": ""John Smith"",
    ""DateOfBirth"": ""1985-01-01T00:00:00Z"",
    ""SSN"": ""8501015009087"",
    ""Email"": ""john.smith@email.com"",
    ""PrimaryPhone"": ""+27821234567"",
    ""PrimaryAddress"": {
      ""StreetAddress"": ""123 Main Street"",
      ""City"": ""Cape Town"",
      ""State"": ""Western Cape"",
      ""PostalCode"": ""8001"",
      ""Country"": ""ZAF"",
      ""AddressType"": ""Residential""
    },
    ""Employment"": {
      ""EmploymentStatus"": ""Permanent"",
      ""EmployerName"": ""ABC Company"",
      ""AnnualIncome"": 180000,
      ""YearsOfEmployment"": 5,
      ""JobTitle"": ""Software Developer""
    },
    ""Finances"": {
      ""MonthlyIncome"": 15000,
      ""MonthlyExpenses"": 8000,
      ""ExistingDebt"": 25000,
      ""NumberOfDependents"": 2,
      ""HasBankAccount"": true,
      ""BankName"": ""Standard Bank""
    }
  },
  ""LoanPreferences"": {
    ""LoanPurpose"": ""Debt Consolidation"",
    ""PreferredTermMonths"": 36,
    ""MaxMonthlyPayment"": 2500,
    ""ProductType"": ""Personal Loan"",
    ""AutoPayEnrollment"": false
  }
}
```

**Example Response:**
```json
{
  ""applicationId"": ""12345678-1234-1234-1234-123456789012""
}
```

**BIAN Compliance:** This endpoint follows Banking Industry Architecture Network standards with structured data separation for customer profiles, financial assessment, and loan preferences.");

// Forward a document verification signal to the orchestrator.  Returns
// 202 Accepted on success.
app.MapPost("/api/loan-applications/{id}/verify-documents", async (string id) =>
{
    using var http = new HttpClient { BaseAddress = new Uri(orchestratorBaseUrl) };
    var response = await http.PostAsync($"/api/loan-applications/{id}/verify-documents", null);
    return Results.StatusCode((int)response.StatusCode);
})
.WithName("VerifyDocuments")
.WithSummary("Verify documents for a loan application")
.WithDescription("Signals the workflow that documents have been verified for the specified loan application.");

// Forward an offer acceptance signal to the orchestrator.
app.MapPost("/api/loan-applications/{id}/accept-offer", async (string id) =>
{
    using var http = new HttpClient { BaseAddress = new Uri(orchestratorBaseUrl) };
    var response = await http.PostAsync($"/api/loan-applications/{id}/accept-offer", null);
    return Results.StatusCode((int)response.StatusCode);
})
.WithName("AcceptOffer")
.WithSummary("Accept a loan offer")
.WithDescription("Signals the workflow that the loan offer has been accepted for the specified application.");

// SSE endpoint to stream workflow events to the UI.  The endpoint
// holds the connection open and writes events as they are enqueued.  If
// the connection is closed or aborted the loop terminates.  Each
// event is encoded as JSON and prefixed with "data: " per the SSE
// specification.
app.MapGet("/api/loan-applications/{id}/events", async (HttpContext context, string id, EventQueue queue) =>
{
    context.Response.Headers["Cache-Control"] = "no-cache";
    context.Response.Headers["Content-Type"] = "text/event-stream";
    var q = queue.GetQueue(id);
    var cancellationToken = context.RequestAborted;
    while (!cancellationToken.IsCancellationRequested)
    {
        while (q.TryDequeue(out var evt))
        {
            var json = JsonSerializer.Serialize(evt);
            Console.WriteLine($"[BFF] Sending event to UI for {id}: {json}");
            await context.Response.WriteAsync($"data: {json}\n\n", cancellationToken);
            await context.Response.Body.FlushAsync(cancellationToken);
        }
        await Task.Delay(250, cancellationToken);
    }
})
.WithName("GetApplicationEvents")
.WithSummary("Get real-time application events")
.WithDescription("Server-Sent Events endpoint that streams workflow status updates for the specified loan application.")
.ExcludeFromDescription(); // SSE endpoints don't work well in Swagger UI

// Internal endpoint called by the orchestrator to publish events.  The
// request body contains the stage and optional data payload.  Events
// are queued under the application id and delivered to connected
// clients via SSE.  This endpoint is not exposed to the UI.
app.MapPost("/internal/notify/{id}", async (string id, HttpContext context, EventQueue queue) =>
{
    var evt = await context.Request.ReadFromJsonAsync<WorkflowEvent>();
    if (evt is not null)
    {
        Console.WriteLine($"[BFF] Received event for {id}: Stage={evt.Stage}, Data={JsonSerializer.Serialize(evt.Data)}");
        queue.Enqueue(id, evt);
    }
    return Results.Accepted();
});

app.Run();

// Enhanced request model with comprehensive applicant information following BIAN standards
record LoanApplicationRequest(
    [property: JsonPropertyName("ApplicantId")] string? ApplicantId, 
    [property: JsonPropertyName("RequestedAmount")] decimal RequestedAmount,
    [property: JsonPropertyName("ApplicantProfile")] ApplicantProfile? ApplicantProfile = null,
    [property: JsonPropertyName("LoanPreferences")] LoanPreferences? LoanPreferences = null
);

record ApplicantProfile(
    [property: JsonPropertyName("FullName")] string FullName,
    [property: JsonPropertyName("DateOfBirth")] string DateOfBirth,
    [property: JsonPropertyName("SSN")] string SSN,
    [property: JsonPropertyName("Email")] string Email,
    [property: JsonPropertyName("PrimaryPhone")] string PrimaryPhone,
    [property: JsonPropertyName("PrimaryAddress")] AddressInformation PrimaryAddress,
    [property: JsonPropertyName("Employment")] EmploymentInformation Employment,
    [property: JsonPropertyName("Finances")] FinancialInformation Finances
);

record AddressInformation(
    [property: JsonPropertyName("StreetAddress")] string StreetAddress,
    [property: JsonPropertyName("City")] string City,
    [property: JsonPropertyName("State")] string State,
    [property: JsonPropertyName("PostalCode")] string PostalCode,
    [property: JsonPropertyName("Country")] string Country = "USA",
    [property: JsonPropertyName("AddressType")] string AddressType = "Residential"
);

record EmploymentInformation(
    [property: JsonPropertyName("EmploymentStatus")] string EmploymentStatus,
    [property: JsonPropertyName("EmployerName")] string EmployerName,
    [property: JsonPropertyName("AnnualIncome")] decimal AnnualIncome,
    [property: JsonPropertyName("YearsOfEmployment")] int YearsOfEmployment,
    [property: JsonPropertyName("JobTitle")] string JobTitle,
    [property: JsonPropertyName("EmployerAddress")] AddressInformation? EmployerAddress = null
);

record FinancialInformation(
    [property: JsonPropertyName("MonthlyIncome")] decimal MonthlyIncome,
    [property: JsonPropertyName("MonthlyExpenses")] decimal MonthlyExpenses,
    [property: JsonPropertyName("ExistingDebt")] decimal ExistingDebt,
    [property: JsonPropertyName("NumberOfDependents")] int NumberOfDependents,
    [property: JsonPropertyName("HasBankAccount")] bool HasBankAccount,
    [property: JsonPropertyName("BankName")] string? BankName = null
);

record LoanPreferences(
    [property: JsonPropertyName("LoanPurpose")] string LoanPurpose,
    [property: JsonPropertyName("PreferredTermMonths")] int PreferredTermMonths,
    [property: JsonPropertyName("MaxMonthlyPayment")] decimal? MaxMonthlyPayment,
    [property: JsonPropertyName("ProductType")] string ProductType = "Personal Loan",
    [property: JsonPropertyName("AutoPayEnrollment")] bool AutoPayEnrollment = false
);

// Event model representing a workflow milestone.  The Data property is
// defined as JsonElement so that arbitrary payloads can be
// deserialised without a concrete type.  The BFF does not inspect
// the payload – it simply relays it to the UI.
record WorkflowEvent
{
    [JsonPropertyName("stage")]
    public string Stage { get; set; } = default!;
    
    [JsonPropertyName("data")]
    public JsonElement? Data { get; set; }
}

// Internal helper managing event queues.  Each application id maps to
// a concurrent queue of events.  Multiple clients can poll the same
// queue concurrently and will each receive all events.  Queues are
// created lazily on demand.
class EventQueue
{
    private readonly ConcurrentDictionary<string, ConcurrentQueue<WorkflowEvent>> _queues = new();

    public ConcurrentQueue<WorkflowEvent> GetQueue(string id) => _queues.GetOrAdd(id, _ => new ConcurrentQueue<WorkflowEvent>());

    public void Enqueue(string id, WorkflowEvent evt)
    {
        var queue = GetQueue(id);
        queue.Enqueue(evt);
    }
}