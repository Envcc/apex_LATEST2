# FILE_ROADMAP.md — Apex Bureau Comprehensive Source File State & Roadmap Manifest

This document maps every source file in the Apex Bureau codebase, detailing its **Current Production State**, **Architectural Invariants**, and **Concrete Steps Required to Reach Future State**.

---

## 1. Root & Infrastructure Systems

### `/server.ts`
- **Current State**: Hardened Express application mounted with Vite middleware in dev. Features endpoints `/api/scope` (Gemini AST compilation), `/api/cost` (Monte Carlo worker pool dispatch), `/api/agents/verify` (multi-agent cross-verification), `/api/attest` (Firestore proof commits), `/api/verify` (REST exit criterion checking), and `/api/health` (uptime monitor).
- **Invariants**: Listens on port 3000. Express routes protected by `verifyStrictBearerAuth`.
- **Steps to Future State**:
  1. Add native support for WebSocket / SSE streaming telemetry feeds.
  2. Integrate automated container sandbox runner (`docker inspect` API) inside `/api/verify`.
  3. Implement HSM (Hardware Security Module) signature validation for multi-region Zurich/Singapore escrow keys.

### `/firestore.rules`
- **Current State**: Security rules enforcing read access for authenticated users, state lock on `/mandates/{mandateId}` (`escrowStatus == resource.data.escrowStatus`), and write restriction on `/proofs` reserved exclusively for server-side Admin SDKs.
- **Invariants**: Client sessions cannot directly mutate escrow status or overwrite proof records.
- **Steps to Future State**:
  1. Add fine-grained Role-Based Access Control (RBAC) checking `request.auth.token.role == 'AUDITOR'`.
  2. Enforce field-level validation on mandate fee amounts.

### `/AGENTS.md`
- **Current State**: System-level specification defining the Zero-Illusion multi-agent pipeline (`ScopingArchitect`, `InvariantValidator`, `ActuarialUnderwriter`, `OracleVerifier`, `SettlementEscrow`).
- **Invariants**: Gemini treated as untrusted AST candidate generator; Zod/DFS DAG as compilation gate; Escrow as settlement authority.
- **Steps to Future State**:
  1. Automate agent consensus logging to decentralized IPFS / Arweave ledgers.

---

## 2. Server Worker Threads (`/server`)

### `/server/sim-worker.ts`
- **Current State**: OS worker thread script receiving `RiskParams` via `workerData`, executing `computeFatTailedMonteCarlo`, and posting results back via `parentPort`.
- **Invariants**: Isolated CPU thread execution. Zero event-loop blocking on main process.
- **Steps to Future State**:
  1. Upgrade to WebAssembly (WASM) C++ SIMD compilation for 100,000-iteration trials under < 1ms.

### `/server/worker-pool.ts`
- **Current State**: Thread pool manager (`SimulationWorkerPool`) that dynamically spawns worker threads, handles lifecycle events, and terminates workers upon completion.
- **Invariants**: Non-blocking asynchronous interface (`executeSimulation`).
- **Steps to Future State**:
  1. Maintain a persistent warm worker pool to eliminate thread cold-start latency.

---

## 3. Core Engine Libraries (`/src/lib`)

### `/src/lib/ast-compiler.ts`
- **Current State**: Ingestion and validation module. Sanitizes Markdown code fences, parses JSON, and enforces `MandateASTSchema` via Zod (`ExitCriterionSchema`, `AtomicOperationalUnitSchema`, `MandateASTSchema`).
- **Invariants**: Throws runtime compilation errors on malformed keys, invalid UUIDs, or missing exit criteria.
- **Steps to Future State**:
  1. Add support for custom domain-specific assertion schemas (e.g., Kubernetes CRD checks).

### `/src/lib/dag-validator.ts`
- **Current State**: Topological graph validator (`assertValidAOUDAG`). Runs Depth-First Search (DFS) with recursion stack tracking to guarantee zero circular dependencies and verify parent ID references.
- **Invariants**: Rejects circular execution loops before any persistent write.
- **Steps to Future State**:
  1. Compute and expose critical path duration analysis and parallel execution tiering.

