# AI Legal Drafting and Review Platform for India

Draft v0.1  
Status: Planning  

## Overview

This project is an AI-assisted platform for Indian individuals, freelancers, and small businesses. It helps users draft legal documents through guided workflows, understand clauses in plain language, check documents for completeness, and view source-backed legal information where that information has been verified.

Phase 1 focuses on one document type: a freelance service agreement with a complete end-to-end drafting workflow. Phase 2 adds review of existing uploaded documents.

The platform is a drafting and legal information aid. It does not replace lawyers and does not guarantee enforceability.

## Problem Statement

Freelancers and small businesses in India often work without written contracts, or they rely on copied templates they do not fully understand. This can lead to unpaid invoices, unclear intellectual property ownership, vague scope, missing termination terms, and weak dispute-resolution provisions.

Lawyers remain valuable and important, but legal support is often unaffordable for small engagements. This platform aims to make basic contract drafting more structured, understandable, and transparent while clearly stating its limits.

## Goals

- Produce a complete, internally consistent freelance agreement from guided user input.
- Explain every clause in plain language.
- Flag missing or risky terms through deterministic completeness checks.
- Provide citations only from a curated and verified legal corpus.
- Protect user data and be transparent about platform limitations.

## Non-Goals

- Replacing legal advice or lawyers.
- Guaranteeing enforceability or legal outcomes.
- Free-form AI generation of binding contract text.
- Supporting many document types in the first release.

## Core Design Principle

The platform uses deterministic legal logic with constrained AI.

The LLM must not freely write binding clause text. Binding clause text comes only from reviewed templates. AI is used for guided intake, structured extraction, plain-language explanation, and retrieval-grounded legal information.

## Phase 1: Freelance Agreement Workflow

The first release supports a complete freelance agreement workflow:

1. Intake: the user answers guided questions about parties, scope, deliverables, fees, payment schedule, timelines, IP, confidentiality, termination, governing law, and dispute resolution.
2. Validation: inputs are checked against a schema, including valid dates and consistent payment totals.
3. Generation: a template engine assembles clauses based on answers and conditional rules.
4. Completeness check: required and recommended clauses are verified, and risk flags are raised.
5. Explanation: each clause receives a plain-language explanation, with citations where verified.
6. Export: the final document is exported with a limitations notice and an execution checklist covering stamping and signing.

### India-Specific Coverage

The platform should cover:

- Stamp duty and state-wise variation, including e-stamping and execution method.
- IP assignment and licensing terms under the Copyright Act, including assignment pitfalls.
- GST and TDS considerations for service providers.
- Governing law, jurisdiction, and arbitration clauses.
- Electronic signature considerations under the Information Technology Act.

Each India-specific item must be confirmed by a legal reviewer before it appears in the product.

## Component Approach

| Component | Approach |
| --- | --- |
| Template selection, clause inclusion, and conditional logic | Rule-based, versioned, lawyer-reviewed |
| Completeness and consistency checks | Deterministic rules |
| Guided intake conversation | LLM with structured output |
| Plain-language explanations | LLM grounded in the selected clause and verified sources |
| Extraction from uploaded documents | LLM with JSON-schema validation |
| Legal citations | Retrieval over curated corpus, with refusal when unsupported |

## Phase 2: Existing Document Review

Phase 2 adds support for reviewing uploaded documents.

Planned capabilities:

- Upload and parse PDF and DOCX documents, with OCR fallback.
- Extract parties, dates, payment terms, and clause types.
- Compare extracted content against completeness rules and the clause library.
- Report missing, unusual, or risky terms with explanations.
- Treat uploaded content as untrusted input, with prompt-injection defenses.

## Architecture

The high-level architecture includes:

- Frontend: guided form flow, document preview, explanation panel, and limitations notices.
- Backend API: authentication, workflow state, template engine, rule engine, and audit logging.
- Database: users, drafts, template versions, clause library, consent records, and audit events.
- AI and document service: LLM orchestration, retrieval over the curated corpus, parsing and extraction, and redaction.
- Infrastructure: CI/CD, environment separation, monitoring, and encrypted storage.

