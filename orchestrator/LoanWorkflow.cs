using System;
using System.Threading.Tasks;
using Temporalio.Activities;
using Temporalio.Workflows;

namespace LoanFulfilment.Orchestrator
{
    // Workflow definition for the personal loan journey.  Each step
    // corresponds to an activity that interacts with an external
    // domain service or emits an event back to the UI.  Temporal
    // automatically persists the workflow state and resumes where it
    // left off on failure or restart.
    [Workflow]
    public class LoanWorkflow
    {
        private bool _documentsVerified;
        private bool _offerAccepted;
        private bool _disbursementTriggered;

        // Signal handler invoked when documents have been verified.
        [WorkflowSignal]
        public Task DocumentVerified()
        {
            _documentsVerified = true;
            return Task.CompletedTask;
        }

        // Signal handler invoked when the applicant accepts the offer.
        [WorkflowSignal]
        public Task OfferAccepted()
        {
            _offerAccepted = true;
            return Task.CompletedTask;
        }

        // Signal handler invoked when disbursement is triggered with bank details.
        [WorkflowSignal]
        public Task DisbursementTriggered()
        {
            _disbursementTriggered = true;
            return Task.CompletedTask;
        }

        // Entry point for the workflow.  Receives the application id
        // (used to correlate events) and the applicant's requested
        // amount.  Activities are called sequentially and may be
        // retried automatically by Temporal on failure.  The workflow
        // waits on signals at two points: document verification and
        // offer acceptance.
        [WorkflowRun]
        public async Task RunAsync(string applicationId, LoanApplicationData input)
        {
            // Use Workflow.ExecuteActivityAsync for activity execution
            var activityOptions = new ActivityOptions { StartToCloseTimeout = TimeSpan.FromMinutes(5) };
            
            // 1. Check eligibility
            var eligibility = await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.CheckEligibilityAsync(input),
                activityOptions);
            
            // 2. Generate loan offer
            var offer = await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.GenerateOfferAsync(eligibility, input),
                activityOptions);
                
            // Notify UI that the offer is prepared
            await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.PublishEventAsync(applicationId, "OfferPrepared", offer),
                activityOptions);

            // 3. Wait for document verification signal
            await Workflow.WaitConditionAsync(() => _documentsVerified);
            await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.PublishEventAsync(applicationId, "DocumentsVerified", null),
                activityOptions);

            // 4. Wait for applicant acceptance
            await Workflow.WaitConditionAsync(() => _offerAccepted);
            await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.PublishEventAsync(applicationId, "OfferAccepted", null),
                activityOptions);

            // 5. Create agreement and loan account
            var agreement = await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.CreateProductAgreementAsync(offer),
                activityOptions);
            
            // Notify UI that the agreement is prepared
            await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.PublishEventAsync(applicationId, "AgreementCreated", agreement),
                activityOptions);
                
            var account = await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.CreateLoanAccountAsync(agreement),
                activityOptions);
            
            // Notify UI that account is created and ready for bank details
            await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.PublishEventAsync(applicationId, "AccountCreated", account),
                activityOptions);

            // 6. Wait for disbursement trigger (with bank details)
            await Workflow.WaitConditionAsync(() => _disbursementTriggered);

            // 7. Execute disbursement
            var payment = await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.ExecuteDisbursementAsync(account),
                activityOptions);
            
            // Notify UI that the loan has been disbursed
            await Workflow.ExecuteActivityAsync(
                (LoanActivitiesImpl activities) => activities.PublishEventAsync(applicationId, "LoanDisbursed", account),
                activityOptions);
        }
    }
}