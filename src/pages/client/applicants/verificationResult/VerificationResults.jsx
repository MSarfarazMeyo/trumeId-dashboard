import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Spin,
  Alert,
  Empty,
  Badge,
  Tag,
  Space,
  Collapse,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  FileTextOutlined,
  CameraOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getVerificationResultByIdandType } from "../../../../services/verificationResult";
import SanctionEvaluationDetails from "./SanctionEvaluationDetails";
import IdVerificationDetails from "./IdVerificationDetails";
import ProofOfAddressDetails from "./ProofOfAddressDetails";
import FaceVerificationDetails from "./FaceVerificationDetails";
import RiskEvaluationDetails from "./RiskEvaluationDetails";
import { colors } from "../../../../constants/brandConfig";

const { Panel } = Collapse;

const VerificationResults = ({ applicantId, requiredVerifications = [] }) => {
  const [activeTab, setActiveTab] = useState("");
  const [verificationData, setVerificationData] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  useEffect(() => {
    if (requiredVerifications.length > 0 && !activeTab) {
      setActiveTab(requiredVerifications[0]);
    }
  }, [requiredVerifications, activeTab]);

  const fetchVerificationData = async (verificationType) => {
    if (verificationData[verificationType]) {
      return; // Already loaded
    }

    setLoading((prev) => ({ ...prev, [verificationType]: true }));
    setError((prev) => ({ ...prev, [verificationType]: null }));

    try {
      const data = await getVerificationResultByIdandType(
        applicantId,
        verificationType
      );
      setVerificationData((prev) => ({
        ...prev,
        [verificationType]: data,
      }));
    } catch (err) {
      setError((prev) => ({
        ...prev,
        [verificationType]: "Failed to fetch verification data",
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [verificationType]: false }));
    }
  };

  // Load initial tab data
  useEffect(() => {
    if (activeTab) {
      fetchVerificationData(activeTab);
    }
  }, [activeTab]);

  const getVerificationIcon = (type) => {
    switch (type) {
      case "email":
        return <MailOutlined />;
      case "phone":
        return <PhoneOutlined />;
      case "selfie":
        return <CameraOutlined />;
      case "idDocument":
        return <IdcardOutlined />;
      case "proofOfAddress":
        return <FileTextOutlined />;
      case "riskEvaluation":
        return <FileTextOutlined />;
      case "sanctionEvaluation":
        return <WarningOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const formatVerificationType = (type) => {
    switch (type) {
      case "email":
        return "Email Verification";
      case "phone":
        return "Phone Verification";
      case "selfie":
        return "Face Verification";
      case "idDocument":
        return "ID Verification";
      case "proofOfAddress":
        return "Proof Of Address";
      case "riskEvaluation":
        return "Risk Assessment";
      case "sanctionEvaluation":
        return "Sanction Screening";
      default:
        return type?.charAt(0)?.toUpperCase() + type?.slice(1);
    }
  };

  const renderVerificationContent = () => {
    const currentData = verificationData[activeTab];
    const isLoading = loading[activeTab];
    const currentError = error[activeTab];

    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-64">
          <Spin size="large" />
        </div>
      );
    }

    if (currentError) {
      return (
        <Alert
          message="Error"
          description={currentError}
          type="error"
          showIcon
        />
      );
    }

    if (!currentData || currentData.length === 0) {
      return (
        <Empty
          description="No verification results found for this type"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <Space direction="vertical" size="middle" className="w-full">
        <Card
          key={currentData._id}
          size="small"
          title={
            <div className="flex items-center justify-between">
              <span>
                {formatVerificationType(currentData.verificationType)} Results
              </span>
              <Space>
                <Tag size="small">
                  {dayjs(currentData.createdAt).format("MMM DD, YYYY HH:mm")}
                </Tag>
                {currentData.imagesUrls &&
                  currentData.imagesUrls.length > 0 && (
                    <Badge
                      count={currentData.imagesUrls.length}
                      size="small"
                      style={{ backgroundColor: colors.primaryDark }}
                    />
                  )}
              </Space>
            </div>
          }
        >
          {currentData.verificationType === "riskEvaluation" && (
            <RiskEvaluationDetails result={currentData} />
          )}
          {currentData.verificationType === "selfie" && (
            <FaceVerificationDetails result={currentData} />
          )}
          {currentData.verificationType === "idDocument" && (
            <IdVerificationDetails result={currentData} />
          )}
          {currentData.verificationType === "sanctionEvaluation" && (
            <SanctionEvaluationDetails result={currentData} />
          )}
          {currentData.verificationType === "proofOfAddress" && (
            <ProofOfAddressDetails result={currentData} />
          )}

          <div className="mt-4">
            <Collapse size="small">
              <Panel header="View Raw Response" key="raw">
                <pre className="bg-gray-50 p-4 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(currentData.rawResponse, null, 2)}
                </pre>
              </Panel>
            </Collapse>
          </div>
        </Card>
      </Space>
    );
  };

  // Generate tab items
  const tabItems = requiredVerifications.map((verificationType) => {
    return {
      key: verificationType,
      label: (
        <Space>
          {getVerificationIcon(verificationType)}
          <span>{formatVerificationType(verificationType)}</span>
          {loading[verificationType] && <Spin size="small" />}
        </Space>
      ),
      content: renderVerificationContent(verificationType),
    };
  });

  if (requiredVerifications.length === 0) {
    return (
      <Card>
        <Empty
          description="No verification requirements found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <div className="custom-tabs-container">
      {/* Tab Headers */}
      <div className="custom-tabs-header flex justify-between">
        {tabItems.map((tab) => (
          <button
            key={tab.key}
            className={`custom-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="custom-tabs-content">
        {tabItems.find((tab) => tab.key === activeTab)?.content}
      </div>
    </div>
  );
};

export default VerificationResults;
