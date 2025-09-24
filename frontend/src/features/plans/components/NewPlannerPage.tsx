import React, { useEffect } from "react";
import { useMultiDayPlannerStore } from "@/shared/stores/multiDayPlannerStore";
import MultiDayPlanner from "./MultiDayPlanner";

const NewPlannerPage: React.FC = () => {
  const { clearCurrentPlan } = useMultiDayPlannerStore();

  // Limpiar el plan actual al montar el componente
  useEffect(() => {
    clearCurrentPlan();
  }, [clearCurrentPlan]);

  return <MultiDayPlanner />;
};

export default NewPlannerPage;