All modules communicate through documented API contracts using OpenAPI. Contracts should be reviewed before implementation.

## Legal Content and Validation

Each supported document type has its own reviewed template and applicable legal checks.

Clause library records should include:

- Source
- Rationale
- Risk level
- Applicable state or execution method
- Reviewer
- Version

At least one practicing advocate should review the template and checklist. Feedback and resulting changes must be logged.

Public legal material may be used for research, but only reviewed and verified material enters the retrieval corpus. Templates are versioned and changelogged like code.

## Evaluation Plan

The project should include:

- Golden set: 30 to 50 sample freelance agreements, including injected defects such as missing IP clauses, missing payment terms, unfair termination, or wrong jurisdiction.
- Metrics: clause detection precision and recall, completeness-check accuracy, citation correctness, and refusal rate on unsupported questions.
- Ablation testing: rules-only, LLM-only, and hybrid approaches.
- Hallucination audit: manual verification of citations in a sample of outputs.
- Regression testing: evaluation suite runs in CI on any change to templates, prompts, or models.
- User pilot: 10 to 20 freelancers or small business owners, measuring completion time, comprehension, and drop-off points.

## Privacy and Security

The platform should align with the Digital Personal Data Protection Act, 2023.

Required privacy and security measures:

- Clear consent notice.
- Data minimization.
- Retention limits.
- User-initiated deletion.
- PII redaction before any third-party LLM call, or a documented self-hosted model option.
- Encryption in transit and at rest.
- Access controls.
- Audit logs.
- Rate limiting.
- Written threat model.
- OWASP-style security review with findings and fixes recorded.

## Transparent Limitations

The product and repository should include a visible limitations notice:

- The platform provides drafting assistance and general legal information, not legal advice.
- It does not guarantee enforceability or suitability for a specific situation.
- Coverage is limited to supported document types, jurisdictions, and execution methods.
- Users with high-value or complex engagements should consult a qualified lawyer.
- When the system cannot verify a legal point, it should say so rather than guessing.

## Team and Module Ownership

Shared practices:

- Pull-request code reviews.
- API contracts agreed before implementation.
- Weekly integration checkpoints.

| Member | Module | Key Responsibilities |
| --- | --- | --- |
| 1 | Frontend | Guided flow, preview, explanation UI, limitations UX |
| 2 | Backend and database | APIs, workflow state, template and rule engine, data model |
| 3 | AI and document processing | Intake LLM, retrieval, explanations, extraction, redaction |
| 4 | Testing and security | Evaluation suite, CI, threat model, security review |
| 5 | Integration and documentation | API contracts, deployment, ADRs, README, demo, write-up |

## Roadmap

| Stage | Deliverable |
| --- | --- |
| 1 | Requirements, API contracts, clause library schema, draft template |
| 2 | End-to-end freelance workflow running locally |
| 3 | Lawyer review of template and checklist; revisions |
| 4 | Evaluation suite with baseline numbers; privacy and security layer |
| 5 | Deployment and user pilot |
| 6 | Existing-document review feature |
| 7 | Final write-up, demo video, limitations card |

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Incorrect or outdated legal content | Lawyer review, versioned templates, source metadata |
| LLM hallucination | Constrained outputs, retrieval grounding, refusal path, audits |
| Sensitive data exposure | Redaction, encryption, retention limits, threat model |
| Scope creep | One document type first; review feature only after Phase 1 is complete |
| Difficulty finding a legal reviewer | Start outreach early; use college legal cell or alumni network |
| Users over-trusting output | Prominent limitations, uncertainty indicators, lawyer-review prompts |

## Open Questions

- Which states will be covered first for stamp duty guidance?
- Should the platform use a self-hosted model or a third-party API with redaction?
- Which advocate or legal clinic will review the template?
- What is the hosting budget?
- What is the pilot recruitment plan?

## Success Criteria

- A deployed, working end-to-end freelance agreement workflow.
- A lawyer-reviewed template with a documented changelog.
- Published evaluation results, including failures.
- A documented privacy and security design.
- Pilot feedback from real users.
- A clear, honest account of what the system does and does not do.
