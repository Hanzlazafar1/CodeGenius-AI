import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  Terminal, 
  Code, 
  BookOpen, 
  BarChart3, 
  Microscope, 
  Sparkles, 
  AlertCircle,
  Hash,
  Settings,
  ArrowRight
} from 'lucide-react'
import CodeBlock from '../components/CodeBlock'
import LoadingSpinner from '../components/LoadingSpinner'
import { callAgentStream } from '../api'

const STEPS = ['Analyzing logic', 'Synthesizing algorithm', 'Formatting documentation', 'Complexity audit']
const LANGUAGES = ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust']

function extractCodeBlock(text = '') {
  const match = text.match(/```[\w]*\n([\s\S]*?)```/)
  return match ? match[1] : text
}

export default function AlgorithmAgent() {
  const [form, setForm] = useState({ problem: '', language: 'Python', constraints: '' })
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('code')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.problem.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    setActiveStep(0)

    const stepTimer = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s))
    }, 3000)

    await callAgentStream('/algorithm', form, {
      onStatus: () => {},
      onResult: (data) => {
        clearInterval(stepTimer)
        setResult(data)
        setLoading(false)
        setActiveStep(STEPS.length)
      },
      onError: (msg) => {
        clearInterval(stepTimer)
        setError(msg)
        setLoading(false)
      },
    })
  }

  const code = result?.algorithm_code ? extractCodeBlock(result.algorithm_code) : ''

  return (
    <div className="agent-page">
      <div className="agent-grid">
        {/* Left: Configuration */}
        <div className="agent-setup">
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Settings size={16} color="var(--color-algo)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)' }}>Parameters</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label"><Hash size={14} /> Objective</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. Implement a thread-safe LRU cache..."
                  value={form.problem}
                  onChange={(e) => setForm({ ...form, problem: e.target.value })}
                  required
                  style={{ minHeight: 120 }}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Runtime Environment</label>
                <select
                  className="form-select"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                >
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 32 }}>
                <label className="form-label">Technical Constraints</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. O(1) complexity, no external libraries..."
                  value={form.constraints}
                  onChange={(e) => setForm({ ...form, constraints: e.target.value })}
                  style={{ minHeight: 80 }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Processing...' : 'Run Synthesis'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Workspace */}
        <div className="agent-workspace">
          <AnimatePresence mode="wait">
            {!loading && !result && !error && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card"
                style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, borderStyle: 'dotted' }}
              >
                <div style={{ padding: 24, background: 'var(--toggle-bg)', borderRadius: '50%', marginBottom: 20 }}>
                  <Terminal size={32} opacity={0.2} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Workspace Idle</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Configure parameters and run to begin algorithm synthesis.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card"
                style={{ height: '100%', minHeight: 400 }}
              >
                <LoadingSpinner steps={STEPS} activeStep={activeStep} label="Neural Engine Processing" />
              </motion.div>
            )}

            {result && (
              <motion.div 
                key="result"
                className="result-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="tab-row">
                  {[
                    { key: 'code', label: 'Source', icon: <Code size={13} /> },
                    { key: 'explain', label: 'Logic', icon: <BookOpen size={13} /> },
                    { key: 'complexity', label: 'Complexity', icon: <BarChart3 size={13} /> },
                    { key: 'analysis', label: 'Audit', icon: <Microscope size={13} /> },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                <div className="glass-card" style={{ padding: 20 }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeTab === 'code' && (
                        <CodeBlock code={code} language={form.language.toLowerCase()} />
                      )}
                      {activeTab === 'explain' && (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.explanation}</ReactMarkdown>
                        </div>
                      )}
                      {activeTab === 'complexity' && (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.complexity}</ReactMarkdown>
                        </div>
                      )}
                      {activeTab === 'analysis' && (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.analysis}</ReactMarkdown>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
