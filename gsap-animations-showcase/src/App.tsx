import { Suspense, lazy } from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ThemeProvider } from '@/components/ThemeProvider'
import { animations } from '@/animations/registry'

const Home = lazy(() => import('@/pages/Home'))
const Animations = lazy(() => import('@/pages/Animations'))
const About = lazy(() => import('@/pages/About'))
const NotFound = lazy(() => import('@/pages/NotFound'))

function PageFallback() {
  return (
    <div className="container flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/animations" element={<Animations />} />
              <Route path="/about" element={<About />} />
              {animations.map(({ slug, Component }) => (
                <Route
                  key={slug}
                  path={`/animations/${slug}`}
                  element={<Component />}
                />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  )
}
