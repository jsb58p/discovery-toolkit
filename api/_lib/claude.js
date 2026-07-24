import Anthropic from "@anthropic-ai/sdk";

// Requires ANTHROPIC_API_KEY set in Vercel project environment variables.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI enablement consultant embedded inside a private equity portfolio operations team. Your job is to review a single employee's description of a repetitive work task and assess whether and how it can be automated or accelerated using Claude, Microsoft Copilot, ChatGPT, or an agentic workflow tool like Cowork.

For the task you are given, return ONLY a single JSON object (no markdown fences, no prose before or after) with exactly these fields:

{
  "aiSolution": "1-2 sentence description of the automation approach",
  "recommendedTool": "One of: Claude, Microsoft Copilot, ChatGPT, Cowork, Power Automate, Not a good AI fit",
  "implementationIdea": "2-4 sentence concrete plan for how to build/configure this, written for a non-technical employee",
  "impactScore": integer 1-10 (10 = huge time/quality impact if automated),
  "effortScore": integer 1-10 (10 = very hard to implement, 1 = trivial),
  "priority": "One of: High, Medium, Low (derive from impact vs effort: high impact + low effort = High priority)",
  "estimatedAnnualHoursSaved": number (estimate using the hours-per-week figure provided, times ~48 working weeks, times an assumed automation efficiency of 40-70% depending on how automatable the task is),
  "risksOrCaveats": "1-2 sentences on where human judgment is still required or what could go wrong"
}

Be honest and calibrated. Not every task is a good automation candidate — if it genuinely requires human judgment, relationship context, or physical presence, say so, keep the impact score low, and set recommendedTool to "Not a good AI fit".`;

export async function analyzeTask(task) {
  const userPrompt = `Employee: ${task.employee}
Department: ${task.department || "Not specified"}
Task: ${task.task}
Current workflow / how they do it today: ${task.currentWorkflow || "Not specified"}
Pain point: ${task.painPoint || "Not specified"}
Software used: ${task.software || "Not specified"}
Time per occurrence: ${task.minutesPerOccurrence || "Not specified"} minutes
Frequency: ${task.frequency || "Not specified"}
Estimated hours per week spent on this task: ${task.hoursPerWeek || "Not specified"}
Parts that require human judgment: ${task.requiresHumanJudgment || "Not specified"}
What a successful output looks like: ${task.successCriteria || "Not specified"}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) throw new Error("No text response from Claude");

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}
