# Report Builder

Web app that turns ISO 14067 Product Carbon Footprint (PCF) CSV data into branded PDF reports for **RELATS S.A.U.**

Built for the Mappa technical challenge — Paths A, B, and C.

## Quick start

```bash
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY or OPENAI_API_KEY for Path C
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- **Path B:** configure template, sections, branding, and metadata (left column)
- **Path C:** describe changes in the AI editor (right column) — updates the same config
- Upload a PCF CSV or use the sample file, then download the PDF

## Paths implemented

| Path | Scope | Status |
|------|--------|--------|
| **A** | CSV → validated model → Relats-branded PDF | Done |
| **B** | `ReportConfig`: template, sections, colors, client, title | Done |
| **C** | Natural-language edits to `ReportConfig` (chat + MCP tools) | Done |

## How it works

```
CSV  →  parsePcfCsv()  →  PcfReportData
                              ↓
Form (B) ──┐
Chat (C) ──┴→ ReportConfig  →  resolveReportConfig()
                              ↓
                    PcfDocument (react-pdf)
                              ↓
                         PDF download
```

The CSV parser is independent of report configuration. Paths B and C only affect `ReportConfig` — not how data is parsed.

## Project structure

```
report-builder/
├── public/data/
│   └── sample_pcf_iso_14067.csv    # Sample input
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate/pcf/     # GET/POST PDF API
│   │   │   └── chat/             # POST AI editor (Path C)
│   │   ├── components/           # Workspace, form, chat panel
│   │   ├── page.tsx
│   │   └── layout.tsx
│   └── lib/
│       ├── pcf/                    # PCF domain module (swappable)
│       │   ├── types.ts            # PcfReportData, ReportConfig
│       │   ├── fields.ts           # CSV column mapping
│       │   ├── labels.ts           # Human-readable category names
│       │   ├── parse-csv.ts        # CSV → PcfReportData
│       │   ├── generate-pdf.ts     # Orchestration
│       │   ├── config/
│       │   │   ├── defaults.ts     # Default Relats config
│       │   │   └── resolve-config.ts
│       │   ├── tools/            # Path C agent tools (shared with MCP)
│       │   └── pdf/
│       │       ├── document.tsx    # Report template
│       │       └── render.ts       # react-pdf adapter
│       ├── branding/
│       │   └── relats.ts           # Relats visual tokens
│       └── server/
│           ├── generate-request.ts # Parse HTTP → csv + config
│           └── http.ts             # PDF response helpers
├── mcp-server/index.ts           # MCP tools for Cursor (same contract as chat)
├── .cursor/mcp.json              # Cursor MCP wiring
├── next.config.ts
└── package.json
```

### Module boundaries

| Module | Responsibility | Replaceable for |
|--------|----------------|-----------------|
| `lib/pcf/` | All PCF logic | OCF module (`lib/ocf/`) |
| `lib/branding/` | Client visual identity | Another client |
| `lib/server/` | HTTP plumbing | Different framework |
| `app/` | UI + routes | — |

## Report configuration (Path B)

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
  };
  metadata: {
    reportYear: number;
    reportTitle: string;
  };
};
```

- **full** — cover + intro + summary table + one page per product
- **summary** — cover + portfolio table only (~2 pages)

Default config matches Path A behaviour.

## API

### `GET /api/generate/pcf`

Generates a PDF from the sample CSV. Optional query: `?template=summary`

### `POST /api/generate/pcf`

| Content-Type | Body |
|--------------|------|
| `multipart/form-data` | `file` (CSV) + `config` (JSON string) |
| `application/json` | `{ "csv"?: string, "config"?: PartialReportConfig }` |

Response: `application/pdf` with `Content-Disposition: attachment`

### `POST /api/chat` (Path C)

```json
{
  "messages": [{ "role": "user", "content": "Executive summary for the board" }],
  "config": { "template": "full" }
}
```

Response:

```json
{
  "message": "Switched to summary template…",
  "config": { "...resolved ReportConfig..." },
  "actions": [{ "tool": "set_template", "summary": "Template → summary" }]
}
```

Requires `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` in `.env.local` (see `.env.example`).

## Path C tools (chat + MCP)

| Tool | Purpose |
|------|---------|
| `get_report_config` | Read current config + summary |
| `update_report_config` | Partial patch (merged via `resolveReportConfig`) |
| `set_template` | `full` or `summary` |
| `toggle_section` | Enable/disable a section |
| `explain_report` | Describe pages/sections without changing config |

**In the app:** right-hand chat panel syncs config with the form; **Undo** reverts AI changes.

**In Cursor:** MCP server `report-builder` (see `.cursor/mcp.json`):

```bash
npm run mcp
```

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| UI | Tailwind CSS v4 |
| PDF | [@react-pdf/renderer](https://react-pdf.org/) |
| CSV | [PapaParse](https://www.papaparse.com/) |
| Path C agent | [Vercel AI SDK](https://sdk.vercel.ai/) + Claude or OpenAI |
| Path C tools schema | [Zod](https://zod.dev/) |
| MCP | [@modelcontextprotocol/sdk](https://modelcontextprotocol.io/) |

No database. An LLM API is the only external service (Path C only).

## Build vs buy (PDF)

| Option | Verdict |
|--------|---------|
| **@react-pdf/renderer** | **Chosen** — React components, versionable templates, runs in API routes |
| Puppeteer / Playwright | High fidelity but heavy for serverless; slower to ship |
| pdf-lib / jsPDF | Too much manual layout for multi-page reports |
| Paid APIs | Fast but adds cost; overkill for this scope |

## Relats branding

Report branding is taken from [relats.com](https://relats.com) public identity (dark primary, teal accent). The Mappa brandbook applies to app UI only, per the challenge brief.

## Development notes

- Access from a phone on the same network: `allowedDevOrigins` in `next.config.ts`
- Path C needs an LLM API key — copy `.env.example` → `.env.local`
- Default Relats logo: `public/branding/relats-logo.svg` (override via logo upload in UI)
- Run only one dev server: `npm run dev` (default port 3000)
- Work from `~/report-builder` — not `~/Projects/report-builder` (duplicate)

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
npm run mcp      # MCP server (stdio, for Cursor)
```

## Deploy to Vercel

1. Push the repo to GitHub (`origin` is already configured).
2. Import the project at [vercel.com/new](https://vercel.com/new) → select `report-builder`.
3. Framework preset: **Next.js** (auto-detected).
4. Add environment variables (Settings → Environment Variables):

| Variable | Required for | Example |
|----------|----------------|---------|
| `AI_PROVIDER` | Path C chat | `anthropic` or `openai` |
| `ANTHROPIC_API_KEY` | Path C (Claude) | `sk-ant-...` |
| `OPENAI_API_KEY` | Path C (OpenAI) | `sk-...` |

Path A + B (PDF generation) work **without** any AI keys.

5. Deploy. Production URL will serve the app and `/api/generate/pcf`.

```bash
# Optional: deploy from CLI
npx vercel --prod
```

## Next steps (out of scope)

- OCF report (`lib/ocf/` mirroring `lib/pcf/`)
- Integration of the MCP server with existing agents.

## License

Private — Mappa technical challenge submission.
