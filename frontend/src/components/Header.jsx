import { Cpu, Zap } from 'lucide-react'

export default function Header({ title, subtitle }) {
  return (
    <header className="header">
      <div className="header-title">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-badges">
        <div className="header-badge">
          <Zap size={10} />
          <span>Groq LPU</span>
        </div>
        <div className="header-badge">
          <Cpu size={10} />
          <span>Llama 3.3</span>
        </div>
      </div>
    </header>
  )
}
