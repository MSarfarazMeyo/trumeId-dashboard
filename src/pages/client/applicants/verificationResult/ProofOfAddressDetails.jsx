import React, { useEffect, useState } from "react";

import {
  Spin,
  Card,
  Row,
  Col,
  Tag,
  Descriptions,
  Badge,
  Typography,
  Space,
  Button,
  Collapse,
  List,
} from "antd";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  PictureOutlined,
  DownloadOutlined,
  WarningOutlined,
  CalendarOutlined,
  UserAddOutlined,
  UserSwitchOutlined,
  EnvironmentOutlined,
  BankOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ProofOfAddressDetails = ({ result }) => {
  const data = result.rawResponse;
  if (!data) return null;

  const getValidationStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "accepted":
        return "success";
      case "rejected":
      case "failed":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Space direction="vertical" size="middle" className="w-full">
      {/* Validation Status Overview */}
      <Card size="small" title="Proof of Address Validation Status">
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <div className="text-center">
              <Text strong>Validation Status</Text>
              <div className="mt-1">
                <Tag
                  color={getValidationStatusColor(data.Status)}
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  <span className="ml-1">{data.Status?.toUpperCase()}</span>
                </Tag>
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="text-center">
              <Text strong>Provider</Text>
              <div className="mt-1">
                <Tag
                  color="blue"
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  <BankOutlined className="mr-1" />
                  {data.Provider}
                </Tag>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Account and Bill Information */}
      <Card size="small" title="Bill Information">
        <Descriptions size="small" column={2} bordered>
          <Descriptions.Item label="Account Number">
            <Text copyable code>
              {data["Account Number"]}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Bill Issue Date">
            <Space>
              <CalendarOutlined />
              <Text>{data["Bill Issue Date"]}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Bill Holder Name">
            <Space>
              <UserAddOutlined />
              <Text>{data["Bill Holder Name"]}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Applicant Name (DB)">
            <Space>
              <UserSwitchOutlined />
              <Text>{data["Applicant Name from DB"]}</Text>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Service Address" span={2}>
            <Space>
              <EnvironmentOutlined />
              <Text>{data["Service Address"]}</Text>
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Validation Details */}
      {data["Bill Validation"] && (
        <Card size="small" title="Bill Validation Details">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="flex items-center gap-2 mb-3">
                <Text strong>Validation Status: </Text>
                <Tag
                  color={data["Bill Validation"].is_valid ? "success" : "error"}
                  icon={
                    data["Bill Validation"].is_valid ? (
                      <CheckCircleOutlined />
                    ) : (
                      <ExclamationCircleOutlined />
                    )
                  }
                >
                  {data["Bill Validation"].is_valid ? "Valid" : "Invalid"}
                </Tag>
              </div>
            </Col>

            {data["Bill Validation"].errors &&
              data["Bill Validation"].errors.length > 0 && (
                <Col span={24}>
                  <Card size="small" title="Validation Errors" type="inner">
                    <List
                      size="small"
                      dataSource={data["Bill Validation"].errors}
                      renderItem={(error, index) => (
                        <List.Item>
                          <div className="flex items-center gap-2">
                            <ExclamationCircleOutlined
                              style={{ color: "#f5222d" }}
                            />
                            <Text type="danger">{error}</Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              )}

            {data["Bill Validation"].warnings &&
              data["Bill Validation"].warnings.length > 0 && (
                <Col span={24}>
                  <Card size="small" title="Validation Warnings" type="inner">
                    <List
                      size="small"
                      dataSource={data["Bill Validation"].warnings}
                      renderItem={(warning, index) => (
                        <List.Item>
                          <div className="flex items-center gap-2">
                            <WarningOutlined style={{ color: "#faad14" }} />
                            <Text type="warning">{warning}</Text>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              )}
          </Row>
        </Card>
      )}

      {/* Database Validation */}
      {data["DB Validation"] && (
        <Card size="small" title="Database Validation">
          <div className="flex items-center gap-2">
            <Text strong>DB Validation Result: </Text>
            <Tag
              color={
                data["DB Validation"].includes("mismatch") ? "error" : "success"
              }
              icon={
                data["DB Validation"].includes("mismatch") ? (
                  <ExclamationCircleOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
            >
              {data["DB Validation"]}
            </Tag>
          </div>
        </Card>
      )}

      {/* Uploaded Document */}
      {data.uploadResult && (
        <Card size="small" title="Uploaded Document">
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div>
                    <Text strong>
                      {data.uploadResult.key?.split("/").pop() || "Document"}
                    </Text>
                    <br />
                  </div>
                </div>
                <Space>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => window.open(data.uploadResult.url, "_blank")}
                  >
                    View
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() =>
                      handleDownloadImage(
                        data.uploadResult.url,
                        data.uploadResult.key?.split("/").pop() ||
                          "proof-of-address-document"
                      )
                    }
                  >
                    Download
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* System Information */}
      <Card size="small" title="System Information">
        <Descriptions size="small" column={2}>
          <Descriptions.Item label="DynamoDB Saved">
            <Badge
              status={data.Dynamodb_saved ? "success" : "error"}
              text={data.Dynamodb_saved ? "Yes" : "No"}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Processed Date">
            {dayjs(result.createdAt).format("MMMM DD, YYYY HH:mm:ss")}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};

export default ProofOfAddressDetails;
