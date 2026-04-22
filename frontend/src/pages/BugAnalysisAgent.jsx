import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  ShieldCheck, 
  Search, 
  Wrench, 
  CheckCircle, 
  Sparkles, 
  AlertCircle, 
  Code,
  Settings,
  Hash,
  ArrowRight,
  Terminal
} from 'lucide-react'
import CodeBlock from '../components/CodeBlock'
import LoadingSpinner from '../components/LoadingSpinner'
import { callAgentStream } from '../api'

const STEPS = ['Classifying type', 'Neural root cause analysis', 'Synthesizing fixes', 'Generating resolved code']
const LANGUAGES = ['Auto-detect', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby']

function extractCodeBlock(text = '') {
  const match = text.match(/```[\w]*\n([\s\S]*?)```/)
  return match ? match[1] : text
}

export default function BugAnalysisAgent() {
  const [form, setForm] = useState({ code: '', error_message: '', language: 'Auto-detect' })
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('causes')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.code.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    setActiveStep(0)

    const stepTimer = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s))
    }, 3000)

    await callAgentStream('/bug-analysis', {
      code: form.code,
      error_message: form.error_message,
      language: form.language === 'Auto-detect' ? '' : form.language,
    }, {
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

  const fixedCode = result?.fixed_code ? extractCodeBlock(result.fixed_code) : ''

  return (
    <div className="agent-page">
      <div className="agent-grid">
        {/* Left: Configuration */}
        <div className="agent-setup">
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Settings size={16} color="var(--color-bug)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)' }}>Parameters</span>
            </div>

            <form onSubmit={handleSubmit}>
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
              
              <div className="form-group">
                <label className="form-label"><Hash size={14} /> Neural Input</label>
                <textarea
                  className="form-textarea"
                  placeholder="Paste problematic code segment here..."
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                  style={{ minHeight: 200, fontSize: 12, fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 32 }}>
                <label className="form-label">Fault / Trace Log</label>
                <textarea
                  className="form-textarea"
                  placeholder="e.g. StackTrace, Error messages..."
                  value={form.error_message}
                  onChange={(e) => setForm({ ...form, error_message: e.target.value })}
                  style={{ minHeight: 80, fontSize: 11 }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Diagnosing...' : 'Execute Diagnostic'}
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
                  <ShieldCheck size={32} opacity={0.2} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Diagnostic Mode</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Input code segment and fault logs to begin autonomous root cause analysis.</p>
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
                <LoadingSpinner steps={STEPS} activeStep={activeStep} label="Neural Diagnostic Pipeline Active" />
              </motion.div>
            )}

            {result && (
              <motion.div 
                key="result"
                className="result-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {result.bug_classification && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
                    <Terminal size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Fault Pattern:</span>
                    <span style={{ padding: '2px 8px', background: 'var(--inline-code-bg)', borderRadius: 6, fontSize: 10, fontWeight: 800, color: 'var(--color-bug)', border: '1px solid var(--glass-border)' }}>{result.bug_classification}</span>
                  </div>
                )}

                <div className="tab-row">
                  {[
                    { key: 'causes', label: 'Diagnostic', icon: <Search size={13} /> },
                    { key: 'fixes', label: 'Remediation', icon: <Wrench size={13} /> },
                    { key: 'fixedcode', label: 'Synthesis', icon: <CheckCircle size={13} /> },
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
                      {activeTab === 'causes' && (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.root_causes}</ReactMarkdown>
                        </div>
                      )}
                      {activeTab === 'fixes' && (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.suggested_fixes}</ReactMarkdown>
                        </div>
                      )}
                      {activeTab === 'fixedcode' && (
                        <CodeBlock
                          code={fixedCode}
                          language={form.language === 'Auto-detect' ? 'python' : form.language.toLowerCase()}
                        />
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
