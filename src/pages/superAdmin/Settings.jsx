import React, { useState, useContext } from "react";
import { Card, Input, Button, Divider, Space, Typography, message } from "antd";
import {
  UserOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  LogoutOutlined,
  MailOutlined,
  BankOutlined,
} from "@ant-design/icons";
import appContext from "../../context/appContext";
import { useLogout } from "../../hooks/useAuth";
import { updateClient } from "../../services/client";
import { useLocation } from "react-router";

const { Title, Text } = Typography;

const Settings = () => {
  const { user, setUser } = useContext(appContext);
  const { logout } = useLogout();
  const [editingField, setEditingField] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const [loading, setLoading] = useState(false);

  const handleEdit = (field) => {
    setEditingField(field);
    setTempValues({ ...tempValues, [field]: user[field] });
  };

  const handleCancel = () => {
    setEditingField(null);
    setTempValues({});
  };

  const handleSave = async (field) => {
    try {
      setLoading(true);
      const updateData = { [field]: tempValues[field] };
      const data = await updateClient(updateData);

      data?.user && setUser(data?.user);
      setEditingField(null);
      setTempValues({});
      message.success(`${field} updated successfully`);
    } catch (error) {
      message.error(`Failed to update ${field}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const renderEditableField = (
    field,
    label,
    icon,
    placeholder,
    readonly = true
  ) => {
    const isEditing = editingField === field;

    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <Text strong>{label}</Text>
            <br />
            <Text type="secondary">
              {isEditing && !readonly ? (
                <Input
                  value={tempValues[field] || ""}
                  onChange={(e) =>
                    setTempValues({ ...tempValues, [field]: e.target.value })
                  }
                  style={{ width: 250 }}
                  placeholder={placeholder}
                />
              ) : (
                user[field] || "Not set"
              )}
            </Text>
          </div>
        </div>
        <div>
          {!readonly &&
            (isEditing ? (
              <Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleSave(field)}
                  loading={loading}
                >
                  Save
                </Button>
                <Button
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Space>
            ) : (
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(field)}
              >
                Edit
              </Button>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <UserOutlined className="text-2xl text-purple-600" />
            </div>
            <div>
              <Title level={3} className="mb-1">
                {user?.firstName} {user?.lastName}
              </Title>
              <Text type="secondary" className="text-base">
                {user?.email}
              </Text>
            </div>
          </div>
        </Card>

        {/* Personal Information Card */}
        <Card title="Personal Information" extra={<UserOutlined />}>
          {renderEditableField(
            "firstName",
            "First Name",
            <UserOutlined />,
            "Enter your first name"
          )}
          <Divider />
          {renderEditableField(
            "lastName",
            "Last Name",
            <UserOutlined />,
            "Enter your last name"
          )}
          <Divider />
          {renderEditableField(
            "email",
            "Email Address",
            <MailOutlined />,
            "Enter your email address"
          )}
        </Card>

        <Card title="Actions">
          <div className="flex justify-between items-center">
            <div>
              <Text strong>Danger Zone</Text>
              <br />
              <Text type="secondary">
                Once you logout, you'll need to sign in again to access your
                account.
              </Text>
            </div>
            <Button
              danger
              type="primary"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              size="large"
            >
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
