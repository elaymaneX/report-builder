# PCF Report Generator

Web app that turns ISO 14067 Product Carbon Footprint (PCF) CSV data into branded PDF reports. Built for the **Footprint Mappa** technical challenge (RELATS S.A.U. client sample).

**Live demo:** add your Vercel URL here after deploy  
**Repository:** https://github.com/elaymaneX/report-builder

---

## Rationale — path blend and why

I implemented **Paths A, B, and C together** (full blend), not a single path in isolation.

| Path | What it adds | Why include it |
|------|----------------|----------------|
| **A** | CSV → validated model → PDF | Core product value: turn PCF data into a client-ready report without manual Word work. |
| **B** | `ReportConfig` (template, sections, branding) | Same dataset, different audiences — board summary vs full technical report — without duplicating parsers or templates. |
| **C** | Natural-language edits to `ReportConfig` via chat + MCP | Lowers friction for non-technical users and demonstrates agent-friendly architecture (tools, not prompt-only magic). |

**Design principle:** data and presentation are separate. The CSV parser produces `PcfReportData`; Paths B and C only mutate `ReportConfig`. The LLM never edits emission numbers — only report settings — which keeps results auditable and avoids hallucinated carbon data.

**PDF approach:** `@react-pdf/renderer` with React components mirroring the Footprint Mappa / Relats sample structure (~25 pages full template: intro, methodology, scope, scenarios, results, per-product detail, recommendations). Footprint Mappa logo appears on every report; client logo is configurable (Relats by default).

**Why MCP:** Path C tools (`get_report_config`, `update_report_config`, etc.) are shared between the in-app chat and a stdio MCP server for Cursor — one contract, two surfaces.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY or OPENAI_API_KEY for Path C
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

1. **Left column (Path B):** template, sections, colours, client name, logo, year  
2. **Right column (Path C):** describe changes in natural language — config syncs with the form  
3. **Use sample CSV** or upload your file → **Download PDF**

Paths A + B work without any API keys. Path C requires an LLM provider key.

---

## Paths implemented

| Path | Scope | Status |
|------|--------|--------|
| **A** | CSV → validated model → branded PDF | Done |
| **B** | `ReportConfig`: template, sections, branding, metadata, logo upload | Done |
| **C** | NL edits to `ReportConfig` (chat + MCP tools) | Done |

### Report configuration (Path B)

```ts
type ReportConfig = {
  template: "full" | "summary";
  sections: {
    introduction: boolean;
    portfolioSummary: boolean;
    productDetails: boolean;
    topEmissionSources: boolean;
  };
  branding: {
    primaryColor: string;
    accentColor: string;
    clientName: string;
    logoDataUrl?: string;   // optional; defaults to bundled Relats logo
  };
  metadata: {
    reportYear: number;
    reportTitle: string;
  };
};
```

- **`full`** — cover + sections 1–5 + portfolio table + two pages per product (~25 pages with sample CSV)  
- **`summary`** — cover + portfolio table only (~2 pages); sections are locked automatically

---

## How it works

```
CSV  →  parsePcfCsv()  →  PcfReportData
                              ↓
Form (B) ──┐
Chat (C) ──┴→ ReportConfig  →  resolveReportConfig()
                              ↓
              resolveReportLogos() + PcfDocument (react-pdf)
                              ↓
                         PDF download
```

---

## Project structure

```
report-builder/
├── public/
│   ├── data/sample_pcf_iso_14067.csv
│   └── branding/                    # Relats + Footprint Mappa logos
├── src/
│   ├── app/
│   │   ├── api/generate/pcf/        # PDF API (Path A)
│   │   ├── api/chat/                # AI editor (Path C)
│   │   └── components/              # Workspace, form, chat, theme
│   └── lib/
│       ├── pcf/                     # Domain module (swappable for OCF)
│       │   ├── parse-csv.ts
│       │   ├── config/
│       │   ├── pdf/                 # document.tsx, content.ts, logos
│       │   └── tools/               # Agent + MCP handlers
│       ├── branding/                # Mappa (UI) + Relats (PDF defaults)
│       └── server/                  # HTTP helpers
├── mcp-server/index.ts              # MCP stdio server (same tools as chat)
├── .env.example
└── vercel.json
```

