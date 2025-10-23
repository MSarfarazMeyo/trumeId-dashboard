import React, { useEffect, useState } from "react";

import {
  Row,
  Col,
  Typography,
  Space,
  Button,
  Collapse,
  Image,
  Modal,
  Tooltip,
  Empty,
} from "antd";
import {
  PictureOutlined,
  DownloadOutlined,
  ExpandOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const ImageGallery = ({ images, verificationType }) => {
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const getImageType = (url, index) => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes("selfie")) return "Selfie";
    if (urlLower.includes("id-photo")) return "ID Photo";
    if (urlLower.includes("front")) return "ID Front";
    if (urlLower.includes("back")) return "ID Back";
    if (urlLower.includes("proof-of-address")) return "Proof of Address";
    if (urlLower.includes("additional-document")) return "Additional Document";
    return `Image ${index + 1}`;
  };

  const handleImageClick = (images, startIndex = 0) => {
    setSelectedImages(images);
    setCurrentImageIndex(startIndex);
    setImageModalVisible(true);
  };

  const handleDownloadImage = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename || "verification-image.jpg";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-4">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No images available"
          style={{ margin: 0 }}
        />
      </div>
    );
  }

  return (
    <div className="image-gallery">
      <div className="mb-3">
        <Text strong>
          <PictureOutlined className="mr-1" />
          Verification Images ({images.length})
        </Text>
      </div>
      <Row gutter={[12, 12]}>
        {images.map((imageUrl, index) => (
          <Col xs={12} sm={8} md={6} key={index}>
            <div className="relative group">
              <Image
                src={imageUrl}
                alt={`${verificationType} verification ${index + 1}`}
                className="rounded-lg shadow-sm"
                style={{
                  width: "100%",
                  height: "120px",
                  objectFit: "cover",
                  cursor: "pointer",
                }}
                preview={false}
                onClick={() => handleImageClick(images, index)}
                placeholder={
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <PictureOutlined className="text-gray-400" />
                  </div>
                }
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Space>
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<ExpandOutlined />}
                    size="small"
                    onClick={() => handleImageClick(images, index)}
                  />
                  <Button
                    type="default"
                    shape="circle"
                    icon={<DownloadOutlined />}
                    size="small"
                    onClick={() =>
                      handleDownloadImage(
                        imageUrl,
                        `${verificationType}-${getImageType(
                          imageUrl,
                          index
                        )}.jpg`
                      )
                    }
                  />
                </Space>
              </div>
              <div className="absolute bottom-1 left-1 right-1">
                <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded text-center">
                  {getImageType(imageUrl, index)}
                </div>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Modal
        title={`Verification Images (${currentImageIndex + 1} of ${
          selectedImages.length
        })`}
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={[
          <Button
            key="download"
            icon={<DownloadOutlined />}
            onClick={() =>
              handleDownloadImage(
                selectedImages[currentImageIndex],
                `verification-image-${currentImageIndex + 1}.jpg`
              )
            }
          >
            Download
          </Button>,
          <Button key="close" onClick={() => setImageModalVisible(false)}>
            Close
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: "800px" }}
        centered
      >
        {selectedImages.length > 0 && (
          <div className="text-center">
            <Image
              src={selectedImages[currentImageIndex]}
              alt={`Verification image ${currentImageIndex + 1}`}
              style={{ maxWidth: "100%", maxHeight: "70vh" }}
              preview={false}
            />
            {selectedImages.length > 1 && (
              <div className="mt-4">
                <Space>
                  <Button
                    disabled={currentImageIndex === 0}
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                  >
                    Previous
                  </Button>
                  <Text>{`${currentImageIndex + 1} / ${
                    selectedImages.length
                  }`}</Text>
                  <Button
                    disabled={currentImageIndex === selectedImages.length - 1}
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                  >
                    Next
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
export default ImageGallery;
