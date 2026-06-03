import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { relatsBrand } from "@/lib/branding/relats";
import {
  pcfBreakdownLabels,
  pcfLifecycleLabels,
} from "@/lib/pcf/labels";
import type {
  PcfLifecycleStage,
  PcfProduct,
  PcfReportData,
  ReportConfig,
} from "@/lib/pcf/types";

type DocumentStyles = ReturnType<typeof createDocumentStyles>;

function createDocumentStyles(config: ReportConfig) {
  const { colors, fonts } = relatsBrand;
  const primary = config.branding.primaryColor;
  const accent = config.branding.accentColor;

  return StyleSheet.create({
    page: {
      fontFamily: fonts.body,
      fontSize: 10,
      color: colors.text,
      paddingTop: 48,
      paddingBottom: 56,
      paddingHorizontal: 48,
    },
    coverPage: {
      backgroundColor: primary,
      color: colors.white,
      justifyContent: "center",
      paddingHorizontal: 56,
    },
    accentBar: {
      width: 64,
      height: 4,
      backgroundColor: accent,
      marginBottom: 24,
    },
    coverTitle: {
      fontFamily: fonts.heading,
      fontSize: 28,
      marginBottom: 12,
    },
    coverSubtitle: {
      fontSize: 14,
      color: accent,
      marginBottom: 48,
    },
    coverClient: {
      fontFamily: fonts.heading,
      fontSize: 18,
      marginTop: 80,
    },
    coverMeta: {
      fontSize: 10,
      color: "#94A3B8",
      marginTop: 8,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 24,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: accent,
    },
    headerBrand: {
      fontFamily: fonts.heading,
      fontSize: 11,
      color: primary,
    },
    headerTitle: {
      fontSize: 9,
      color: colors.muted,
    },
    sectionTitle: {
      fontFamily: fonts.heading,
      fontSize: 14,
      color: primary,
      marginBottom: 10,
      marginTop: 8,
    },
    paragraph: {
      fontSize: 10,
      lineHeight: 1.5,
      color: colors.text,
      marginBottom: 8,
    },
    table: {
      marginTop: 8,
      marginBottom: 16,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: primary,
      color: colors.white,
      paddingVertical: 6,
      paddingHorizontal: 6,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 5,
      paddingHorizontal: 6,
    },
    tableRowAlt: {
      backgroundColor: colors.surface,
    },
    cellProduct: { width: "28%" },
    cellUnit: { width: "12%" },
    cellNum: { width: "10%", textAlign: "right" },
    cellHeader: {
      fontFamily: fonts.heading,
      fontSize: 8,
    },
    cellText: { fontSize: 8 },
    footer: {
      position: "absolute",
      bottom: 24,
      left: 48,
      right: 48,
      flexDirection: "row",
      justifyContent: "space-between",
      fontSize: 8,
      color: colors.muted,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 8,
    },
    stageBarRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    stageLabel: { width: "32%", fontSize: 8 },
    stageBarTrack: {
      width: "48%",
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 2,
    },
    stageBarFill: {
      height: 8,
      backgroundColor: accent,
      borderRadius: 2,
    },
    stageValue: { width: "20%", fontSize: 8, textAlign: "right" },
  });
}

function PageFooter({
  pageLabel,
  clientName,
  styles,
}: {
  pageLabel: string;
  clientName: string;
  styles: DocumentStyles;
}) {
  return (
    <View style={styles.footer} fixed>
      <Text>{clientName} · Product Carbon Footprint</Text>
      <Text>{pageLabel}</Text>
    </View>
  );
}

function PageHeader({
  title,
  clientName,
  styles,
}: {
  title: string;
  clientName: string;
  styles: DocumentStyles;
}) {
  return (
    <View style={styles.header} fixed>
      <Text style={styles.headerBrand}>{clientName}</Text>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  );
}

