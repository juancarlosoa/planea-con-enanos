import React, { useState } from "react";
import { Button, Card } from "@/shared/components";
import { Calendar } from "lucide-react";

interface NewPlanFormProps {
  onCreatePlan: (
    name: string,
    description: string,
    startDate: string,
    endDate: string
  ) => void;
}

const NewPlanForm: React.FC<NewPlanFormProps> = ({ onCreatePlan }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;
    onCreatePlan(name, description, startDate, endDate);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <div className="text-center mb-6">
        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Crear Plan Multi-día
        </h3>
        <p className="text-gray-600 max-w-md">
          Planifica tu aventura de escape rooms a lo largo de varios días.
          Organiza rutas optimizadas para cada día de tu viaje.
        </p>
      </div>

      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nombre del Plan*
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Fin de semana de escape rooms"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder="Describe brevemente tu plan..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de inicio*
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (!endDate || endDate < e.target.value) {
                    setEndDate(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Fecha de fin*
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                min={startDate || new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" size="lg">
              Comenzar Planificación
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default NewPlanForm;
