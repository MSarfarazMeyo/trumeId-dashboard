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
  Button,
  Collapse,
} from "antd";

import dayjs from "dayjs";
import ImageGallery from "./ImageGallery";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const IdVerificationDetails = ({ result }) => {
  const data = result.rawResponse?.resultData;
  const personalData =
    result.rawResponse?.responseCustomerData?.extractedPersonalData;
  const idData = result.rawResponse?.responseCustomerData?.extractedIdData;

  console.log("idData", idData);

  if (!data) return null;

  const calculateAgeOver18 = (dateOfBirth) => {
    try {
      if (!dateOfBirth || dateOfBirth === "NA") return "NA";

      // Parse date of birth (assuming DD/MM/YYYY format)
      const [day, month, year] = dateOfBirth
        .split("/")
        .map((num) => parseInt(num));
      if (!day || !month || !year) return "NA";

      const dobDate = new Date(year, month - 1, day); // month is 0-indexed
      const currentDate = new Date();

      let age = currentDate.getFullYear() - dobDate.getFullYear();
      const monthDiff = currentDate.getMonth() - dobDate.getMonth();

      // Adjust if birthday hasn't occurred this year
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && currentDate.getDate() < dobDate.getDate())
      ) {
        age--;
      }

      return age >= 18 ? "Y" : "N";
    } catch (error) {
      console.error("Error calculating age:", error);
      return "NA";
    }
  };

  return (
    <Space direction="vertical" size="middle" className="w-full">
      <Card size="small" title="ID Verification Status">
        <Row gutter={[16, 8]}>
          <Col span={24}>
            <Text strong>Verification Result: </Text>
            <Tag
              color={data.verificationResult === "OK" ? "success" : "warning"}
            >
              {data.verificationResult}
            </Tag>
          </Col>
        </Row>

        {data.verificationResultDetails && (
          <div className="mt-4">
            <Text strong>Detailed Checks:</Text>
            <Row gutter={[16, 8]} className="mt-2">
              {Object.entries(data.verificationResultDetails).map(
                ([key, value]) => (
                  <Col span={12} key={key}>
                    <div className="flex justify-between items-center">
                      <Text className="text-sm">
                        {key
                          .replace("Decision_", "")
                          .replace(/([A-Z])/g, " $1")
                          .trim()}
                        :
                      </Text>
                      <Tag
                        size="small"
                        color={
                          value.DecisionResult === "OK" ? "success" : "warning"
                        }
                      >
                        {value.DecisionResult}
                      </Tag>
                    </div>
                  </Col>
                )
              )}
            </Row>
          </div>
        )}
      </Card>

      {personalData && (
        <Card size="small" title="Extracted Personal Information">
          <Descriptions size="small" column={2}>
            <Descriptions.Item label="Full Name">
              {personalData.name}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {personalData.dob}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {personalData.gender}
            </Descriptions.Item>
            {personalData.address && (
              <Descriptions.Item label="Address" span={2}>
                {personalData.address}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {idData && (
        <Card size="small" title="ID Document Information">
          <Descriptions
            size="small"
            column={2}
            style={{ marginBottom: 5, marginTop: 5 }}
          >
            <Descriptions.Item label="ID Type">
              {idData.idType}
            </Descriptions.Item>
            <Descriptions.Item label="ID Number">
              {idData.idNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Secondary ID Number">
              {idData.idNumber2}
            </Descriptions.Item>
            <Descriptions.Item label="Id Issue Country">
              {idData.idIssueCountry}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {idData.idDateOfBirth}
            </Descriptions.Item>
            <Descriptions.Item label="Issue Date">
              {idData.idIssueDate}
            </Descriptions.Item>
            <Descriptions.Item label="Expiration Date">
              {idData.idExpirationDate}
            </Descriptions.Item>
            <Descriptions.Item label="Nationality">
              {idData.nationality}
            </Descriptions.Item>
            <Descriptions.Item label="Age Over 18">
              <Badge
                status={
                  calculateAgeOver18(idData.idDateOfBirth) === "Y"
                    ? "success"
                    : calculateAgeOver18(idData.idDateOfBirth) === "N"
                    ? "error"
                    : "default"
                }
                text={
                  calculateAgeOver18(idData.idDateOfBirth) === "Y"
                    ? "Yes"
                    : calculateAgeOver18(idData.idDateOfBirth) === "N"
                    ? "No"
                    : "Unknown"
                }
              />
            </Descriptions.Item>
            <Descriptions.Item label="ID Not Expired">
              <Badge
                status={idData.idNotExpired === "Y" ? "success" : "error"}
                text={idData.idNotExpired === "Y" ? "Valid" : "Expired"}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Valid ID Number">
              <Badge
                status={idData.validIdNumber === "Y" ? "success" : "error"}
                text={idData.validIdNumber === "Y" ? "Valid" : "Invalid"}
              />
            </Descriptions.Item>

            <Descriptions.Item label="Registration Date">
              {idData.registrationDate}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {result.imagesUrls && result.imagesUrls.length > 0 && (
        <Card size="small" title="ID Verification Images">
          <ImageGallery
            images={result.imagesUrls || []}
            verificationType={"id"}
          />
        </Card>
      )}
    </Space>
  );
};

export default IdVerificationDetails;
