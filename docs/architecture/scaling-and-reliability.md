# Scaling and Reliability

## Purpose

This document defines how the marketplace platform should be designed for reliability, concurrency safety, and realistic growth.

It focuses on:

- high-read and high-write system behavior
- concurrency risks
- failure handling
- retry/idempotency behavior
- indexing and query planning
- future hardening paths

This document is not a promise of immediate enterprise-scale infrastructure. It is a design guide for making good early decisions that do not block future scaling.

---

## Goals

### Primary Goals

- design for realistic growth without premature complexity
- protect critical commerce flows from duplicate actions and inconsistent state
- identify high-risk read and write paths
- make performance assumptions explicit
- preserve upgrade paths for future hardening

### Non-Goals

At this stage, the system is not trying to implement:

- multi-region architecture
- sharding
- distributed event streaming platforms
- large-scale microservice infrastructure
- advanced real-time operational tooling

The goal is strong design now, not maximum infrastructure now.

---

## Reliability Principles

### 1. Correctness first

The most important flows must be correct before they are highly optimized.

Examples:

- checkout
- payment confirmation
- order creation
- seller/admin ownership enforcement

### 2. Reads and writes are different

Read-heavy catalog paths should be optimized differently from write-sensitive commerce paths.

### 3. Expect retries and duplicate events

Users, browsers, and payment providers may retry.
The system should tolerate this where needed.

### 4. Preserve historical truth

Historical records must remain intact through product, seller, or policy changes.

### 5. Make upgrade points visible

The architecture should show where caching, async jobs, denormalization, or stronger infra could be added later.

---

## Load Model Thinking

## High-Read Paths

These areas are expected to carry the most repeated traffic:

- product listing
- search
- autocomplete
- product detail pages
- category browsing

## Write-Sensitive Paths

These areas are lower-frequency but higher-risk:

- cart mutation
- checkout
- payment updates
- seller product changes
- admin moderation actions

### Important Principle

A slow listing page is bad.
A broken checkout or duplicate payment flow is worse.

---

## Concurrency Risks

## Catalog Risks

- many simultaneous search requests
- expensive fuzzy search under load
- pagination on large datasets
- inconsistent listing visibility if moderation state changes frequently

## Checkout Risks

- duplicate checkout requests
- multiple tabs using same cart
- stale pricing during checkout
- stock conflicts if stock is enforced
- coupon usage limits hit concurrently

## Payment Risks

- webhook arrives more than once
- webhook arrives late
- provider timeout during confirmation
- partial system failure after payment success

## Seller/Admin Risks

- seller edits product during active checkout
- admin suspends product or seller during active browsing
- seller and admin update same resource at similar times

---

## Idempotency Strategy

## Why It Matters

Idempotency protects the system from duplicate side effects caused by:

- double-clicks
- page refreshes
- retry logic
- provider webhook retries
- temporary network failures

## Critical Flows Requiring Protection

- checkout initiation
- payment session creation
- webhook processing
- refund actions later if added
- selected admin mutations if especially sensitive

## Recommended Patterns

- `Idempotency-Key` header for sensitive writes where appropriate
- unique provider session/payment identifiers
- transition checks before applying updates
- reuse of existing pending order/payment attempt where policy allows

---

## Failure Handling Strategy

## General Rule

Every critical flow should define:

- what can fail
- what must remain durable
- what can be retried
- what needs reconciliation

## Checkout Failure Examples

- cart invalid at checkout
- coupon invalid at final validation
- payment session creation fails
- network interruption before redirect

## Payment Failure Examples

- payment succeeds but webhook is delayed
- webhook fails once and is retried
- provider reference not found due to data mismatch
- duplicate event received

## Operational Failure Examples

- admin action applied partially
- seller update conflicts with current product state
- logging/audit record creation fails after main mutation

### Design Principle

Critical data mutation should fail safely and predictably, even if user experience becomes temporarily degraded.

---

## High-Value Tables and Query Areas

## High-Read Tables

- products
- categories
- product_images
- reviews if public

## High-Sensitivity Tables

- orders
- order_items
- payments
- seller_commissions
- seller_profiles when status affects access

## Hot Query Patterns

- public listing by filters and sort
- search/autocomplete
- product detail by slug
- customer order history
- seller order views
- admin order monitoring

---

## Indexing Strategy

## Early Required Indexes

Recommended early indexes include:

- product slug
- product status
- product category + status
- product seller + status
- created/published sort columns used in listing
- coupon code
- order customer + created_at
- order status/payment status
- order item seller + created_at
- payment provider reference fields

