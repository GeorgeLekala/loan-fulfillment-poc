# Swagger/OpenAPI Documentation for Loan Fulfillment System

## Overview
All microservices in the Loan Fulfillment system now include comprehensive Swagger/OpenAPI documentation with interactive interfaces for testing endpoints.

## Service API Documentation URLs

### 1. BFF (Backend-for-Frontend) Service
- **URL**: http://localhost:5001/swagger
- **Description**: Backend-for-Frontend API providing proxy endpoints to orchestrator and real-time event streaming
- **Endpoints**:
  - `POST /api/loan-applications` - Create a new loan application
  - `POST /api/loan-applications/{id}/verify-documents` - Verify documents for a loan application
  - `POST /api/loan-applications/{id}/accept-offer` - Accept a loan offer
  - `GET /api/loan-applications/{id}/events` - Get real-time application events (SSE)

### 2. Orchestrator Service
- **URL**: http://localhost:5000/swagger
- **Description**: Temporal workflow orchestrator for managing loan application lifecycles
- **Endpoints**:
  - `POST /api/loan-applications` - Start a new loan application workflow
  - `POST /api/loan-applications/{id}/verify-documents` - Signal document verification
  - `POST /api/loan-applications/{id}/accept-offer` - Signal offer acceptance

### 3. Eligibility Service
- **URL**: http://localhost:5002/swagger
- **Description**: Microservice for assessing loan eligibility based on applicant information
- **Endpoints**:
  - `POST /eligibility-assessments` - Assess loan eligibility

### 4. Customer Offer Service
- **URL**: http://localhost:5003/swagger
- **Description**: Microservice for generating and managing personalized loan offers
- **Endpoints**:
  - `POST /customer-offers` - Create a loan offer
  - `GET /customer-offers/{id}` - Get loan offer by ID

### 5. Consumer Loan Service
- **URL**: http://localhost:5004/swagger
- **Description**: Microservice for creating and managing consumer loan accounts
- **Endpoints**:
  - `POST /consumer-loans` - Create a consumer loan account

### 6. Payment Order Service
- **URL**: http://localhost:5005/swagger
- **Description**: Microservice for processing payment orders and disbursing loan funds
- **Endpoints**:
  - `POST /payment-orders` - Execute a payment order

### 7. Sales Agreement Service
- **URL**: http://localhost:5006/swagger
- **Description**: Microservice for creating and managing sales product agreements
- **Endpoints**:
  - `POST /sales-product-agreements` - Create a sales product agreement

## Features

### Interactive Documentation
- **Try It Out**: Each endpoint includes an interactive "Try it out" button for testing
- **Request/Response Examples**: Comprehensive examples showing expected data formats
- **Model Schemas**: Detailed schemas for all request and response models
- **HTTP Status Codes**: Documentation of all possible response codes

### API Descriptions
- **Service Level**: Each service includes a description of its purpose and role
- **Endpoint Level**: Individual endpoints have detailed descriptions of functionality
- **Parameter Documentation**: All parameters are documented with types and descriptions

### Request/Response Models
All data models are fully documented including:
- **EligibilityRequest/EligibilityResult**: For eligibility assessments
- **OfferRequest/LoanOffer**: For loan offer generation
- **LoanAccountRequest/LoanAccountResult**: For loan account creation
- **PaymentRequest/PaymentResult**: For payment processing
- **AgreementRequest/AgreementResult**: For sales agreements
- **LoanApplicationRequest**: For workflow initiation
- **WorkflowEvent**: For real-time event streaming

## Usage Instructions

1. **Access any service's Swagger UI** by visiting the corresponding URL above
2. **Explore endpoints** by expanding the endpoint sections
3. **Test endpoints** by clicking "Try it out" and providing sample data
4. **View schemas** by scrolling down to the "Schemas" section
5. **Generate client code** using the OpenAPI specifications

## Integration Notes

- All services expose OpenAPI 3.0 compliant specifications
- Documentation is only available in development environment for security
- All endpoints include proper HTTP status code documentation
- Request/response examples are provided for all data models
- CORS is properly configured for cross-origin testing

## South African Banking Compliance

The system implements BIAN (Banking Industry Architecture Network) standards and includes:
- SA ID number validation patterns
- ZAR currency handling
- South African banking regulations compliance
- Proper risk assessment workflows

## System Architecture

The loan fulfillment system follows a microservices architecture with:
- **Temporal Workflows**: Orchestrating complex business processes
- **Event-Driven Architecture**: Real-time updates via Server-Sent Events
- **BIAN Compliance**: Following banking industry standards
- **Containerized Deployment**: Docker-based deployment with proper service discovery
