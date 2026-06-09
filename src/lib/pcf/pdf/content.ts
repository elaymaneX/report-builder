import type { PcfProduct, ReportConfig } from "@/lib/pcf/types";

export function introductionParagraphs(
  config: ReportConfig,
  productCount: number,
): string[] {
  const client = config.branding.clientName;
  const year = config.metadata.reportYear;
  const shortName = client.split(" ")[0];

  return [
    `The present report summarises the results of the Product Carbon Footprint (PCF) assessment conducted by Footprint Mappa for ${client} in ${year}. The main objective is to quantify the greenhouse gas (GHG) emissions associated with the cradle-to-gate life cycle of the selected products, including materials, manufacturing and transport stages represented in the submitted dataset.`,
    `The document provides both a qualitative and quantitative overview of each product's climate impact, identifies the most emission-intensive life-cycle stages, and supports future decision-making regarding material optimisation, process improvements, and sustainable product design. For the purposes of this report, the term "${shortName}" refers to ${client}, encompassing all operations within the defined organisational boundary.`,
    `${client} is an industrial organisation with production and supply-chain operations across multiple sites. The analysis covers ${productCount} products included in the ${year} assessment dataset, which have been calculated in accordance with internationally recognised standards, namely ISO 14067:2018, ensuring methodological consistency and credibility.`,
    `This assessment establishes a baseline for comparison in subsequent reporting cycles. Results are reported per declared functional unit, enabling comparability across product variants, manufacturing configurations and future portfolio changes.`,
    `The scope of the assessment follows a cradle-to-gate approach due to the nature of intermediate and finished goods whose downstream impacts are determined by customer applications. It includes all relevant life-cycle stages as per ISO 14067 represented in the source data: raw materials and packaging acquisition, upstream freight transportation, energy and consumables from manufacturing processes, and downstream waste transportation where applicable.`,
  ];
}

export const methodologicalBullets = [
  "ISO 14067:2018 – Greenhouse gases – Carbon footprint of products",
  "GHG Protocol – Product Life Cycle Accounting and Reporting Standard",
  "Life-cycle inventory (LCI) data from reputable databases such as EXIOBASE, DEFRA, IEA, and industry-specific sources",
  "Primary activity data from manufacturing sites supplemented by secondary emission factors where primary data is unavailable",
];

export function scopeOverviewParagraphs(
  config: ReportConfig,
  products: PcfProduct[],
): string[] {
  const client = config.branding.clientName;
  const year = config.metadata.reportYear;
  const names = products.map((p) => p.product).join(", ");

  return [
    `The assessment covers the main product portfolio submitted by ${client} for the ${year} reporting period. In total, the study includes ${products.length} products, ensuring comprehensive coverage of the assessed catalogue: ${names}.`,
    `Each product has been modelled according to its declared functional unit and the life-cycle stages available in the dataset. Geographic distribution of manufacturing and upstream logistics is reflected in transport-stage emissions where inter-site or long-distance flows are present.`,
    `The following table lists all products in scope together with their functional units and total cradle-to-gate emissions as a reference for the detailed results presented in Section 4.`,
  ];
}

export const scopeBullets = [
  "Raw material and packaging acquisition: polymers, fibres, resins, metals and all material components.",
  "Upstream transportation: delivery of materials, packaging and consumables to production sites.",
  "Energy and consumables used for manufacturing processes, including electricity and process inputs.",
  "Waste generated during manufacturing: treatment and final disposal of production scraps.",
  "Downstream transportation of waste to waste manager where applicable.",
];

export const lifecycleModuleRows: [string, string][] = [
  ["Material Acquisition", "1.1 Raw materials · 1.2 Inbound packaging · 1.3 Outbound packaging"],
  ["Manufacturing", "2.1 Electricity · 2.2 Other energy · 2.3 Consumables · 2.4 Waste generated"],
  ["Transportation", "3.1–3.5 Upstream and internal transport stages"],
  ["Distribution", "4.1 Product distribution"],
  ["Use", "5.1 Product use · 5.2 Maintenance · 5.3 Other use-stage emissions"],
  ["End-of-life", "6.1 Collection · 6.2 Treatment · 6.3 Final disposal"],
];

export function scopeBoundaryParagraph(config: ReportConfig): string {
  return `Distribution, use phase and end-of-life may be excluded from the system boundary when products are intermediate components whose downstream impacts are determined by the customer, in line with ISO 14067 guidance for cradle-to-gate assessments. This approach is appropriate for ${config.branding.clientName} product categories where end-use scenarios vary significantly across customers and applications.`;
}

export function functionalUnitParagraph(products: PcfProduct[]): string {
  const units = [...new Set(products.map((p) => p.functionalUnit))];
  const unitList = units.join(", ");
  return `The functional unit (FU) used in this assessment is reported per product as declared in the source data (${unitList}), ensuring comparability across variants within each product category and consistency with customer-facing declarations.`;
}

export type ManufacturingScenario = {
  id: string;
  title: string;
  paragraphs: string[];
  flowSteps: string[];
};

