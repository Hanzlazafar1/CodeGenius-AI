import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Terminal, 
  MessageSquare, 
  ShieldCheck, 
  ClipboardCheck, 
  Cpu, 
  Globe, 
  Rocket, 
  Layers, 
  Radio, 
  Zap 
} from 'lucide-react'

const AGENTS = [
  {
    path: '/algorithm',
    icon: <Terminal size={24} />,
    title: 'Algorithm Engineering',
    desc: 'High-performance logic synthesis with optimized Big-O complexity audits.',
    color: 'var(--color-algo)',
    steps: ['Analyze', 'Synthesis', 'Audit', 'Complexity'],
  },
  {
    path: '/code-explain',
    icon: <MessageSquare size={24} />,
    title: 'Cognitive Explainer',
    desc: 'Deep semantic deconstruction and structural code breakdown for rapid comprehension.',
    color: 'var(--color-explain)',
    steps: ['Deconstruct', 'Semantic', 'Logical', 'Summary'],
  },
  {
    path: '/bug-analysis',
    icon: <ShieldCheck size={24} />,
    title: 'Diagnostic Neural',
    desc: 'Autonomous bug classification and corrective synthesis for mission-critical code.',
    color: 'var(--color-bug)',
    steps: ['Classify', 'Diagnostic', 'Patch', 'Verify'],
  },
  {
    path: '/srs',
    icon: <ClipboardCheck size={24} />,
    title: 'Requirement Parser',
    desc: 'Automated extraction of functional mappings and technical specifications from raw documentation.',
    color: 'var(--color-srs)',
    steps: ['Parse', 'Logic Map', 'NFRs', 'Draft'],
  },
]

const TECH = [
  { label: 'LangGraph Core', icon: <Layers size={14} /> },
  { label: 'FastAPI Stream', icon: <Terminal size={14} /> },
  { label: 'Groq LPU Array', icon: <Rocket size={14} /> },
  { label: 'React 18', icon: <Globe size={14} /> },
  { label: 'Llama 3.3 70B', icon: <Cpu size={14} /> },
  { label: 'SSE Pipeline', icon: <Radio size={14} /> },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
}

const item = {
  hidden: { y: 12, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }
}

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <motion.div 
        className="home-hero"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="home-hero-tag">
          <Zap size={10} fill="currentColor" />
          <span>Operational Pipeline v4.2</span>
        </div>
        <h1>Next-Gen Software Control</h1>
        <p>
          State-of-the-art AI agents powered by <strong>Groq LPU</strong> technology and 
          <strong> LangGraph</strong> runtime. Real-time engineering synthesis at scale.
        </p>

        <div className="home-tech-stack" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {TECH.map((t) => (
            <div key={t.label} className="tech-chip" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 8, 
              padding: '6px 12px', 
              background: 'rgba(255,255,255,0.03)', 
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}>
              <span style={{ display: 'flex' }}>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div 
        className="stats-bar glass-card"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        {[
          { value: '4', label: 'Engines' },
          { value: '16', label: 'Neural Nodes' },
          { value: '70B', label: 'Models' },
          { value: '250ms', label: 'TPOT' },
        ].map((s) => (
          <div key={s.label} className="stat-item">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Agents Grid */}
      <motion.div 
        className="agents-grid"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {AGENTS.map((agent) => (
          <motion.div key={agent.path} variants={item}>
            <Link 
              to={agent.path} 
              className="agent-card"
            >
              <div 
                className="agent-card-icon" 
                style={{ color: agent.color }}
              >
                {agent.icon}
              </div>

              <h3>{agent.title}</h3>
              <p>{agent.desc}</p>

              <div className="agent-card-workflow">
                {agent.steps.map((step, i) => (
                  <span key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span 
                      className="workflow-tag"
                      style={{ color: agent.color, borderColor: `${agent.color}40`, background: `${agent.color}10` }}
                    >
                      {step}
                    </span>
                    {i < agent.steps.length - 1 && <span style={{ opacity: 0.2, fontSize: 10 }}>/</span>}
                  </span>
                ))}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Architecture Architecture Architecture */}
      <motion.div 
        className="glass-card" 
        style={{ textAlign: 'center', padding: '32px', marginBottom: 40, borderStyle: 'dashed' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 }}>SYSTEM TOPOLOGY</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--primary)' }}>Frontend Edge</span>
          <span style={{ opacity: 0.2 }}>•</span>
          <span style={{ color: 'var(--secondary)' }}>API Gateway</span>
          <span style={{ opacity: 0.2 }}>•</span>
          <span style={{ color: '#f59e0b' }}>Neural Graph</span>
          <span style={{ opacity: 0.2 }}>•</span>
          <span style={{ color: 'var(--accent)' }}>Hardware LPU</span>
        </div>
      </motion.div>
    </div>
  )
}
