import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Discovery from "./pages/Discovery.jsx";
import Backlog from "./pages/Backlog.jsx";
import Report from "./pages/Report.jsx";

const navItems = [
  { to: "/", label: "Discovery", icon: "①" },
  { to: "/backlog", label: "Backlog", icon: "②" },
  { to: "/report", label: "Report", icon: "③" },
];

export default function App() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Desktop side rail */}
      <aside className="hidden md:flex md:w-56 md:flex-col md:border-r md:border-line md:py-8 md:px-6 md:sticky md:top-0 md:h-screen">
        <Brand />
        <nav className="mt-10 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>
        <div className="mt-auto pt-8 text-xs text-pending leading-relaxed">
          Internal tool · CPC Management
          <br />
          AI Enablement pilot
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-line sticky top-0 bg-paper z-20">
        <Brand compact />
      </header>

      <main className="flex-1 pb-24 md:pb-0">
        <Routes>
          <Route path="/" element={<Discovery />} />
          <Route path="/backlog" element={<Backlog />} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-line bg-panel z-20 flex">
        {navItems.map((item) => (
          <MobileNavItem key={item.to} {...item} />
        ))}
      </nav>
    </div>
  );
}

function Brand({ compact }) {
  return (
    <div>
      <div className="font-display text-lg font-semibold tracking-tight">
        Workflow Discovery
      </div>
      {!compact && (
        <div className="font-mono text-[11px] text-pending mt-1 uppercase tracking-wide">
          Impact × Effort Toolkit
        </div>
      )}
    </div>
  );
}

function NavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors focus-ring ${
          isActive
            ? "bg-ink text-paper"
            : "text-ink/70 hover:bg-ink/5 hover:text-ink"
        }`
      }
    >
      <span className="font-mono text-xs">{icon}</span>
      {label}
    </NavLink>
  );
}

function MobileNavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-medium focus-ring ${
          isActive ? "text-signal" : "text-pending"
        }`
      }
    >
      <span className="font-mono text-sm">{icon}</span>
      {label}
    </NavLink>
  );
}
