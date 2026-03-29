import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Loader2, Sparkles, AlertCircle } from 'lucide-react'

export default function LoadingSpinner({ 
  steps = [], 
  activeStep = 0, 
  label = 'Agent is working…',
  error = null 
}) {
  return (
    <div className="loading-wrapper" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100%',
      minHeight: 400,
      textAlign: 'center',
      padding: '40px'
    }}>
      {/* Neural Core Animation */}
      <div style={{ position: 'relative', width: 80, height: 80, marginBottom: 32 }}>
        <AnimatePresence>
          {!error && (
            <>
              <motion.div
                key="pulse-1"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '2px solid var(--primary)',
                  boxShadow: '0 0 20px var(--primary-glow)',
                }}
                animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                key="pulse-2"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: '1px solid var(--primary)',
                }}
                animate={{ scale: [1, 1.1], opacity: [1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
              <motion.div
                key="core"
                style={{
                  position: 'absolute',
                  inset: '25%',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px var(--primary-glow)',
                }}
                animate={{ scale: [0.95, 1.05] }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
              >
                <Sparkles size={20} color="white" />
              </motion.div>
            </>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '2px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(239, 68, 68, 0.2)',
              }}
            >
              <AlertCircle size={32} color="#ef4444" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ maxWidth: 320 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
          {error ? 'Process Halted' : label}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 32 }}>
          {error || 'The neural engine is synthesizing your request across multiple specialized layers.'}
        </p>

        {steps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
            {steps.map((step, i) => {
              const isActive = i === activeStep
              const isDone = i < activeStep
              
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12, 
                    color: isActive ? 'var(--text-primary)' : isDone ? 'var(--text-dim)' : 'rgba(255,255,255,0.1)',
                    transition: 'color 0.3s ease'
                  }}
                >
                  <div style={{ flexShrink: 0, display: 'flex' }}>
                    {isDone ? (
                      <CheckCircle2 size={16} color="var(--primary)" />
                    ) : isActive ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                        <Loader2 size={16} color="var(--primary)" />
                      </motion.div>
                    ) : (
                      <Circle size={16} />
                    )}
                  </div>
                  <span style={{ 
                    fontSize: 12, 
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: isActive ? '0.2px' : '0'
                  }}>
                    {step}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
