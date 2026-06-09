import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { relatsBrand } from "@/lib/branding/relats";
import {
  functionalUnitParagraph,
  introductionParagraphs,
  lifecycleModuleRows,
  manufacturingScenarios,
  methodologicalBullets,
  productDetailParagraph,
  productNarrative,
  recommendationSections,
  resultsNarrativeParagraphs,
  scopeBoundaryParagraph,
  scopeBullets,
  scopeOverviewParagraphs,
} from "@/lib/pcf/pdf/content";
import type { ReportLogos } from "@/lib/pcf/pdf/resolve-logo";
import { pcfBreakdownLabels } from "@/lib/pcf/labels";
import type { PcfProduct, PcfReportData, ReportConfig } from "@/lib/pcf/types";

type DocumentStyles = ReturnType<typeof createDocumentStyles>;

const RESULT_STAGE_COLS = [
  { key: "materials" as const, label: "Materials" },
  { key: "manufacturing" as const, label: "Manufacturing" },
  { key: "transport" as const, label: "Transport" },
];

function createDocumentStyles(config: ReportConfig) {
  const tableHeader = config.branding.primaryColor || "#111111";

  return StyleSheet.create({
    page: {
      fontFamily: relatsBrand.fonts.body,
      fontSize: 10,
      color: "#1a1a1a",
      paddingTop: 56,
      paddingBottom: 52,
      paddingHorizontal: 52,
      backgroundColor: "#ffffff",
    },
    coverPage: {
      paddingTop: 64,
      paddingBottom: 48,
      paddingHorizontal: 52,
      backgroundColor: "#ffffff",
      justifyContent: "space-between",
    },
    coverClientLogo: {
      width: 140,
      height: 36,
      objectFit: "contain",
      marginBottom: 40,
    },
    coverTitleLine1: {
      fontFamily: relatsBrand.fonts.heading,
      fontSize: 32,
      color: "#111111",
      lineHeight: 1.15,
    },
    coverTitleLine2: {
      fontFamily: relatsBrand.fonts.heading,
      fontSize: 32,
      color: "#111111",
      lineHeight: 1.15,
      marginBottom: 8,
    },
    coverYear: {
      fontFamily: relatsBrand.fonts.heading,
      fontSize: 22,
      color: "#333333",
      marginBottom: 48,
    },
    coverClient: {
      fontFamily: relatsBrand.fonts.heading,
      fontSize: 18,
      color: "#111111",
    },
    coverPreparedBlock: {
      marginTop: 24,
    },
    coverMappaLogo: {
      width: 160,
      height: 28,
      objectFit: "contain",
      marginBottom: 6,
    },
    coverPrepared: {
      fontSize: 9,
      color: "#666666",
    },
    header: {
      position: "absolute",
      top: 22,
      left: 52,
      right: 52,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#cccccc",
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },
    headerMappaLogo: {
      width: 88,
      height: 16,
      objectFit: "contain",
      marginRight: 8,
    },
    headerBrand: {
      fontSize: 8,
      color: "#666666",
    },
    headerSection: {
      fontSize: 8,
      color: "#666666",
    },
    sectionTitle: {
      fontFamily: relatsBrand.fonts.heading,
      fontSize: 14,
      color: "#111111",
      marginBottom: 10,
      marginTop: 4,
    },
    subsectionTitle: {
      fontFamily: relatsBrand.fonts.heading,
      fontSize: 11,
      color: "#111111",
      marginBottom: 8,
      marginTop: 14,
    },
    paragraph: {
      fontSize: 10,
      lineHeight: 1.6,
      color: "#1a1a1a",
      marginBottom: 10,
      textAlign: "justify",
    },
    bulletRow: {
      flexDirection: "row",
      marginBottom: 5,
      paddingRight: 8,
    },
    bulletDot: {
      width: 12,
      fontSize: 10,
      color: "#1a1a1a",
    },
    bulletText: {
      flex: 1,
      fontSize: 10,
      lineHeight: 1.5,
      color: "#1a1a1a",
    },
    table: {
      marginTop: 8,
      marginBottom: 14,
    },
    tableCaption: {
      fontSize: 9,
      fontFamily: relatsBrand.fonts.heading,
      color: "#333333",
      marginBottom: 4,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: tableHeader,
      color: "#ffffff",
      paddingVertical: 6,
      paddingHorizontal: 5,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e5e5e5",
      paddingVertical: 5,
      paddingHorizontal: 5,
    },
    tableRowAlt: {
      backgroundColor: "#f7f7f7",
    },
    cellProduct: { width: "34%" },
    cellUnit: { width: "14%" },
    cellNum: { width: "13%", textAlign: "right" },
    cellHeader: {
      fontFamily: relatsBrand.fonts.heading,
      fontSize: 7.5,
    },
    cellText: { fontSize: 7.5 },
    moduleTableLabel: { width: "28%", fontSize: 8 },
    moduleTableValue: { width: "72%", fontSize: 8 },
    footer: {
      position: "absolute",
      bottom: 24,
      left: 52,
      right: 52,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: 8,
      color: "#888888",
      borderTopWidth: 1,
      borderTopColor: "#dddddd",
      paddingTop: 6,
    },
    footerMappa: {
      width: 72,
      height: 12,
      objectFit: "contain",
    },
    shareRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 3,
      fontSize: 8,
    },
    shareBarTrack: {
      height: 6,
      backgroundColor: "#eeeeee",
      marginTop: 2,
      marginBottom: 6,
    },
    shareBarFill: {
      height: 6,
      backgroundColor: config.branding.accentColor || "#2DD4A8",
    },
    flowRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 8,
    },
    flowBox: {
      borderWidth: 1,
      borderColor: "#cccccc",
      backgroundColor: "#f9f9f9",
      paddingVertical: 8,
      paddingHorizontal: 6,
      width: "17%",
      minHeight: 36,
      justifyContent: "center",
    },
    flowBoxText: {
      fontSize: 7,
      textAlign: "center",
      color: "#333333",
    },
    flowArrow: {
      fontSize: 10,
      color: "#888888",
      width: "2%",
      textAlign: "center",
    },
  });
}

