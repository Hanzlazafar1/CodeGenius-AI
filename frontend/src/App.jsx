import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Home from './pages/Home'
import AlgorithmAgent from './pages/AlgorithmAgent'
import CodeExplainAgent from './pages/CodeExplainAgent'
import BugAnalysisAgent from './pages/BugAnalysisAgent'
import SRSAgent from './pages/SRSAgent'

const ROUTES = [
  { path: '/', element: <Home />, title: 'Autonomous Dev Layer', subtitle: 'Real-time software synthesis and structural audit' },
  { path: '/algorithm', element: <AlgorithmAgent />, title: 'Algorithm Engineering', subtitle: 'High-performance logic synthesis & complexity audit' },
  { path: '/code-explain', element: <CodeExplainAgent />, title: 'Cognitive Explainer', subtitle: 'Structural deconstruction & semantic analysis' },
  { path: '/bug-analysis', element: <BugAnalysisAgent />, title: 'Diagnostic Neural', subtitle: 'Root cause classification & corrective synthesis' },
  { path: '/srs', element: <SRSAgent />, title: 'Requirement Parser', subtitle: 'Functional extraction & specification mapping' },
]

export { ROUTES }

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {ROUTES.map(({ path, element, title, subtitle }) => (
          <Route
            key={path}
            path={path}
            element={
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <Header title={title} subtitle={subtitle} />
                <div className="page-body">{element}</div>
              </motion.div>
            }
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <div className="mesh-bg" />
        <Sidebar />
        <main className="main-content">
          <AnimatedRoutes />
        </main>
      </div>
    </BrowserRouter>
  )
}
