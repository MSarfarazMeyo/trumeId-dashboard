import React from "react";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import BasicPlan from "../../assets/svg/BasicPlan";
import SimplePlan from "../../assets/svg/SimplePlan";
import KycPlucPlan from "../../assets/svg/KycPlucPlan";

const PlanBreakdown = ({ planData, planBreakdownLegend }) => {
  const customOrder = ["BasicIDV", "SimpleKYC", "KYC+"];

  // Sort the legend items according to the custom order
  const sortedLegend = [...planBreakdownLegend].sort((a, b) => {
    return customOrder.indexOf(a.name) - customOrder.indexOf(b.name);
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={planData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis dataKey="month" />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="BasicIDV"
              stackId="a"
              fill="#ef4444"
              name="Basic IDV"
            />
            <Bar dataKey="KYC+" stackId="a" fill="#8b5cf6" name="KYC+" />
            <Bar
              dataKey="SimpleKYC"
              stackId="a"
              fill="#f59e0b"
              name="Simple KYC"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-3">
        {sortedLegend.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {item.name == "BasicIDV" ? (
                <BasicPlan />
              ) : item.name == "SimpleKYC" ? (
                <SimplePlan />
              ) : (
                <KycPlucPlan />
              )}

              <div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
            </div>
            <div className="font-semibold text-gray-700">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanBreakdown;
