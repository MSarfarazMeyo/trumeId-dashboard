import React, { useContext, useState } from "react";
import {
  Table,
  Button,
  Input,
  Dropdown,
  Pagination,
  Tooltip,
  Card,
  message,
  Tag,
  Progress,
} from "antd";
import {
  SearchOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  EyeOutlined,
  ShareAltOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
} from "@ant-design/icons";
import { useDeleteApplicantMutation } from "../../../hooks/useApplicants";

import { IoPhonePortraitOutline } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaIdCard } from "react-icons/fa";
import { TbUserScan } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { useNavigate, useSearchParams } from "react-router";
import { useDebounce } from "../../../hooks/useDebounce";
import { useFlowsQuery, useUpdateFlow } from "../../../hooks/useFlows";
import appContext from "../../../context/appContext";
import OnboardingFlowModal from "./OnboardingFlowModal";
import FlowDetailModal from "./FlowDetailModal";
import { colors } from "../../../constants/brandConfig";

const verificationOrder = [
  "phone",
  "email",
  "idDocument",
  "selfie",
  "proofOfAddress",
];

const FlowsTable = () => {
  const [searchParams] = useSearchParams();

  // Check if "newApplicant" exists
  const hasNewApplicant = searchParams.has("newFlow");

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [flowDetails, setFlowDetails] = useState(null);

  const [isOnboardingModalOpen, setIsOnboardingModalOpen] =
    useState(hasNewApplicant);
  const { refetchUserProfile } = useContext(appContext);

  const debouncedSearchText = useDebounce(searchText, 300);

  const { data, isLoading, error } = useFlowsQuery({
    page: currentPage,
    searchText: debouncedSearchText,
  });

  const { mutate: updateFlow, isLoading: isLoadingUpdate } = useUpdateFlow();

  const deleteApplicantMutation = useDeleteApplicantMutation();

  const handleTableChange = (pagination, sorter) => {
    setCurrentPage(pagination.current);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "verified":
        return "#00E052";
      case "rejected":
        return "#EA0606";
      case "pending":
        return "#F9D816";
      case "in review":
        return "#8F93AC";
      default:
        return "#F9D816";
    }
  };

  const getVerificationIcons = (verifications) => {
    const icons = [];

    verifications.forEach((verification) => {
      const { verificationType, status } = verification;

      if (verificationType === "phone") {
        icons.push(
          <Tooltip key="phone" title={`Phone: ${status}`}>
            <IoPhonePortraitOutline
              style={{ color: getStatusColor(status), fontSize: 18 }}
            />
          </Tooltip>
        );
      }
      if (verificationType === "email") {
        icons.push(
          <Tooltip key="email" title={`Email: ${status}`}>
            <MdOutlineMailOutline
              style={{ color: getStatusColor(status), fontSize: 18 }}
            />
          </Tooltip>
        );
      }
      if (verificationType === "idDocument") {
        icons.push(
          <Tooltip key="identity" title={`ID Document: ${status}`}>
            <FaIdCard style={{ color: getStatusColor(status), fontSize: 18 }} />
          </Tooltip>
        );
      }
      if (verificationType === "selfie") {
        icons.push(
          <Tooltip key="biometric" title={`Selfie: ${status}`}>
            <TbUserScan
              style={{ color: getStatusColor(status), fontSize: 18 }}
            />
          </Tooltip>
        );
      }
      if (verificationType === "proofOfAddress") {
        icons.push(
          <Tooltip key="location" title={`Proof of Address: ${status}`}>
            <IoLocationOutline
              style={{ color: getStatusColor(status), fontSize: 18 }}
            />
          </Tooltip>
        );
      }
    });

    return icons;
  };

  const handleMenuClick = (key, record) => {
    switch (key) {
      case "view":
        setFlowDetails(record);
        break;

      case "toggle":
        // Toggle the isActive status
        const updatedStatus = { isActive: !record.isActive };

        updateFlow(
          { id: record._id, ...updatedStatus }, // pass variables to hook
          {
            onSuccess: () => {
              message.success(
                `Flow ${updatedStatus.isActive ? "activated" : "deactivated"}`
              );
            },
            onError: (err) => {
              message.error(`Failed to update flow: ${err.message}`);
            },
          }
        );
        break;

      default:
        message.info(`${key} action for ${record.name}`);
    }
  };

  const columns = [
    {
      title: "Flow",
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (_, record) => (
        <div
          className="cursor-pointer text-gray-900 hover:text-blue-900"
          onClick={() => setFlowDetails(record)}
        >
          <div className="flex items-center space-x-3">
            <div>
              <div className="font-medium text-sm">{record.name}</div>
              <div
                className="text-xs text-gray-500 truncate"
                style={{ maxWidth: "200px" }}
              >
                {record.description || "No description"}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Plan",
      dataIndex: "subscriptionPlan",
      key: "subscriptionPlan",
      width: 100,
      render: (subscriptionPlan) => (
        <Tag color="blue">{subscriptionPlan?.name || "N/A"}</Tag>
      ),
    },
    {
      title: "Verification Steps",
      dataIndex: "requiredVerifications",
      key: "requiredVerifications",
      width: 200,
      render: (requiredVerifications) => {
        if (!requiredVerifications || requiredVerifications.length === 0) {
          return <span className="text-gray-400">No verifications</span>;
        }

        const sortedVerifications = requiredVerifications
          .slice()
          .sort((a, b) => {
            return (
              verificationOrder.indexOf(a.verificationType) -
              verificationOrder.indexOf(b.verificationType)
            );
          });

        return (
          <div className="flex space-x-2">
            {getVerificationIcons(sortedVerifications)}
          </div>
        );
      },
    },

    {
      title: "Risk & Sanctions Level",
      dataIndex: "verificationConfig",
      key: "riskSanctionsLevel",
      width: 250,
      render: (verificationConfig) => {
        if (!verificationConfig) {
          return <span className="text-gray-400">N/A</span>;
        }

        const { riskLevel, sanctionsLevel } = verificationConfig;

        return (
          <div className="flex flex-col text-xs">
            <span>Risk: {riskLevel ?? 0}</span>
            <span>Sanctions: {sanctionsLevel ?? 0}</span>
          </div>
        );
      },
    },

    {
      title: "Usage",
      dataIndex: "usage",
      key: "usage",
      width: 220,
      render: (_, record) => {
        const percentage =
          record.maxUses > 0 ? (record.currentUses / record.maxUses) * 100 : 0;
        const isOverLimit = record.currentUses > record.maxUses;

        return (
          <div style={{ paddingRight: "20px" }}>
            <div
              className="text-xs text-[#1677ff] mb-1 cursor-pointer"
              onClick={() => {
                navigate(`/client/users/?flowId=${record._id}`);
              }}
            >
              {record.currentUses} / {record.maxUses} uses
            </div>
            <Progress
              percent={Math.min(percentage, 100).toFixed(0)}
              size="small"
              status={isOverLimit ? "exception" : "normal"}
              strokeColor={isOverLimit ? "#1677ff" : undefined}
            />
          </div>
        );
      },
    },

    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? "green" : "default"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },

    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 160,
      sorter: false,
      render: (_, record) => (
        <span className="text-gray-600 text-xs">
          {new Date(record.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },

    {
      title: "",
      dataIndex: "actions",
      key: "actions",
      width: 50,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "view", label: "View Details", icon: <EyeOutlined /> },

              {
                key: "toggle",
                label: record.isActive ? "Deactivate" : "Activate",
                icon: record.isActive ? (
                  <PauseCircleOutlined />
                ) : (
                  <PlayCircleOutlined />
                ),
              },
            ],
            onClick: ({ key }) => handleMenuClick(key, record),
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <ExclamationCircleOutlined className="text-red-500 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load flows
          </h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  const handleStartVerification = () => {
    setIsOnboardingModalOpen(true);
    refetchUserProfile();
  };

  return (
    <div className="p-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Flows Overview
          </h1>

          <p className="text-gray-600">
            You have total{" "}
            <span className="font-medium text-gray-900">
              {data?.total || 0}
            </span>{" "}
            verification flows.
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <Input
            placeholder="Search flows..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: "250px" }}
            allowClear
            autoFocus
          />

          <Button
            type="primary"
            onClick={handleStartVerification}
            style={{
              background: colors.primaryDark,
              color: "#fff",
              border: "none",
              height: "34px",
              width: "150px",
              borderRadius: "1rem",
            }}
          >
            Create New Flow
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.flows || []}
          rowKey="_id"
          pagination={false}
          className="flows-table"
          loading={isLoading || deleteApplicantMutation.isLoading}
          onChange={handleTableChange}
          size="small"
        />

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 pt-4">
          <Button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>

          <Pagination
            current={currentPage}
            total={data?.total || 0}
            pageSize={10}
            onChange={setCurrentPage}
            showSizeChanger={false}
            showQuickJumper={false}
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} items`
            }
          />

          <Button
            disabled={!data?.flows || data.flows.length < 10}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </Card>

      {isOnboardingModalOpen && (
        <OnboardingFlowModal
          isModalOpen={isOnboardingModalOpen}
          setIsModalOpen={setIsOnboardingModalOpen}
        />
      )}

      {!!flowDetails && (
        <FlowDetailModal
          flowDetails={flowDetails}
          setFlowDetails={setFlowDetails}
        />
      )}
    </div>
  );
};

export default FlowsTable;
