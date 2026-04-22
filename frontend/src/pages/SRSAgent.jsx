import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  ClipboardCheck, 
  FileText, 
  CheckCircle2, 
  Settings2, 
  BarChart, 
  Sparkles, 
  AlertCircle, 
  Download, 
  BookOpen,
  Settings,
  Hash,
  ArrowRight
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import { callAgentStream } from '../api'

const STEPS = ['Parsing semantics', 'Extracting functional logic', 'Mapping constraints', 'Formatting specification']

const EXAMPLE_DOC = `Project: Online Learning Management System (LMS)

The system should allow students to register and log in using email and password.
Instructors can create courses, upload video lectures, and set assignments.
Students can enroll in courses, watch videos, submit assignments, and take quizzes.
The system must support at least 10,000 concurrent users.
All pages should load within 2 seconds under normal load.
The platform must be accessible on mobile and desktop browsers.
User data must be encrypted at rest and in transit using AES-256 and TLS 1.3.
The system should have 99.9% uptime.
An admin dashboard should allow managing users, courses, and analytics.
Email notifications should be sent for enrollment, assignment deadlines, and grades.`

export default function SRSAgent() {
  const [form, setForm] = useState({ document_text: '', project_name: '' })
  const [loading, setLoading] = useState(false)
  const [activeStep, setActiveStep] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('full')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.document_text.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    setActiveStep(0)

    const stepTimer = setInterval(() => {
      setActiveStep((s) => (s < STEPS.length - 1 ? s + 1 : s))
    }, 3000)

    await callAgentStream('/srs', form, {
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
              <Settings size={16} color="var(--color-srs)" />
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)' }}>Parameters</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Project Identifier</label>
                <input
                  className="form-input"
                  style={{ background: 'var(--bg-input)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '10px 14px', color: 'var(--text-primary)', width: '100%', fontSize: '13px', outline: 'none', fontFamily: 'inherit', transition: 'var(--transition-smooth)' }}
                  placeholder="e.g. NextGen Core Architecture"
                  value={form.project_name}
                  onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: 32 }}>
                <label className="form-label"><Hash size={14} /> Source Documentation</label>
                <textarea
                  className="form-textarea"
                  placeholder="Paste raw requirements or meeting notes here..."
                  value={form.document_text}
                  onChange={(e) => setForm({ ...form, document_text: e.target.value })}
                  required
                  style={{ minHeight: 280, fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? 'Extracting...' : 'Parse Requirements'}
                  {!loading && <ArrowRight size={16} />}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setForm({ document_text: EXAMPLE_DOC, project_name: 'Online LMS' })}
                  disabled={loading}
                >
                  Load Example
                </button>
              </div>
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
                  <ClipboardCheck size={32} opacity={0.2} />
                </div>
                <h3 style={{ fontSize: 16, marginBottom: 8 }}>Workspace Ready</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Supply source documentation to begin multi-stage classification.</p>
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
                <LoadingSpinner steps={STEPS} activeStep={activeStep} label="Semantic Mapping Engine Active" />
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
                    { key: 'full', label: 'Specification', icon: <BookOpen size={13} /> },
                    { key: 'functional', label: 'Functional', icon: <CheckCircle2 size={13} /> },
                    { key: 'nonfunctional', label: 'Structural', icon: <Settings2 size={13} /> },
                    { key: 'summary', label: 'Summary', icon: <BarChart size={13} /> },
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
                      <div className="markdown-body">
                        {activeTab === 'full' && (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.formatted_output}</ReactMarkdown>
                        )}
                        {activeTab === 'functional' && (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.functional_requirements}</ReactMarkdown>
                        )}
                        {activeTab === 'nonfunctional' && (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.non_functional_requirements}</ReactMarkdown>
                        )}
                        {activeTab === 'summary' && (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.document_summary}</ReactMarkdown>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <button
                  className="btn btn-secondary"
                  style={{ width: '100%' }}
                  onClick={() => {
                    const blob = new Blob([result.formatted_output], { type: 'text/markdown' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${form.project_name || 'SRS'}_Requirements.md`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                >
                  <Download size={14} /> Export Specification
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
