import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Checkbox,
  Tag,
  Avatar,
  Dropdown,
  Pagination,
  Space,
  Tooltip,
  Badge,
  Card,
  Row,
  Col,
  Spin,
  message,
  Modal,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  SettingOutlined,
  MoreOutlined,
  ExportOutlined,
  DownOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  CarOutlined,
  BankOutlined,
  GlobalOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  CopyOutlined,
  LinkOutlined,
  CaretUpOutlined,
  CaretDownOutlined,
  SortDescendingOutlined,
  SortAscendingOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  useApplicantsQuery,
  useDeleteApplicantMutation,
} from "../../../hooks/useApplicants";

import { IoPhonePortraitOutline } from "react-icons/io5";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaIdCard } from "react-icons/fa";
import { TbUserScan } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import { useNavigate } from "react-router";
import { useDebounce } from "../../../hooks/useDebounce";
import { getApplicantFulDetails } from "../../../services/applicantDocResults";
import EditApplicantModal from "./EditApplicantModal";
import { colors } from "../../../constants/brandConfig";

const { Option } = Select;
const { confirm } = Modal;

const verificationOrder = [
  "phone",
  "email",
  "idDocument",
  "selfie",
  "proofOfAddress",
];

const SanctionAmlTable = () => {
  const baseURL = import.meta.env.VITE_APP_SDK_URL;

  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    searchText: "",
    email: "",
    phone: "",
    riskLevel: "",
    sanctionsLevel: "1",

    verificationStatus: undefined,
    documentType: undefined,
    nameSort: undefined,

    sortBy: "updatedAt",
    sortOrder: "desc", // 'asc' or 'desc'
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const debouncedSearchText = useDebounce(filters.searchText, 300);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const { data, isLoading, error } = useApplicantsQuery({
    page: currentPage,
    ...filters,
    searchText: debouncedSearchText,
  });

  const deleteApplicantMutation = useDeleteApplicantMutation();

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);

    // Handle sorting
    if (sorter && sorter.field) {
      setFilters((prev) => ({
        ...prev,
        sortBy: sorter.field,
        sortOrder: sorter.order === "ascend" ? "asc" : "desc",
      }));
    }
  };

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split("-");
    setFilters((prev) => ({
      ...prev,
      nameSort: undefined,
      sortBy,
      sortOrder,
    }));
    setCurrentPage(1);
  };

  const handleNameSortChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      nameSort: value == null ? undefined : value,
    }));
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, searchText: value }));
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleBulkAction = (action) => {
    if (action === "delete") {
      showBulkDeleteConfirmation();
    } else if (action === "export") {
      handleExportSelected();
    } else {
      message.info(`Bulk ${action} for ${selectedRowKeys.length} applicants`);
    }
  };

  const handleExportSelected = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("No applicants selected for export.");
      return;
    }

    message.loading({
      content: "Exporting full applicant details...",
      key: "export",
    });

    try {
      // Fetch full details of all selected applicants
      const detailedApplicants = await Promise.all(
        selectedRowKeys.map((id) => getApplicantFulDetails(id))
      );

      const json = JSON.stringify(detailedApplicants, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `applicants_full_details_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success({
        content: `${detailedApplicants.length} applicants exported successfully`,
        key: "export",
      });
    } catch (error) {
      console.error("Export error:", error);
      message.error({
        content: "Failed to export applicant data.",
        key: "export",
      });
    }
  };

  const handleExport = async () => {
    if (data.applicants.length === 0) {
      message.warning("No applicants Exist for export.");
      return;
    }

    message.loading({
      content: "Exporting current page applicants with details...",
      key: "export",
    });

    try {
      // Fetch full details of all selected applicants
      const detailedApplicants = await Promise.all(
        data.applicants.map((applicnt) => getApplicantFulDetails(applicnt._id))
      );

      const json = JSON.stringify(detailedApplicants, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `applicants_full_details_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success({
        content: `${detailedApplicants.length} applicants exported successfully`,
        key: "export",
      });
    } catch (error) {
      console.error("Export error:", error);
      message.error({
        content: "Failed to export applicant data.",
        key: "export",
      });
    }
  };

  const showDeleteConfirmation = (record) => {
    confirm({
      title: "Delete Applicant",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Are you sure you want to delete this applicant?</p>
          <div className="mt-3 p-3 bg-gray-50 rounded">
            <p>
              <strong>Name:</strong> {record.name}
            </p>
            <p>
              <strong>User ID:</strong>{" "}
              {record.userId || `UD${record._id?.slice(-4)}`}
            </p>
          </div>
          <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
            <p className="text-red-600 font-medium">⚠️ Warning:</p>
            <p className="text-red-600 text-sm">
              This action will permanently delete the applicant and all
              associated data including:
            </p>
            <ul className="text-red-600 text-sm mt-2 ml-4">
              <li>• Personal information</li>
              <li>• Uploaded documents (ID, selfie, proof of address)</li>
              <li>• Verification history</li>
              <li>• All configuration settings</li>
            </ul>
            <p className="text-red-600 text-sm mt-2 font-medium">
              This action cannot be undone.
            </p>
          </div>
        </div>
      ),
      okText: "Yes, Delete",
      cancelText: "Cancel",
      okType: "danger",
      width: 500,
      onOk() {
        deleteApplicantMutation.mutate(record._id, {
          onSuccess: () => {
            message.success(`${record.name} has been deleted successfully`);
            setSelectedRowKeys((prev) =>
              prev.filter((key) => key !== record._id)
            );
          },
          onError: (error) => {
            console.error("Delete error:", error);
            message.error("Failed to delete applicant. Please try again.");
          },
        });
      },
    });
  };

  const showBulkDeleteConfirmation = () => {
    const selectedApplicants =
      data?.applicants?.filter((applicant) =>
        selectedRowKeys.includes(applicant._id)
      ) || [];

    confirm({
      title: "Delete Multiple Applicants",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            Are you sure you want to delete {selectedRowKeys.length} applicants?
          </p>
          <div className="mt-3 p-3 bg-gray-50 rounded max-h-32 overflow-y-auto">
            {selectedApplicants.map((applicant) => (
              <div key={applicant._id} className="flex justify-between text-sm">
                <span>{applicant.name}</span>
                <span className="text-gray-500">
                  {applicant.userId || `UD${applicant._id?.slice(-4)}`}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 p-3 bg-red-50 rounded border border-red-200">
            <p className="text-red-600 font-medium">⚠️ Warning:</p>
            <p className="text-red-600 text-sm">
              This action will permanently delete all selected applicants and
              their associated data including:
            </p>
            <ul className="text-red-600 text-sm mt-2 ml-4">
              <li>• Personal information</li>
              <li>• Uploaded documents (ID, selfie, proof of address)</li>
              <li>• Verification history</li>
              <li>• All configuration settings</li>
            </ul>
            <p className="text-red-600 text-sm mt-2 font-medium">
              This action cannot be undone.
            </p>
          </div>
        </div>
      ),
      okText: `Yes, Delete ${selectedRowKeys.length} Applicants`,
      cancelText: "Cancel",
      okType: "danger",
      width: 500,
      onOk() {
        // Handle bulk delete here - you might need to implement this in your backendF
        // For now, we'll delete them one by one
        Promise.all(
          selectedRowKeys.map((applicantId) =>
            deleteApplicantMutation.mutateAsync(applicantId)
          )
        )
          .then(() => {
            message.success(
              `${selectedRowKeys.length} applicants deleted successfully`
            );
            setSelectedRowKeys([]);
          })
          .catch((error) => {
            console.error("Bulk delete error:", error);
            message.error(
              "Failed to delete some applicants. Please try again."
            );
          });
      },
    });
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

  const getRiskLevelColor = (level) => {
    if (level == "Failed") return "#EA0606";
    if (level == "Passed") return "#00E052";
    return "#FADD33";
  };

  const getRiskLevelText = (level) => {
    if (level == "Failed") return "High Risk";
    if (level == "medium") return "Mid Risk";
    if (level == "low") return "Low Risk";
    return "Low Risk";
  };

  const getVerificationIcons = (verifications, status) => {
    const icons = [];

    if (verifications == "phone") {
      icons.push(
        <IoPhonePortraitOutline
          key="phone"
          style={{ color: getStatusColor(status), fontSize: 20 }}
        />
      );
    }
    if (verifications == "email") {
      icons.push(
        <MdOutlineMailOutline
          key="email"
          style={{ color: getStatusColor(status), fontSize: 20 }}
        />
      );
    }
    if (verifications == "idDocument") {
      icons.push(
        <FaIdCard
          key="identity"
          style={{ color: getStatusColor(status), fontSize: 20 }}
        />
      );
    }

    if (verifications == "selfie") {
      icons.push(
        <TbUserScan
          key="biometric"
          style={{ color: getStatusColor(status), fontSize: 20 }}
        />
      );
    }
    if (verifications == "proofOfAddress") {
      icons.push(
        <IoLocationOutline
          key="location"
          style={{ color: getStatusColor(status), fontSize: 20 }}
        />
      );
    }

    return icons;
  };

  const linkAction = (key, applicantId) => {
    const SDKlink = `${baseURL}/verification?id=${applicantId}`;

    if (key === "newTab") {
      window.open(SDKlink, "_blank", "noopener,noreferrer");
    } else if (key === "copy") {
      navigator.clipboard.writeText(SDKlink);
      message.success("Link copied to clipboard");
    }
  };

  const handleMenuClick = (key, record) => {
    switch (key) {
      case "view":
        navigate(`/client/users/${record._id}`);
        break;
      case "edit":
        setSelectedApplicant(record);
        setEditModalOpen(true);
        break;
      case "copy":
        linkAction(key, record._id);
        break;
      case "newTab":
        linkAction(key, record._id);
        break;
      case "delete":
        showDeleteConfirmation(record);
        break;
      default:
        message.info(`${key} action for ${record.name}`);
    }
  };

  const columns = [
    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>User</span>
          <div style={{ display: "flex", gap: "10px" }}>
            <Tooltip
              title={
                filters.nameSort === 1
                  ? "Sorted by: Name A–Z"
                  : filters.nameSort === -1
                  ? "Sorted by: Name Z–A"
                  : "Click to sort by name"
              }
            >
              <div
                style={{
                  cursor: "pointer",
                }}
                onClick={() => {
                  const newOrder = filters.nameSort === 1 ? -1 : 1;
                  handleNameSortChange(newOrder);
                }}
              >
                {filters.nameSort === 1 && (
                  <CaretUpOutlined
                    style={{ fontSize: 12, color: colors.primaryDark }}
                  />
                )}
                {filters.nameSort === -1 && (
                  <CaretDownOutlined
                    style={{ fontSize: 12, color: colors.primaryDark }}
                  />
                )}
                {filters.nameSort !== 1 && filters.nameSort !== -1 && (
                  <CaretDownOutlined style={{ fontSize: 12, color: "#ccc" }} />
                )}
              </div>
            </Tooltip>

            {(filters.nameSort == 1 || filters.nameSort == -1) && (
              <Tooltip title={"clear"}>
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => handleNameSortChange(null)}
                >
                  <CloseOutlined style={{ fontSize: 12, color: "#ccc" }} />
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      ),
      dataIndex: "user",
      key: "user",
      width: 250,
      render: (_, record) => (
        <div
          className="flex items-center space-x-3  cursor-pointer text-gray-900 hover:text-blue-900"
          onClick={() => navigate(`/client/users/${record._id}`)}
        >
          <div className="transition-transform duration-200 hover:scale-120">
            <Avatar
              src={record.selfieImageUrl || record.idDocumentImageUrl}
              icon={<UserOutlined />}
            />
          </div>
          <div>
            <div className="font-medium ">{record?.name?.slice(0, 20)}</div>
            <div className="text-sm text-gray-500  hover:text-blue-900">
              {record.userId || `UD${record._id?.slice(-4)}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Sanction Match",
      dataIndex: "sanctionMatchStatus",
      key: "sanctionMatchStatus",
      render: (sanctionMatchStatus, record) => (
        <span
          style={{
            color: getRiskLevelColor(record.sanctionCaseStatus || "low"),
          }}
          className="text-gray-600"
        >
          {sanctionMatchStatus || "-"}
        </span>
      ),
    },
    {
      title: "Sanction Case",
      dataIndex: "sanctionCaseStatus",
      key: "sanctionCaseStatus",
      render: (sanctionCaseStatus, record) => {
        return (
          <div
            className="flex space-x-2"
            style={{
              color: getRiskLevelColor(sanctionCaseStatus || "low"),
            }}
          >
            {sanctionCaseStatus || 0}
          </div>
        );
      },
    },

    {
      title: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            justifyContent: "space-between",
          }}
          onClick={() => {
            const newOrder =
              filters.sortBy === "updatedAt" && filters.sortOrder === "asc"
                ? "desc"
                : "asc";
            handleSortChange(`updatedAt-${newOrder}`);
          }}
        >
          <span>Assessment</span>

          <Tooltip
            title={
              filters.sortBy === "updatedAt"
                ? filters.sortOrder === "asc"
                  ? "Sorted by: Oldest First"
                  : "Sorted by: Newest First"
                : "Click to sort"
            }
          >
            <div>
              {filters.sortBy === "updatedAt" &&
                filters.sortOrder === "asc" && (
                  <CaretUpOutlined
                    style={{ fontSize: 12, color: colors.primaryDark }}
                  />
                )}
              {filters.sortBy === "updatedAt" &&
                filters.sortOrder === "desc" && (
                  <CaretDownOutlined
                    style={{ fontSize: 12, color: colors.primaryDark }}
                  />
                )}
              {filters.sortBy !== "updatedAt" && (
                <CaretDownOutlined style={{ fontSize: 12, color: "#ccc" }} />
              )}
            </div>
          </Tooltip>
        </div>
      ),
      dataIndex: "updatedAt",
      key: "updatedAt",
      // Remove AntD built-in sorting
      sorter: false,
      render: (_, record) => (
        <span className="text-gray-600">
          {new Date(record.updatedAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },

    {
      title: "Recommended Action",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        const status = record.verificationStatus || "pending";
        return (
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "center",
              color: "#777B8B",
            }}
          >
            <span
              style={{
                color: getStatusColor(status),
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {status === "verified" ? (
              <CheckCircleOutlined />
            ) : status === "rejected" ? (
              <CloseCircleOutlined />
            ) : (
              <ClockCircleOutlined />
            )}
          </div>
        );
      },
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
              { key: "edit", label: "Edit Applicant", icon: <EditOutlined /> },
              { type: "divider" },
              { key: "copy", label: "Copy Link", icon: <CopyOutlined /> },
              { key: "newTab", label: "Open Link", icon: <LinkOutlined /> },
              { type: "divider" },
              {
                key: "delete",
                label: "Delete",
                danger: true,
                icon: <DeleteOutlined />,
              },
            ],
            onClick: ({ key }) => handleMenuClick(key, record),
          }}
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<MoreOutlined />}
            loading={deleteApplicantMutation.isLoading}
          />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    onSelectAll: (selected, selectedRows, changeRows) => {
      if (selected) {
        setSelectedRowKeys(data?.applicants?.map((item) => item._id) || []);
      } else {
        setSelectedRowKeys([]);
      }
    },
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <ExclamationCircleOutlined className="text-red-500 text-4xl mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load applicants
          </h3>
          <p className="text-gray-500">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-16 bg-gray-50 min-h-screen">
      <EditApplicantModal
        isModalOpen={editModalOpen}
        setIsModalOpen={setEditModalOpen}
        applicantData={selectedApplicant}
      />

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Risk Overview{" "}
          </h1>
        </div>
        <Button
          icon={<ExportOutlined />}
          onClick={handleExport}
          className="flex items-center"
        >
          Export Report
        </Button>
      </div>

      {/* Filters and Actions */}
      <Card className="mb-6">
        {/* Search Input Row */}
        {showSearchInput && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={24}>
              <Input
                placeholder="Search applicants..."
                prefix={<SearchOutlined />}
                value={filters.searchText}
                onChange={(e) => handleSearch(e.target.value)}
                allowClear
                autoFocus
                onBlur={() => {
                  if (!filters.searchText) {
                    setShowSearchInput(false);
                  }
                }}
              />
            </Col>
          </Row>
        )}

        {showFilterOptions && (
          <Row gutter={[16, 16]} className="mb-4">
            <Col span={8}>
              <Select
                placeholder="Verification Status"
                value={filters.verificationStatus}
                onChange={(value) =>
                  handleFilterChange("verificationStatus", value)
                }
                allowClear
                style={{ width: "100%" }}
              >
                <Option value="verified">Verified</Option>
                <Option value="rejected">Rejected</Option>
                <Option value="pending">Pending</Option>
                <Option value="requested">Requested</Option>
              </Select>
            </Col>

            <Col span={8}>
              <Select
                placeholder="Document Type"
                value={filters.documentType}
                onChange={(value) => handleFilterChange("documentType", value)}
                allowClear
                style={{ width: "100%" }}
              >
                <Option value="NID">National Identity Card</Option>
                <Option value="PP">Passport</Option>
                <Option value="DL">Driving License</Option>
                <Option value="others">Others</Option>
              </Select>
            </Col>

            <Col span={8}>
              <Select
                placeholder="Sort by"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={handleSortChange}
                style={{ width: "100%" }}
              >
                <Option value="updatedAt-desc">
                  <SortDescendingOutlined /> Newest First
                </Option>
                <Option value="updatedAt-asc">
                  <SortAscendingOutlined /> Oldest First
                </Option>
              </Select>
            </Col>
          </Row>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Dropdown
              menu={{
                items: [
                  { key: "export", label: "Export Selected" },
                  { type: "divider" },

                  {
                    key: "delete",
                    label: "Delete Selected",
                    danger: true,
                    icon: <DeleteOutlined />,
                  },
                ],
                onClick: ({ key }) => handleBulkAction(key),
              }}
              disabled={selectedRowKeys.length === 0}
            >
              <Button
                disabled={selectedRowKeys.length === 0}
                loading={deleteApplicantMutation.isLoading}
              >
                Bulk Action <DownOutlined />
              </Button>
            </Dropdown>
            {showFilterOptions && (
              <Button
                onClick={() => {
                  setFilters({
                    searchText: "",
                    email: "",
                    phone: "",
                    riskLevel: "",
                    sanctionsLevel: "",
                    verificationStatus: "",
                    sortBy: "updatedAt",
                    sortOrder: "desc",
                  });
                  setCurrentPage(1);
                  setShowSearchInput(false);
                  setShowFilterOptions(false);
                }}
              >
                Reset Filters
              </Button>
            )}
            {selectedRowKeys.length > 0 && (
              <span className="text-sm text-gray-500">
                {selectedRowKeys.length} selected
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              icon={<SearchOutlined />}
              onClick={() => setShowSearchInput(!showSearchInput)}
              type={showSearchInput ? "primary" : "default"}
            />
            <Button
              icon={<FilterOutlined />}
              onClick={() => setShowFilterOptions(!showFilterOptions)}
              type={showFilterOptions ? "primary" : "default"}
            />
            <Button icon={<SettingOutlined />} />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.applicants || []}
          rowSelection={rowSelection}
          rowKey="_id"
          pagination={false}
          className="applicants-table"
          loading={isLoading || deleteApplicantMutation.isLoading}
          onChange={handleTableChange}
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
            disabled={!data?.applicants || data.applicants.length < 10}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SanctionAmlTable;
