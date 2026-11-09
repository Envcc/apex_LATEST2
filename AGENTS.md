# AGENTS.md — Apex Bureau Zero-Illusion Architecture & Autonomous Subagent Specification

## Executive Overview: Zero-Illusion Architecture
Apex Bureau operates on a **Zero-Illusion System Architecture**. Probabilistic generative models are strictly barred from contract authority, financial mutation, or unverified execution. Instead, software execution follows a rigid three-stage separation of concerns:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              ZERO-ILLUSION SYSTEM PIPELINE                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [STAGE 1: UNTRUSTED DRAFTING]                                                         │
│   └── Gemini 2.5 Flash: Generates candidate JSON Abstract Syntax Tree (AST) drafts.    │
│       Probabilistic next-token inference. Zero state mutation authority.               │
│                                                                                        │
│          │ (Candidate JSON String)                                                     │
│          ▼                                                                             │
│  [STAGE 2: HARDENED COMPILATION GATE]                                                 │
│   └── Zod Invariant Validator: Enforces strict types, UUIDs, & 64-char SHA-256 hashes. │
│   └── DFS Graph Validator: Proves zero circular dependency deadlocks in the DAG.       │
│   └── Human Scoping Binding: Executive sign-off & manual criterion refinement.         │
│                                                                                        │
│          │ (Verified Executable DAG)                                                   │
│          ▼                                                                             │
│  [STAGE 3: FINAL SETTLEMENT AUTHORITY]                                                 │
│   └── Actuarial Worker Pool: Heavy-tailed Log-Normal Monte Carlo underwriting ($N=1000$).│
│   └── Oracle Telemetry Verifier: Programmatic HTTP 200 & payload SHA-256 assertions.   │
│   └── Settlement Escrow Vault: Condition-gated Firestore lock & immutable proof log.  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Separation of Concerns & Subagent Hierarchy

### 1.1 `ScopingArchitect` — Untrusted Candidate AST Generator
- **Role**: Ingests natural language directives from procurement officers and drafts candidate Abstract Syntax Tree (AST) structures.
- **Model Primitive**: `gemini-2.5-flash` with JSON output mime-type constraints and markdown code fence sanitization.
- **Invariants**:
  - **Zero Trust**: Candidate JSON outputs are treated as untrusted strings until validated.
  - **No Direct Execution**: The generator cannot write to persistent storage, alter contract state, or release escrow funds.
  - **Ambiguity Extraction**: Scans input directives for unquantifiable subjective terms (`fast`, `scalable`, `secure`) and calculates a Real-Time Verifiability Score.

### 1.2 `InvariantValidator` — Hardened Compilation Gate
- **Role**: Serves as the deterministic firewall between stochastic LLM token output and executable contracts.
- **Invariants**:
  - **Zod Schema Compilation**: Validates UUID v4 formats, URL assertion endpoints, integer status codes, complexity scalars ($1.0 - 3.0$), and 64-character SHA-256 hex hashes via `MandateASTSchema`.
  - **DFS Graph Verification**: Executes Depth-First Search with recursion stack tracking (`assertValidAOUDAG`) to mathematically prove the work breakdown structure is a Directed Acyclic Graph (DAG) with zero circular deadlocks and zero dangling parent pointers.
  - **Human Scoping Binding**: Exposes candidate nodes for executive manual refinement and sign-off before contract locking.

### 1.3 `ActuarialUnderwriter` — Heavy-Tailed Risk Engine
- **Role**: Calculates insolvency-proof fee ceilings using Log-Normal Pareto Monte Carlo simulations ($N=1,000$ iterations).
- **Isolation Boundary**:
  - Offloaded to dedicated OS hardware threads (`node:worker_threads`) via `SimulationWorkerPool` to prevent V8 event-loop starvation during heavy numerical operations.
  - Generates fat-tailed Pareto cost distributions using Box-Muller transforms.
  - Computes P50 Base, P80 Enterprise Buffer, P90 Insolvency-Proof Guarantee (default sovereign standard), and P99 Tail-Risk boundaries.

