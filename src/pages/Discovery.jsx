import { useState } from "react";
import { useNavigate } from "react-router-dom";

const emptyTask = () => ({
  task: "",
  minutesPerOccurrence: "",
  frequency: "Daily",
  hoursPerWeek: "",
  software: "",
  successCriteria: "",
  requiresHumanJudgment: "",
  currentWorkflow: "",
  painPoint: "",
});

const FREQUENCIES = ["Daily", "A few times a week", "Weekly", "Monthly", "Ad hoc"];

export default function Discovery() {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState("");
  const [department, setDepartment] = useState("");
  const [tasks, setTasks] = useState([emptyTask()]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updateTask = (index, field, value) => {
    setTasks((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const addTask = () => setTasks((prev) => [...prev, emptyTask()]);
  const removeTask = (index) =>
    setTasks((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!employee.trim()) {
      setError("Employee name is required.");
      return;
    }
    const validTasks = tasks.filter((t) => t.task.trim());
    if (validTasks.length === 0) {
      setError("Add at least one task.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employee, department, tasks: validTasks }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Analysis failed");
      }
      const data = await res.json();
      localStorage.setItem("lastSessionId", data.sessionId);
      navigate(`/backlog?session=${data.sessionId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-10 py-8 md:py-12">
      <p className="font-mono text-xs uppercase tracking-wide text-signal mb-2">
        Step 1 — Discovery session
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-3">
        Map the work before you automate it.
      </h1>
      <p className="text-ink/70 mb-10 max-w-xl">
        Run a structured 1:1. Capture each repetitive task in the person's own
        words, then let Claude score it for automation impact and effort.
      </p>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Employee name">
            <input
              className="input"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              placeholder="Jamie Rivera"
            />
          </Field>
          <Field label="Department (optional)">
            <input
              className="input"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Finance"
            />
          </Field>
        </div>

        <div className="space-y-6">
          {tasks.map((task, i) => (
            <TaskCard
              key={i}
              index={i}
              task={task}
              onChange={updateTask}
              onRemove={tasks.length > 1 ? () => removeTask(i) : null}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addTask}
          className="w-full border border-dashed border-line rounded-lg py-3 text-sm font-medium text-ink/70 hover:border-signal hover:text-signal transition-colors focus-ring"
        >
          + Add another task
        </button>

        {error && (
          <p className="text-rejected text-sm font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full md:w-auto px-8 py-3 bg-ink text-paper rounded-lg font-medium hover:bg-ink/90 disabled:opacity-50 transition-colors focus-ring"
        >
          {submitting ? "Analyzing with Claude…" : "Analyze tasks"}
        </button>
      </form>
    </div>
  );
}

function TaskCard({ index, task, onChange, onRemove }) {
  return (
    <div className="border border-line rounded-xl p-5 bg-panel relative">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-xs text-pending uppercase tracking-wide">
          Task {index + 1}
        </span>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-xs text-rejected hover:underline focus-ring"
          >
            Remove
          </button>
        )}
      </div>

      <Field label="What repetitive task do you do?">
        <textarea
          className="input"
          rows={2}
          value={task.task}
          onChange={(e) => onChange(index, "task", e.target.value)}
          placeholder="Every Monday I summarize customer feedback from the past week into a report."
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Field label="Minutes per occurrence">
          <input
            type="number"
            className="input"
            value={task.minutesPerOccurrence}
            onChange={(e) =>
              onChange(index, "minutesPerOccurrence", e.target.value)
            }
            placeholder="45"
          />
        </Field>
        <Field label="How often?">
          <select
            className="input"
            value={task.frequency}
            onChange={(e) => onChange(index, "frequency", e.target.value)}
          >
            {FREQUENCIES.map((f) => (
              <option key={f}>{f}</option>
            ))}
          </select>
        </Field>
        <Field label="Estimated hours per week">
          <input
            type="number"
            step="0.5"
            className="input"
            value={task.hoursPerWeek}
            onChange={(e) => onChange(index, "hoursPerWeek", e.target.value)}
            placeholder="3"
          />
        </Field>
        <Field label="Software used">
          <input
            className="input"
            value={task.software}
            onChange={(e) => onChange(index, "software", e.target.value)}
            placeholder="Excel, Outlook, Salesforce"
          />
        </Field>
      </div>

      <Field label="What does a successful output look like?" className="mt-4">
        <textarea
          className="input"
          rows={2}
          value={task.successCriteria}
          onChange={(e) => onChange(index, "successCriteria", e.target.value)}
          placeholder="A 1-page summary with top 3 themes and 2 supporting quotes each."
        />
      </Field>

      <Field label="What parts require human judgment?" className="mt-4">
        <textarea
          className="input"
          rows={2}
          value={task.requiresHumanJudgment}
          onChange={(e) =>
            onChange(index, "requiresHumanJudgment", e.target.value)
          }
          placeholder="Deciding which themes matter most to leadership this quarter."
        />
      </Field>

      <Field label="Current workflow / pain point (optional)" className="mt-4">
        <textarea
          className="input"
          rows={2}
          value={task.currentWorkflow}
          onChange={(e) => onChange(index, "currentWorkflow", e.target.value)}
          placeholder="I read every ticket manually and copy quotes into a Word doc."
        />
      </Field>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-ink/60 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}