function PageFooter({
  mappaLogoSrc,
  styles,
}: {
  mappaLogoSrc: string;
  styles: DocumentStyles;
}) {
  return (
    <View style={styles.footer} fixed>
      <Image src={mappaLogoSrc} style={styles.footerMappa} />
      <Text
        render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
      />
    </View>
  );
}

function RunningHeader({
  clientName,
  section,
  mappaLogoSrc,
  styles,
}: {
  clientName: string;
  section: string;
  mappaLogoSrc: string;
  styles: DocumentStyles;
}) {
  return (
    <View style={styles.header} fixed>
      <View style={styles.headerLeft}>
        <Image src={mappaLogoSrc} style={styles.headerMappaLogo} />
        <Text style={styles.headerBrand}>{clientName}</Text>
      </View>
      <Text style={styles.headerSection}>{section}</Text>
    </View>
  );
}

function BulletList({ items, styles }: { items: string[]; styles: DocumentStyles }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item.slice(0, 40)} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function FlowDiagram({
  steps,
  styles,
}: {
  steps: string[];
  styles: DocumentStyles;
}) {
  const nodes: React.ReactNode[] = [];
  steps.forEach((step, i) => {
    if (i > 0) {
      nodes.push(
        <Text key={`arrow-${i}`} style={styles.flowArrow}>
          →
        </Text>,
      );
    }
    nodes.push(
      <View key={step} style={styles.flowBox}>
        <Text style={styles.flowBoxText}>{step}</Text>
      </View>,
    );
  });
  return <View style={styles.flowRow}>{nodes}</View>;
}

