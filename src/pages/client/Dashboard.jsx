import React, { useContext, useState } from "react";
import {
  Card,
  Row,
  Col,
  Progress,
  Statistic,
  Badge,
  Spin,
  Alert,
  Button,
  Modal,
} from "antd";

import { useDashboardStats } from "../../hooks/useDashboardStats";
import TotalVerifications from "../../assets/svg/TotalVerifications";
import ApprovedVerifications from "../../assets/svg/ApprovedVerifications";
import PendingVerifications from "../../assets/svg/PendingVerifications";
import RejectedVerifications from "../../assets/svg/RejectedVerifications";
import TransactionsUsed from "../../components/dashboard/TransactionsUsed";
import PlanBreakdown from "../../components/dashboard/PlanBreakdown";
import VerificationStatistics from "../../components/dashboard/VerificationStatistics";
import RecentActivity from "../../components/dashboard/RecentActivity";
import PromotionalCard from "../../components/dashboard/PromotionalCard";
import appContext from "../../context/appContext";
import { useNavigate } from "react-router";
import { colors } from "../../constants/brandConfig";

const Dashboard = () => {
  const { data: stats, isLoading, error } = useDashboardStats();
  const navigate = useNavigate();

  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const { refetchUserProfile } = useContext(appContext);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error loading dashboard"
        description={error.message || "Failed to load dashboard statistics"}
        type="error"
        showIcon
        className="m-4"
      />
    );
  }

  const {
    totalVerifications = 0,
    approvedVerifications = 0,
    pendingVerifications = 0,
    rejectedVerifications = 0,
    transactionsUsed = 0,
    transactionLimit = 15000,
    monthlyGrowth = {},
    recentApplicants = [],
    planBreakdownStats,
  } = stats || {};

  const verificationData = [
    { name: "Pending", value: pendingVerifications, color: "#4f46e5" },
    { name: "Rejected", value: rejectedVerifications, color: "#ef4444" },
    { name: "Approved", value: approvedVerifications, color: "#10b981" },
    { name: "Total", value: totalVerifications, color: "#f59e0b" },
  ];

  const handleStartVerification = () => {
    setIsChoiceModalOpen(true);
    refetchUserProfile();
  };

  const handleChoice = (choice) => {
    setIsChoiceModalOpen(false);
    if (choice === "manual") {
      navigate(`/client/users/?newApplicant`);
    } else if (choice === "onboarding") {
      navigate(`/client/flows/?newFlow`);
    }
  };

  return (
    <div className="p-16 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Overview</h1>
          <p className="text-gray-600">
            Monitor your verification statistics and transaction usage
          </p>
        </div>

        <Button
          type="primary"
          onClick={handleStartVerification}
          style={{
            background: colors.primaryDark,
            border: "none",
            height: "48px",
            width: "193px",
            borderRadius: "1rem",
            color: "#fff",
          }}
        >
          Start Verification
        </Button>

        {/* Choice Modal */}
        <Modal
          visible={isChoiceModalOpen}
          title="Start Verification"
          onCancel={() => setIsChoiceModalOpen(false)}
          footer={null}
        >
          <div className="flex flex-col gap-4">
            <Button type="default" onClick={() => handleChoice("manual")}>
              New Applicant (Manual)
            </Button>
            <Button
              type="primary"
              style={{ background: "#1677ff" }}
              onClick={() => handleChoice("onboarding")}
            >
              New Onboarding Flow
            </Button>
          </div>
        </Modal>
      </div>

      <div className="flex flex-wrap gap-6 mb-8 justify-between">
        {/* Total Verifications Card */}
        <Card
          className="min-w-[182px] flex-1 min-h-[236px] border-l-4 border-l-orange-400 shadow-sm hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "24px", height: "100%" }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <TotalVerifications />
            </div>
            <span className="text-gray-600 text-sm font-medium mb-2">
              Total Verifications
            </span>
            <div className="text-3xl font-bold text-gray-800 mb-4 flex-grow flex items-center">
              {totalVerifications.toLocaleString()}
            </div>
            <div className="flex items-center mt-auto">
              <span
                className={`text-sm ${
                  monthlyGrowth.total >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {monthlyGrowth.total >= 0 ? "+" : ""}
                {monthlyGrowth.total}%
              </span>
              <span className="text-gray-500 text-sm ml-2">This Month</span>
            </div>
          </div>
        </Card>

        {/* Approved Verifications Card */}
        <Card
          className="min-w-[182px] flex-1 min-h-[236px] border-l-4 border-l-green-400 shadow-sm hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "24px", height: "100%" }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <ApprovedVerifications />
            </div>
            <span className="text-gray-600 text-sm font-medium mb-2">
              Approved Verifications
            </span>
            <div className="text-3xl font-bold text-gray-800 mb-4 flex-grow flex items-center">
              {approvedVerifications.toLocaleString()}
            </div>
            <div className="flex items-center mt-auto">
              <span
                className={`text-sm ${
                  monthlyGrowth.approved >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {monthlyGrowth.approved >= 0 ? "+" : ""}
                {monthlyGrowth.approved}%
              </span>
              <span className="text-gray-500 text-sm ml-2">This Month</span>
            </div>
          </div>
        </Card>

        {/* Pending Verifications Card */}
        <Card
          className="min-w-[182px] flex-1 min-h-[236px] border-l-4 border-l-blue-400 shadow-sm hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "24px", height: "100%" }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <PendingVerifications />
            </div>
            <span className="text-gray-600 text-sm font-medium mb-2">
              Pending Verifications
            </span>
            <div className="text-3xl font-bold text-gray-800 mb-4 flex-grow flex items-center">
              {pendingVerifications.toLocaleString()}
            </div>
            <div className="flex items-center mt-auto">
              <span
                className={`text-sm ${
                  monthlyGrowth.pending >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {monthlyGrowth.pending >= 0 ? "+" : ""}
                {monthlyGrowth.pending}%
              </span>
              <span className="text-gray-500 text-sm ml-2">This Month</span>
            </div>
          </div>
        </Card>

        {/* Rejected Verifications Card */}
        <Card
          className="min-w-[182px] flex-1 min-h-[236px] border-l-4 border-l-red-400 shadow-sm hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "24px", height: "100%" }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center mb-4">
              <RejectedVerifications />
            </div>
            <span className="text-gray-600 text-sm font-medium mb-2">
              Rejected Verifications
            </span>
            <div className="text-3xl font-bold text-gray-800 mb-4 flex-grow flex items-center">
              {rejectedVerifications.toLocaleString()}
            </div>
            <div className="flex items-center mt-auto">
              <span
                className={`text-sm ${
                  monthlyGrowth.rejected >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {monthlyGrowth.rejected >= 0 ? "+" : ""}
                {monthlyGrowth.rejected}%
              </span>
              <span className="text-gray-500 text-sm ml-2">This Month</span>
            </div>
          </div>
        </Card>

        {/* Transactions Used Card */}
        <Card
          className="max-w-[384px] flex-[1.5] min-h-[236px] border-l-4 border-l-indigo-400 shadow-sm hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "24px", height: "100%" }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Transactions Used
              </h3>
            </div>
            <div className="flex-grow flex items-center justify-center">
              <TransactionsUsed
                used={transactionsUsed}
                limit={transactionLimit}
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-6 mb-8 justify-between">
        <Card
          className="min-w-[275px] flex-1 min-h-[371px] border-l-4 border-l-indigo-400 shadow-sm hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "24px", height: "100%" }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-backgroundInput">
                Verification Statistics{" "}
              </h3>
            </div>
            <div className="flex-grow">
              <VerificationStatistics verificationData={verificationData} />
            </div>
          </div>
        </Card>

        <Card
          className="min-w-[275px] flex-1 min-h-[371px] border-l-4 border-l-indigo-400 shadow-sm hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "24px", height: "100%" }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Plan Breakdown{" "}
              </h3>
            </div>
            <div className="flex-grow">
              <PlanBreakdown
                planBreakdownLegend={planBreakdownStats?.legend || []}
                planData={planBreakdownStats?.monthlyProgress || []}
              />
            </div>
          </div>
        </Card>

        <Card
          className="min-w-[517px] flex-2 min-h-[371px] border-l-4 border-l-indigo-400 shadow-sm hover:shadow-md transition-shadow"
          bodyStyle={{ padding: "24px", height: "100%" }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Verifications{" "}
              </h3>
            </div>
            <div className="flex-grow">
              <RecentActivity recentActivity={recentApplicants} />
            </div>
          </div>
        </Card>
      </div>

      <PromotionalCard />
    </div>
  );
};

export default Dashboard;
