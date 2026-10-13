import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { estimatedWeeks, firstYearCost, firstYearTotal, progressPercent, remainingBudget, totalsByCategory } from "@/lib/budget";
import {
  BUDGET_CATEGORIES,
  EMIRATES,
  JURISDICTIONS,
  JURISDICTION_PREFERENCES,
  RECURRENCES,
  SECTORS,
  TASK_STATUSES,
  labelOf,
} from "@/lib/constants";
import { formatAed, formatAedRange, formatDate } from "@/lib/format";
import { reportColors } from "@/lib/theme-colors";

// The plan as a PDF report (FR-13), drawn with @react-pdf/renderer. It uses
// the built-in Helvetica font, so no font files are needed. It looks like the
// app: black ink on white paper, thin rules, small uppercase field labels, an
// OFFICIAL mark in gold on checked fees and green for finished steps. The
// colours come from the app's palette (src/lib/theme-colors.js mirrors
// globals.css, because the PDF is drawn on the server and cannot read CSS).

const {
  ink: INK,
  muted: MUTED,
  rule: RULE,
  strongRule: STRONG_RULE,
  fill: FILL,
  seal: GOLD,
  done: GREEN,
  danger: RED,
  estimate: BAR,
} = reportColors;

const s = StyleSheet.create({
  page: { paddingTop: 40, paddingBottom: 56, paddingHorizontal: 40, fontFamily: "Helvetica", fontSize: 10, color: INK, lineHeight: 1.4 },
  brand: { fontSize: 8, color: MUTED, fontFamily: "Helvetica-Bold", letterSpacing: 1 },
  title: { fontSize: 22, fontFamily: "Helvetica-Bold", marginTop: 6, lineHeight: 1.25 },
  label: { fontSize: 7, color: MUTED, fontFamily: "Helvetica-Bold", letterSpacing: 0.6, textTransform: "uppercase" },
  fields: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: RULE,
    paddingVertical: 8,
  },
  field: { paddingRight: 14, marginRight: 14, borderRightWidth: 1, borderRightColor: RULE },
  fieldLast: { paddingRight: 0, marginRight: 0, borderRightWidth: 0 },
  fieldValue: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 2 },
  h2: { fontSize: 14, fontFamily: "Helvetica-Bold", marginTop: 22, paddingTop: 8, marginBottom: 8, borderTopWidth: 1, borderTopColor: INK },
  h3: { fontSize: 11, fontFamily: "Helvetica-Bold", marginTop: 10, marginBottom: 4 },
  muted: { color: MUTED },
  small: { fontSize: 8, marginTop: 1 },
  box: { borderWidth: 1, borderColor: RULE, borderRadius: 4, padding: 10, marginTop: 12 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: RULE, paddingVertical: 4 },
  headRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: STRONG_RULE, backgroundColor: FILL, paddingVertical: 4 },
  head: { fontFamily: "Helvetica-Bold", color: MUTED, fontSize: 7, letterSpacing: 0.6, textTransform: "uppercase" },
  official: { color: GOLD, fontFamily: "Helvetica-Bold", fontSize: 7, letterSpacing: 0.6 },
  done: { color: GREEN, fontFamily: "Helvetica-Bold" },
  bullet: { flexDirection: "row", marginBottom: 3 },
  barTrack: { flex: 1, height: 8, backgroundColor: FILL },
  link: { color: GREEN },
  // Placed from the top of the A4 page (841.89 points high), about 24 points
  // above its bottom edge. With `bottom`, react-pdf moves a footer that holds
  // the page number off the page.
  footer: {
    position: "absolute",
    top: 800,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: MUTED,
    borderTopWidth: 1,
    borderTopColor: RULE,
    paddingTop: 6,
  },
});

const cell = (flex, extra) => ({ flex, paddingRight: 6, ...extra });

/** A cost's basis, as on screen: OFFICIAL in gold for a checked fee, otherwise "estimate". */
function Basis({ basis }) {
  if (basis === "reference") return <Text style={s.official}> OFFICIAL</Text>;
  if (basis === "demo") return <Text style={s.muted}> demo fee, not checked</Text>;
  return <Text style={s.muted}> estimate</Text>;
}