function ResultsStageTable({
  products,
  styles,
  caption,
}: {
  products: PcfProduct[];
  styles: DocumentStyles;
  caption?: string;
}) {
  return (
    <View style={styles.table}>
      {caption && <Text style={styles.tableCaption}>{caption}</Text>}
      <View style={styles.tableHeader}>
        <Text style={[styles.cellHeader, styles.cellProduct]}>Product</Text>
        <Text style={[styles.cellHeader, styles.cellUnit]}>F.U.</Text>
        {RESULT_STAGE_COLS.map((col) => (
          <Text key={col.key} style={[styles.cellHeader, styles.cellNum]}>
            {col.label}
          </Text>
        ))}
        <Text style={[styles.cellHeader, styles.cellNum]}>Total</Text>
      </View>
      {products.map((p, i) => (
        <View
          key={p.product}
          style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          <Text style={[styles.cellText, styles.cellProduct]}>{p.product}</Text>
          <Text style={[styles.cellText, styles.cellUnit]}>{p.functionalUnit}</Text>
          {RESULT_STAGE_COLS.map((col) => (
            <Text key={col.key} style={[styles.cellText, styles.cellNum]}>
              {p.stages[col.key].toFixed(2)}
            </Text>
          ))}
          <Text style={[styles.cellText, styles.cellNum]}>
            {p.totalEmissions.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function FullBreakdownTable({
  product,
  styles,
}: {
  product: PcfProduct;
  styles: DocumentStyles;
}) {
  const rows = Object.entries(product.breakdown).sort(([, a], [, b]) => b - a);

  return (
    <View style={styles.table}>
      <Text style={styles.tableCaption}>
        kgCO₂e per {product.functionalUnit} (all life-cycle modules)
      </Text>
      <View style={styles.tableHeader}>
        <Text style={[styles.cellHeader, { width: "55%" }]}>Category</Text>
        <Text style={[styles.cellHeader, { width: "22%", textAlign: "right" }]}>
          kgCO₂e
        </Text>
        <Text style={[styles.cellHeader, { width: "23%", textAlign: "right" }]}>
          Share of total
        </Text>
      </View>
      {rows.map(([key, value], i) => (
        <View
          key={key}
          style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          <Text style={[styles.cellText, { width: "55%" }]}>
            {pcfBreakdownLabels[key] ?? key}
          </Text>
          <Text style={[styles.cellText, { width: "22%", textAlign: "right" }]}>
            {value.toFixed(2)}
          </Text>
          <Text style={[styles.cellText, { width: "23%", textAlign: "right" }]}>
            {product.totalEmissions > 0
              ? `${((value / product.totalEmissions) * 100).toFixed(1)}%`
              : "—"}
          </Text>
        </View>
      ))}
      <View style={[styles.tableRow, { backgroundColor: "#eeeeee" }]}>
        <Text style={[styles.cellText, { width: "55%", fontFamily: relatsBrand.fonts.heading }]}>
          Total
        </Text>
        <Text
          style={[
            styles.cellText,
            { width: "22%", textAlign: "right", fontFamily: relatsBrand.fonts.heading },
          ]}
        >
          {product.totalEmissions.toFixed(2)}
        </Text>
        <Text style={[styles.cellText, { width: "23%", textAlign: "right" }]}>100%</Text>
      </View>
    </View>
  );
}

function StageShareChart({
  product,
  styles,
}: {
  product: PcfProduct;
  styles: DocumentStyles;
}) {
  const items = RESULT_STAGE_COLS.map((col) => ({
    label: col.label,
    value: product.stages[col.key],
  }));
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <View>
      {items.map((item) => (
        <View key={item.label}>
          <View style={styles.shareRow}>
            <Text>{item.label}</Text>
            <Text>
              {item.value.toFixed(2)} (
              {product.totalEmissions > 0
                ? `${((item.value / product.totalEmissions) * 100).toFixed(1)}%`
                : "—"}
              )
            </Text>
          </View>
          <View style={styles.shareBarTrack}>
            <View
              style={[
                styles.shareBarFill,
                { width: `${Math.round((item.value / max) * 100)}%` },
              ]}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function ProductResultsOverviewPage({
  product,
  index,
  config,
  mappaLogoSrc,
  styles,
}: {
  product: PcfProduct;
  index: number;
  config: ReportConfig;
  mappaLogoSrc: string;
  styles: DocumentStyles;
}) {
  const sectionNum = `4.${index + 1}`;

  return (
    <Page size="A4" style={styles.page}>
      <RunningHeader
        clientName={config.branding.clientName}
        section={`${sectionNum} ${product.product}`}
        mappaLogoSrc={mappaLogoSrc}
        styles={styles}
      />
      <Text style={styles.sectionTitle}>
        {sectionNum} {product.product}
      </Text>
      <Text style={styles.paragraph}>{productNarrative(product, index)}</Text>
      <ResultsStageTable
        products={[product]}
        styles={styles}
        caption="kgCO₂e per functional unit (by stage)"
      />
      <Text style={styles.subsectionTitle}>Emissions distribution by stage</Text>
      <StageShareChart product={product} styles={styles} />
      <PageFooter mappaLogoSrc={mappaLogoSrc} styles={styles} />
    </Page>
  );
}

function ProductResultsDetailPage({
  product,
  index,
  config,
  mappaLogoSrc,
  styles,
}: {
  product: PcfProduct;
  index: number;
  config: ReportConfig;
  mappaLogoSrc: string;
  styles: DocumentStyles;
}) {
  const sectionNum = `4.${index + 1}`;

  return (
    <Page size="A4" style={styles.page}>
      <RunningHeader
        clientName={config.branding.clientName}
        section={`${sectionNum} ${product.product} — detail`}
        mappaLogoSrc={mappaLogoSrc}
        styles={styles}
      />
      <Text style={styles.subsectionTitle}>Detailed emission sources</Text>
      <Text style={styles.paragraph}>{productDetailParagraph(product)}</Text>
      <FullBreakdownTable product={product} styles={styles} />
      <PageFooter mappaLogoSrc={mappaLogoSrc} styles={styles} />
    </Page>
  );
}

export function PcfDocument({
  data,
  config,
  logos,
}: {
  data: PcfReportData;
  config: ReportConfig;
  logos: ReportLogos;
}) {
  const styles = createDocumentStyles(config);
  const year = config.metadata.reportYear;
  const client = config.branding.clientName;
  const isFull = config.template === "full";
  const introParas = introductionParagraphs(config, data.products.length);
  const introPage1 = introParas.slice(0, 3);
  const introPage2 = introParas.slice(3);
  const scenarios = manufacturingScenarios(config, data.products);
  const recFirstHalf = recommendationSections.slice(0, 2);
  const recSecondHalf = recommendationSections.slice(2);

  return (
    <Document
      title={`Products Carbon Footprint Report ${year} — ${client}`}
      author="Footprint Mappa"
      subject="Product Carbon Footprint Report (ISO 14067)"
    >
      {/* Cover */}
      <Page size="A4" style={styles.coverPage}>
        <Image src={logos.clientLogoSrc} style={styles.coverClientLogo} />
        <View>
          <Text style={styles.coverTitleLine1}>Products</Text>
          <Text style={styles.coverTitleLine2}>Carbon Footprint Report</Text>
          <Text style={styles.coverYear}>{year}</Text>
          <Text style={styles.coverClient}>{client}</Text>
        </View>
        <View style={styles.coverPreparedBlock}>
          <Image src={logos.mappaLogoSrc} style={styles.coverMappaLogo} />
          <Text style={styles.coverPrepared}>
            Prepared by Footprint Mappa · ISO 14067:2018 · Confidential
          </Text>
        </View>
      </Page>

      {/* 1 Introduction — page 1 */}
      {config.sections.introduction && isFull && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            clientName={client}
            section="1 Introduction"
            mappaLogoSrc={logos.mappaLogoSrc}
            styles={styles}
          />
          <Text style={styles.sectionTitle}>1 Introduction</Text>
          {introPage1.map((p) => (
            <Text key={p.slice(0, 48)} style={styles.paragraph}>
              {p}
            </Text>
          ))}
          <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
        </Page>
      )}

      {/* 1 Introduction — page 2 */}
      {config.sections.introduction && isFull && introPage2.length > 0 && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            clientName={client}
            section="1 Introduction (cont.)"
            mappaLogoSrc={logos.mappaLogoSrc}
            styles={styles}
          />
          {introPage2.map((p) => (
            <Text key={p.slice(0, 48)} style={styles.paragraph}>
              {p}
            </Text>
          ))}
          <BulletList
            items={[
              "Raw materials and packaging acquisition",
              "Upstream freight transportation",
              "Energy and consumables from manufacturing processes",
              "Downstream waste transportation",
            ]}
            styles={styles}
          />
          <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
        </Page>
      )}

      {/* 2 Methodological Approach */}
      {config.sections.introduction && isFull && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            clientName={client}
            section="2 Methodological Approach"
            mappaLogoSrc={logos.mappaLogoSrc}
            styles={styles}
          />
          <Text style={styles.sectionTitle}>
            2 Methodological Approach ({year})
          </Text>
          <Text style={styles.paragraph}>
            The {year} PCF assessment for {client} has been carried out in
            accordance with internationally recognised standards:
          </Text>
          <BulletList items={methodologicalBullets} styles={styles} />
          <Text style={[styles.paragraph, { marginTop: 12 }]}>
            These methodological foundations ensure robustness, comparability, and
            auditability of results across all assessed products. The calculation
            is based on a combination of primary and secondary data drawn from the
            submitted dataset and internationally recognised emission factor databases.
          </Text>
          <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
        </Page>
      )}

      {/* 3 Scope — overview */}
      {config.sections.introduction && isFull && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            clientName={client}
            section="3 Scope and Boundaries"
            mappaLogoSrc={logos.mappaLogoSrc}
            styles={styles}
          />
          <Text style={styles.sectionTitle}>3 Scope and Boundaries</Text>
          {scopeOverviewParagraphs(config, data.products).map((p) => (
            <Text key={p.slice(0, 48)} style={styles.paragraph}>
              {p}
            </Text>
          ))}
          <ResultsStageTable
            products={data.products}
            styles={styles}
            caption="Products in scope — summary emissions"
          />
          <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
        </Page>
      )}

      {/* 3 Scope — boundaries */}
      {config.sections.introduction && isFull && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            clientName={client}
            section="3 Scope and Boundaries"
            mappaLogoSrc={logos.mappaLogoSrc}
            styles={styles}
          />
          <Text style={styles.paragraph}>
            The boundaries defined for this PCF study include the following
            life-cycle stages:
          </Text>
          <BulletList items={scopeBullets} styles={styles} />
          <Text style={styles.subsectionTitle}>ISO 14067 life-cycle modules</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellHeader, styles.moduleTableLabel]}>Stage</Text>
              <Text style={[styles.cellHeader, styles.moduleTableValue]}>
                Modules included
              </Text>
            </View>
            {lifecycleModuleRows.map(([stage, modules], i) => (
              <View
                key={stage}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.cellText, styles.moduleTableLabel]}>{stage}</Text>
                <Text style={[styles.cellText, styles.moduleTableValue]}>{modules}</Text>
              </View>
            ))}
          </View>
          <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
        </Page>
      )}

      {/* 3 Scope — exclusions & functional unit */}
      {config.sections.introduction && isFull && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            clientName={client}
            section="3 Scope and Boundaries"
            mappaLogoSrc={logos.mappaLogoSrc}
            styles={styles}
          />
          <Text style={styles.paragraph}>{scopeBoundaryParagraph(config)}</Text>
          <Text style={styles.paragraph}>{functionalUnitParagraph(data.products)}</Text>
          <Text style={styles.paragraph}>
            In line with ISO 14067, excluding downstream stages is appropriate for
            intermediate goods whose impacts are determined by the specific
            applications and design decisions of the end customer. Footprint Mappa
            has documented all boundary choices in the calculation model underlying
            this report.
          </Text>
          <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
        </Page>
      )}

      {/* 3.1–3.3 Manufacturing scenarios */}
      {config.sections.introduction &&
        isFull &&
        scenarios.map((scenario) => (
          <Page key={scenario.id} size="A4" style={styles.page}>
            <RunningHeader
              clientName={client}
              section={`${scenario.id} ${scenario.title}`}
              mappaLogoSrc={logos.mappaLogoSrc}
              styles={styles}
            />
            <Text style={styles.sectionTitle}>
              {scenario.id} {scenario.title}
            </Text>
            {scenario.paragraphs.map((p) => (
              <Text key={p.slice(0, 48)} style={styles.paragraph}>
                {p}
              </Text>
            ))}
            <Text style={styles.subsectionTitle}>Production flow</Text>
            <FlowDiagram steps={scenario.flowSteps} styles={styles} />
            <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
          </Page>
        ))}

      {/* 4 Results */}
      {config.sections.portfolioSummary && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            clientName={client}
            section="4 Results"
            mappaLogoSrc={logos.mappaLogoSrc}
            styles={styles}
          />
          <Text style={styles.sectionTitle}>4 Results</Text>
          {isFull &&
            resultsNarrativeParagraphs(config).map((p) => (
              <Text key={p.slice(0, 48)} style={styles.paragraph}>
                {p}
              </Text>
            ))}
          <ResultsStageTable
            products={data.products}
            styles={styles}
            caption="Portfolio summary — kgCO₂e per functional unit (by stage)"
          />
          <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
        </Page>
      )}

      {/* 4.x Product pages — two per product in full template */}
      {config.sections.productDetails &&
        isFull &&
        data.products.flatMap((product, index) => {
          const pages = [
            <ProductResultsOverviewPage
              key={`${product.product}-overview`}
              product={product}
              index={index}
              config={config}
              mappaLogoSrc={logos.mappaLogoSrc}
              styles={styles}
            />,
          ];
          if (config.sections.topEmissionSources) {
            pages.push(
              <ProductResultsDetailPage
                key={`${product.product}-detail`}
                product={product}
                index={index}
                config={config}
                mappaLogoSrc={logos.mappaLogoSrc}
                styles={styles}
              />,
            );
          }
          return pages;
        })}

      {/* 5 Strategic Recommendations — page 1 */}
      {config.sections.introduction && isFull && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            clientName={client}
            section="5 Strategic Recommendations"
            mappaLogoSrc={logos.mappaLogoSrc}
            styles={styles}
          />
          <Text style={styles.sectionTitle}>
            5 Strategic Recommendations for Carbon Footprint Improvement
          </Text>
          <Text style={styles.paragraph}>
            Footprint Mappa has identified the following lines of action to support
            decarbonisation of the assessed product portfolio for {client}.
          </Text>
          {recFirstHalf.map((rec, i) => (
            <View key={rec.title}>
              <Text style={styles.subsectionTitle}>
                5.{i + 1} {rec.title}
              </Text>
              <Text style={styles.paragraph}>{rec.body}</Text>
            </View>
          ))}
          <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
        </Page>
      )}

      {/* 5 Strategic Recommendations — page 2 */}
      {config.sections.introduction && isFull && (
        <Page size="A4" style={styles.page}>
          <RunningHeader
            clientName={client}
            section="5 Strategic Recommendations (cont.)"
            mappaLogoSrc={logos.mappaLogoSrc}
            styles={styles}
          />
          {recSecondHalf.map((rec, i) => (
            <View key={rec.title}>
              <Text style={styles.subsectionTitle}>
                5.{i + 3} {rec.title}
              </Text>
              <Text style={styles.paragraph}>{rec.body}</Text>
            </View>
          ))}
          <PageFooter mappaLogoSrc={logos.mappaLogoSrc} styles={styles} />
        </Page>
      )}
    </Document>
  );
}
