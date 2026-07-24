const STATUS_COLORS = {
  Accepted: "#3A7D63",
  Rejected: "#B3462C",
  "Needs Discussion": "#8A8F98",
};

// Plots opportunities on an impact (y, 1-10) vs effort (x, 1-10) grid.
// Top-left quadrant = high impact, low effort = best automation candidates.
export default function ImpactEffortMatrix({ opportunities, onSelect, selectedId }) {
  const size = 320;
  const pad = 28;
  const plot = size - pad * 2;

  const toX = (effort) => pad + ((effort - 1) / 9) * plot;
  const toY = (impact) => pad + (1 - (impact - 1) / 9) * plot;

  return (
    <div className="border border-line rounded-xl bg-panel p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display text-base font-semibold">
          Impact × Effort
        </h3>
        <div className="flex gap-3 text-[11px] font-mono">
          {Object.entries(STATUS_COLORS).map(([label, color]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: color }}
              />
              {label}
            </span>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-auto"
        role="img"
        aria-label="Impact versus effort scatter plot of automation opportunities"
      >
        {/* quadrant backgrounds */}
        <rect x={pad} y={pad} width={plot / 2} height={plot / 2} fill="#3A7D6314" />
        <rect x={pad + plot / 2} y={pad} width={plot / 2} height={plot / 2} fill="#C8792A10" />
        <rect x={pad} y={pad + plot / 2} width={plot / 2} height={plot / 2} fill="#F4F2ED" />
        <rect x={pad + plot / 2} y={pad + plot / 2} width={plot / 2} height={plot / 2} fill="#B3462C0D" />

        {/* axes */}
        <line x1={pad} y1={pad} x2={pad} y2={size - pad} stroke="#D9D5CB" />
        <line x1={pad} y1={size - pad} x2={size - pad} y2={size - pad} stroke="#D9D5CB" />

        {/* quadrant labels */}
        <text x={pad + 6} y={pad + 14} className="fill-ink/40" fontSize="9" fontFamily="IBM Plex Mono">
          QUICK WINS
        </text>
        <text x={size - pad - 6} y={size - pad - 6} textAnchor="end" className="fill-ink/30" fontSize="9" fontFamily="IBM Plex Mono">
          RECONSIDER
        </text>

        {/* axis labels */}
        <text x={size / 2} y={size - 6} textAnchor="middle" fontSize="10" fontFamily="IBM Plex Mono" className="fill-ink/50">
          EFFORT →
        </text>
        <text
          x={10}
          y={size / 2}
          textAnchor="middle"
          fontSize="10"
          fontFamily="IBM Plex Mono"
          className="fill-ink/50"
          transform={`rotate(-90 10 ${size / 2})`}
        >
          IMPACT →
        </text>

        {opportunities.map((o) => {
          const cx = toX(o.effort_score ?? o.effortScore ?? 5);
          const cy = toY(o.impact_score ?? o.impactScore ?? 5);
          const isSelected = o.id === selectedId;
          return (
            <g
              key={o.id}
              onClick={() => onSelect?.(o.id)}
              className="cursor-pointer"
            >
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? 8 : 6}
                fill={STATUS_COLORS[o.status] || STATUS_COLORS["Needs Discussion"]}
                stroke={isSelected ? "#1B2430" : "white"}
                strokeWidth={isSelected ? 2 : 1.5}
                opacity={0.9}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
