import { useEffect, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import ImpactEffortMatrix from "../components/ImpactEffortMatrix.jsx";

const STATUSES = ["Needs Discussion", "Accepted", "Rejected"];
const STATUS_STYLES = {
  Accepted: "bg-accepted/10 text-accepted border-accepted/30",
  Rejected: "bg-rejected/10 text-rejected border-rejected/30",
  "Needs Discussion": "bg-pending/10 text-pending border-pending/30",
};

export default function Backlog() {
  const [params] = useSearchParams();
  const sessionId = params.get("session") || localStorage.getItem("lastSessionId");

  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    fetchOpportunities();
  }, [sessionId]);

  async function fetchOpportunities() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/opportunities?sessionId=${sessionId}`);
      if (!res.ok) throw new Error("Failed to load backlog");
      const data = await res.json();
      setOpportunities(data.opportunities);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    const previous = opportunities;
    setSaveError(null);
    setOpportunities((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status } : o))
    );
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Save failed (${res.status})`);
      }
    } catch (err) {
      console.error("Failed to save status:", err);
      setOpportunities(previous);
      setSaveError(`Couldn't save status change: ${err.message}. Please try again.`);
    }
  }

  const filtered = useMemo(() => {
    return opportunities.filter((o) => {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (priorityFilter !== "All" && o.priority !== priorityFilter) return false;
      return true;
    });
  }, [opportunities, statusFilter, priorityFilter]);

  if (!sessionId) {
    return (
      <EmptyState
        title="No discovery session yet"
        body="Run a discovery session first to build a backlog."
      />
    );
  }

  if (loading) {
    return <EmptyState title="Loading backlog…" body="" />;
  }

  if (loadError) {
    return <EmptyState title="Something went wrong" body={loadError} isError />;
  }

  if (opportunities.length === 0) {
    return (
      <EmptyState
        title="No opportunities in this session"
        body="Go back to Discovery and add at least one task."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-10 py-8 md:py-12">
      <p className="font-mono text-xs uppercase tracking-wide text-signal mb-2">
        Step 2 — Automation backlog
      </p>
      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-4">
        Rank it. Decide. Move on.
      </h1>

      {saveError && (
        <div className="mb-6 flex items-start justify-between gap-4 border border-rejected/40 bg-rejected/10 text-rejected text-sm rounded-lg px-4 py-3">
          <span>{saveError}</span>
          <button
            onClick={() => setSaveError(null)}
            className="shrink-0 font-medium hover:underline focus-ring"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
        <div className="space-y-4">
          <ImpactEffortMatrix
            opportunities={opportunities}
            onSelect={setSelectedId}
            selectedId={selectedId}
          />
          <Link
            to="/report"
            onClick={() => localStorage.setItem("lastSessionId", sessionId)}
            className="block text-center border border-line rounded-lg py-3 text-sm font-medium hover:border-ink transition-colors focus-ring"
          >
            View one-page report →
          </Link>
        </div>

        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={["All", ...STATUSES]}
              label="Status"
            />
            <FilterSelect
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={["All", "High", "Medium", "Low"]}
              label="Priority"
            />
          </div>

          <div className="space-y-3">
            {filtered.map((o) => (
              <OpportunityCard
                key={o.id}
                o={o}
                selected={o.id === selectedId}
                onSelect={() => setSelectedId(o.id)}
                onStatusChange={(status) => updateStatus(o.id, status)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OpportunityCard({ o, selected, onSelect, onStatusChange }) {
  return (
    <div
      onClick={onSelect}
      className={`border rounded-xl p-4 bg-panel cursor-pointer transition-colors ${
        selected ? "border-ink" : "border-line hover:border-ink/30"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wide text-pending mb-1">
            {o.employee} {o.department ? `· ${o.department}` : ""}
          </div>
          <h3 className="font-medium leading-snug">{o.task}</h3>
        </div>
        <PriorityBadge priority={o.priority} />
      </div>

      <p className="text-sm text-ink/70 mt-2">{o.ai_solution}</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs font-mono text-ink/60">
        <span>Tool: {o.recommended_tool}</span>
        <span>Impact {o.impact_score}/10</span>
        <span>Effort {o.effort_score}/10</span>
        {o.estimated_annual_hours_saved != null && (
          <span>~{Math.round(o.estimated_annual_hours_saved)} hrs/yr saved</span>
        )}
      </div>

      <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => onStatusChange(s)}
            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors focus-ring ${
              o.status === s
                ? STATUS_STYLES[s]
                : "border-line text-ink/40 hover:text-ink/70"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-3 pt-3 border-t border-line text-sm space-y-2">
          <p>
            <span className="font-medium">Implementation idea: </span>
            {o.implementation_idea}
          </p>
          {o.notes && (
            <p className="text-ink/60">
              <span className="font-medium">Notes: </span>
              {o.notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    High: "bg-signal text-white",
    Medium: "bg-signal/20 text-signal",
    Low: "bg-ink/10 text-ink/50",
  };
  return (
    <span
      className={`shrink-0 text-[11px] font-medium px-2 py-1 rounded-full ${
        colors[priority] || colors.Low
      }`}
    >
      {priority}
    </span>
  );
}

function FilterSelect({ value, onChange, options, label }) {
  return (
    <label className="text-xs font-medium text-ink/60 flex items-center gap-2">
      {label}
      <select
        className="input !w-auto py-1.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({ title, body, isError }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <h2 className="font-display text-2xl font-semibold mb-2">{title}</h2>
      <p className={isError ? "text-rejected" : "text-ink/60"}>{body}</p>
      <Link
        to="/"
        className="inline-block mt-6 text-sm font-medium text-signal hover:underline"
      >
        ← Start a discovery session
      </Link>
    </div>
  );
}
