import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function Report() {
  const [params] = useSearchParams();
  const sessionId = params.get("session") || localStorage.getItem("lastSessionId");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    fetch(`/api/report?sessionId=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load report");
        return res.json();
      })
      .then(setReport)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (!sessionId) {
    return (
      <EmptyState body="No discovery session yet. Run one first." />
    );
  }
  if (loading) return <EmptyState body="Loading report…" />;
  if (error) return <EmptyState body={error} isError />;
  if (!report) return null;

  const accepted = report.opportunities.filter((o) => o.status === "Accepted");

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-10 py-8 md:py-12 print:py-0">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <p className="font-mono text-xs uppercase tracking-wide text-signal">
          Step 3 — Implementation report
        </p>
        <button
          onClick={() => window.print()}
          className="text-sm font-medium border border-line rounded-md px-3 py-1.5 hover:border-ink transition-colors focus-ring"
        >
          Print / Save PDF
        </button>
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-1">
        {report.employee}
        {report.department ? ` · ${report.department}` : ""}
      </h1>
      <p className="text-ink/50 text-sm font-mono mb-10">
        Generated {new Date(report.generatedAt).toLocaleString()}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <Stat label="Opportunities found" value={report.totalOpportunities} />
        <Stat
          label="Hours/wk identified"
          value={report.totalHoursPerWeekIdentified.toFixed(1)}
        />
        <Stat
          label="Est. hrs/yr saved (accepted)"
          value={Math.round(report.totalAnnualHoursSavedAccepted)}
        />
        <Stat
          label="Est. hrs/yr saved (if all accepted)"
          value={Math.round(report.totalAnnualHoursSavedIfAllAccepted)}
        />
      </div>

      <Section title="Priority breakdown">
        <div className="flex gap-6 font-mono text-sm">
          <span>High: {report.byPriority.High}</span>
          <span>Medium: {report.byPriority.Medium}</span>
          <span>Low: {report.byPriority.Low}</span>
        </div>
      </Section>

      <Section title={`Accepted for implementation (${accepted.length})`}>
        {accepted.length === 0 ? (
          <p className="text-ink/50 text-sm">
            Nothing accepted yet — mark opportunities as Accepted in the
            backlog to include them here.
          </p>
        ) : (
          <div className="space-y-5">
            {accepted.map((o) => (
              <div key={o.id} className="border-l-2 border-accepted pl-4">
                <h4 className="font-medium">{o.task}</h4>
                <p className="text-sm text-ink/70 mt-1">{o.implementation_idea}</p>
                <p className="text-xs font-mono text-ink/50 mt-1.5">
                  Tool: {o.recommended_tool} · Impact {o.impact_score}/10 ·
                  Effort {o.effort_score}/10 · ~
                  {Math.round(o.estimated_annual_hours_saved || 0)} hrs/yr
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      <div className="mt-10 print:hidden">
        <Link to="/backlog" className="text-sm text-signal font-medium hover:underline">
          ← Back to backlog
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border border-line rounded-lg p-4 bg-panel">
      <div className="font-display text-2xl font-semibold">{value}</div>
      <div className="text-[11px] text-ink/50 mt-1 leading-tight">{label}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-10">
      <h2 className="font-display text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState({ body, isError }) {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className={isError ? "text-rejected" : "text-ink/60"}>{body}</p>
      <Link to="/" className="inline-block mt-6 text-sm font-medium text-signal hover:underline">
        ← Start a discovery session
      </Link>
    </div>
  );
}
