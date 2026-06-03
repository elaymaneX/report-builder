# Report Builder

Web app that turns ISO 14067 Product Carbon Footprint (PCF) CSV data into branded PDF reports for **RELATS S.A.U.**

Built for the Mappa technical challenge — Path A (foundation) + Path B (customizable).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Configure template, sections, branding, and metadata
- Upload a PCF CSV or use the sample file
- Download the generated PDF

## Paths implemented

| Path | Scope | Status |
|------|--------|--------|
| **A** | CSV → validated model → Relats-branded PDF | Done |
| **B** | `ReportConfig`: template, sections, colors, client, title | Done |
| **C** | Natural-language report editing | Not implemented |

## How it works

```
CSV  →  parsePcfCsv()  →  PcfReportData
                              ↓
ReportConfig  →  resolveReportConfig()
                              ↓
                    PcfDocument (react-pdf)
                              ↓
                         PDF download
```

The CSV parser is independent of report configuration. Path B only affects the PDF template and metadata — not how data is parsed.

## Project structure

```
report-builder/
├── public/data/
│   └── sample_pcf_iso_14067.csv    # Sample input
├── src/
│   ├── app/
│   │   ├── api/generate/pcf/       # GET/POST PDF API
│   │   ├── components/             # ReportBuilderForm (Path B UI)
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
│       │   └── pdf/
│       │       ├── document.tsx    # Report template
│       │       └── render.ts       # react-pdf adapter
│       ├── branding/
│       │   └── relats.ts           # Relats visual tokens
│       └── server/
│           ├── generate-request.ts # Parse HTTP → csv + config
│           └── http.ts             # PDF response helpers
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

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- [@react-pdf/renderer](https://react-pdf.org/) — PDF generation
- [PapaParse](https://www.papaparse.com/) — CSV parsing

No database or external backend (Path A/B scope).

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

- Access from a phone on the same network: `allowedDevOrigins` includes `172.20.10.2` in `next.config.ts`
- Run only one dev server: `npm run dev` (default port 3000)
- Work from `~/report-builder` — not `~/Projects/report-builder` (duplicate)

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Next steps (out of scope)

- OCF report (`lib/ocf/` mirroring `lib/pcf/`)
- Path C: natural-language edits to `ReportConfig`
- Logo upload in branding config
- Deploy to Vercel
- Richer layout matching full Word sample reports

## License

Private — Mappa technical challenge submission.
