import { Layout, Menu, Avatar, Dropdown, Button, Input } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router";
import { SearchOutlined } from "@ant-design/icons";
import { useContext } from "react";
import appContext from "../../../context/appContext";
import { LOCAL_STORAGE } from "../../../lib/constants";

import Calender from "../../../assets/svg/Calender";
import OverView from "../../../assets/svg/OverView";
import Profile from "../../../assets/svg/Profile";
import Settings from "../../../assets/svg/Settings";
import { Logo } from "../../../assets/svg/Logo";
import { useLogout } from "../../../hooks/useAuth";
import { brandInfo, colors } from "../../../constants/brandConfig";

const { Sider, Content } = Layout;

const AdminSidebarLayout = () => {
  const navigate = useNavigate();
  const { user } = useContext(appContext);
  const { logout } = useLogout();

  const menuItems = [
    {
      key: "/admin",
      label: "Dashboard",
      icon: <OverView />,
    },

    {
      key: "/admin/clients",
      label: "Client Management",
      icon: <Profile />,
    },

    {
      key: "/admin/plans",
      label: "Subscription Plans",
      icon: <Calender />,
    },
  ];

  const userMenuItems = [
    {
      key: "/admin/settings",
      icon: <Settings />,
      label: "Settings",
    },
  ];

  const handleMenuClick = (key) => {
    navigate(key);
  };

  const menu = (
    <Menu
      className="min-w-[200px] w-[200px]"
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
    <div className="min-h-[100vh] min-w-[100vw] flex ">
      {/* Sidebar */}
      <div
        className=" flex flex-col gap-4  w-[200px] min-w-[200px]"
        style={{
          background: colors.primaryDark,
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-[80px]  ">
          <img
            src={brandInfo.logo}
            alt={brandInfo.name}
            className="h-[49px] w-[121px] object-contain"
          />
        </div>

        {/* Application Section */}
        <div className=" px-2 ">
          <div className="text-white text-sm mb-2 px-2">Main</div>
          <div className="flex flex-col gap-2 py-2">
            {menuItems.map((item) => {
              return (
                <div
                  className="cursor-pointer p-2 hover:bg-primary-light text-white flex gap-2 items-center rounded-sm "
                  onClick={() => handleMenuClick(item.key)}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className=" px-2">
          <div className="text-white text-sm mb-2 px-2">Others</div>
          <div className="flex flex-col gap-2 py-2">
            {userMenuItems.map((item) => {
              return (
                <div
                  className="cursor-pointer p-2 hover:bg-primary-light text-white flex gap-2 items-center rounded-sm"
                  onClick={() => handleMenuClick(item.key)}
                >
                  {item.icon}
                  <span className="text-sm">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Profile at Bottom */}
        <Dropdown overlay={menu} placement="topRight" trigger={["click"]}>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-white">
              <Avatar className="mr-3">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </Avatar>
              <div>
                <div className="text-sm font-medium">{user.lastName}</div>
                <div className="text-xs text-white/60">
                  {localStorage.getItem(LOCAL_STORAGE.ROLE)}
                </div>
              </div>
            </div>
          </div>
        </Dropdown>
      </div>

      {/* Main Content */}
      <Layout>
        <Content className="bg-[#F7F9FB]">
          <Outlet />
        </Content>
      </Layout>
    </div>
  );
};

export default AdminSidebarLayout;