### `/src/lib/subagent-verification.ts`
- **Current State**: Cross-verification consensus engine (`executeMultiAgentCrossVerification`). Evaluates all 5 system subagents and issues cryptographically signed reports with signature `MACH-*`.
- **Invariants**: Unanimous pass required for `APPROVED_FOR_EXECUTION` status.
- **Steps to Future State**:
  1. Add multi-signature threshold cryptography (2-of-3 key signing).

### `/src/lib/simulation-engine.ts`
- **Current State**: Fat-tailed Log-Normal Monte Carlo risk engine (`computeFatTailedMonteCarlo`). Uses Box-Muller transforms ($Z \sim \mathcal{N}(0,1)$) scaled by complexity multipliers to generate P50, P80, P90, and P99 fee spreads.
- **Invariants**: Log-Normal Pareto probability density function.
- **Steps to Future State**:
  1. Ingest historical execution telemetry to dynamically calibrate complexity multipliers.

### `/src/lib/firebase-admin.ts` & `/src/lib/firebase.ts`
- **Current State**: Admin SDK initialization using `firebase-applet-config.json` and client SDK initialization for Google Auth and Firestore listeners.
- **Invariants**: Explicit database ID configuration (`ai-studio-apexbureau-*`).
- **Steps to Future State**:
  1. Implement local offline persistent cache fallback.

---

## 4. Ingress Security & Middleware (`/src/middleware`)

### `/src/middleware/auth.ts`
- **Current State**: Hardened Express Bearer auth middleware (`verifyStrictBearerAuth`). Verifies ID tokens with `checkRevoked = true` via Firebase Admin SDK. Restricted sandbox bypass for development.
- **Invariants**: 401 Unauthorized response on invalid or missing tokens.
- **Steps to Future State**:
  1. Integrate IP geolocation and device fingerprint validation.

---

## 5. UI Components & Render Engine (`/src/components`)

### `/src/components/scoping/ScopingEditor.tsx`
- **Current State**: Human Scoping Binding editor. Allows executive principals to review and modify AOU titles, descriptions, duration hours, complexity scalars, and assertion endpoints prior to contract locking.
- **Invariants**: Real-time two-way state synchronization with `MandateAST`.
- **Steps to Future State**:
  1. Add rich inline diff visualizer showing LLM candidate vs. Human-edited specification.

### `/src/components/scoping/IntentInputForm.tsx`
- **Current State**: Directive input form featuring real-time ambiguity heatmap evaluation (`evalAmbiguity`) and verifiability scoring.
- **Invariants**: Highlights subjective terms (`fast`, `scalable`, `secure`).
- **Steps to Future State**:
  1. Suggest automated replacement clauses for vague requirements.

### `/src/components/dag/ExecutionGraphView.tsx`
- **Current State**: Topological execution visualizer displaying AOU nodes, status indicators (`PENDING`, `IN_PROGRESS`, `COMPLETED`), durations, complexity scalars, and proof counts.
- **Invariants**: Clean, responsive layout.
- **Steps to Future State**:
  1. Integrate interactive drag-and-drop node re-ordering with automated DAG re-validation.

### `/src/components/escrow/RiskSlider.tsx`
- **Current State**: Underwriting control drawer allowing selection between P50 Base, P80 Enterprise Buffer, and P90 Insolvency-Proof Guarantee tiers.
- **Invariants**: Formats currency figures in tabular monospace.
- **Steps to Future State**:
  1. Add real-time risk sensitivity analysis graphs.

### `/src/components/audit/SubagentVerificationPanel.tsx`
- **Current State**: Multi-agent consensus verification display rendering real-time attestations, subagent statuses, digests, and MACH consensus signatures.
- **Invariants**: Visual pass/fail status for all 5 subagents.
- **Steps to Future State**:
  1. Add clickable drill-down inspection for individual subagent proof traces.

---

## 6. Client Application Entry Point (`/src`)

### `/src/App.tsx`
- **Current State**: Core application view state machine (`dashboard`, `scoping`, `engagement`, `audits`). Connects Google Authentication, Firestore realtime listeners, ScopingWorkflow, and EngagementDashboard.
- **Invariants**: Sovereign dark design system (`#07090E`), institutional branding (Delta Vault $\Delta$), Plus Jakarta Sans / Inter / JetBrains Mono typography.
- **Steps to Future State**:
  1. Implement multi-language localization (German, French, English for Zurich/Singapore financial centers).
