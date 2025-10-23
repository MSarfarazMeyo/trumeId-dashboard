import React, { useEffect, useMemo, useRef, useState } from "react";
import { getApplicantFulDetails } from "../../../services/applicantDocResults";
import {
  Spin,
  Card,
  Row,
  Col,
  Tag,
  Timeline,
  Alert,
  Badge,
  Typography,
  Space,
  Button,
  Collapse,
  message,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  FileTextOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";
import VerificationResults from "./verificationResult/VerificationResults";
import { BiArrowBack } from "react-icons/bi";
import PDFExportButton from "../../../components/PDFExportApplicantDetailButton";
import { useCreateOrUpdateVerificationResult } from "../../../hooks/useApplicants";
import { useUploadFile } from "../../../hooks/useUploadFile";
import NotesComponent from "../../../components/NotesComponent";
import { VerificationType } from "../../../types";
import { colors } from "../../../constants/brandConfig";

const { Title, Text } = Typography;
const { Panel } = Collapse;

// IP Geolocation service function
const getIPLocation = async (ip) => {
  try {
    // Using ipapi.co as an example - you can replace with your preferred service
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) {
      throw new Error("Failed to fetch IP location");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching IP location:", error);
    return null;
  }
};

const ApplicantDetailPage = () => {
  const { mutate: uploadFile, isPending: isUploadPending } = useUploadFile();
  const { mutateAsync: createOrUpdateNote } =
    useCreateOrUpdateVerificationResult();

  const { id } = useParams(); // 👈 get ID from route
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ipLocation, setIpLocation] = useState(null);
  const [ipLocationLoading, setIpLocationLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      setError("No applicant ID provided");
      setLoading(false);
      return;
    }

    const fetchDetails = async () => {
      try {
        const data = await getApplicantFulDetails(id); // 👈 use ID from URL
        setApplicant(data);

        // Get IP from applicant data or ID document verification
        const clientIdDocument = data?.verificationResults?.find(
          (item) => item.verificationType === VerificationType.ID
        );

        const ipAddress =
          data?.applicant?.ip ||
          clientIdDocument?.rawResponse?.status?.ipAddress;

        // Fetch IP location if IP exists
        if (ipAddress) {
          setIpLocationLoading(true);
          const locationData = await getIPLocation(ipAddress);
          setIpLocation(locationData);
          setIpLocationLoading(false);
        }
      } catch (err) {
        setError("Failed to fetch applicant details");
        setIpLocationLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "verified":
        return <CheckCircleOutlined />;
      case "pending":
        return <ClockCircleOutlined />;
      case "failed":
        return <ExclamationCircleOutlined />;
      default:
        return <ClockCircleOutlined />;
    }
  };

  const getVerificationIcon = (type) => {
    switch (type) {
      case "email":
        return <MailOutlined />;
      case "phone":
        return <PhoneOutlined />;
      case "face":
        return <CameraOutlined />;
      case "idDocument":
        return <IdcardOutlined />;
      case "document":
        return <FileTextOutlined />;
      case "riskEvaluation":
        return <FileTextOutlined />;
      case "sanctionEvaluation":
        return <WarningOutlined />;
      default:
        return <UserOutlined />;
    }
  };

  const formatVerificationType = (type) => {
    switch (type) {
      case "email":
        return "Email Verification";
      case "phone":
        return "Phone Verification";
      case "selfie":
        return "Face Verification";
      case "idDocument":
        return "ID Verification";
      case "proofOfAddress":
        return "Proof Of Address Verification";
      case "riskEvaluation":
        return "Risk Assessment";
      case "sanctionEvaluation":
        return "Sanction Screening";
      default:
        return type?.charAt(0)?.toUpperCase() + type?.slice(1);
    }
  };

  const renderLocationInfo = () => {
    const clientIdDocument = applicant?.verificationResults?.find(
      (item) => item.verificationType === VerificationType.ID
    );

    const ipAddress =
      applicant?.applicant?.ip ||
      clientIdDocument?.rawResponse?.status?.ipAddress;

    if (!ipAddress) return null;

    return (
      <Card title="Location Information" className="h-full">
        <Space direction="vertical" size="middle" className="w-full">
          <div>
            <Text strong>IP Address: </Text>
            <Text copyable code>
              {ipAddress}
            </Text>
          </div>

          {ipLocationLoading && (
            <div className="flex items-center gap-2">
              <Spin size="small" />
              <Text type="secondary">Loading location data...</Text>
            </div>
          )}

          {ipLocation && !ipLocationLoading && (
            <>
              {ipLocation.country_name && (
                <div>
                  <Text strong>Country: </Text>
                  <Text>{ipLocation.country_name}</Text>
                  {ipLocation.country_code && (
                    <Tag className="ml-2">{ipLocation.country_code}</Tag>
                  )}
                </div>
              )}

              {ipLocation.region && (
                <div>
                  <Text strong>State/Region: </Text>
                  <Text>{ipLocation.region}</Text>
                </div>
              )}

              {ipLocation.city && (
                <div>
                  <Text strong>City: </Text>
                  <Text>{ipLocation.city}</Text>
                </div>
              )}

              {ipLocation.latitude && ipLocation.longitude && (
                <div>
                  <Text strong>Coordinates: </Text>
                  <Text
                    copyable
                  >{`${ipLocation.latitude}, ${ipLocation.longitude}`}</Text>
                </div>
              )}
            </>
          )}

          {!ipLocation && !ipLocationLoading && ipAddress && (
            <Alert
              message="Location information unavailable"
              type="warning"
              size="small"
            />
          )}
        </Space>
      </Card>
    );
  };

  const renderVerificationTimeline = () => {
    const sortedVerifications =
      applicant?.applicant?.requiredVerifications?.sort(
        (a, b) => a.order - b.order
      ) || [];

    return (
      <Timeline>
        {sortedVerifications.map((verification) => (
          <Timeline.Item
            key={verification._id}
            dot={getStatusIcon(verification.status)}
            color={getStatusColor(verification.status)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getVerificationIcon(verification.verificationType)}
                <span className="font-medium">
                  {formatVerificationType(verification.verificationType)}
                </span>
              </div>
              <Tag color={getStatusColor(verification.status)}>
                {verification.status?.toUpperCase()}
              </Tag>
            </div>
          </Timeline.Item>
        ))}
      </Timeline>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="p-4">
        <Alert
          message="No Data"
          description="Applicant details not found"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  const { applicant: applicantData } = applicant;

  const hasClientNotes = applicant?.verificationResults?.some(
    (item) => item.verificationType === VerificationType.CLIENT_NOTES
  );

  const clientIdDocument = applicant?.verificationResults?.find(
    (item) => item.verificationType === VerificationType.ID
  );

  const totalCount =
    (applicant?.verificationResults?.length || 0) - (hasClientNotes ? 1 : 0);

  // Determine grid layout based on whether IP exists
  const hasIP =
    applicant?.applicant?.ip ||
    clientIdDocument?.rawResponse?.status?.ipAddress;
  const basicInfoColSpan = hasIP ? { xs: 24, lg: 8 } : { xs: 24, lg: 12 };
  const timelineColSpan = hasIP ? { xs: 24, lg: 8 } : { xs: 24, lg: 12 };
  const locationColSpan = { xs: 24, lg: 8 };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start my-8">
        <div className="">
          <div className="flex gap-4 items-center mb-1">
            <div
              className="cursor-pointer p-1"
              onClick={() => navigate("/client/users")}
            >
              <BiArrowBack />
            </div>

            <span level={2} className=" text-2xl  font-semibold ">
              <UserOutlined className="mr-1 " />
              Applicant Details /
            </span>
            <span
              style={{
                color: colors.primaryDark,
              }}
            >
              {applicant?.applicant?.name}
            </span>
          </div>

          <Text type="secondary" className="text-[#838799] pl-8">
            <span className="text-[black]"> Application ID: </span>
            {applicant?.applicant?._id}
          </Text>

          <Text type="secondary" className="text-[#838799 ml-4]">
            <span className="text-[black]"> Submitted At: </span>
            {dayjs(applicantData.updatedAt).format("MMMM DD, YYYY HH:mm")}
          </Text>
        </div>

        <div className="flex gap-2">
          {applicant && <PDFExportButton applicant={applicant} />}
        </div>
      </div>

      <div className="py-12">
        {applicant && (
          <NotesComponent
            applicantId={id}
            applicant={applicant}
            uploadFile={uploadFile}
            createOrUpdateNote={createOrUpdateNote}
            isUploadPending={isUploadPending}
          />
        )}
      </div>

      <Row gutter={[24, 24]}>
        <Col {...basicInfoColSpan}>
          <Card title="Basic Information" className="h-full">
            <Space direction="vertical" size="middle" className="w-full">
              <div>
                <Text strong>Name: </Text>
                <Text>{applicantData.name}</Text>
              </div>
              <div>
                <Text strong>Email: </Text>
                <Text copyable>{applicantData.email}</Text>
              </div>
              <div>
                <Text strong>Phone: </Text>
                <Text copyable>{applicantData.phone}</Text>
              </div>
              <div>
                <Text strong>Applicant ID: </Text>
                <Text copyable code>
                  {applicantData._id}
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        {hasIP && <Col {...locationColSpan}>{renderLocationInfo()}</Col>}

        <Col {...timelineColSpan}>
          <Card title="Verification Progress">
            {renderVerificationTimeline()}
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            title="Detailed Verification Results"
            extra={
              <Badge
                count={totalCount || 0}
                style={{ backgroundColor: "#52c41a" }}
              />
            }
          >
            {applicant && applicant?.applicant && (
              <VerificationResults
                applicantId={applicant.applicant._id}
                requiredVerifications={
                  applicant?.verificationResults?.length
                    ? applicant.verificationResults
                        .filter(
                          (item) =>
                            item.verificationType !==
                            VerificationType.CLIENT_NOTES
                        )
                        .map((item) => item.verificationType)
                    : []
                }
              />
            )}{" "}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ApplicantDetailPage;
