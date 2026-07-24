import { getDb, ensureSchema } from "./_lib/db.js";

export default async function handler(req, res) {
  await ensureSchema();
  const db = getDb();

  if (req.method === "GET") {
    const { sessionId, status } = req.query;
    let sql = "SELECT * FROM opportunities WHERE 1=1";
    const args = [];

    if (sessionId) {
      sql += " AND session_id = ?";
      args.push(sessionId);
    }
    if (status) {
      sql += " AND status = ?";
      args.push(status);
    }
    sql += " ORDER BY impact_score DESC, effort_score ASC";

    const result = await db.execute({ sql, args });
    return res.status(200).json({ opportunities: result.rows });
  }

  res.setHeader("Allow", "GET");
  return res.status(405).json({ error: "Method not allowed" });
}
