import { getDb, ensureSchema } from "../_lib/db.js";

const ALLOWED_STATUSES = ["Accepted", "Rejected", "Needs Discussion"];

export default async function handler(req, res) {
  await ensureSchema();
  const db = getDb();
  const { id } = req.query;

  if (req.method === "PATCH") {
    const { status, notes } = req.body;

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}`,
      });
    }

    const updates = [];
    const args = [];
    if (status) {
      updates.push("status = ?");
      args.push(status);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      args.push(notes);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: "Nothing to update" });
    }
    args.push(id);

    await db.execute({
      sql: `UPDATE opportunities SET ${updates.join(", ")} WHERE id = ?`,
      args,
    });

    const result = await db.execute({
      sql: "SELECT * FROM opportunities WHERE id = ?",
      args: [id],
    });
    return res.status(200).json({ opportunity: result.rows[0] || null });
  }

  if (req.method === "DELETE") {
    await db.execute({
      sql: "DELETE FROM opportunities WHERE id = ?",
      args: [id],
    });
    return res.status(204).end();
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).json({ error: "Method not allowed" });
}
