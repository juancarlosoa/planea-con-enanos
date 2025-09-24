import { Routes, Route } from "react-router-dom";
import Layout from "@/shared/components/Layout";
import HomePage from "@/features/escape-rooms/components/HomePage";
import PlansPage from "@/features/plans/components/PlansPage";
import { PlannerDemo } from "@/features/route-planning/components/PlannerDemo";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import NewPlannerPage from "@/features/plans/components/NewPlannerPage";

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/planner" element={<NewPlannerPage />} />
          <Route path="/planner-demo" element={<PlannerDemo />} />
          <Route path="/plans" element={<PlansPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
