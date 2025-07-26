using System;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Temporalio.Activities;

namespace LoanFulfilment.Orchestrator
{
    // Interface defining all activities used by the loan workflow.  Each
    // activity corresponds to an external call or side effect.  The
    // Temporal worker will generate stubs from this interface when
    // invoked from the workflow.
    public interface ILoanActivities
    {
        Task<EligibilityResult> CheckEligibilityAsync(LoanApplicationData input);
        Task<LoanOffer> GenerateOfferAsync(EligibilityResult eligibility, LoanApplicationData input);
        Task PublishEventAsync(string applicationId, string stage, object? data);
        Task<AgreementResult> CreateProductAgreementAsync(LoanOffer offer);
        Task<LoanAccountResult> CreateLoanAccountAsync(AgreementResult agreement);
        Task<PaymentResult> ExecuteDisbursementAsync(LoanAccountResult account);
    }

    // Implementation of the activities.  The base addresses for the
    // domain services and BFF are read from configuration (via
    // environment variables configured in docker-compose).  Each
    // activity makes an HTTP request and deserialises the JSON result.
    public class LoanActivitiesImpl : ILoanActivities
    {
        private readonly HttpClient _eligibilityClient;
        private readonly HttpClient _offerClient;
        private readonly HttpClient _agreementClient;
        private readonly HttpClient _loanClient;
        private readonly HttpClient _paymentClient;
        private readonly HttpClient _bffClient;

        public LoanActivitiesImpl(IHttpClientFactory httpClientFactory, IConfiguration config)
        {
            // Resolve base addresses from configuration or use sensible
            // defaults.  The defaults correspond to the Docker
            // Compose service names.
            var eligibilityBase = config["ELIGIBILITY_SERVICE_URL"] ?? "http://eligibility-service";
            var offerBase = config["CUSTOMER_OFFER_SERVICE_URL"] ?? "http://customer-offer-service";
            var agreementBase = config["SALES_AGREEMENT_SERVICE_URL"] ?? "http://sales-agreement-service";
            var loanBase = config["CONSUMER_LOAN_SERVICE_URL"] ?? "http://consumer-loan-service";
            var paymentBase = config["PAYMENT_ORDER_SERVICE_URL"] ?? "http://payment-order-service";
            var bffBase = config["BFF_INTERNAL_URL"] ?? "http://bff";

            _eligibilityClient = new HttpClient { BaseAddress = new Uri(eligibilityBase) };
            _offerClient = new HttpClient { BaseAddress = new Uri(offerBase) };
            _agreementClient = new HttpClient { BaseAddress = new Uri(agreementBase) };
            _loanClient = new HttpClient { BaseAddress = new Uri(loanBase) };
            _paymentClient = new HttpClient { BaseAddress = new Uri(paymentBase) };
            _bffClient = new HttpClient { BaseAddress = new Uri(bffBase) };
        }

        // Call the eligibility service with the applicant's information.
        [Activity]
        public async Task<EligibilityResult> CheckEligibilityAsync(LoanApplicationData input)
        {
            var request = new 
            { 
                input.ApplicantId, 
                RequestedAmount = input.RequestedAmount,
                ApplicantProfile = new
                {
                    AnnualIncome = input.AnnualIncome,
                    EmploymentStatus = input.EmploymentStatus
                }
            };
            var response = await _eligibilityClient.PostAsJsonAsync("/eligibility-assessments", request);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<EligibilityResult>();
            return result ?? throw new ApplicationException("Eligibility service returned null");
        }

        // Call the customer offer service to generate an offer based on
        // the eligibility outcome.
        [Activity]
        public async Task<LoanOffer> GenerateOfferAsync(EligibilityResult eligibility, LoanApplicationData input)
        {
            var offerRequest = new
            {
                ApplicantId = input.SSN, // Use SSN as applicant identifier
                Amount = input.RequestedAmount, // Use the requested amount from the application
                Preferences = new
                {
                    PreferredTermMonths = input.PreferredTermMonths,
                    MaxMonthlyPayment = input.MaxMonthlyPayment,
                    LoanPurpose = input.LoanPurpose,
                    ProductType = input.ProductType ?? "Personal Loan",
                    AutoPayEnrollment = input.AutoPayEnrollment,
                    RateType = "Fixed"
                },
                EligibilityData = new
                {
                    EligibilityReference = eligibility.EligibilityReference,
                    CreditScore = eligibility.Assessment?.CreditScore ?? 720m,
                    CreditGrade = eligibility.Assessment?.CreditGrade ?? "B",
                    MaxEligibleAmount = eligibility.MaxAmount
                }
            };
            
            Console.WriteLine($"[ORCHESTRATOR] Sending to Customer Offer Service: {System.Text.Json.JsonSerializer.Serialize(offerRequest)}");
            
            var response = await _offerClient.PostAsJsonAsync("/customer-offers", offerRequest);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<LoanOffer>();
            return result ?? throw new ApplicationException("Offer service returned null");
        }

        // Publish an event back to the BFF.  The workflow uses this
        // activity to send real‑time updates to the UI via SSE.
        [Activity]
        public async Task PublishEventAsync(string applicationId, string stage, object? data)
        {
            var evt = new WorkflowEvent { Stage = stage, Data = data };
            var response = await _bffClient.PostAsJsonAsync($"/internal/notify/{applicationId}", evt);
            response.EnsureSuccessStatusCode();
        }

        // Call the sales agreement service to record the loan agreement.
        [Activity]
        public async Task<AgreementResult> CreateProductAgreementAsync(LoanOffer offer)
        {
            var response = await _agreementClient.PostAsJsonAsync("/sales-product-agreements", new { OfferId = offer.OfferId });
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<AgreementResult>();
            return result ?? throw new ApplicationException("Agreement service returned null");
        }

        // Call the consumer loan service to open the loan account.
        [Activity]
        public async Task<LoanAccountResult> CreateLoanAccountAsync(AgreementResult agreement)
        {
            var response = await _loanClient.PostAsJsonAsync("/consumer-loans", new { AgreementId = agreement.AgreementId });
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<LoanAccountResult>();
            return result ?? throw new ApplicationException("Consumer loan service returned null");
        }

        // Call the payment order service to disburse funds.  In this POC
        // we use a constant source account and disburse the maximum
        // amount.  The destination account is the newly created loan
        // account id.  The service returns a confirmation.
        [Activity]
        public async Task<PaymentResult> ExecuteDisbursementAsync(LoanAccountResult account)
        {
            var request = new
            {
                SourceAccount = "BANK_SRC",
                DestinationAccount = account.LoanAccountId,
                Amount = 10000m
            };
            var response = await _paymentClient.PostAsJsonAsync("/payment-orders", request);
            response.EnsureSuccessStatusCode();
            var result = await response.Content.ReadFromJsonAsync<PaymentResult>();
            return result ?? throw new ApplicationException("Payment service returned null");
        }
    }
}