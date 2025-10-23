// pages/admin/ClientManagement.jsx
import React from "react";
import { Card, Row, Col, Statistic, Table, Tag, Spin, Alert } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAdminDashboardStatistics } from "../../hooks/useDashboardStats";
import { colors } from "../../constants/brandConfig";

const Home = () => {
  const { data, isLoading, error } = useAdminDashboardStatistics();

  if (isLoading) {
    return (
      <div className="p-16 bg-gray-50 min-h-screen flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-16 bg-gray-50 min-h-screen">
        <Alert
          message="Error"
          description="Failed to load dashboard statistics"
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Columns for the recent clients table
  const recentClientsColumns = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <div>
          <div className="font-medium">{`${record.firstName} ${record.lastName}`}</div>
          <div className="text-gray-500 text-sm">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Company",
      dataIndex: "companyName",
      key: "companyName",
      render: (companyName) => companyName || "N/A",
    },
    {
      title: "Plan",
      dataIndex: "planName",
      key: "planName",
      render: (planName) => <Tag color="blue">{planName}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
  ];

  // Columns for the clients by plan table
  const clientsByPlanColumns = [
    {
      title: "Plan Name",
      dataIndex: "planName",
      key: "planName",
      render: (planName) => <div className="font-medium">{planName}</div>,
    },
    {
      title: "Total Clients",
      dataIndex: "clientCount",
      key: "clientCount",
      render: (count) => <div className="text-center">{count}</div>,
    },
    {
      title: "Active Clients",
      dataIndex: "activeClientCount",
      key: "activeClientCount",
      render: (count) => (
        <div className="text-center text-green-600 font-medium">{count}</div>
      ),
    },
    {
      title: "Inactive Clients",
      key: "inactiveClientCount",
      render: (_, record) => (
        <div className="text-center text-red-600 font-medium">
          {record.clientCount - record.activeClientCount}
        </div>
      ),
    },
  ];

  return (
    <div className="p-16 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600">
            Monitor your client statistics and recent activity
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Clients"
              value={data?.totalClients || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: colors.primaryDark }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Clients"
              value={data?.activeClients || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Inactive Clients"
              value={data?.inactiveClients || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Plans"
              value={data?.totalPlans || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Data Tables */}
      <Row gutter={16}>
        {/* Clients by Plan */}
        <Col xs={24} lg={12} className="mb-4">
          <Card
            title="Clients by Plan"
            className="h-full"
            extra={<UserOutlined />}
          >
            <Table
              dataSource={data?.clientsByPlan || []}
              columns={clientsByPlanColumns}
              rowKey="planId"
              pagination={false}
              size="small"
              scroll={{ x: true }}
            />
          </Card>
        </Col>

        {/* Recent Clients */}
        <Col xs={24} lg={12} className="mb-4">
          <Card
            title="Recent Clients"
            className="h-full"
            extra={<TeamOutlined />}
          >
            <Table
              dataSource={data?.recentClients || []}
              columns={recentClientsColumns}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: true }}
            />
          </Card>
        </Col>
      </Row>

      {/* Plan Distribution Summary */}
      {data?.clientsByPlan && data.clientsByPlan.length > 0 && (
        <Row gutter={16} className="mt-4">
          <Col span={24}>
            <Card title="Plan Distribution Summary">
              <Row gutter={16}>
                {data.clientsByPlan.map((plan) => (
                  <Col
                    xs={24}
                    sm={12}
                    md={8}
                    lg={6}
                    key={plan.planId}
                    className="mb-4"
                  >
                    <Card size="small" className="text-center">
                      <Statistic
                        title={plan.planName}
                        value={plan.clientCount}
                        suffix={`/ ${data.totalClients}`}
                        valueStyle={{
                          color:
                            plan.activeClientCount === plan.clientCount
                              ? "#52c41a"
                              : "#faad14",
                        }}
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        {plan.activeClientCount} active
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Home;
