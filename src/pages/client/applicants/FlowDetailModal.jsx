import React, { useState, useRef } from "react";
import {
  Modal,
  Button,
  message,
  Divider,
  Typography,
  Card,
  Space,
  Tooltip,
} from "antd";
import QRCode from "react-qr-code";
import { FiShare2, FiExternalLink } from "react-icons/fi";
import {
  CopyOutlined,
  DownloadOutlined,
  QrcodeOutlined,
  CodeOutlined,
  LinkOutlined,
  CheckOutlined,
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const FlowDetailModal = ({ flowDetails, setFlowDetails }) => {
  const [copiedStates, setCopiedStates] = useState({
    link: false,
    embedCode: false,
    iframeCode: false,
  });

  const qrCodeRef = useRef();

  if (!flowDetails) return null;

  const { _id: flowId, name: flowName, description } = flowDetails;

  const baseURL = import.meta.env.VITE_APP_SDK_URL;
  const flowApiLink = `${baseURL}/flow/${flowId}`;

  const embedCode = `
<div id="kyc-flow-${flowId}">
  <a href="${flowApiLink}" 
     target="_blank" 
     rel="noopener noreferrer"
     >
    Start Verification
  </a>
</div>`;

  const handleCopy = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [type]: true }));
      message.success(
        `${type === "link" ? "Link" : "Code"} copied to clipboard!`
      );

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedStates((prev) => ({ ...prev, [type]: false }));
      }, 2000);
    } catch (err) {
      message.error("Failed to copy to clipboard");
    }
  };

  const downloadQRCode = () => {
    const svg = qrCodeRef.current;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(
      svg.querySelector("svg")
    );
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${flowName || "flow"}-qr-code.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const closeModal = () => {
    setFlowDetails(null);
    setCopiedStates({ link: false, embedCode: false, iframeCode: false });
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <FiShare2 className="text-blue-600 text-lg" />
          </div>
          <div>
            <Title level={4} className="mb-0">
              Share Verification Flow
            </Title>
            <Text type="secondary" className="text-sm">
              {flowName}
            </Text>
          </div>
        </div>
      }
      open={!!flowDetails}
      onCancel={closeModal}
      width={800}
      className="flow-share-modal"
      footer={[
        <Button key="close" onClick={closeModal} size="large">
          Close
        </Button>,
      ]}
      bodyStyle={{ padding: "24px" }}
    >
      <div className="space-y-6">
        {/* Description */}
        {description && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <Text type="secondary">{description}</Text>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Copy Link */}
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer border-dashed"
            onClick={() => handleCopy(flowApiLink, "link")}
          >
            <div className="text-center space-y-3">
              <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                {copiedStates.link ? (
                  <CheckOutlined className="text-green-600 text-xl" />
                ) : (
                  <LinkOutlined className="text-green-600 text-xl" />
                )}
              </div>
              <div>
                <Title level={5} className="mb-1">
                  Copy Link
                </Title>
                <Text type="secondary" className="text-xs">
                  Direct verification URL
                </Text>
              </div>
            </div>
          </Card>

          {/* Download QR Code */}
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer border-dashed"
            onClick={downloadQRCode}
          >
            <div className="text-center space-y-3">
              <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <QrcodeOutlined className="text-blue-600 text-xl" />
              </div>
              <div>
                <Title level={5} className="mb-1">
                  Download QR
                </Title>
                <Text type="secondary" className="text-xs">
                  PNG image file
                </Text>
              </div>
            </div>
          </Card>

          {/* Copy Embed Code */}
          <Card
            className="hover:shadow-md transition-shadow cursor-pointer border-dashed"
            onClick={() => handleCopy(embedCode, "embedCode")}
          >
            <div className="text-center space-y-3">
              <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                {copiedStates.embedCode ? (
                  <CheckOutlined className="text-purple-600 text-xl" />
                ) : (
                  <CodeOutlined className="text-purple-600 text-xl" />
                )}
              </div>
              <div>
                <Title level={5} className="mb-1">
                  Embed Code
                </Title>
                <Text type="secondary" className="text-xs">
                  HTML button code
                </Text>
              </div>
            </div>
          </Card>
        </div>

        <Divider />

        {/* Detailed Options */}
        <div className="space-y-6">
          {/* QR Code Section */}
          <div>
            <Title level={5} className="mb-4 flex items-center gap-2">
              <QrcodeOutlined className="text-blue-600" />
              QR Code
            </Title>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <div ref={qrCodeRef}>
                  <QRCode
                    value={flowApiLink}
                    size={180}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <Divider />
        </div>
      </div>

      <style jsx>{`
        .flow-share-modal .ant-modal-header {
          border-bottom: 1px solid #f0f0f0;
          padding: 24px 24px 16px;
        }
        .flow-share-modal .ant-modal-body {
          padding-top: 0;
        }
      `}</style>
    </Modal>
  );
};

export default FlowDetailModal;
