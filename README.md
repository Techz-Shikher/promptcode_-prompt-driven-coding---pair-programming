<div align="center">

# PromptCode IDE 2.0

**Code · Learn · Solve · Grow**

*A full-stack, prompt-driven engineering workspace for mastering Data Structures & Algorithms, surgical debugging, contract-first software development, quantum optimization experiments, and Resume–Job Description keyword gap analysis.*

[![React 19](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-API-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini API](https://img.shields.io/badge/Gemini-Server--Side_SDK-8e75b2?style=flat-square)](https://ai.google.dev/)

[Overview](#-why-promptcode-ide-20) • [Core Modes](#-core-engineering-modes) • [Resume–JD Matcher](#-resumejob-description-matcher) • [Academy & Quantum Lab](#-prompt-academy--quantum-lab) • [Tools Suite](#-tools-analytics--collaboration-suite) • [Architecture](#-architecture--workspace-layout) • [Setup](#-getting-started) • [API](#-backend-api-reference)

</div>

---

## Why PromptCode IDE 2.0?

Most coding assistants encourage copy-pasting vague instructions and hoping the output compiles. **PromptCode IDE 2.0** reverses that habit by treating **prompt formulation as an engineering discipline**:

- **Structured Reasoning Before Syntax**: Enforces invariants, Big-O bounds, edge-case contracts, and step-by-step proofs alongside executable code.
- **Prompt → Code → Test Loop**: Execute a prompt, inspect the scored breakdown, apply the generated implementation into the editor with one click, and verify it against real automated test cases in the browser sandbox.
- **Resilient Dual-Engine Backend**: Uses `@google/genai` server-side with timeout guards (`12s`) and seamless deterministic fallbacks, so every workflow remains responsive even offline or without an API key.
- **Career-Ready Skill Alignment**: Includes a zero-dependency **Resume–JD Matcher** for `.pdf` and `.docx` resumes to surface skill gaps transparently without fabricating experience.

---

## Core Engineering Modes

Switch effortlessly between three specialized engineering workflows from the top navigation bar:

### 1. Solve (DSA) — *Canonical 7-Section Reasoning*
Designed for technical interviews and competitive programming, **Solve** grades prompt precision (`1/5`–`5/5` Prompt Power meter) and produces solutions structured around the **7-Section DSA Standard**:

| # | Section | Engineering Purpose |
| :-: | --- | --- |
| **1** | **Restating the problem** | Locks down input/output contracts, types, and domain constraints |
| **2** | **Naming the technique** | Commits to an algorithmic paradigm (Sliding Window, DP, Two Pointers, Monotonic Stack, etc.) |
| **3** | **Key observations** | Surfaces monotonicity, optimal substructure, or lookup invariants |
| **4** | **The algorithm** | Establishes a clean procedural walkthrough prior to code |
| **5** | **Correctness arguments** | Justifies why loop invariants and base cases hold across edge inputs |
| **6** | **Complexity analyses** | Derives tight worst-case Time and Space Big-O bounds |
| **7** | **Potential pitfalls** | Flags integer overflow, duplicates, empty inputs, and off-by-one traps |

- **9 Built-in DSA Challenges**: *Two Sum* (`Easy`), *Valid Parentheses* (`Easy`), *Longest Substring Without Repeating Characters* (`Medium`), *Coin Change* (`Medium`), *Course Schedule II* (`Medium`), *Subarray Sum Equals K* (`Medium`), *LRU Cache* (`Medium`), *Trapping Rain Water* (`Hard`), and *Median of Two Sorted Arrays* (`Hard`).
- **One-Click Formatting & Quick Prompts**: Expand any brief prompt into the 7-section format or pick curated starter templates from the Prompt Studio bar.

### 2. Debugging Lab — *Surgical Defect Isolation*
Built to cure "rewrite the whole file" AI behavior by enforcing root-cause rigor:
- **Invariant & Termination Diagnosis**: Pinpoints exact failing conditions (e.g., non-contracting binary search bounds or missing recursion-stack states in directed graph cycle checks).
- **Dry-Run Trace**: Walks step-by-step through state transitions immediately preceding an infinite loop or false positive.
- **Minimal Patching**: Preserves function signatures and surrounding logic while guarding against regressions.
- **2 Built-in Debugging Challenges**: *Binary Search Infinite Loop & Off-by-One* and *Directed Graph Cycle Detection False Positives*.

### 3. System Dev (Development) — *Contract-First Architecture*
Focused on building production-grade TypeScript modules from architectural specifications:
- **Interface & Resource Hygiene**: Emphasizes explicit API contracts, `O(1)` memory bounds, jitter/concurrency math, and leak-free designs (such as lazy timestamp refill instead of background `setInterval` timers).
- **Multi-Language Editor & Live Test Sandbox**: Supports `TypeScript`, `Python`, `C++`, `Java`, and `Go` editing, inline **Apply to Editor / Discard** banners for prompt-generated code, custom test case creation, and real in-browser TypeScript transpilation & execution (`src/utils/testRunner.ts`) with runtime and memory telemetry.
- **3 Built-in System Dev Challenges**: *Token Bucket Rate Limiter with Burst & Refill*, *Strictly Typed Event Emitter with Once & Wildcards*, and *Resilient Retry with Exponential Backoff & Full Jitter*.

---

## Resume–Job Description Matcher

> Access via **Tools & Labs → Resume–JD Matcher** in the top navigation bar.

Analyze how well your resume aligns with a target job description—with **zero third-party parser bloat** and **strict anti-fabrication guardrails**.

### How the Pipeline Works

```text
  [ PDF / DOCX Upload ] ──► Server-Side Extractor (/api/resume/parse)
         (<= 5 MB)           • DOCX: Inflates OOXML zip (word/document.xml, tables, headers/footers)
                             • PDF : Lexes BT/ET content streams, FlateDecode & /ToUnicode CMaps
                                       │
                                       ▼
  [ Job Description Text ] + [ Extracted Resume Text ] ──► Matching Engine (/api/resume/analyze)
                                                                       │
                                                                       ▼
                       ┌───────────────────────────────────────────────────────────────┐
                       │ • Resume Match % & Required Keyword Counter                   │
                       │ • Matched vs. Missing Keywords (Mandatory / Skills / Quals)   │
                       │ • Relevant Skills Present vs. Missing                         │
                       │ • Honest Recommendations (Never auto-edited into resume)      │
                       └───────────────────────────────────────────────────────────────┘
```

### Highlights
- **Accurate Boundary & Phrasing Matching**: Handles case-insensitivity, aliases (`PostgreSQL`/`Postgres`, `Node.js`/`NodeJS`), hyphens/spaces (`Data-Modeling`/`Data Modeling`), and plurals (`Stored Procedure`/`Stored Procedures`)—while preventing false positives like `SQL` matching inside `MySQL`.
- **Transparent Reference Preview**: Displays the extracted resume text and metadata (character count, word count, parser engine) alongside the gap analysis.
- **Honest Recommendation Guardrail**: Missing keywords are surfaced with priority levels and placement tips, never automatically injected into the resume.

---

## Prompt Academy & Quantum Lab

### Prompt Engineering Academy
Accessible directly from the main toolbar (**Prompt Academy**), featuring 4 structured modules:

| Module | Focus Area | Level | Practice Problem |
| --- | --- | --- | --- |
| **1. The 5-Pillar Matrix** | Persona, I/O Contract, Big-O Bounds, Edge Invariants & CoT | Beginner | *Two Sum* |
| **2. Canonical 7-Section DSA** | Full Restate → Pitfalls mathematical standard | Intermediate | *Longest Substring Without Repeating Characters* |
| **3. Root-Cause Debugging** | Failing trace isolation & surgical line-level patches | Intermediate | *Binary Search Off-by-One* |
| **4. Contract-First Development** | Interfaces, resource cleanup & adversarial unit tests | Advanced | *Token Bucket Rate Limiter* |

Each module contrasts **The Amateur Mistake** (*why vague prompts fail*) against **The Master Developer Prompt** (*why structured prompts win*) and includes a **Launch Practice Lab** button to load the target challenge into the IDE.

### Quantum & Research Lab
Accessible via **Tools & Labs → Quantum & Research Lab**:
- **QAOA Component Selection**: Models prompt clause selection using Quantum Approximate Optimization weights across all 7 reasoning components under an adjustable word/token budget slider (`50–120` words), dynamically showing which clauses are **Included** vs. **Pruned**.
- **Qiskit 1.0 Circuit Synthesizer**: Ready-to-copy Python Qiskit 1.0 templates for **Bell State Entanglement** (`StatevectorSampler`), **Grover's Quantum Search Oracle**, and **3-Qubit Quantum Fourier Transform (QFT)**.

---

## Tools, Analytics & Collaboration Suite

Every supporting tool integrates directly into the 3-column IDE workflow:

| Tool | Where to Find It | What It Does |
| --- | --- | --- |
| **Prompt Optimizer** | Top Bar | Evaluates weak/ambiguous prompts and upgrades them into constraint-bound specifications |
| **Problem Bank & AI Importer** | Top Bar | Browse problems by difficulty, install curated packs, or convert unstructured text into runnable challenges |
| **Interactive Code Review** | Workspace / Panel | Persona-driven line-by-line review score with one-click suggested patches |
| **Live Pair Programming & `@ai` Chat** | Workspace Drawer | Toggle **Driver / Navigator** roles, voice indicator, and context-aware `@ai` chat assistance |
| **Prompt A/B Comparison** | Tools & Labs | Benchmark two prompt variants side by side (score, Big-O, strengths, improvements) |
| **Prompt Skill Analytics** | Tools & Labs | Competency breakdown across invariant rigor, complexity discipline, edge guards, and prompt replay history |
| **Multi-Model & 3-Agent Swarm** | Tools & Labs | Smart/manual routing across 5 model profiles (`Gemini 3.8 Flash`, `Gemini 2.5 Pro`, `Claude 3.5 Sonnet`, `GPT-4o`, `DeepSeek-R1`) + 3-agent deliberation simulator |
| **SQL & API Assistant** | Tools & Labs | Query + compound index advisor (`PostgreSQL`, `MySQL 8.0`, `SQLite`) and OpenAPI 3.0 YAML generator |
| **Leaderboard & Challenges** | Tools & Labs | Rankings, badges, constrained daily challenges, and shareable community prompt patterns |
| **Dev Integrations & Health** | Tools & Labs | Live REST API test console, VS Code `dsa7` snippet, GitHub Actions CI/CD YAML, telemetry, and audit logs |

### Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl / Cmd + K` | Focus quick problem & tag search |
| `Ctrl / Cmd + I` | Ask AI directly from the code editor |
| `Tab` | Insert indentation inside the code editor |
| `Esc` | Dismiss active search/tool popovers |

---

## Architecture & Workspace Layout

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, `motion/react`, `lucide-react`, `canvas-confetti`
- **Backend**: Node.js + Express (`server.ts`) serving both `/api/*` endpoints and Vite dev middleware (or static `dist/` in production)
- **AI SDK**: `@google/genai` (all API calls execute server-side; no client API key exposure)

```text
├── server.ts                          # Express API server, Gemini orchestration & Vite middleware
├── index.html                         # HTML entry point & SEO/OpenGraph metadata
├── metadata.json                      # Application manifest & capabilities
├── package.json                       # Scripts (dev, lint, build, start) & dependencies
├── .env.example                       # Environment template (GEMINI_API_KEY, APP_URL)
└── src/
    ├── App.tsx                        # 3-column IDE layout, state, shortcuts & modal orchestration
    ├── types.ts                       # Shared domain types & interfaces
    ├── index.css                      # Tailwind CSS v4 config & custom theme/scrollbar styles
    ├── data/
    │   ├── problems.ts                # 14 built-in problems across Solve, Debug & System Dev + packs
    │   ├── lessons.ts                 # Prompt Engineering Academy 4-module curriculum
    │   └── masterChecklist.ts         # Feature checklist metadata
    ├── utils/
    │   ├── resumeParser.server.ts     # Zero-dependency Node zlib PDF & DOCX text extractor
    │   ├── resumeMatcher.ts           # JD keyword extraction, token-boundary matcher & gap recommender
    │   ├── testRunner.ts              # In-browser TypeScript transpiler & test case runner
    │   ├── problemProgress.ts         # Persistent problem completion & score tracking
    │   ├── customProblems.ts          # LocalStorage persistence for imported problems
    │   ├── dsaPromptFormat.ts         # Canonical 7-section DSA prompt builder & helpers
    │   └── sounds.ts                  # Web Audio UI feedback effects
    └── components/
        ├── Navbar.tsx                 # Top navigation, mode switcher, Ctrl+K search & Tools & Labs menu
        ├── ProblemPanel.tsx           # Problem selector, difficulty filters, constraints & guide
        ├── CodeEditorPanel.tsx        # Multi-language editor, AI solution banner & shortcuts
        ├── PromptEngineeringBar.tsx   # Prompt studio, power meter & quick templates
        ├── RealtimeStepsPanel.tsx     # Step-by-step reasoning, Copilot tab & Apply Code controls
        ├── TestResultsPanel.tsx       # Automated test suite results & custom test builder
        ├── ResumeMatcherModal.tsx     # Resume upload, JD input & keyword gap dashboard
        ├── PromptAcademyModal.tsx     # Interactive lessons & Launch Practice Lab flow
        ├── QuantumAndResearchModal.tsx# QAOA clause optimizer & Qiskit 1.0 circuit synthesizer
        └── ...                        # Optimizer, Compare, Analytics, Routing, SQL/API, Integrations, Review & Auth modals
```

---

## Getting Started

### Prerequisites
- **Node.js 20+** and **npm**

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for server-side `/api/*` routes. When omitted or timed out, endpoints automatically fall back to deterministic local engines. |
| `APP_URL` | Optional | Public URL where the application is deployed. |

### 3. Start the Development Server
```bash
npm run dev
```
Runs Express + Vite middleware together on **`http://localhost:3000`**.

### 4. Typecheck, Build & Production Run
```bash
npm run lint     # TypeScript strict typecheck (tsc --noEmit)
npm run build    # Builds Vite frontend + bundles server.ts to dist/server.cjs
npm start        # Serves production build on port 3000
```

---

## Backend API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health probe reporting server status and Gemini configuration state |
| `POST` | `/api/prompt/execute` | Executes `solve`, `debug`, or `develop` prompts; returns prompt score, steps, complexity, and code |
| `POST` | `/api/prompt/optimize` | Audits a raw prompt and returns an upgraded constraint-driven specification |
| `POST` | `/api/prompt/compare` | Benchmarks two prompt variants side by side (scores, Big-O, strengths, improvements) |
| `POST` | `/api/review` | Runs persona-based code review with rating and line-level annotations |
| `POST` | `/api/problem/import-ai` | Parses unstructured problem text into a structured challenge with starter code and tests |
| `POST` | `/api/chat` | Context-aware AI pair programmer replies for `@ai` messages |
| `POST` | `/api/resume/parse` | Validates `.pdf`/`.docx` uploads (`<= 5 MB`) and returns extracted text & parser metadata |
| `POST` | `/api/resume/analyze` | Compares extracted resume text against a job description; returns match score, keyword gaps & honest recommendations |
