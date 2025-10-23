import {
  Spin,
  Card,
  Row,
  Col,
  Tag,
  Timeline,
  Descriptions,
  Alert,
  Badge,
  Divider,
  Typography,
  Space,
  Progress,
} from "antd";

import ImageGallery from "./ImageGallery";
import { PlayCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const FaceVerificationDetails = ({ result }) => {
  const data = result.rawResponse?.resultData;
  const faceMatchData = result.faceMatchValidation;

  if (!data) return null;

  const getFaceMatchColor = (result) => {
    switch (result?.toLowerCase()) {
      case "verified":
      case "approved":
        return "success";
      case "rejected":
      case "failed":
        return "error";
      default:
        return "warning";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "success";
    if (score >= 50) return "warning";
    return "error";
  };

  return (
    <Space direction="vertical" size="middle" className="w-full">
      {/* Face Match Validation Results */}
      {faceMatchData && (
        <Card size="small" title="Face Match Validation">
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Text strong>Match Status: </Text>
              <Tag color={getFaceMatchColor(faceMatchData.result)}>
                {faceMatchData.result}
              </Tag>
            </Col>
            <Col span={12}>
              <Text strong>Verification Result: </Text>
              <Tag color={getFaceMatchColor(faceMatchData.verificationResult)}>
                {faceMatchData.verificationResult}
              </Tag>
            </Col>
            <Col span={12}>
              <Text strong>Face Matched: </Text>
              <Badge
                status={faceMatchData.matched ? "success" : "error"}
                text={faceMatchData.matched ? "Yes" : "No"}
              />
            </Col>
            <Col span={12}>
              <Text strong>Match Score: </Text>
              <Space>
                <Text
                  type={
                    getScoreColor(faceMatchData.score) === "success"
                      ? "success"
                      : getScoreColor(faceMatchData.score) === "error"
                      ? "danger"
                      : "warning"
                  }
                >
                  {faceMatchData.score}%
                </Text>
              </Space>
            </Col>
            {faceMatchData.message && (
              <Col span={24}>
                <Alert
                  message={faceMatchData.message}
                  type={faceMatchData.matched ? "success" : "warning"}
                  showIcon
                  style={{ marginTop: 8 }}
                />
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Live Face Detection Results */}
      <Card size="small" title="Live Face Detection">
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>Decision: </Text>
            <Tag
              color={
                data.verificationResult === "Live Face Detected"
                  ? "success"
                  : "error"
              }
            >
              {data.verificationResult}
            </Tag>
          </Col>
          <Col span={12}>
            <Text strong>Live Face: </Text>
            <Badge
              status={data.liveFace === "true" ? "success" : "error"}
              text={data.liveFace === "true" ? "Detected" : "Not Detected"}
            />
          </Col>
          <Col span={12}>
            <Text strong>Real Score: </Text>
            <Text>{data.realScore}</Text>
          </Col>
          <Col span={12}>
            <Text strong>Estimated Age: </Text>
            <Text>{data.estimatedAge || "Not detected"}</Text>
          </Col>
        </Row>
      </Card>

      {/* Additional Detection Results */}
      <Card size="small" title="Additional Detections">
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <Text strong>Face Mask: </Text>
            <Badge
              status={data.faceMask === "true" ? "warning" : "success"}
              text={data.faceMask === "true" ? "Detected" : "Not Detected"}
            />
            {data.faceMaskScore !== undefined && (
              <Text type="secondary"> (Score: {data.faceMaskScore})</Text>
            )}
          </Col>
          <Col span={12}>
            <Text strong>Head Covering: </Text>
            <Badge
              status={data.headCovering === "true" ? "warning" : "success"}
              text={data.headCovering === "true" ? "Detected" : "Not Detected"}
            />
            {data.headCoveringScore !== undefined && (
              <Text type="secondary"> (Score: {data.headCoveringScore})</Text>
            )}
          </Col>
          <Col span={12}>
            <Text strong>Eye Covering: </Text>
            <Badge
              status={data.eyeCovering === "true" ? "warning" : "success"}
              text={data.eyeCovering === "true" ? "Detected" : "Not Detected"}
            />
            {data.eyeCoveringScore !== undefined && (
              <Text type="secondary"> (Score: {data.eyeCoveringScore})</Text>
            )}
          </Col>
          <Col span={12}>
            <Text strong>Cell Phone: </Text>
            <Badge
              status={data.cellPhone === "true" ? "warning" : "success"}
              text={data.cellPhone === "true" ? "Detected" : "Not Detected"}
            />
            {data.cellPhoneScore !== undefined && (
              <Text type="secondary"> (Score: {data.cellPhoneScore})</Text>
            )}
          </Col>
        </Row>
      </Card>

      {result.videoUrl && result.videoUrl.url && (
        <Card size="small" title="Liveliness Recording">
          <video
            src={result.videoUrl.url}
            controls
            style={{
              width: "100%",
              borderRadius: 8,
              background: "#000",
              maxHeight: 350,
            }}
          >
            Your browser does not support the video tag.
          </video>
        </Card>
      )}

      {/* Face Verification Images */}
      {result.imagesUrls && result.imagesUrls.length > 0 && (
        <Card size="small" title="Face Verification Images">
          <ImageGallery
            images={result.imagesUrls || []}
            verificationType={"face"}
          />
        </Card>
      )}
    </Space>
  );
};

export default FaceVerificationDetails;