## Fuzzy Search

If fuzzy search remains SQL-based:

- use appropriate trigram indexing
- review query cost as product count grows
- bound suggestion result sizes aggressively

### Important Rule

Indexes should follow actual query patterns, not speculative ideas.

---

## Pagination Rules

## Why Pagination Matters

Pagination protects:

- response size
- DB workload
- memory usage
- frontend rendering load

## Rules

- listing endpoints should always paginate
- seller/admin list pages should paginate
- page size should be capped
- very large unbounded reads should be avoided

---

## Caching Strategy

## Early Caching Candidates

Reasonable future cache candidates:

- category list
- common public listing queries
- popular product detail pages
- autocomplete for high-frequency prefixes

## What Not To Cache Too Early

Avoid early caching of:

- checkout state
- order/payment state transitions
- seller/admin operational write flows

### Rule

Cache read-heavy public data first, not sensitive mutation flows.

---

## Async and Background Work

## Good Future Candidates

Possible later async/background tasks:

- notifications
- reporting/analytics refresh
- seller summary aggregation
- webhook retry/reconciliation helpers
- audit/event export
- image processing

## Important Rule

Do not introduce background complexity before the synchronous core flow is correct.

---

## Rate Limiting Strategy

## Recommended Early Targets

Rate limiting should be considered for:

- autocomplete
- search endpoints
- checkout initiation
- auth-related endpoints
- admin mutation routes
- webhook endpoint protection where compatible with provider behavior

## Purpose

Rate limiting helps protect:

- database load
- abuse-prone endpoints
- accidental retry storms

---

## Stock and Inventory Reliability

## Key Decision Area

If the platform uses stock limits, it must clearly define:

- when stock is checked
- when stock is reserved
- when stock is decremented
- how oversell is prevented

## MVP Recommendation

If stock is not central to the product, keep logic simpler and document it clearly.
If stock is important, transaction-aware decrement/reservation rules become more important.

---

## Order and Payment Reliability

## Core Rules

- order and payment states are separate
- payment provider references must be stored reliably
- webhooks must be idempotent
- client redirect success is not enough for final truth
- historical order records must not depend on mutable product state

## Reconciliation Need

As the system grows, it may benefit from reconciliation jobs or admin views for:

- stuck pending orders
- paid-but-unconfirmed states
- failed payment attempts
- mismatched provider references

---

## Seller and Admin Reliability

## Seller Reliability Concerns

- seller should never see other sellers' data
- seller analytics should not recalculate historical orders incorrectly
- seller suspension should restrict future operations without deleting history

## Admin Reliability Concerns

- sensitive admin changes should be auditable
- manual state changes should be controlled
- platform policy changes should not corrupt old records

---

## Observability and Logging

## Minimum Useful Events

Recommended important events to log:

- checkout initiated
- checkout validation failed
- payment session created
- payment confirmed
- payment failed
- duplicate webhook ignored
- seller approved/rejected/suspended
- admin moderation actions
- unexpected state transition blocked

## Why This Matters

Without observability, debugging reliability issues becomes much harder as the project grows.

---

## Recovery and Reconciliation Thinking

## What to Plan For

Even before implementing background jobs, the docs should assume that some flows may need reconciliation later.

Examples:

- pending orders after interrupted checkout
- payments marked paid but order state not fully advanced
- stale seller summary values
- webhook-delivery timing issues

### Principle

A good architecture does not assume every flow will always succeed on the first attempt.

---

## Performance Review Triggers

## Revisit Architecture If

- listing/search queries become slow
- autocomplete becomes expensive
- order/payment failure handling becomes hard to reason about
- seller/admin dashboards rely on too many heavy joins
- large datasets make page-based queries unstable
- docs no longer match real bottlenecks

---

## Future Upgrade Paths

Possible later upgrades:

- query tuning and selective denormalization
- better caching
- cursor-based pagination for hot endpoints
- background job processing
- observability dashboards
- reconciliation tooling
- partitioning strategies if data grows significantly

These are future options, not MVP requirements.

---

## Related Documents

- `architecture/ARCHITECTURE_OVERVIEW.md`
- `architecture/checkout-and-payments.md`
- `DATABASE_SCHEMA.md`
- `FEATURE_SPEC.md`
- `API_SPEC.md`

---

## Summary

The system should scale by:

- keeping reads simple
- protecting critical writes
- using indexes intentionally
- treating retries as normal
- preserving historical correctness
- leaving clear upgrade paths for future hardening
