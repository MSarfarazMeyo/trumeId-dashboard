import React, { useState } from "react";

const TransactionsUsed = ({ used, limit }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const percentage = (used / limit) * 100;
  const radius = 60;
  const circumference = Math.PI * radius; // Half circle circumference
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleMouseEnter = (event) => {
    setShowTooltip(true);
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - 10,
    });
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const CustomTooltip = () => {
    if (!showTooltip) return null;

    return (
      <div
        className="absolute bg-white p-2 border border-gray-300 rounded shadow-lg z-10 pointer-events-none w-[120px]"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: "translate(-50%, -100%)",
        }}
      >
        <p className="font-medium text-sm">Usage Details</p>
        <p className="text-sm text-gray-600">Used: {used.toLocaleString()}</p>
        <p className="text-sm text-gray-600">Limit: {limit.toLocaleString()}</p>
        <p className="text-sm text-gray-500">
          Percentage: {percentage.toFixed(1)}%
        </p>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <svg
          width="140"
          height="100"
          className="overflow-visible cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Background half circle */}
          <path
            d={`M 10 70 A ${radius} ${radius} 0 0 1 130 70`}
            stroke="#e5e7eb"
            strokeWidth="8"
            fill="none"
          />
          {/* Progress half circle */}
          <path
            d={`M 10 70 A ${radius} ${radius} 0 0 1 130 70`}
            stroke="#4f46e5"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out hover:stroke-blue-600"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center pt-4 pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">
              {used.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Transactions</div>
          </div>
        </div>
        <CustomTooltip />
      </div>
    </div>
  );
};

export default TransactionsUsed;
