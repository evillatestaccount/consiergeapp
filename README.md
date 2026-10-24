# EscortVilla — VIP Event & Travel Companionship

> Production-Ready Full-Stack Directory for Verified Social Companions and Event-Dating Hosts built with **Next.js (App Router)**, **TypeScript**, **Prisma ORM**, **Tailwind CSS**, and powered by **Bun**.

---

## 💎 Design System & Aesthetic
- **Brand Palette:**
  - **Primary Magenta:** `#D91680`
  - **Deep Purple:** `#4B1248`
  - **Crimson Accent:** `#E62044`
  - **Soft Blush Pink:** `#FDEEF4`
  - **Neutrals & Dark Canvas:** `#0B070E`, `#1A1A1A`, `#FFFFFF`
- **Styling:** Luxury glassmorphism (`backdrop-blur-xl`, `border-white/10`), clean `rounded-2xl` & `rounded-3xl` radii, subtle hover-zoom portrait interactions, and responsive card layouts.
- **Tone:** High-end concierge, discreet, elegant, and professional. 100% compliant with formal social directory standards (zero adult terminology or NSFW references anywhere in schema, UI, or dummy data).

---

## 🏛️ Architecture & Features

### 1. Static Site Generation (SSG) & On-Demand ISR
- **Pre-rendered City Directory Hubs:** `/companions-in-delhi`, `/companions-in-mumbai`, `/companions-in-london`, `/companions-in-new-york` are statically pre-rendered at build time with `generateStaticParams()`.
- **Zero Client-Side Spinners:** Directory hubs and listings are server-rendered with instant static-compatible filter controls powered by URL search parameters.
- **On-Demand Incremental Static Regeneration (ISR):** Triggered automatically whenever a listing is approved or updated (`/api/revalidate?path=/companions-in-[city]&token=secure-reval-token`).
- **Comprehensive SEO & Structured Data:** Dynamic OpenGraph tags, dynamic Twitter cards, breadcrumbs, and JSON-LD schemas (`ItemList`, `LocalBusiness`, `Person`, `BreadcrumbList`).

### 2. Dual-Role RBAC & Management Portals
- **SuperAdmin Portal (`/admin/super`):**
  - **Listing Moderation Queue:** Review pending listings. One-click "Approve & Publish" sets status to `PUBLISHED`, updates the verification badge, triggers an automated Nodemailer status email, and executes on-demand ISR revalidation.
  - **Editor Management:** Approve, decline, or suspend registered agency editors. Approving triggers an automated welcome email via Nodemailer.
  - **City Management:** Add and curate supported metropolitan chapters (registers new static slugs).
  - **Concierge Inbox:** Read, flag (`NEW`, `CONTACTED`, `RESOLVED`), and manage incoming VIP booking inquiries.
- **Editor Workspace (`/admin/editor`):**
  - Multi-step modal for creating and updating companion profiles (Profile, Scope, Pricing, Gallery).
  - Image uploader (drag & drop with preview).
  - Submitting listing sets status to `PENDING_REVIEW` for SuperAdmin approval.
- **Dual-Role Auth (`/admin/login`, `/admin/register`):**
  - JWT in secure HTTP-only cookies (`escortvilla_token`).
  - Passwords hashed with `bcryptjs`.
  - Self-signup with *"Account pending SuperAdmin activation"* workflow.

### 3. Database Layer (PostgreSQL via Prisma + Embedded Store)
- **Prisma PostgreSQL:** Configured in `prisma/schema.prisma` with `User`, `City`, `CompanionListing`, and `Inquiry` models.
- **Resilient Unified Data Layer (`src/lib/db.ts`):** Connects to PostgreSQL via Prisma when configured in `DATABASE_URL`. If running offline or locally without an external database server, it automatically and seamlessly falls back to a persistent embedded store (`.data/store.json`) with identical schema, relationships, and queries.

### 4. Nodemailer Service Module (`src/lib/email.ts`)
- `sendAdminNewEditorAlert(editorData)`
- `sendEditorApprovedEmail(editorEmail, editorName)`
- `sendListingStatusEmail(editorEmail, listingTitle, status, comments)`
- `sendInquiryNotification(inquiryData)` (Dispatches both Client confirmation and Admin notification)

---

## 🔑 Default Evaluation Credentials

| Role | Email | Password |
|---|---|---|
| **SuperAdmin** | `admin@escortvilla.com` | `AdminPass123!` |
| **Approved Editor** | `sophia.editor@escortvilla.com` | `EditorPass123!` |
| **Approved Editor** | `marcus.editor@escortvilla.com` | `EditorPass123!` |
| **Pending Editor** | `elena.pending@escortvilla.com` | `EditorPass123!` |

---

## 🚀 Quickstart with Bun

### 1. Install Dependencies
```bash
bun install
```

### 2. Seed Database
```bash
bun run seed
```

### 3. Build for Production (SSG + ISR)
```bash
bun run build
```

### 4. Start Production Server
```bash
bun run start
```
The application will be live at `http://localhost:3000`.

### 5. Development Mode
```bash
bun run dev
```

---

## 🐳 Running with Docker & Real PostgreSQL

This platform includes a complete **Dockerfile** and **docker-compose.yml** with automated PostgreSQL 16 provisioning, schema synchronization, and database seeding.

### One-Command Startup
```bash
docker compose up --build -d
```

### What happens automatically:
1. Starts the `postgres:16-alpine` database service on port `5432`.
2. Runs healthchecks until PostgreSQL is ready to accept connections.
3. Automatically runs `prisma db push` to create all PostgreSQL tables (`users`, `cities`, `companion_listings`, `inquiries`).
4. Runs `scripts/seed.ts` to populate PostgreSQL with:
   - SuperAdmin (`admin@auradirectory.com` / `AdminPass123!`)
   - 2 Approved Editors and 1 Pending Editor
   - 4 Cities (New York, London, Delhi, Mumbai)
   - 10 Verified companion listings and sample VIP inquiries
5. Starts the Next.js production server with Bun on **`http://localhost:3000`**.

### View Container Logs
```bash
docker compose logs -f app
```

### Stop Containers
```bash
docker compose down
```

---

## 🌐 Public Routes & Directory Hubs
- **Home:** `http://localhost:3000/`
- **Companions in London:** `http://localhost:3000/companions-in-london`
- **Companions in New York:** `http://localhost:3000/companions-in-new-york`
- **Companions in Delhi:** `http://localhost:3000/companions-in-delhi`
- **Companions in Mumbai:** `http://localhost:3000/companions-in-mumbai`
- **Companion Profile:** `http://localhost:3000/profile/comp-1`
- **Concierge Desk & Inquiries:** `http://localhost:3000/contact`
- **Login Portal:** `http://localhost:3000/admin/login`
- **Editor Registration:** `http://localhost:3000/admin/register`
- **Editor Dashboard:** `http://localhost:3000/admin/editor`
- **SuperAdmin Console:** `http://localhost:3000/admin/super`