function SummaryTable({
  products,
  styles,
}: {
  products: PcfProduct[];
  styles: DocumentStyles;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.cellHeader, styles.cellProduct]}>Product</Text>
        <Text style={[styles.cellHeader, styles.cellUnit]}>F.U.</Text>
        <Text style={[styles.cellHeader, styles.cellNum]}>Total</Text>
        <Text style={[styles.cellHeader, styles.cellNum]}>Mat.</Text>
        <Text style={[styles.cellHeader, styles.cellNum]}>Mfg.</Text>
        <Text style={[styles.cellHeader, styles.cellNum]}>Trans.</Text>
        <Text style={[styles.cellHeader, styles.cellNum]}>Use</Text>
        <Text style={[styles.cellHeader, styles.cellNum]}>EoL</Text>
      </View>
      {products.map((p, i) => (
        <View
          key={p.product}
          style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
        >
          <Text style={[styles.cellText, styles.cellProduct]}>{p.product}</Text>
          <Text style={[styles.cellText, styles.cellUnit]}>{p.functionalUnit}</Text>
          <Text style={[styles.cellText, styles.cellNum]}>
            {p.totalEmissions.toFixed(2)}
          </Text>
          <Text style={[styles.cellText, styles.cellNum]}>
            {p.stages.materials.toFixed(2)}
          </Text>
          <Text style={[styles.cellText, styles.cellNum]}>
            {p.stages.manufacturing.toFixed(2)}
          </Text>
          <Text style={[styles.cellText, styles.cellNum]}>
            {p.stages.transport.toFixed(2)}
          </Text>
          <Text style={[styles.cellText, styles.cellNum]}>
            {p.stages.use.toFixed(2)}
          </Text>
          <Text style={[styles.cellText, styles.cellNum]}>
            {p.stages.endOfLife.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function StageBreakdown({
  product,
  styles,
}: {
  product: PcfProduct;
  styles: DocumentStyles;
}) {
  const stages = Object.entries(product.stages) as [PcfLifecycleStage, number][];
  const max = Math.max(...stages.map(([, v]) => v), 1);

  return (
    <View>
      {stages.map(([key, value]) => (
        <View key={key} style={styles.stageBarRow}>
          <Text style={styles.stageLabel}>{pcfLifecycleLabels[key]}</Text>
          <View style={styles.stageBarTrack}>
            <View
              style={[
                styles.stageBarFill,
                { width: `${Math.round((value / max) * 100)}%` },
              ]}
            />
          </View>
          <Text style={styles.stageValue}>{value.toFixed(2)} kgCO₂e</Text>
        </View>
      ))}
    </View>
  );
}

function ProductDetailPage({
  product,
  config,
  styles,
}: {
  product: PcfProduct;
  config: ReportConfig;
  styles: DocumentStyles;
}) {
  const topBreakdown = Object.entries(product.breakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader
        title={product.product}
        clientName={config.branding.clientName}
        styles={styles}
      />
      <Text style={styles.sectionTitle}>{product.product}</Text>
      <Text style={styles.paragraph}>
        Functional unit: {product.functionalUnit} · Total emissions:{" "}
        {product.totalEmissions.toFixed(2)} kgCO₂e
      </Text>

      <Text style={styles.sectionTitle}>Emissions by life-cycle stage</Text>
      <StageBreakdown product={product} styles={styles} />

      {config.sections.topEmissionSources && (
        <>
          <Text style={styles.sectionTitle}>Top emission sources</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.cellHeader, { width: "70%" }]}>Category</Text>
              <Text style={[styles.cellHeader, styles.cellNum]}>kgCO₂e</Text>
            </View>
            {topBreakdown.map(([key, value], i) => (
              <View
                key={key}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                <Text style={[styles.cellText, { width: "70%" }]}>
                  {pcfBreakdownLabels[key] ?? key}
                </Text>
                <Text style={[styles.cellText, styles.cellNum]}>
                  {value.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
      <PageFooter
        pageLabel={product.product}
        clientName={config.branding.clientName}
        styles={styles}
      />
    </Page>
  );
}

export function PcfDocument({
  data,
  config,
}: {
  data: PcfReportData;
  config: ReportConfig;
}) {
  const styles = createDocumentStyles(config);
  const year = config.metadata.reportYear;
  const title = config.metadata.reportTitle;

  return (
    <Document
      title={`${title} ${year} — ${config.branding.clientName}`}
      author="Footprint Mappa"
    >
      <Page size="A4" style={[styles.page, styles.coverPage]}>
        <View style={styles.accentBar} />
        <Text style={styles.coverTitle}>
          {title} {year}
        </Text>
        <Text style={styles.coverSubtitle}>
          ISO 14067 · Cradle-to-gate assessment
        </Text>
        <Text style={styles.coverClient}>{config.branding.clientName}</Text>
        <Text style={styles.coverMeta}>
          Generated {new Date(data.generatedAt).toLocaleDateString("en-GB")} ·{" "}
          {data.products.length} products assessed · {config.template} template
        </Text>
      </Page>

      {(config.sections.introduction || config.sections.portfolioSummary) && (
        <Page size="A4" style={styles.page}>
          <PageHeader
            title="Introduction & summary"
            clientName={config.branding.clientName}
            styles={styles}
          />
          {config.sections.introduction && (
            <>
              <Text style={styles.sectionTitle}>Introduction</Text>
              <Text style={styles.paragraph}>
                This report summarises Product Carbon Footprint (PCF) results for{" "}
                {config.branding.clientName}, quantifying greenhouse gas emissions
                across the product life cycle in accordance with ISO 14067.
              </Text>
              <Text style={styles.paragraph}>
                {config.branding.clientName} is an international industrial group
                manufacturing advanced protective sleeving and technical textile
                solutions.
              </Text>
            </>
          )}
          {config.sections.portfolioSummary && (
            <>
              <Text style={styles.sectionTitle}>
                Portfolio summary (kgCO₂e per F.U.)
              </Text>
              <SummaryTable products={data.products} styles={styles} />
            </>
          )}
          <PageFooter
            pageLabel="Summary"
            clientName={config.branding.clientName}
            styles={styles}
          />
        </Page>
      )}

      {config.sections.productDetails &&
        data.products.map((product) => (
          <ProductDetailPage
            key={product.product}
            product={product}
            config={config}
            styles={styles}
          />
        ))}
    </Document>
  );
}