export function PlanReport({ plan, sources }) {
  const total = firstYearTotal(plan.budgetItems);
  const remaining = remainingBudget(plan.budgetAed, plan.budgetItems);
  const byCategory = Object.entries(totalsByCategory(plan.budgetItems)).map(([category, totals]) => [category, totals.estimated]);
  const largest = Math.max(1, ...byCategory.map(([, amount]) => amount));
  // The planner gives every document the same licensing source, so it is named once above the list.
  const documentSourceIds = new Set(plan.documents.map((doc) => doc.sourceId));
  const documentSources = sources.filter((source) => documentSourceIds.has(source._id));

  const fields = [
    ["Sector", labelOf(SECTORS, plan.sector)],
    ["Emirate", labelOf(EMIRATES, plan.emirate)],
    ["Licence", labelOf(JURISDICTIONS, plan.recommendedJurisdiction)],
    ["Made", formatDate(plan.generatedAt)],
    ["Reference", String(plan._id).slice(-6).toUpperCase()],
  ];
  const figures = [
    ["First-year estimate", formatAed(total)],
    ["Budget", formatAed(plan.budgetAed)],
    remaining >= 0 ? ["Left in budget", formatAed(remaining)] : ["Over budget", `${formatAed(-remaining)} over`, RED],
    ["Time needed", `About ${estimatedWeeks(plan.phases, plan.tasks)} weeks`],
    ["Progress", `${progressPercent(plan.tasks)}%`],
  ];

  return (
    <Document title={`${plan.title} - startup plan`} author="UAE Venture Guide">
      <Page size="A4" style={s.page}>
        <Text style={s.brand}>UAE VENTURE GUIDE · STARTUP PLAN</Text>
        <Text style={s.title}>{plan.title}</Text>

        <View style={s.fields}>
          {fields.map(([label, value], index) => (
            <View key={label} style={[s.field, index === fields.length - 1 && s.fieldLast]}>
              <Text style={s.label}>{label}</Text>
              <Text style={s.fieldValue}>{value}</Text>
            </View>
          ))}
        </View>

        <Text style={{ marginTop: 12 }}>{plan.summary}</Text>

        <View style={[s.fields, { marginTop: 12 }]}>
          {figures.map(([label, value, color], index) => (
            <View key={label} style={[s.field, index === figures.length - 1 && s.fieldLast]}>
              <Text style={s.label}>{label}</Text>
              <Text style={[s.fieldValue, color && { color }]}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={s.box}>
          <Text style={{ fontFamily: "Helvetica-Bold" }}>
            Recommended: {labelOf(JURISDICTIONS, plan.recommendedJurisdiction)}
            <Text style={[s.muted, { fontFamily: "Helvetica" }]}>
              {" "}
              · Your answer: {labelOf(JURISDICTION_PREFERENCES, plan.jurisdictionPref)}
            </Text>
          </Text>
          <Text style={{ marginTop: 2 }}>{plan.jurisdictionReason}</Text>
        </View>

        {/* The founder's own answers from the intake form. */}
        <View style={{ marginTop: 14 }}>
          <Text style={s.label}>The idea</Text>
          <Text style={{ marginTop: 2 }}>{plan.idea}</Text>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <View style={{ flex: 3, paddingRight: 14 }}>
              <Text style={s.label}>Customers</Text>
              <Text style={{ marginTop: 2 }}>{plan.targetCustomers}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Team</Text>
              <Text style={{ marginTop: 2 }}>{plan.teamSize === 1 ? "Just you" : `${plan.teamSize} people`}</Text>
            </View>
          </View>
        </View>

        <Text style={s.h2}>Roadmap</Text>
        {plan.phases.map((phase, index) => (
          <View key={phase._id} wrap={false} style={{ marginBottom: 6 }}>
            <Text style={s.h3}>
              {index + 1}. {phase.title}
            </Text>
            <View style={s.headRow}>
              <Text style={[s.head, cell(0.4, { paddingLeft: 2 })]}>No.</Text>
              <Text style={[s.head, cell(3)]}>Step</Text>
              <Text style={[s.head, cell(2.2)]}>Cost</Text>
              <Text style={[s.head, cell(0.7)]}>Days</Text>
              <Text style={[s.head, cell(0.9)]}>Status</Text>
            </View>
            {plan.tasks
              .filter((task) => task.phaseId === phase._id)
              .map((task, taskIndex) => (
                <View key={task._id} style={s.row}>
                  <Text style={[cell(0.4, { paddingLeft: 2 }), s.muted]}>
                    {index + 1}.{taskIndex + 1}
                  </Text>
                  <View style={cell(3)}>
                    <Text>{task.title}</Text>
                    {task.description ? <Text style={s.small}>{task.description}</Text> : null}
                    {task.authority ? <Text style={[s.muted, s.small]}>{task.authority}</Text> : null}
                  </View>
                  <Text style={cell(2.2)}>
                    {task.costMinAed || task.costMaxAed ? (
                      <>
                        {formatAedRange(task.costMinAed, task.costMaxAed)}
                        <Basis basis={task.costBasis} />
                      </>
                    ) : (
                      "No fee"
                    )}
                  </Text>
                  <Text style={cell(0.7)}>{task.estDays}</Text>
                  <Text style={[cell(0.9), task.status === "done" && s.done]}>{labelOf(TASK_STATUSES, task.status)}</Text>
                </View>
              ))}
          </View>
        ))}

        <Text style={s.h2} break>
          Budget
        </Text>
        <Text style={s.muted}>First-year cost by category. Monthly costs count 12 times.</Text>
        <View style={{ marginTop: 8, marginBottom: 12 }}>
          {byCategory
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => (
              <View key={category} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                <Text style={{ width: 80 }}>{labelOf(BUDGET_CATEGORIES, category)}</Text>
                <View style={s.barTrack}>
                  <View style={{ width: `${(amount / largest) * 100}%`, height: 8, backgroundColor: BAR }} />
                </View>
                <Text style={{ width: 80, textAlign: "right" }}>{formatAed(amount)}</Text>
              </View>
            ))}
        </View>
        <View style={s.headRow}>
          <Text style={[s.head, cell(3, { paddingLeft: 2 })]}>Cost</Text>
          <Text style={[s.head, cell(1)]}>How often</Text>
          <Text style={[s.head, cell(1.3, { textAlign: "right" })]}>Estimate</Text>
          <Text style={[s.head, cell(1.3, { textAlign: "right" })]}>Actually paid</Text>
          <Text style={[s.head, cell(1.3, { textAlign: "right" })]}>First year</Text>
        </View>
        {plan.budgetItems.map((item) => (
          <View key={item._id} style={s.row} wrap={false}>
            <Text style={cell(3, { paddingLeft: 2 })}>
              {item.label}
              <Basis basis={item.costBasis} />
            </Text>
            <Text style={cell(1)}>{labelOf(RECURRENCES, item.recurrence)}</Text>
            <Text style={cell(1.3, { textAlign: "right" })}>{formatAed(item.estimatedAed)}</Text>
            <Text style={cell(1.3, { textAlign: "right" })}>{item.actualAed == null ? "-" : formatAed(item.actualAed)}</Text>
            <Text style={cell(1.3, { textAlign: "right" })}>{formatAed(firstYearCost(item.estimatedAed, item.recurrence))}</Text>
          </View>
        ))}
        <View style={[s.row, { borderBottomWidth: 0, borderTopWidth: 1, borderTopColor: STRONG_RULE }]}>
          <Text style={[cell(6.6, { textAlign: "right" }), { fontFamily: "Helvetica-Bold" }]}>Estimated first-year total</Text>
          <Text style={[cell(1.3, { textAlign: "right" }), { fontFamily: "Helvetica-Bold" }]}>{formatAed(total)}</Text>
        </View>

        <Text style={s.h2}>Documents</Text>
        {documentSources.length > 0 && (
          <Text style={[s.muted, { marginBottom: 6 }]}>
            Official {documentSources.length === 1 ? "page" : "pages"} for these documents:{" "}
            {documentSources.map((source) => source.title).join(", ")} (see Official sources).
          </Text>
        )}
        {plan.documents.map((doc) => (
          <View key={doc._id} style={s.bullet} wrap={false}>
            <Text style={[{ width: 22 }, doc.obtained && s.done]}>{doc.obtained ? "[x]" : "[ ]"}</Text>
            <Text style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{doc.name}</Text>
              {doc.required ? "" : " (if it applies)"}: {doc.description}
            </Text>
          </View>
        ))}

        <Text style={s.h2}>Risks</Text>
        {plan.risks.map((risk) => (
          <View key={risk._id} style={{ marginBottom: 6 }} wrap={false}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>
              {risk.title}{" "}
              <Text style={s.muted}>
                (likelihood {risk.likelihood}, impact {risk.impact})
              </Text>
            </Text>
            <Text>{risk.description}</Text>
            <Text>What to do: {risk.mitigation}</Text>
          </View>
        ))}

        {sources.length > 0 && (
          <>
            <Text style={s.h2}>Official sources</Text>
            {sources.map((source) => (
              <View key={source._id} style={s.bullet} wrap={false}>
                <Text style={{ flex: 1 }}>
                  {source.title} ({source.publisher}) -{" "}
                  <Link src={source.url} style={s.link}>
                    {source.url}
                  </Link>
                </Text>
              </View>
            ))}
          </>
        )}

        {/* The advice notice, on every page. */}
        <View style={s.footer} fixed>
          <Text>Guidance only. Check each step and fee with the official source. Not legal or financial advice.</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
