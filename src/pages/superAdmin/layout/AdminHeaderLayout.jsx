import { Layout, Menu, Avatar, Dropdown, Button, Badge } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router";

import { FaAngleDown } from "react-icons/fa";
import { Logo } from "../../../assets/svg/Logo";
import { useContext } from "react";
import appContext from "../../../context/appContext";
import { LOCAL_STORAGE } from "../../../lib/constants";
import { useLogout } from "../../../hooks/useAuth";
import { DashboardOutlined } from "@ant-design/icons";
import { brandInfo, colors } from "../../../constants/brandConfig";

const { Header, Content } = Layout;

const AdminHeaderLayout = () => {
  const navigate = useNavigate();

  const { logout } = useLogout();

  const { user } = useContext(appContext);

  const headerMenuItems = [
    {
      key: "/admin",
      label: "Dashboard",
      icon: <FaAngleDown style={{ fontSize: "13px" }} />,
    },
    {
      key: "/admin/clients",
      label: "Client Management",
      icon: <FaAngleDown style={{ fontSize: "13px" }} />,
    },

    {
      key: "/admin/plans",
      label: "Subscription Plans",
      icon: <FaAngleDown style={{ fontSize: "13px" }} />,
    },

    {
      key: "/admin/settings",
      label: "Settings",
      icon: <FaAngleDown style={{ fontSize: "13px" }} />,
    },
  ];

  const handleMenuClick = (key) => {
    navigate(key);
  };

  const menu = (
    <Menu
      items={[
        {
          key: "logout",
          label: "Logout",
          onClick: logout, // your logout function
        },
      ]}
    />
  );

  return (
    <div className="min-h-screen min-w-screen flex flex-col" style={{}}>
      {/* Sidebar */}
      <div
        className=" flex  justify-between gap-4   min-w-[100%] h-[80px] items-center px-16  "
        style={{
          background: colors.primaryDark,
        }}
      >
        <div className="flex gap-6 items-center">
          <div className="flex items-center justify-center h-[80px]  ">
            <img
              src={brandInfo.logo}
              alt={brandInfo.name}
              className="h-[49px] w-[121px] object-contain"
            />
          </div>

          <div className="flex gap-6 items-center">
            {headerMenuItems.map((item) => {
              return (
                <div
                  className="cursor-pointer py-2 px-4 hover:bg-primary-light text-white flex gap-2 items-center rounded-sm "
                  onClick={() => handleMenuClick(item.key)}
                >
                  <span className="text-sm">{item.label}</span>
                  {item.icon}
                </div>
              );
            })}
          </div>
        </div>

        <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
          <div className="flex items-center gap-2 text-white cursor-pointer">
            <Avatar className="mr-3">{user.firstName?.[0]}</Avatar>
            <div>
              <div className="text-sm font-medium">{"Jeston"}</div>
              <div className="text-xs text-white/60">
                {localStorage.getItem(LOCAL_STORAGE.ROLE)}
              </div>
            </div>
            <FaAngleDown />
          </div>
        </Dropdown>
      </div>

      {/* Main Content */}
      <Content className="bg-[#F7F9FB] flex-1">
        <Outlet />
      </Content>
    </div>
  );
};

export default AdminHeaderLayout;
