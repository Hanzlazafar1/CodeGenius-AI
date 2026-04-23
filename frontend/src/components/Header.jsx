import { Cpu, Zap, Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header({ title, subtitle, toggleSidebar }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="header">
      <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle Menu">
        <Menu size={20} />
      </button>
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

        {/* Theme Toggle Button */}
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'dark' ? (
              <motion.span
                key="sun"
                className="theme-toggle-icon"
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              >
                <Sun size={15} />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                className="theme-toggle-icon"
                initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              >
                <Moon size={15} />
              </motion.span>
            )}
          </AnimatePresence>
          <span className="theme-toggle-label">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>
    </header>
  )
}
