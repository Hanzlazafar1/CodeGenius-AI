import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Zap,
  Search,
  Bug,
  FileText,
  Activity,
  Terminal,
  MessageSquare,
  ShieldCheck,
  ClipboardCheck
} from 'lucide-react'

const AGENTS = [
  {
    path: '/algorithm',
    label: 'Algorithm Gen',
    icon: <Terminal size={18} />,
    color: 'var(--color-algo)',
  },
  {
    path: '/code-explain',
    label: 'Code Explainer',
    icon: <MessageSquare size={18} />,
    color: 'var(--color-explain)',
  },
  {
    path: '/bug-analysis',
    label: 'Bug Analyzer',
    icon: <ShieldCheck size={18} />,
    color: 'var(--color-bug)',
  },
  {
    path: '/srs',
    label: 'SRS Extractor',
    icon: <ClipboardCheck size={18} />,
    color: 'var(--color-srs)',
  },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Logo Section */}
      <div className="sidebar-logo">
        <div className="logo-glow">
          <Activity size={20} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <h1>CodeGenius</h1>
          <p>AI Engine</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main</div>
        <NavLink to="/" end className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="nav-indicator"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </>
          )}
        </NavLink>

        <div className="sidebar-section-label">Engines</div>
        {AGENTS.map((agent) => (
          <NavLink
            key={agent.path}
            to={agent.path}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="nav-indicator"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span style={{ color: isActive ? agent.color : 'inherit', display: 'flex' }}>
                  {agent.icon}
                </span>
                <span>{agent.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-status">
          <div className="status-dot" />
          <span>Operational</span>
        </div>
        <div className="sidebar-attribution">
          <span>Made with ❤️</span>
        </div>
      </div>
    </aside>
  )
}
