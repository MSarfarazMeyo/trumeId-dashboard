import React from "react";
import { Card, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

const statusColorMap = {
  verified: "#04AA77", // green
  pending: "#FFA800", // yellow
  rejected: "#AA0000", // red
};

const riskColorMap = {
  low: "#04AA77", // green
  medium: "#FFA800", // yellow
  high: "#AA0000", // red
};

const riskLabelMap = {
  low: "Low Risk",
  medium: "Mid Risk",
  high: "High Risk",
};

const RecentActivity = ({ recentActivity }) => {
  const getStatusColor = (status) => statusColorMap[status] || "#9ca3af";
  const getRiskColor = (risk) => riskColorMap[risk] || "#9ca3af";
  const getRiskLabel = (risk) => riskLabelMap[risk] || "low";

  return (
    <div className="h-full flex flex-col">
      <div className="space-y-3">
        {recentActivity?.map((item) => (
          <div key={item.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
            {/* Mobile Layout */}
            <div className="block sm:hidden space-y-3">
              <div className="flex items-center space-x-3 ">
                <Avatar
                  size={36}
                  style={{ backgroundColor: "#f0f0f0", color: "#666" }}
                  src={item?.image}
                  icon={<UserOutlined />}
                >
                  {item?.name}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {item?.name || "NA"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {new Date(item?.createdAt)?.toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    color: getStatusColor(item?.status),
                    backgroundColor: getStatusColor(item?.status) + "20",
                  }}
                >
                  {item?.status}
                </div>
                <div
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    color: getRiskColor(item?.riskStatus),
                    backgroundColor: getRiskColor(item?.riskStatus) + "20",
                  }}
                >
                  {item.riskValue ? `${item.riskValue} ` : ""}
                  {item.riskStatus ? getRiskLabel(item.riskStatus) : "-"}
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:grid grid-cols-12 gap-4 items-center">
              {/* User Section - 4 columns */}
              <div className="col-span-4 flex items-center space-x-4 min-w-0 gap-2">
                <Avatar
                  size={40}
                  style={{ backgroundColor: "#f0f0f0", color: "#666" }}
                  src={item?.image}
                  icon={<UserOutlined />}
                >
                  {item?.name}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {item?.name || "NA"}
                  </div>
                </div>
              </div>

              {/* Date Section - 4 columns */}
              <div className="col-span-4 text-center">
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(item?.createdAt)?.toLocaleDateString()}
                </div>
              </div>

              {/* Status & Risk Section - 4 columns */}
              <div className="col-span-4 flex items-center justify-end space-x-3">
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  style={{
                    color: getStatusColor(item?.status),
                    backgroundColor: getStatusColor(item?.status) + "20",
                    minWidth: "85px",
                    textAlign: "center",
                  }}
                >
                  {item?.status}
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  style={{
                    color: getRiskColor(item?.riskStatus),
                    backgroundColor: getRiskColor(item?.riskStatus) + "20",
                    minWidth: "85px",
                    textAlign: "center",
                  }}
                >
                  {item.riskValue ? `${item.riskValue} ` : ""}
                  {item.riskStatus ? getRiskLabel(item.riskStatus) : "-"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
