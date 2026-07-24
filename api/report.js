import { getDb, ensureSchema } from "./_lib/db.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sessionId } = req.query;
  if (!sessionId) {
    return res.status(400).json({ error: "sessionId query param is required" });
  }

  await ensureSchema();
  const db = getDb();

  const result = await db.execute({
    sql: "SELECT * FROM opportunities WHERE session_id = ? ORDER BY impact_score DESC",
    args: [sessionId],
  });

  const rows = result.rows;
  const totalOpportunities = rows.length;
  const totalHoursPerWeekIdentified = rows.reduce(
    (sum, r) => sum + (Number(r.hours_per_week) || 0),
    0
  );
  const totalAnnualHoursSavedIfAllAccepted = rows.reduce(
    (sum, r) => sum + (Number(r.estimated_annual_hours_saved) || 0),
    0
  );
  const accepted = rows.filter((r) => r.status === "Accepted");
  const totalAnnualHoursSavedAccepted = accepted.reduce(
    (sum, r) => sum + (Number(r.estimated_annual_hours_saved) || 0),
    0
  );
  const byPriority = { High: 0, Medium: 0, Low: 0 };
  rows.forEach((r) => {
    if (byPriority[r.priority] !== undefined) byPriority[r.priority] += 1;
  });

  return res.status(200).json({
    sessionId,
    employee: rows[0]?.employee || null,
    department: rows[0]?.department || null,
    generatedAt: new Date().toISOString(),
    totalOpportunities,
    totalHoursPerWeekIdentified,
    totalAnnualHoursSavedIfAllAccepted,
    totalAnnualHoursSavedAccepted,
    byPriority,
    opportunities: rows,
  });
}
