import { Routes, Route } from 'react-router-dom'
import Layout from '@/shared/components/Layout'
import HomePage from '@/features/escape-rooms/components/HomePage'
import PlannerPage from '@/features/route-planning/components/PlannerPage'
import PlansPage from '@/features/plans/components/PlansPage'
import { PlannerDemo } from '@/features/route-planning/components/PlannerDemo'
import { ErrorBoundary } from '@/shared/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/planner-demo" element={<PlannerDemo />} />
          <Route path="/plans" element={<PlansPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  )
}

export default App