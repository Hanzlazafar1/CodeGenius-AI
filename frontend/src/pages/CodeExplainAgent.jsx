import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  MessageSquare, 
  Code, 
  BookOpen, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  Info,
  Settings,
  Hash,
  ArrowRight,
  Terminal
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { callAgentStream } from '../api'

const STEPS = ['Detecting syntax', 'Mapping logical structure', 'Synthesizing semantics', 'Generating context']
const LANGUAGES = ['Auto-detect', 'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby']

export default function CodeExplainAgent() {
  const [form, setForm] = useState({ code: '', language: 'Auto-detect' })
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('explanation')

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

    await callAgentStream('/code-explain', {
      code: form.code,
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

  return (
    <div className="agent-page">
      <div className="agent-grid">
        {/* Left: Configuration */}
        <div className="agent-setup">
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <Settings size={16} color="var(--color-explain)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)' }}>Parameters</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Contextual Language</label>
                <select
                  className="form-select"
                  value={form.language}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                >
                  {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              
              <div className="form-group" style={{ marginBottom: 32 }}>
                <label className="form-label"><Hash size={14} /> Neural Input</label>
                <textarea
                  className="form-textarea"
                  placeholder="Paste your source code here for deconstruction..."
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  required
                  style={{ minHeight: 280, fontSize: 12, fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Analyzing...' : 'Deconstruct Code'}
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
                <div style={{ padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: '50%', marginBottom: 20 }}>
                  <MessageSquare size={32} opacity={0.2} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Vocalizing Input</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Input code snippet to begin structural deconstruction and semantic mapping.</p>
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
                <LoadingSpinner steps={STEPS} activeStep={activeStep} label="Semantic Engine Active" />
              </motion.div>
            )}

            {result && (
              <motion.div 
                key="result"
                className="result-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {result.detected_language && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
                    <Terminal size={12} color="var(--text-muted)" />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Detected Context:</span>
                    <span style={{ padding: '2px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: 6, fontSize: 10, fontWeight: 800, color: 'var(--color-explain)', border: '1px solid var(--glass-border)' }}>{result.detected_language}</span>
                  </div>
                )}

                <div className="tab-row">
                  {[
                    { key: 'explanation', label: 'Semantic', icon: <BookOpen size={13} /> },
                    { key: 'structure', label: 'Structure', icon: <Layers size={13} /> },
                    { key: 'summary', label: 'Executive', icon: <Sparkles size={13} /> },
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
                      {activeTab === 'explanation' && (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.detailed_explanation}</ReactMarkdown>
                        </div>
                      )}
                      {activeTab === 'structure' && (
                        <div className="markdown-body">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.structure_analysis}</ReactMarkdown>
                        </div>
                      )}
                      {activeTab === 'summary' && (
                        <div style={{ 
                          padding: 24, 
                          background: 'rgba(255, 255, 255, 0.02)', 
                          borderRadius: 12, 
                          fontSize: 14, 
                          lineHeight: 1.6, 
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--glass-border)'
                        }}>
                          {result.summary}
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
