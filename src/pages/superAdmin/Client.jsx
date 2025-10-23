// pages/admin/ClientManagement.jsx
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
  Switch,
  Tooltip,
  Badge,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  StopOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import {
  fetchClients,
  createClient,
  updateClient,
  deleteClient,
  toggleClientStatus,
  fetchSubscriptionPlans,
  getClientDetails,
  getOAuthCredentials,
  regenerateOAuthCredentials,
} from "../../services/adminServices";
import { colors } from "../../constants/brandConfig";

const { Option } = Select;

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [credentialsModalVisible, setCredentialsModalVisible] = useState(false);
  const [clientCredentials, setClientCredentials] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingClient, setViewingClient] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadClients();
    loadPlans();
  }, [
    pagination.current,
    pagination.pageSize,
    searchText,
    statusFilter,
    planFilter,
  ]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        status: statusFilter !== "all" ? statusFilter : undefined,
        plan: planFilter !== "all" ? planFilter : undefined,
      };

      const response = await fetchClients(params);
      setClients(response.clients);
      setPagination((prev) => ({
        ...prev,
        total: response.total,
      }));
    } catch (error) {
      message.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await fetchSubscriptionPlans();
      setPlans(response);
    } catch (error) {
      message.error("Failed to load subscription plans");
    }
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    form.setFieldsValue({
      ...client,
      companyAddress: client.companyAddress || {},
      // Convert subscriptionPlans array to array of IDs for the form
      subscriptionPlans:
        client.subscriptionPlans?.map((plan) =>
          typeof plan === "object" ? plan._id : plan
        ) || [],
    });
    setIsModalVisible(true);
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await deleteClient(clientId);
      message.success("Client deleted successfully");
      loadClients();
    } catch (error) {
      message.error("Failed to delete client");
    }
  };

  const handleToggleStatus = async (clientId, val) => {
    try {
      await updateClient(clientId, { isActive: !val });
      message.success("Client status updated successfully");
      loadClients();
    } catch (error) {
      message.error("Failed to update client status");
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();

      if (editingClient) {
        await updateClient(editingClient._id, values);
        message.success("Client updated successfully");
        setIsModalVisible(false);
        loadClients();
      } else {
        const response = await createClient(values);
        message.success("Client created successfully");
        setIsModalVisible(false);

        // Show credentials modal for new client
        setClientCredentials({
          email: response.email,
          password: values.password,
          oauthCredentials: response.oauthCredentials,
        });
        setCredentialsModalVisible(true);

        loadClients();
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred.";

      message.error(
        `${
          editingClient ? "Failed to update client" : "Failed to create client"
        }: ${errorMessage}`
      );
    }
  };

  const columns = [
    {
      title: "Client Info",
      key: "clientInfo",
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-800">
            {record.firstName} {record.lastName}
          </div>
          <div className="text-sm text-gray-500">{record.email}</div>
          {record.companyName && (
            <div
              className="text-sm "
              style={{
                color: colors.primaryDark,
              }}
            >
              {record.companyName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Subscription Plans",
      dataIndex: "subscriptionPlans",
      key: "subscriptionPlans",
      render: (subscriptionPlans) => (
        <div className="flex flex-wrap gap-1">
          {subscriptionPlans && subscriptionPlans.length > 0 ? (
            subscriptionPlans.map((plan, index) => (
              <Tag key={index} color="blue">
                {typeof plan === "object" ? plan.name : plan}
              </Tag>
            ))
          ) : (
            <span className="text-gray-400">No plans assigned</span>
          )}
        </div>
      ),
    },

    {
      title: "Total Applicants",
      dataIndex: "applicantCount",
      key: "applicantCount",
      align: "center",
      render: (applicantCount, record) => (
        <div className="flex flex-col items-center mr-8">
          <Badge
            count={applicantCount || 0}
            showZero
            color="#52c41a"
            style={{ fontSize: "12px" }}
          />
          <div className="text-xs text-gray-500 mt-1">
            Max: {record.maxApplicants || 100}
          </div>
          {/* Progress indicator */}
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  ((applicantCount || 0) / (record.maxApplicants || 100)) * 100,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>
      ),
    },

    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      render: (isActive, record) => (
        <Tooltip title={isActive ? "Deactivate" : "Activate"}>
          <Popconfirm
            title={`Are you sure you want to ${
              isActive ? "deactivate" : "activate"
            } this item?`}
            onConfirm={() => handleToggleStatus(record._id, isActive)}
            okText="Yes"
            cancelText="No"
          >
            <Button>
              <Tag
                icon={isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                color={isActive ? "success" : "error"}
              >
                {isActive ? "Active" : "Inactive"}
              </Tag>
            </Button>
          </Popconfirm>
        </Tooltip>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleViewClient(record._id)}
            />
          </Tooltip>
          <Tooltip title="Edit Client">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditClient(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Are you sure you want to delete this client?"
            onConfirm={() => handleDeleteClient(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete Client">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleTableChange = (paginationConfig) => {
    setPagination(paginationConfig);
  };

  const handleViewClient = async (clientId) => {
    try {
      const [clientData, oauthData] = await Promise.all([
        getClientDetails(clientId),
        getOAuthCredentials(clientId),
      ]);
      setViewingClient({ ...clientData, oauthCredentials: oauthData });
      setViewModalVisible(true);
    } catch (error) {
      message.error("Failed to load client details");
    }
  };

  const handleRegenerateCredentials = async () => {
    if (!viewingClient) return;

    setRegenerating(true);
    try {
      const newCredentials = await regenerateOAuthCredentials(
        viewingClient._id
      );
      setViewModalVisible(false);
      setClientCredentials({
        email: newCredentials.email,
        password: "*** For security reasons, password cannot be retrieved ***",
        oauthCredentials: {
          client_id: newCredentials.client_id,
          client_secret: newCredentials.client_secret,
          token_endpoint: newCredentials.token_endpoint,
        },
      });
      setCredentialsModalVisible(true);
      message.success("OAuth credentials regenerated successfully");
    } catch (error) {
      message.error("Failed to regenerate credentials");
    } finally {
      setRegenerating(false);
    }
  };

  console.log("plans", plans);

  return (
    <div className="p-16 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Client Management</h1>

        <Button
          icon={<PlusOutlined />}
          className="w-full "
          onClick={() => {
            console.log("clicked");

            setIsModalVisible(true);
          }}
          style={{
            background: colors.primaryDark,
            color: "#fff",
            border: "none",
            height: "48px",
            width: "193px",
            borderRadius: "1rem",
          }}
        >
          Create Client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={12} md={12}>
            <Input
              placeholder="Search clients..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full"
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Plan"
              value={planFilter}
              onChange={setPlanFilter}
              className="w-full"
            >
              <Option value="all">All Plans</Option>
              {plans?.map((plan) => (
                <Option key={plan._id} value={plan._id}>
                  {plan.name}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>

        {/* Clients Table */}
        <Table
          columns={columns}
          dataSource={clients}
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="_id"
          className="overflow-x-auto"
        />
      </Card>

      {/* Create/Edit Client Modal */}
      <Modal
        title={editingClient ? "Edit Client" : "Create New Client"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingClient(null);
          form.resetFields();
        }}
        width={800}
        okText={editingClient ? "Update" : "Create"}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
            mfa_enabled: false,
            maxApplicants: 100,
            subscriptionPlans: [], // Initialize as empty array
            scopes: [
              'nobis.sessions:write',
              'nobis.sessions:read',
              'nobis.verifications:read',
              'nobis.resources:read',
              'nobis.webhooks:write'
            ]
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[
                  { required: true, message: "Please input first name!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: "Please input last name!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Please input email!" },
                  { type: "email", message: "Please input valid email!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Password"
                rules={[
                  {
                    required: !editingClient,
                    message: "Please input password!",
                  },
                  {
                    min: 6,
                    message: "Password must be at least 6 characters!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="companyName" label="Company Name">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="subscriptionPlans"
                label="Subscription Plans"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one plan!",
                    type: "array",
                    min: 1,
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select subscription plans"
                  allowClear
                  showSearch
                  filterOption={(input, option) =>
                    option?.children
                      ?.toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {plans.map((plan) => (
                    <Option key={plan._id} value={plan._id}>
                      {plan.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maxApplicants"
                label="Max Applicants"
                rules={[
                  { required: true, message: "Please input max applicants!" },
                ]}
              >
                <Input
                  type="number"
                  min={1}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    form.setFieldValue("maxApplicants", value);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <div className="space-y-4">
                <Form.Item
                  name="isActive"
                  valuePropName="checked"
                  label="Status"
                >
                  <Switch
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                  />
                </Form.Item>
              </div>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="scopes"
                label="Access Rights (Scopes)"
                rules={[
                  {
                    required: true,
                    message: "Please select at least one scope!",
                    type: "array",
                    min: 1,
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select access rights"
                  allowClear
                >
                  <Option value="nobis.sessions:write">Sessions Write</Option>
                  <Option value="nobis.sessions:read">Sessions Read</Option>
                  <Option value="nobis.verifications:read">Verifications Read</Option>
                  <Option value="nobis.resources:read">Resources Read</Option>
                  <Option value="nobis.webhooks:write">Webhooks Write</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <div className="space-y-4">
              </div>
            </Col>
          </Row>

          {/* Company Address */}
          <Form.Item label="Company Address">
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item name={["companyAddress", "street"]} label="Street">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={["companyAddress", "city"]} label="City">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={["companyAddress", "state"]} label="State">
                  <Input />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name={["companyAddress", "country"]} label="Country">
                  <Input />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name={["companyAddress", "zipCode"]}
                  label="Zip Code"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Client Details Modal */}
      <Modal
        title="Client Details"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setViewingClient(null);
        }}
        footer={[
          <Button
            key="regenerate"
            type="primary"
            danger
            loading={regenerating}
            onClick={handleRegenerateCredentials}
          >
            Regenerate OAuth Credentials
          </Button>,
          <Button
            key="close"
            onClick={() => {
              setViewModalVisible(false);
              setViewingClient(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        {viewingClient && (
          <div className="space-y-4">
            <Card title="Client Information">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Name:</strong> {viewingClient.firstName}{" "}
                  {viewingClient.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {viewingClient.email}
                </div>
                <div>
                  <strong>Company:</strong> {viewingClient.companyName || "N/A"}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  {viewingClient.isActive ? "Active" : "Inactive"}
                </div>
              </div>
            </Card>

            <Card title="OAuth Information">
              <div className="space-y-2">
                <div>
                  <strong>Client ID:</strong>{" "}
                  {viewingClient.oauthCredentials?.client_id}
                </div>
                <div>
                  <strong>Token Endpoint:</strong>{" "}
                  {"https://api-bk.getnobis.com" +
                    viewingClient.oauthCredentials?.token_endpoint}
                </div>
                <div className="text-sm text-orange-600 mt-2">
                  {viewingClient.oauthCredentials?.note}
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>

      {/* Client Credentials Modal */}
      <Modal
        title={
          clientCredentials?.password?.includes("***")
            ? "Regenerated OAuth Credentials"
            : "Client Credentials Created"
        }
        open={credentialsModalVisible}
        onCancel={() => {
          setCredentialsModalVisible(false);
          setClientCredentials(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setCredentialsModalVisible(false);
              setClientCredentials(null);
            }}
          >
            Close
          </Button>,
        ]}
        width={600}
      >
        {clientCredentials && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Please share these credentials with your client. Make sure to copy
              them now as they won't be shown again.
            </div>

            {/* Email & Password Card */}
            {!clientCredentials.password?.includes("***") && (
              <Card title="Login Credentials" className="mb-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Email:
                      </div>
                      <div className="text-sm text-gray-900">
                        {clientCredentials.email}
                      </div>
                    </div>
                    <Button
                      icon={<CopyOutlined />}
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(clientCredentials.email);
                        message.success("Email copied to clipboard");
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-700">
                        Password:
                      </div>
                      <div className="text-sm text-gray-900 font-mono">
                        {clientCredentials.password}
                      </div>
                    </div>
                    <Button
                      icon={<CopyOutlined />}
                      size="small"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          clientCredentials.password
                        );
                        message.success("Password copied to clipboard");
                      }}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* OAuth Credentials Card */}
            <Card title="OAuth Credentials">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Client ID:
                    </div>
                    <div className="text-sm text-gray-900 font-mono">
                      {clientCredentials.oauthCredentials?.client_id}
                    </div>
                  </div>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        clientCredentials.oauthCredentials?.client_id
                      );
                      message.success("Client ID copied to clipboard");
                    }}
                  />
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Client Secret:
                    </div>
                    <div className="text-sm text-gray-900 font-mono">
                      {clientCredentials.oauthCredentials?.client_secret}
                    </div>
                  </div>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        clientCredentials.oauthCredentials?.client_secret
                      );
                      message.success("Client Secret copied to clipboard");
                    }}
                  />
                </div>
                <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Token Endpoint:
                    </div>
                    <div className="text-sm text-gray-900 font-mono">
                      {"https://api-bk.getnobis.com" +
                        clientCredentials.oauthCredentials?.token_endpoint}
                    </div>
                  </div>
                  <Button
                    icon={<CopyOutlined />}
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        "https://api-bk.getnobis.com" +
                          clientCredentials.oauthCredentials?.token_endpoint
                      );
                      message.success("Token Endpoint copied to clipboard");
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ClientManagement;
