import { randomUUID } from "crypto";
import { getDb, ensureSchema } from "./_lib/db.js";
import { analyzeTask } from "./_lib/claude.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { sessionId, employee, department, tasks } = req.body;

    if (!employee || !Array.isArray(tasks) || tasks.length === 0) {
      return res
        .status(400)
        .json({ error: "employee and a non-empty tasks array are required" });
    }

    await ensureSchema();
    const db = getDb();
    const effectiveSessionId = sessionId || randomUUID();

    const results = [];

    for (const task of tasks) {
      const analysis = await analyzeTask({
        employee,
        department,
        ...task,
      });

      const id = randomUUID();
      const hoursPerWeek = Number(task.hoursPerWeek) || 0;

      await db.execute({
        sql: `INSERT INTO opportunities (
          id, session_id, employee, department, task, current_workflow,
          pain_point, software, minutes_per_occurrence, frequency, hours_per_week,
          requires_human_judgment, ai_solution, recommended_tool, implementation_idea,
          impact_score, effort_score, priority, estimated_annual_hours_saved, status
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          id,
          effectiveSessionId,
          employee,
          department || null,
          task.task,
          task.currentWorkflow || null,
          task.painPoint || null,
          task.software || null,
          task.minutesPerOccurrence || null,
          task.frequency || null,
          hoursPerWeek,
          task.requiresHumanJudgment || null,
          analysis.aiSolution,
          analysis.recommendedTool,
          analysis.implementationIdea,
          analysis.impactScore,
          analysis.effortScore,
          analysis.priority,
          analysis.estimatedAnnualHoursSaved,
          "Needs Discussion",
        ],
      });

      results.push({
        id,
        sessionId: effectiveSessionId,
        employee,
        department,
        task: task.task,
        ...analysis,
        status: "Needs Discussion",
      });
    }

    return res.status(200).json({ sessionId: effectiveSessionId, results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Analysis failed" });
  }
}