export function manufacturingScenarios(
  config: ReportConfig,
  products: PcfProduct[],
): ManufacturingScenario[] {
  const client = config.branding.clientName;
  const sample = products[0]?.product ?? "the assessed portfolio";

  return [
    {
      id: "3.1",
      title: "Primary manufacturing route (single-site production)",
      paragraphs: [
        `Scenario 1 represents the standard production route for products such as ${sample}, where raw materials are procured, transformed at a primary manufacturing site, and prepared for distribution. This configuration minimises inter-site transport and reflects the baseline logistics chain for the portfolio.`,
        `Emissions in this scenario are driven primarily by material acquisition, with manufacturing energy and upstream transport contributing smaller shares. Renewable electricity at the production site further reduces the manufacturing stage contribution.`,
      ],
      flowSteps: [
        "Raw materials",
        "Inbound packaging",
        "Manufacturing",
        "Outbound packaging",
        "Distribution",
      ],
    },
    {
      id: "3.2",
      title: "Alternative route with inter-site finishing",
      paragraphs: [
        `This scenario represents an alternative production route in which semi-finished goods are manufactured at one ${client} facility, shipped to a second site for finishing or assembly, and then distributed to customers.`,
        `Inter-site transport introduces additional upstream logistics emissions compared with the single-site route. The magnitude of this increase depends on distance, transport mode and shipment volume. This configuration is evaluated when production capacity is split across facilities.`,
      ],
      flowSteps: [
        "Primary site",
        "Semi-finished goods",
        "Inter-site transport",
        "Finishing site",
        "Customer",
      ],
    },
    {
      id: "3.3",
      title: "Regional integrated manufacturing",
      paragraphs: [
        `Scenario 3 considers fully integrated regional manufacturing, where raw materials are sourced locally or regionally and the complete product is manufactured within a single geographic production hub before distribution.`,
        `This route can reduce long-distance upstream transport emissions when local suppliers are available, while manufacturing emissions depend on the regional electricity mix. It is particularly relevant for products with heavy or bulky raw materials where logistics represent a material share of the footprint.`,
      ],
      flowSteps: [
        "Regional suppliers",
        "Local manufacturing",
        "Quality control",
        "Regional distribution",
        "Customer",
      ],
    },
  ];
}

export function resultsNarrativeParagraphs(config: ReportConfig): string[] {
  const client = config.branding.clientName;
  return [
    `The carbon footprint results across the assessed portfolio show a consistent pattern in which materials represent the dominant contributor to total emissions, typically accounting for the largest share of the cradle-to-gate impact. This trend is visible across all products in scope, regardless of functional unit or product category.`,
    `Manufacturing emissions vary according to the energy mix at each production site. Facilities operating with renewable electricity show lower manufacturing intensities than sites relying on grid electricity. Transport contributes a smaller but measurable fraction, with higher shares appearing in scenarios that involve long-distance or inter-site shipping.`,
    `This distribution of impacts reinforces the critical importance of material selection and procurement strategy, as well as optimisation of upstream logistics and manufacturing energy sources. The following tables summarise emissions per functional unit for each product assessed for ${client} in ${config.metadata.reportYear}.`,
  ];
}

export function productNarrative(product: PcfProduct, index: number): string {
  const materialsShare =
    product.totalEmissions > 0
      ? ((product.stages.materials / product.totalEmissions) * 100).toFixed(0)
      : "—";

  return `The results for product ${index + 1} (${product.product}) show total cradle-to-gate emissions of ${product.totalEmissions.toFixed(2)} kgCO₂e per ${product.functionalUnit}. Material acquisition accounts for approximately ${materialsShare}% of the total footprint, with manufacturing and transport contributing the remaining share. Variability in product-level emissions reflects differences in material composition, process energy and upstream logistics for this product category.`;
}

export function productDetailParagraph(product: PcfProduct): string {
  return `As expected, the materials stage is the primary driver of emissions for ${product.product}. Manufacturing and transport contributions depend on site-specific energy sources and supply-chain configuration. The detailed breakdown below lists all emission categories per functional unit in accordance with the ISO 14067 module structure represented in the dataset.`;
}

export const recommendationSections: { title: string; body: string }[] = [
  {
    title: "Accelerate the transition to renewable energy",
    body: "Sites relying on grid electricity show higher manufacturing emissions than facilities operating with renewable energy. Transitioning toward renewable electricity — through on-site generation or green energy purchase agreements — would reduce the manufacturing footprint of affected products. In addition to emissions benefits, renewable energy can offer substantial operational savings where solar or wind resources are favourable.",
  },
  {
    title: "Develop localised supply chains",
    body: "Long-distance transport of raw materials increases upstream emissions and supply-chain risk. Identifying and qualifying regional suppliers for key materials would reduce logistics emissions, improve delivery times, and increase supply-chain resilience. Local sourcing is particularly effective for bulky or high-mass inputs where transport represents a material share of the product footprint.",
  },
  {
    title: "Explore recycled-content material options",
    body: "Although recycled materials may not be widely available for all product specifications today, monitoring the development of recycled polymers, fibres and technical materials will position the organisation to adopt lower-carbon inputs as soon as the market becomes viable. Early engagement with suppliers and research institutions allows the organisation to lead adoption ahead of competitors.",
  },
  {
    title: "Invest in alternative material research",
    body: "Investigating alternative, lower-carbon materials could open new commercial opportunities while reducing climate impact. Bio-based polymers, high-performance low-carbon fibres, or redesigned material systems may offer equal or improved performance with reduced environmental intensity. Structured R&D programmes can identify viable substitutions without compromising product quality or certification requirements.",
  },
];
