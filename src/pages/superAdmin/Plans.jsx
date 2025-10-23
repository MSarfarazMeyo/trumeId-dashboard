import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Checkbox,
  Tooltip,
  Typography,
  Divider,
  Badge,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  AccountBookFilled,
  SecurityScanOutlined,
} from "@ant-design/icons";
import { fetchSubscriptionPlans } from "../../services/adminServices";
import { colors } from "../../constants/brandConfig";

const { Option } = Select;
const { Title, Text } = Typography;

const availableModules = [
  { value: "phone", label: "Phone Verification", icon: "📱" },
  { value: "email", label: "Email Verification", icon: "📧" },
  { value: "idDocument", label: "ID Document", icon: "🆔" },
  { value: "selfie", label: "Selfie Verification", icon: "🤳" },
  { value: "proofOfAddress", label: "Proof of Address", icon: "🏠" },
];

const riskLevelLabels = {
  0: { label: "Off", color: "default" },
  1: { label: "Level 1", color: "blue" },
  2: { label: "Level 2", color: "orange" },
};

const sanctionsLevelLabels = {
  0: { label: "Off", color: "default" },
  1: { label: "Level 1", color: "blue" },
  2: { label: "Level 2", color: "orange" },
};

const PlansManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [moduleValues, setModuleValues] = useState([]);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // create, edit, view
  const [currentPlan, setCurrentPlan] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await fetchSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      message.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const onChange = (checkedValues) => {
    setModuleValues(checkedValues);
  };

  // Statistics
  const totalPlans = plans.length;
  const activePlans = plans.filter(
    (plan) => plan.intakeModules.length > 0
  ).length;
  const avgModulesPerPlan =
    plans.length > 0
      ? (
          plans.reduce((sum, plan) => sum + plan.intakeModules.length, 0) /
          plans.length
        ).toFixed(1)
      : 0;

  // Handle plan operations
  const handleCreatePlan = () => {
    setModalMode("create");
    setCurrentPlan(null);
    form.resetFields();
    setModuleValues([]);
    setIsModalVisible(true);
  };

  const handleEditPlan = (plan) => {
    setModalMode("edit");
    setCurrentPlan(plan);
    form.setFieldsValue({
      name: plan.name,
      riskLevel: plan.defaults.riskLevel,
      sanctionsLevel: plan.defaults.sanctionsLevel,
    });
    setModuleValues(plan.intakeModules);
    setIsModalVisible(true);
  };

  const handleViewPlan = (plan) => {
    setModalMode("view");
    setCurrentPlan(plan);
    form.setFieldsValue({
      name: plan.name,
      riskLevel: plan.defaults.riskLevel,
      sanctionsLevel: plan.defaults.sanctionsLevel,
    });
    setModuleValues(plan.intakeModules);
    setIsModalVisible(true);
  };

  const handleDeletePlan = async (planId) => {
    try {
      setLoading(true);
      setPlans(plans.filter((plan) => plan._id !== planId));
      message.success("Plan deleted successfully!");
    } catch (error) {
      message.error("Failed to delete plan");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    try {
      setLoading(true);
      setPlans(plans.filter((plan) => !selectedRowKeys.includes(plan._id)));
      setSelectedRowKeys([]);
      message.success(`${selectedRowKeys.length} plans deleted successfully!`);
    } catch (error) {
      message.error("Failed to delete plans");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const planData = {
        name: values.name,
        intakeModules: moduleValues,
        defaults: {
          riskLevel: values.riskLevel,
          sanctionsLevel: values.sanctionsLevel,
        },
      };

      if (modalMode === "create") {
        const newPlan = {
          _id: Date.now().toString(),
          ...planData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPlans([...plans, newPlan]);
        message.success("Plan created successfully!");
      } else if (modalMode === "edit") {
        setPlans(
          plans.map((plan) =>
            plan._id === currentPlan._id
              ? { ...plan, ...planData, updatedAt: new Date().toISOString() }
              : plan
          )
        );
        message.success("Plan updated successfully!");
      }

      setIsModalVisible(false);
      form.resetFields();
      setModuleValues([]);
    } catch (error) {
      message.error(`Failed to ${modalMode} plan`);
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "Plan Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Intake Modules",
      dataIndex: "intakeModules",
      key: "intakeModules",
      render: (modules) => (
        <div className="flex flex-wrap gap-1">
          {modules.map((module) => {
            const moduleInfo = availableModules.find((m) => m.value === module);
            return (
              <Tag
                key={module}
                color="blue"
                className="flex items-center space-x-1"
              >
                <span>{moduleInfo?.icon}</span>
                <span>{moduleInfo?.label || module}</span>
              </Tag>
            );
          })}
        </div>
      ),
    },
    {
      title: "Default Risk Level",
      dataIndex: ["defaults", "riskLevel"],
      key: "riskLevel",
      width: 150,
      render: (level) => {
        const levelInfo = riskLevelLabels[level];
        return (
          <Tag color={levelInfo.color} icon={<AccountBookFilled />}>
            {levelInfo.label}
          </Tag>
        );
      },
    },
    {
      title: "Default Sanctions Level",
      dataIndex: ["defaults", "sanctionsLevel"],
      key: "sanctionsLevel",
      width: 170,
      render: (level) => {
        const levelInfo = sanctionsLevelLabels[level];
        return (
          <Tag color={levelInfo.color} icon={<SecurityScanOutlined />}>
            {levelInfo.label}
          </Tag>
        );
      },
    },
    {
      title: "Module Count",
      dataIndex: "intakeModules",
      key: "moduleCount",
      width: 120,
      sorter: (a, b) => a.intakeModules.length - b.intakeModules.length,
      render: (modules) => (
        <Badge
          count={modules.length}
          style={{ backgroundColor: "#52c41a" }}
          showZero
        />
      ),
    },

    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewPlan(record)}
              className="text-blue-500 hover:text-blue-700"
            />
          </Tooltip>
          <Tooltip title="Edit Plan">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEditPlan(record)}
              className="text-green-500 hover:text-green-700"
            />
          </Tooltip>
          <Tooltip title="Delete Plan">
            <Popconfirm
              title="Are you sure you want to delete this plan?"
              description="This action cannot be undone."
              onConfirm={() => handleDeletePlan(record._id)}
              okText="Yes"
              cancelText="No"
              okType="danger"
            >
              <Button
                icon={<DeleteOutlined />}
                className="text-red-500 hover:text-red-700"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Filtered data
  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(searchText.toLowerCase()) ||
      plan.intakeModules.some((module) =>
        module.toLowerCase().includes(searchText.toLowerCase())
      )
  );

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    selections: [
      Table.SELECTION_ALL,
      Table.SELECTION_INVERT,
      Table.SELECTION_NONE,
    ],
  };

  return (
    <div className="p-16 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Title level={2} className="mb-2">
          <SettingOutlined className="mr-3" />
          Plans Management
        </Title>
        <Text type="secondary">
          Manage subscription plans with intake modules and default
          risk/sanctions levels
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Total Plans"
              value={totalPlans}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: colors.primaryDark }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Active Plans"
              value={activePlans}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8} md={8}>
          <Card>
            <Statistic
              title="Avg Modules/Plan"
              value={avgModulesPerPlan}
              prefix={<SettingOutlined />}
              valueStyle={{ color: colors.primaryDark }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card */}
      <Card className="shadow-sm">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <Input
              placeholder="Search plans or modules..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="sm:w-80"
              allowClear
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`Delete ${selectedRowKeys.length} selected plans?`}
                description="This action cannot be undone."
                onConfirm={handleBulkDelete}
                okText="Yes"
                cancelText="No"
                okType="danger"
              >
                <Button type="default" danger>
                  Delete Selected ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}

            <Button icon={<PlusOutlined />} onClick={handleCreatePlan}>
              Create Plan
            </Button>
          </div>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredPlans}
          rowKey="_id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            total: filteredPlans.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} plans`,
          }}
          scroll={{ x: 1200 }}
          className="bg-white"
        />
      </Card>

      {/* Modal for Create/Edit/View */}
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <AppstoreOutlined />
            <span>
              {modalMode === "create" && "Create New Plan"}
              {modalMode === "edit" && "Edit Plan"}
              {modalMode === "view" && "Plan Details"}
            </span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
          setModuleValues([]);
        }}
        footer={
          modalMode === "view"
            ? [
                <Button key="close" onClick={() => setIsModalVisible(false)}>
                  Close
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={() => setIsModalVisible(false)}>
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  loading={loading}
                  onClick={() => form.submit()}
                >
                  {modalMode === "create" ? "Create Plan" : "Update Plan"}
                </Button>,
              ]
        }
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
          initialValues={{
            riskLevel: 0,
            sanctionsLevel: 0,
          }}
        >
          <Form.Item
            name="name"
            label="Plan Name"
            rules={[
              { required: true, message: "Please enter plan name" },
              { min: 2, message: "Plan name must be at least 2 characters" },
              { max: 50, message: "Plan name cannot exceed 50 characters" },
            ]}
          >
            <Input
              placeholder="Enter plan name (e.g., Basic IDV, Simple KYC, KYC+)"
              disabled={modalMode === "view"}
            />
          </Form.Item>

          <Form.Item label="Intake Modules" required>
            <Text type="secondary" className="block mb-3">
              Select the modules available for this plan:
            </Text>
            <Checkbox.Group
              options={availableModules.map((module) => ({
                label: (
                  <div className="flex items-center space-x-2">
                    <span>{module.icon}</span>
                    <span>{module.label}</span>
                  </div>
                ),
                value: module.value,
              }))}
              value={moduleValues}
              onChange={onChange}
              disabled={modalMode === "view"}
              className="flex flex-col space-y-2"
            />
            {moduleValues.length === 0 && modalMode !== "view" && (
              <Text type="danger" className="text-sm mt-2">
                Please select at least one intake module
              </Text>
            )}
          </Form.Item>

          <Divider>Default Settings</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="riskLevel"
                label={
                  <span className="flex items-center space-x-1">
                    <AccountBookFilled />
                    <span>Default Risk Level</span>
                  </span>
                }
                rules={[
                  { required: true, message: "Please select risk level" },
                ]}
              >
                <Select
                  disabled={modalMode === "view"}
                  placeholder="Select risk level"
                >
                  <Option value={0}>
                    <Tag color="default">Level 0 - Off</Tag>
                  </Option>
                  <Option value={1}>
                    <Tag color="blue">Level 1 - Basic</Tag>
                  </Option>
                  <Option value={2}>
                    <Tag color="orange">Level 2 - Advanced</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sanctionsLevel"
                label={
                  <span className="flex items-center space-x-1">
                    <SecurityScanOutlined />
                    <span>Default Sanctions Level</span>
                  </span>
                }
                rules={[
                  { required: true, message: "Please select sanctions level" },
                ]}
              >
                <Select
                  disabled={modalMode === "view"}
                  placeholder="Select sanctions level"
                >
                  <Option value={0}>
                    <Tag color="default">Level 0 - Off</Tag>
                  </Option>
                  <Option value={1}>
                    <Tag color="green">Level 1 - Standard</Tag>
                  </Option>
                  <Option value={2}>
                    <Tag color="red">Level 2 - Enhanced</Tag>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {modalMode === "view" && currentPlan && (
            <>
              <Divider />
              <div className="space-y-3">
                <div>
                  <Text strong>Created:</Text>
                  <Text className="ml-2">
                    {new Date(currentPlan.createdAt).toLocaleString()}
                  </Text>
                </div>
                <div>
                  <Text strong>Last Updated:</Text>
                  <Text className="ml-2">
                    {new Date(currentPlan.updatedAt).toLocaleString()}
                  </Text>
                </div>
              </div>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default PlansManagement;
