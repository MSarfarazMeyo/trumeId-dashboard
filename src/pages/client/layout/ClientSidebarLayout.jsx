import { Layout, Menu, Avatar, Dropdown, Button, Input } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router";
import { SearchOutlined } from "@ant-design/icons";
import { useContext } from "react";
import appContext from "../../../context/appContext";
import { LOCAL_STORAGE } from "../../../lib/constants";

import Calender from "../../../assets/svg/Calender";
import OverView from "../../../assets/svg/OverView";
import Risk from "../../../assets/svg/Risk";
import Profile from "../../../assets/svg/Profile";
import Activity from "../../../assets/svg/Activity";
import Message from "../../../assets/svg/Message";
import Settings from "../../../assets/svg/Settings";
import { Logo } from "../../../assets/svg/Logo";
import { useLogout } from "../../../hooks/useAuth";
import { brandInfo, colors } from "../../../constants/brandConfig";

const { Sider, Content } = Layout;

const ClientSidebarLayout = () => {
  const navigate = useNavigate();
  const { user } = useContext(appContext);
  const { logout } = useLogout();

  const menuItems = [
    {
      key: "/client",
      icon: <OverView />,
      label: "Overview",
    },
    {
      key: "/client/aml-sanctions",
      icon: <Calender />,
      label: "AML / Sanctions",
    },
    {
      key: "/client/risk-fraud",
      icon: <Risk />,
      label: "Risk & Fraud",
    },

    {
      key: "/client/users",
      icon: <Profile />,
      label: "Users",
    },

    {
      key: "/client/flows",
      icon: <Risk />,
      label: "Flows",
    },
  ];

  const userMenuItems = [
    {
      key: "/client/activity",
      icon: <Activity />,
      label: "Activity",
    },
    {
      key: "/client/admin-profile",
      icon: <Message />,
      label: "Admin Profile",
    },
    {
      key: "/client/settings",
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

        {/* Search */}
        <div className="mb-2 px-4  mt-[-16px]  2xl:mt-0">
          <Input
            prefix={
              <SearchOutlined
                style={{
                  color: "#464E5F",
                  opacity: 0.6,
                }}
              />
            }
            type="text"
            placeholder="Search"
            className="w-full px-3 py-1 bg-white border border-white/20 rounded-md text-[#464E5F] placeholder-[#464E5F] focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>

        {/* Application Section */}
        <div className=" px-2">
          <div className="text-white text-sm mb-2 px-2">Application</div>
          <div className="flex flex-col sm:gap-1 2xl:gap-1 py-2">
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
          <div className="flex flex-col sm:gap-1 2xl:gap-1 py-2">
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

export default ClientSidebarLayout;
