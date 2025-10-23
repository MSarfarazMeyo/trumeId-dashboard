import React, { useEffect, useState } from "react";

import {
  Spin,
  Card,
  Row,
  Col,
  Tag,
  Descriptions,
  Badge,
  Divider,
  Typography,
  Space,
  Button,
  Collapse,
  Progress,
  List,
  Alert,
} from "antd";
import {
  FileTextOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  FlagOutlined,
  CalculatorOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import ImageGallery from "./ImageGallery";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const RiskEvaluationDetails = ({ result }) => {
  const data = result.rawResponse;
  if (!data) return null;

  // Check if there's an error in the response
  if (data.error && data.message) {
    const formatErrorMessage = (errorData) => {
      if (errorData.detail && Array.isArray(errorData.detail)) {
        return errorData.detail.map((error, index) => (
          <div key={index} style={{ marginBottom: "8px" }}>
            <Text strong>Field: </Text>
            <Text code>{error.loc?.join(" → ") || "Unknown field"}</Text>
            <br />
            <Text strong>Error: </Text>
            <Text>{error.msg}</Text>
            {error.input && (
              <>
                <br />
                <Text strong>Input: </Text>
                <Text code>
                  {typeof error.input === "object"
                    ? JSON.stringify(error.input)
                    : error.input}
                </Text>
              </>
            )}
            {error.ctx?.pattern && (
              <>
                <br />
                <Text strong>Expected Pattern: </Text>
                <Text code>{error.ctx.pattern}</Text>
              </>
            )}
          </div>
        ));
      }
      return (
        <Text>
          {typeof errorData === "string"
            ? errorData
            : JSON.stringify(errorData)}
        </Text>
      );
    };

    return (
      <Space direction="vertical" size="middle" className="w-full">
        <Card size="small">
          <Alert
            message="Risk Evaluation Failed"
            description={
              <div>
                <Text strong>Status Code: {data.statusCode}</Text>
                <Divider />
                <div>
                  <Text strong>Error Details:</Text>
                  <div style={{ marginTop: "12px" }}>
                    {formatErrorMessage(data.message)}
                  </div>
                </div>
              </div>
            }
            type="error"
            icon={<CloseCircleOutlined />}
            showIcon
          />
        </Card>

        <Card size="small" title="Assessment Information">
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Assessment Date">
              {dayjs(result.createdAt).format("MMMM DD, YYYY HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="red" icon={<CloseCircleOutlined />}>
                FAILED
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Error Type">
              <Text>Validation Error</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    );
  }

  // Helper function to get risk color
  const getRiskColor = (risk) => {
    switch (risk?.toUpperCase()) {
      case "LOW":
        return "green";
      case "MEDIUM":
        return "orange";
      case "HIGH":
        return "red";
      default:
        return "gray";
    }
  };

  // Helper function to get outcome color
  const getOutcomeColor = (outcome) => {
    switch (outcome?.toUpperCase()) {
      case "APPROVE":
        return "green";
      case "REVIEW":
        return "orange";
      case "REJECT":
        return "red";
      default:
        return "gray";
    }
  };

  // Calculate percentage for visual display (cap at 100 for progress bar)
  const displayPercentage = Math.min(data.score, 100);

  // Determine risk level color for progress bar
  const getProgressColor = (score) => {
    if (score <= 34) return "#52c41a"; // Green
    if (score <= 64) return "#faad14"; // Orange
    return "#f5222d"; // Red
  };

  return (
    <Space direction="vertical" size="middle" className="w-full">
      <Card size="small" title="Risk Assessment Overview">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div className="text-center mb-4">
              <div className="mb-2">
                <Text strong style={{ fontSize: "18px" }}>
                  Risk Score: {data.score} Points
                </Text>
              </div>
              <Progress
                type="circle"
                percent={displayPercentage}
                format={() => `${data.score}`}
                strokeColor={getProgressColor(data.score)}
                size={120}
              />
              <div className="mt-2">
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {data.score > 100
                    ? "Score exceeds 100 points"
                    : "Risk Points"}
                </Text>
              </div>
            </div>
          </Col>

          <Col span={12}>
            <div className="text-center">
              <Text strong>Risk Level</Text>
              <div className="mt-1">
                <Tag
                  color={getRiskColor(data.risk)}
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  <FileTextOutlined className="mr-1" />
                  {data.risk?.toUpperCase()}
                </Tag>
              </div>
              <div className="mt-1">
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  {data.risk?.toUpperCase() === "LOW" && "0-34 points"}
                  {data.risk?.toUpperCase() === "MEDIUM" && "35-64 points"}
                  {data.risk?.toUpperCase() === "HIGH" && "65+ points"}
                </Text>
              </div>
            </div>
          </Col>

          <Col span={12}>
            <div className="text-center">
              <Text strong>Recommended Action</Text>
              <div className="mt-1">
                <Tag
                  color={getOutcomeColor(data.outcome)}
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  {data.outcome === "APPROVE" && (
                    <CheckCircleOutlined className="mr-1" />
                  )}
                  {data.outcome === "REVIEW" && (
                    <ExclamationCircleOutlined className="mr-1" />
                  )}
                  {data.outcome === "REJECT" && (
                    <WarningOutlined className="mr-1" />
                  )}
                  {data.outcome?.toUpperCase()}
                </Tag>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Risk Scoring Breakdown */}
      <Card
        size="small"
        title={
          <span>
            <CalculatorOutlined className="mr-2" />
            Risk Scoring Breakdown
          </span>
        }
      >
        <div className="mb-3">
          <Text strong>How Risk Score is Calculated:</Text>
        </div>
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text type="secondary">• Email Domain (Disposable): +25 pts</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">• Phone Reuse (1 user): +40 pts</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">• Biometric Hash Reuse: +50 pts</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">• IP Risk (VPN/Proxy): +30 pts</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">• IP ≠ ID Country: +15 pts</Text>
          </Col>
          <Col span={12}>
            <Text type="secondary">• Phone Area Mismatch: +15 pts</Text>
          </Col>
          <Col span={24}>
            <Text type="secondary">• Geolocation Risk: +25 pts</Text>
          </Col>
        </Row>
      </Card>

      {data.flags && data.flags.length > 0 && (
        <Card
          size="small"
          title={
            <span>
              <FlagOutlined className="mr-2" />
              Detected Risk Flags ({data.flags.length})
            </span>
          }
        >
          <List
            size="small"
            dataSource={data.flags}
            renderItem={(flag, index) => (
              <List.Item>
                <div className="flex items-center gap-2">
                  <Badge status="warning" />
                  <Text>{flag}</Text>
                </div>
              </List.Item>
            )}
          />
        </Card>
      )}

      <Card size="small" title="Assessment Summary">
        <Descriptions size="small" column={1}>
          <Descriptions.Item label="Assessment Date">
            {dayjs(result.createdAt).format("MMMM DD, YYYY HH:mm:ss")}
          </Descriptions.Item>
          <Descriptions.Item label="Total Risk Points">
            <Space>
              <Text
                strong
                style={{
                  fontSize: "16px",
                  color: getProgressColor(data.score),
                }}
              >
                {data.score} points
              </Text>
              <Progress
                percent={displayPercentage}
                size="small"
                style={{ width: 150 }}
                strokeColor={getProgressColor(data.score)}
                showInfo={false}
              />
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Risk Classification">
            <Space>
              <Tag color={getRiskColor(data.risk)} style={{ fontSize: "13px" }}>
                {data.risk?.toUpperCase()}
              </Tag>
              <Text type="secondary">
                ({data.risk?.toUpperCase() === "LOW" && "0-34 points"}) (
                {data.risk?.toUpperCase() === "MEDIUM" && "35-64 points"}) (
                {data.risk?.toUpperCase() === "HIGH" && "65+ points"})
              </Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="System Recommendation">
            <Tag
              color={getOutcomeColor(data.outcome)}
              style={{ fontSize: "13px" }}
            >
              {data.outcome?.toUpperCase()}
            </Tag>
          </Descriptions.Item>
          {data.flags && data.flags.length > 0 && (
            <Descriptions.Item label="Risk Flags Detected">
              <Badge
                count={data.flags.length}
                style={{ backgroundColor: "#faad14" }}
              />
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </Space>
  );
};

export default RiskEvaluationDetails;
