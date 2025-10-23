import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAdminLogin, useClientLogin } from "../hooks/useAuth";
import { LOCAL_STORAGE } from "../lib/constants";
import appContext from "../context/appContext";
import BannerBg from "../assets/svg/BannerBg";
import { brandInfo, colors } from "../constants/brandConfig";
import BannerInner from "../assets/svg/BannerInner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("client");
  const { setUser, user } = useContext(appContext);

  const navigate = useNavigate();
  const [form] = Form.useForm();

  const adminLoginMutation = useAdminLogin();
  const clientLoginMutation = useClientLogin();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    form.setFieldsValue({ email: value });
    const isAdmin =
      value.toLowerCase() === "admin@example.com" ||
      value.toLowerCase().includes("admin");
    const detectedRole = isAdmin ? "admin" : "client";
    setRole(detectedRole);
    localStorage.setItem("role", detectedRole);
  };

  const handleSubmit = async (values) => {
    console.log("values", values);

    try {
      let result;

      if (role === "admin") {
        result = await adminLoginMutation.mutateAsync(values);
      } else {
        result = await clientLoginMutation.mutateAsync(values);
      }

      if (result?.user) {
        setUser(result.user);
        localStorage.setItem(LOCAL_STORAGE.TOKEN_KEY, result.access_token);
        localStorage.setItem(LOCAL_STORAGE.ROLE, role);

        message.success("Login successful!");

        navigate("/dashboard");
      }
    } catch (error) {
      message.error(
        error?.message || "Login failed. Please check your credentials."
      );
    }
  };

  const isLoading =
    adminLoginMutation.isPending || clientLoginMutation.isPending;

  return (
    <div className="w-screen h-screen flex">
      {/* Left side - Login Form */}
      <div className="w-1/2 h-full flex justify-center items-center bg-white">
        <div className="w-full max-w-md px-8">
          <div className="text-center mb-10">
            <div className="mb-4">
              <h1
                className="text-4xl font-bold mb-2"
                style={{
                  color: colors.primaryDark,
                }}
              >
                LOGIN
              </h1>
              <div
                className="w-16 h-1 mx-auto rounded-full"
                style={{
                  background: `linear-gradient(to right, ${colors.primaryLight}, ${colors.primaryDark})`,
                }}
              ></div>
            </div>
            <div className="space-y-2">
              <h2
                className="text-lg font-semibold  tracking-wide"
                style={{
                  color: colors.primaryDark,
                }}
              >
                FRICTIONLESS ONBOARDING. SMARTER COMPLIANCE.
              </h2>
              <p className="text-sm text-[#666666] max-w-sm mx-auto leading-relaxed">
                Verify instantly, stay compliant, automate with AI – you're in
                control.
              </p>
            </div>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            className="w-full"
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "email",
                  message: "Please enter a valid email!",
                },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Username"
                style={{
                  background: "#f0edff",
                  height: "52px",
                  borderRadius: "1rem",
                  border: "none",
                }}
                value={email}
                onChange={handleEmailChange}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Password"
                style={{
                  background: "#f0edff",
                  height: "52px",
                  borderRadius: "1rem",
                  border: "none",
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                className="w-full "
                style={{
                  background: `linear-gradient(to right, ${colors.primaryLight}, ${colors.primaryDark})`,
                  color: "#fff",
                  border: "none",
                  height: "52px",
                  borderRadius: "1rem",
                }}
              >
                Login as {role === "admin" ? "Admin" : "Client"}
              </Button>
            </Form.Item>

            <div className="text-center">
              <Button
                type="link"
                className="text-gray-500 p-0"
                style={{
                  color: "#525252",
                }}
              >
                Forgot Password?
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {/* Right side - Image */}
      <div
        className="w-1/2 h-full  relative overflow-hidden flex items-center justify-center p-0 m-0"
        style={{
          color: colors.primaryDark,
        }}
      >
        <div className="absolute top-0 left-0 w-full h-full ">
          <BannerBg />
        </div>

        <div className="z-10 w-full h-full flex flex-col items-center justify-center">
          <div className="flex items-center justify-center h-[80px]">
            <img
              src={brandInfo.logo}
              alt={brandInfo.name}
              className="h-[130px] w-[324px] object-contain"
            />
          </div>

          <div className="w-[70%] h-[50%]">
            <BannerInner />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
