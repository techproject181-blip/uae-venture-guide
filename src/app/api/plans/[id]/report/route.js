import { renderToBuffer } from "@react-pdf/renderer";
import { ApiError, requireApiUser, route, toPlain } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { canReadPlan } from "@/lib/plans";
import { PlanReport } from "@/lib/report/plan-report";
import { Plan } from "@/models/Plan";
import { Source } from "@/models/Source";

// GET /api/plans/:id/report: the plan as a PDF, for anyone who may read the plan.
export const GET = route(async (request, { params }) => {
  const user = await requireApiUser();
  const { id } = await params;

  await connectDB();
  const plan = await Plan.findById(id).lean();
  if (!plan || !(await canReadPlan(user, plan))) throw new ApiError(404, "Plan not found.");
  const sources = await Source.find({ _id: { $in: plan.tasks.flatMap((task) => task.sourceIds) }, active: true })
    .select("title publisher url")
    .lean();

  const pdf = await renderToBuffer(<PlanReport plan={toPlain(plan)} sources={toPlain(sources)} />);
  const filename = `${
    plan.title
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "plan"
  }-report.pdf`;
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
});