| Module | Responsibility |
|--------|----------------|
| `lib/pcf/` | All PCF logic — intended swap target for future `lib/ocf/` |
| `lib/branding/` | Visual identity tokens |
| `lib/server/` | Framework-agnostic HTTP plumbing |
| `app/` | Next.js UI and routes |

---

## Technology survey — build, reuse, buy

### Application framework

| Option | Type | Verdict |
|--------|------|---------|
| **Next.js (App Router)** | Open-source | **Chosen** — API routes for PDF/chat, React UI, one-repo deploy on Vercel |
| Remix / SvelteKit | Open-source | Viable; less aligned with team’s likely React stack |
| Separate Express + SPA | Build | More moving parts for same outcome |

### CSV parsing

| Option | Type | Verdict |
|--------|------|---------|
| **PapaParse** | Open-source | **Chosen** — robust header mode, browser + Node |
| csv-parse | Open-source | Similar; PapaParse already familiar |
| Manual split | Build | Fragile for quoted fields and Excel exports |

### PDF generation

| Option | Type | Verdict |
|--------|------|---------|
| **@react-pdf/renderer** | Open-source | **Chosen** — React templates in git, server-side render, fits serverless |
| Puppeteer / Playwright (HTML→PDF) | Open-source | Higher visual fidelity; heavy cold starts, harder on Vercel limits |
| pdf-lib / jsPDF | Open-source | Low-level; too much layout code for 25-page reports |
| Docx templating (docxtemplater) | Open-source + optional paid | Closer to Word output; harder to diff and version |
| **Paid APIs** (PDFMonkey, Carbone, etc.) | Buy | Fast to prototype; ongoing cost and vendor lock-in |
| **Manual Word** | — | Not scalable for batch client reports |

**Decision:** **Build** the template in react-pdf, **reuse** PapaParse and Next.js, **buy** only the LLM API for Path C (no paid PDF SaaS).

### AI / agent layer (Path C)

| Option | Type | Verdict |
|--------|------|---------|
| **Vercel AI SDK** + tool calling | Open-source | **Chosen** — provider-agnostic, Zod schemas, fits Next.js |
| LangChain / LangGraph | Open-source | Heavier; overkill for five config tools |
| Raw OpenAI / Anthropic SDK | Open-source | Works; AI SDK reduces boilerplate |
| **MCP (@modelcontextprotocol/sdk)** | Open-source standard | **Reuse** — same tools exposed to Cursor and future agents |

### Hosting

| Option | Type | Verdict |
|--------|------|---------|
| **Vercel** | Paid tier / hobby | **Chosen** — zero-config Next.js, env vars for API keys |
| Docker + VPS | Build | More ops for a challenge scope |
| AWS Lambda + S3 | Build | Flexible; slower to ship |

---

## Path C — tools (chat + MCP)

| Tool | Purpose |
|------|---------|
| `get_report_config` | Read current config + human summary |
| `update_report_config` | Partial patch merged via `resolveReportConfig` |
| `set_template` | `full` or `summary` |
| `toggle_section` | Enable/disable a section |
| `explain_report` | Describe output without changing config |

**In the app:** chat panel syncs with the form; **Undo** reverts AI-only changes.  
**In Cursor:** `npm run mcp` — see `.cursor/mcp.json`.

---

## API

### `GET /api/generate/pcf`

Sample CSV PDF. Optional: `?template=summary`

### `POST /api/generate/pcf`

| Content-Type | Body |
|--------------|------|
| `multipart/form-data` | `file` (CSV) + `config` (JSON string) |
| `application/json` | `{ "csv"?: string, "config"?: PartialReportConfig }` |

Response: `application/pdf`

### `POST /api/chat`

```json
{
  "messages": [{ "role": "user", "content": "Executive summary for the board" }],
  "config": { "template": "full" }
}
```

Requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` (see `.env.example`).

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS v4, light/dark theme |
| PDF | @react-pdf/renderer |
| CSV | PapaParse |
| Agent | Vercel AI SDK + Claude or OpenAI |
| Validation | Zod |
| MCP | @modelcontextprotocol/sdk |

No database. LLM API is the only external service (Path C only).

---

## Time invested

Approximate breakdown (solo work + AI-assisted sessions):

| Phase | Hours | Notes |
|-------|-------|-------|
| Path A — CSV parser + basic PDF | ~8h | Types, fields mapping, Relats branding, API route |
| Path B — config UI + template rules | ~4h | Form, `resolveReportConfig`, section toggles |
| Path C — agent, chat, MCP | ~6h | Tools, Zod schemas, workspace sync, undo |
| PDF alignment with Mappa sample | ~4h | Multi-section narrative, logos, ~25-page layout |
| UI polish + deploy prep | ~3h | Footprint Mappa theme, Vercel, README |
| **Total** | **~25h** | Across several days including review and debugging |

---

## AI usage disclosure

**Tools used:** Cursor (Agent mode), Claude / OpenAI via Vercel AI SDK, MCP in Cursor for local tool testing.

| Area | AI role | My role |
|------|---------|---------|
| Architecture (data vs config split, module layout) | Suggested patterns | **Decided** final structure and naming |
| Path C tool design | Drafted schemas and handlers | **Reviewed** boundaries (config-only, no CSV edits) |
| PDF `document.tsx` / `content.ts` | Generated large drafts from sample PDF | **Directed** structure, tested output, fixed react-pdf/SVG font issues |
| UI components | Scaffolded workspace, chat, theme | **Adjusted** UX, copy, layout |
| README & rationale | Draft assistance | **Own** time estimates and final wording |
| Debugging | Helped trace PDF/API errors | **Reproduced** issues, validated fixes locally |

**What I did not delegate:** product decisions (full A+B+C blend), choice of react-pdf over Puppeteer, requirement that the agent must not mutate emission data, and all manual testing (sample CSV, template switches, chat → PDF flow).

---

## Next steps (with more time)

1. **OCF module** — mirror `lib/pcf/` as `lib/ocf/` for Organisation Carbon Footprint reports  
2. **PDF fidelity** — pie charts, scenario diagrams closer to the Word original; optional Puppeteer pass for pixel-perfect exports  
3. **Data QA** — reconcile `sum(stages)` vs `total_emissions`; warn on CSV inconsistencies  
4. **CSV robustness** — semicolon delimiter (European Excel), column mapping UI  
5. **Tests** — parser unit tests, snapshot tests for `resolveReportConfig`, smoke test for PDF generation  
6. **Path C** — streaming chat responses; logo/colour changes via natural language with preview  
7. **Persistence** — save/load report configs per client (Postgres or Vercel KV)  
8. **i18n** — Catalan/Spanish report narratives alongside English  
9. **Auth** — simple login if deployed for multiple Mappa consultants  

---

## Deploy to Vercel

1. Import repo at [vercel.com/new](https://vercel.com/new)  
2. Framework: **Next.js** (auto-detected)  
3. Environment variables for Path C:

| Variable | Example |
|----------|---------|
| `AI_PROVIDER` | `anthropic` or `openai` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `OPENAI_API_KEY` | `sk-...` |

4. Deploy — Paths A + B work without AI keys.

```bash
# Optional: deploy from CLI
npx vercel --prod
```

---

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npm run mcp      # MCP server (stdio, for Cursor)
```

---

## Branding notes

- **App UI:** Footprint Mappa brandbook (gradient, light/dark theme)  
- **PDF defaults:** RELATS S.A.U. colours and logo; overridable via Path B  
- **PDF footer/header:** Footprint Mappa logo always present  

---

## License

Private — Footprint Mappa / Investigo technical challenge submission.

**Collaborator access (if private repo):** add GitHub user `victorcuadrat`.
