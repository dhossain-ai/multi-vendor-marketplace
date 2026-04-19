# Project Overview

## Project Name

Marketplace Platform (built from the existing game search/catalog foundation)

## Summary

This project is evolving from a search-first catalog application into a full-stack multi-vendor marketplace platform. The current foundation already supports a polished search experience, fuzzy query matching, API-backed listing, and a Supabase PostgreSQL data layer. The next stages will expand the product into a real marketplace system with buyer flows, seller/vendor capabilities, admin controls, payments, order management, and production-minded architecture decisions.

The purpose of this project is twofold:

1. Build a portfolio-grade, real-world full-stack product that demonstrates strong engineering and product thinking.
2. Create a reusable foundation for future larger marketplace or commerce-oriented systems.

This is **not** intended to be a clone of any single product. It is a custom marketplace platform that uses realistic commerce patterns and role-based workflows.

---

## Current State

The project currently includes:

- Next.js App Router application with TypeScript and Tailwind CSS
- Supabase PostgreSQL schema and seed data
- Search/list API
- Search autocomplete
- Fuzzy search using PostgreSQL `pg_trgm`
- Repository/data access layer
- Responsive UI with polished game card/listing presentation
- Test setup with Vitest and React Testing Library
- Verified build/lint/test pipeline
- Deployment to Vercel

At this stage, the application should be treated as a **catalog and discovery foundation**, not yet a complete marketplace.

---

## Target Product Vision

The long-term vision is a marketplace platform with three primary surfaces:

### 1. Customer Surface

Features for buyers/end users:

- browse products
- search/filter/sort
- product details
- cart
- coupon support
- checkout and payment
- order history
- profile and addresses
- wishlist and reviews

### 2. Seller/Vendor Surface

Features for sellers:

- seller onboarding/application
- seller dashboard
- product management
- pricing and inventory controls
- seller order visibility
- sales and earnings summaries
- discount/campaign management

### 3. Admin Surface

Features for platform administration:

- dashboard overview
- vendor approval/review
- product moderation/management
- category and coupon management
- order monitoring
- revenue/commission visibility
- platform settings
- auditability for sensitive operations

---

## Product Goals

### Primary Goals

- Demonstrate end-to-end full-stack development capability
- Showcase marketplace-grade architecture and data modeling
- Implement realistic role-based flows for customer, seller, and admin
- Build payment-aware order processing with strong server-side validation
- Keep the codebase structured enough for AI-assisted continuation without confusion

### Secondary Goals

- Maintain clean documentation for future sessions and model handoffs
- Preserve a clear path from MVP to more scalable architecture
- Use the project as a reusable starter for future real products

---

## Non-Goals

The project is **not** trying to solve every enterprise concern in the first version.

Out of scope for early phases:

- microservices
- advanced payout automation
- full tax engine
- global multi-currency settlement
- highly complex recommendation systems
- production fraud detection systems
- fully automated vendor dispute workflows

These may be explored later only if they support portfolio value or real product goals.

---

## User Roles

### Customer

A standard buyer who can browse products, manage cart, complete checkout, and view their order history.

### Seller

A vendor who can manage their own products, track orders relevant to them, and monitor sales/earnings.

### Admin

A platform operator who can manage vendors, products, categories, coupons, orders, and platform-level settings.

---

## Engineering Principles

### 1. Server-validated business logic

Critical operations such as checkout, coupon validation, role authorization, and order creation must be enforced server-side.

### 2. Clear separation of concerns

The project should maintain clear boundaries between:

- UI rendering
- domain/business logic
- data access/repository layer
- API contracts
- database schema and constraints

### 3. Safe data modeling

Order-related data should be modeled so that historical records remain correct even if product or pricing data changes later.

### 4. Scalable by design

Even if the initial version is small, the system should avoid schema and workflow decisions that block future growth.

### 5. Documentation-first continuity

Documentation is treated as part of the system. Every major architectural or product decision should be reflected in docs so future development remains consistent across new chats, models, or collaborators.

---

## Technical Stack

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend / Data

- Supabase
- PostgreSQL
- Supabase RPC for search
- Server-side repository/data access layer

### Search

- PostgreSQL `pg_trgm`
- fuzzy search RPC
- alias mapping and normalized queries
- autocomplete/typeahead UX

### Quality / Tooling

- ESLint
- Prettier
- Vitest
- React Testing Library

### Deployment

- Vercel

---

## System Scope by Stage

### Current Scope

- discovery/search/catalog foundation

### Near-Term Scope

- product details
- authentication
- cart and checkout
- payment integration
- order persistence
- seller dashboard shell
- admin dashboard shell

### Mid-Term Scope

- multi-vendor order handling
- commission model
- coupon management
- reviews/wishlist
- analytics and reporting

### Long-Term Scope

- improved scaling strategy
- better observability
- asynchronous workflows
- background jobs and notifications
- production hardening

---

## Success Criteria

### Product Success

- The application feels like a real marketplace product, not a demo page
- A buyer can complete a realistic end-to-end purchase flow
- A seller can manage products and view relevant orders
- An admin can monitor and control core platform operations

### Engineering Success

- Clean schema with realistic constraints and indexes
- Clear API boundaries
- Documented architectural decisions
- Safe handling of core edge cases
- Maintainable code and docs for future iteration

### Portfolio Success

- The project can be presented as a serious marketplace/e-commerce platform
- The repo demonstrates both product depth and engineering maturity
- The documentation is strong enough for anyone reviewing the repo to understand current state, future direction, and technical design quickly

---

## Core Risks

- Overbuilding before locking down product behavior
- Mixing portfolio polish with weak backend modeling
- Implementing UI-only flows without robust server-side validation
- Letting docs drift away from the actual codebase
- Adding too many features before defining order, payment, and role rules clearly

---

## Documentation Strategy

The documentation in `docs/` is a core part of the project and must remain aligned with implementation.

Key files:

- `PROJECT_OVERVIEW.md` — high-level product and engineering summary
- `AI_CONTEXT.md` — fast handoff context for new AI sessions/models
- `ROADMAP.md` — phased delivery plan
- `FEATURE_SPEC.md` — behavior and business rules
- `DATABASE_SCHEMA.md` — tables, relationships, statuses, constraints, indexes
- `API_SPEC.md` — route contracts and server behavior
- `ARCHITECTURE.md` — technical design and request/data flow
- `DECISIONS.md` — important engineering/product decisions and rationale
- `STATUS.md` — current progress snapshot
- `NEXT_STEPS.md` — immediate actionable tasks
- `DEV_SUMMARY.md` — historical development summary
- `AI_PROMPT_HISTORY.md` — prompt history and AI-assisted workflow notes

---

## Guiding Principle

Build this as a real system in progressive layers:

1. strong catalog/discovery foundation
2. reliable commerce flow
3. role-based marketplace features
4. production-minded hardening