### 1.4 `OracleVerifier` — Programmatic Telemetry Agent
- **Role**: Performs live network assertions against predefined exit criteria for every Atomic Operational Unit (AOU) node.
- **Verification Matrix**:
  - **REST Endpoints**: Evaluates HTTP status codes (HTTP 200 OK) and checks payload SHA-256 hashes against expected signatures.
  - **Container Sandboxes**: Asserts Docker container exit code 0 (`docker inspect --format='{{.State.ExitCode}}'`).
  - **Cryptographic Git Trees**: Validates commit tree digest signatures and signed GitHub Actions webhooks.
  - **Multi-Sig Fallbacks**: Requires 2-of-3 executive sign-offs (Principal key + Contractor key + Bureau Arbiter key) for physical or off-chain deliverables.

### 1.5 `SettlementEscrow` — Final Settlement Authority
- **Role**: Controls condition-gated capital locks and commits signed attestations to the immutable audit ledger.
- **Security Invariants**:
  - **Server-Side Admin SDK Signatures**: Escrow state transitions (`UNFUNDED` $\rightarrow$ `FUNDED` $\rightarrow$ `COMPLETED`) require backend Firebase Admin SDK authentication.
  - **Immutable Append-Only Ledger**: Writes to the `/proofs` collection are append-only. Client sessions cannot modify or overwrite existing attestations.

---

## 2. Multi-Agent Cross-Verification Consensus Protocol

State mutations and contract escrow commitments require a signed **Multi-Agent Consensus Hash** (`MACH-*`). If any subagent fails verification, contract initialization is immediately aborted.

### 2.1 Protocol Execution Workflow

```
[Mandate Intent] ──► 1. ScopingArchitect ──► 2. InvariantValidator ──► 3. ActuarialUnderwriter ──► 4. OracleVerifier ──► 5. SettlementEscrow ──► [MACH Signed]
```

1. **Gate 1 (`ScopingArchitect`)**: Structural decomposition check. Verifies the candidate AST contains $\ge 1$ valid Atomic Operational Unit (AOU).
2. **Gate 2 (`InvariantValidator`)**: Topological cycle proof. Runs `assertValidAOUDAG(ast)` to verify non-cyclic DAG topology and Zod schema conformity.
3. **Gate 3 (`ActuarialUnderwriter`)**: Fat-tailed Monte Carlo simulation ($N=1,000$). Calculates the P90 fee ceiling scaled by average node complexity.
4. **Gate 4 (`OracleVerifier`)**: Network and schema assertion check. Confirms all assertion endpoints are valid URLs with registered SHA-256 digest targets.
5. **Gate 5 (`SettlementEscrow`)**: Final consensus check. Evaluates whether Gates 1–4 returned `VERIFIED`. Issues a signed Multi-Agent Consensus Hash (`MACH-<UUID>`).

### 2.2 Consensus Schema Interfaces

```typescript
export interface SubagentAttestation {
  agentName: 'ScopingArchitect' | 'InvariantValidator' | 'ActuarialUnderwriter' | 'OracleVerifier' | 'SettlementEscrow';
  status: 'VERIFIED' | 'FAILED';
  timestamp: string;
  details: string;
  digest: string;
}

export interface MultiAgentConsensusReport {
  timestamp: string;
  mandateId: string;
  consensusPassed: boolean;
  overallStatus: 'APPROVED_FOR_EXECUTION' | 'REJECTED_BY_INVARIANTS';
  attestations: SubagentAttestation[];
  consensusSignature: string;
  p90FeeCeiling: number;
}
```

---

## 3. Production Invariants & Engineering Standards

1. **No Mock Fallbacks in Production**:
   All contract states, actuarial risk calculations, and telemetry proofs run live against Cloud Firestore and isolated thread worker pools.
2. **Bearer Auth & Revocation Checks**:
   Server requests enforce `verifyStrictBearerAuth` with active token revocation checks (`checkRevoked = true`) via `adminAuth.verifyIdToken`.
3. **Hardened Port & Express Binding**:
   Listens strictly on port 3000. Express routes protected against unauthenticated mutation.
4. **Institutional UI & Typography**:
   Sovereign dark color scheme (`#07090E`), tabular JetBrains Mono metrics, and high-density Inter display headers matching Fortune 500 institutional fintech standards.
