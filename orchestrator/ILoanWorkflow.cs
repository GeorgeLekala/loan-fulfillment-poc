using System.Threading.Tasks;
using Temporalio.Workflows;

namespace LoanFulfilment.Orchestrator
{
    /// <summary>
    /// Strongly typed workflow interface used by the Temporal client to
    /// start and signal the workflow.  The type must exactly match the
    /// workflow implementation signature (method name and parameters)
    /// but does not need to share the same assembly.  Temporal uses
    /// reflection to infer the workflow type name and maps it to the
    /// registered implementation.
    /// </summary>
    [Workflow]
    public interface ILoanWorkflow
    {
        [WorkflowRun]
        Task RunAsync(string applicationId, LoanApplicationData input);

        [WorkflowSignal]
        Task DocumentVerified();

        [WorkflowSignal]
        Task OfferAccepted();

        [WorkflowSignal]
        Task DisbursementTriggered();
    }
}