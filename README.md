# Loan Fulfilment System – Proof‑of‑Concept

This repository contains a self‑contained proof of concept for a
personal loan fulfilment system.  The architecture is composed of
several loosely coupled microservices written in **.NET 8**, a
**Temporal** workflow orchestrator, a **Backend‑for‑Frontend (BFF)**
gateway, and a **React** single‑page application (SPA) for the user
interface.  All components are containerised and orchestrated via
Docker Compose, allowing you to stand up the entire system with a
single command.

## Architecture Overview

The POC implements a simple personal loan journey:

1. **Eligibility & Offer:** The applicant submits a loan request.  The
   orchestrator calls the *Eligibility* service to determine
   eligibility and the *Customer Offer* service to produce a
   provisional offer.
2. **Document Verification:** The workflow pauses until the applicant
   (or an operator) verifies documents.  A signal is sent to the
   workflow via the BFF to unblock this step.
3. **Offer Acceptance:** The applicant accepts the offer.  Another
   signal unblocks the workflow.
4. **Agreement, Account & Disbursement:** The orchestrator records
   the agreement, opens a loan account and executes a payment order to
   disburse funds.
5. **Real‑Time Updates:** At each milestone the workflow publishes an
   event back to the BFF, which streams it to the React UI via
   server‑sent events (SSE).

### Services

| Service                    | Description |
|---------------------------|-------------|
| **Temporal**              | Runs the Temporal server.  Provides durable, fault‑tolerant workflow execution. |
| **Orchestrator**          | Hosts the loan workflow and activities, exposes HTTP endpoints to start workflows and send signals. |
| **Eligibility Service**   | Implements a BIAN‑style *Customer Product Eligibility* domain.  Always returns an eligible result with a fixed maximum amount. |
| **Customer Offer Service**| Implements a *Customer Offer* domain.  Generates a provisional offer with a fixed interest rate and term. |
| **Sales Agreement Service**| Records the loan agreement. |
| **Consumer Loan Service** | Opens the loan account (arrangement). |
| **Payment Order Service** | Simulates the disbursement of funds. |
| **BFF**                   | Acts as a gateway for the React UI.  Proxies API calls to the orchestrator and streams workflow events to the UI using SSE. |
| **UI**                    | A React SPA built with Vite.  Allows the user to start a loan application, verify documents, accept the offer and observe real‑time status updates. |

## Running the POC

Ensure you have a recent version of **Docker** and **Docker Compose**
installed.  Clone or extract this repository and run the following in
the root directory:

```bash
docker-compose up --build
```

The first build may take several minutes as it downloads base images
and restores NuGet/npm packages.  Once complete you should see logs
from multiple services.

### Accessing the UI

Open your browser to **http://localhost:3000**.  You will see a
minimal form where you can enter an applicant ID and requested loan
amount.  After submitting the application the UI will connect to the
BFF via SSE and display updates as the workflow progresses.  Use the
“Verify Documents” and “Accept Offer” buttons to advance the process.

### How It Works

1. **Start Application:** The UI calls `POST /api/loan-applications` on
   the BFF.  The BFF forwards this to the orchestrator, which starts
   a Temporal workflow and returns the generated application ID.  The
   UI stores this ID and opens an SSE connection to
   `/api/loan-applications/{id}/events`.
2. **Eligibility & Offer:** The workflow calls the eligibility and
   offer services via activities.  When the offer is ready it uses
   another activity to publish an `OfferPrepared` event back to the
   BFF.  The UI receives this event and displays the offer.
3. **Document Verification:** Click “Verify Documents” in the UI to
   POST to `/api/loan-applications/{id}/verify-documents`.  The BFF
   forwards this to the orchestrator, which signals the workflow.  The
   workflow resumes and publishes a `DocumentsVerified` event.
4. **Offer Acceptance:** Click “Accept Offer” to signal the workflow.
   The workflow proceeds to create the agreement, loan account and
   payment order.  A final `LoanDisbursed` event is published with
   details of the new loan account.

## Customisation

This POC is intentionally simple.  To extend it:

* Replace the mock domain services with real implementations or
  integrate with a database.
* Enhance the workflow with additional steps (credit scoring,
  regulatory checks, etc.).
* Secure the BFF with authentication and authorisation.
* Introduce a message broker instead of direct HTTP for event
  publishing.

## Cleaning Up

To stop the environment press **Ctrl+C** in the terminal where
`docker-compose up` is running.  To remove containers and volumes run
`docker-compose down --volumes`.