using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Temporalio.Client;
using Temporalio.Worker;
using LoanFulfilment.Orchestrator;

namespace LoanFulfilment.Orchestrator
{
    /// <summary>
    /// Background service that hosts the Temporal worker.  When the
    /// service starts, it registers the workflow and activity
    /// implementations and begins polling on the configured task
    /// queue.  The worker stops gracefully when the host shuts down.
    /// </summary>
    public class TemporalWorkerService : BackgroundService
    {
        private readonly TemporalClient _client;
        private readonly LoanActivitiesImpl _activities;

        public TemporalWorkerService(TemporalClient client, LoanActivitiesImpl activities)
        {
            _client = client;
            _activities = activities;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Configure the worker to listen on the same task queue used when
            // starting workflows.  Register the workflow and activity
            // implementations.  Use 'using' to dispose the worker
            // cleanly when cancelled.
            using var worker = new TemporalWorker(
                _client,
                new TemporalWorkerOptions("LoanTaskQueue")
                    .AddWorkflow<LoanWorkflow>()
                    .AddAllActivities(_activities)
            );
            await worker.ExecuteAsync(stoppingToken);
        }
    }
}