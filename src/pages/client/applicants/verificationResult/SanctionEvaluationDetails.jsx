import {
  Card,
  Row,
  Col,
  Tag,
  Descriptions,
  Alert,
  Badge,
  Typography,
  Space,
  Collapse,
  List,
  Divider,
} from "antd";
import {
  UserOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  FlagOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const SanctionEvaluationDetails = ({ result }) => {
  console.log("result", result);

  const rawResponse = result?.rawResponse;
  if (!rawResponse) return null;

  // Check if there's an error in the response
  if (rawResponse.error && rawResponse.message) {
    const formatErrorMessage = (errorMessage) => {
      if (typeof errorMessage === "string") {
        // Handle specific error patterns
        if (errorMessage.includes("Token generation failed")) {
          const match = errorMessage.match(/401 ({.*})/);
          if (match) {
            try {
              const errorData = JSON.parse(match[1]);
              return (
                <div>
                  <Text strong>Authentication Error</Text>
                  <br />
                  <Text>
                    {errorData.data?.error_message || "Authentication failed"}
                  </Text>
                  <br />
                  <Text type="secondary">Status: {errorData.status}</Text>
                </div>
              );
            } catch (e) {
              // If JSON parsing fails, return the original message
              return <Text>{errorMessage}</Text>;
            }
          }
        }
        return <Text>{errorMessage}</Text>;
      }
      return <Text>{JSON.stringify(errorMessage)}</Text>;
    };

    return (
      <Space direction="vertical" size="middle" className="w-full">
        <Card size="small">
          <Alert
            message="Sanction Evaluation Failed"
            description={
              <div>
                <Text strong>Status Code: {rawResponse.statusCode}</Text>
                <Divider />
                <div>
                  <Text strong>Error Details:</Text>
                  <div style={{ marginTop: "12px" }}>
                    {formatErrorMessage(rawResponse.message)}
                  </div>
                </div>
              </div>
            }
            type="error"
            icon={<CloseCircleOutlined />}
            showIcon
          />
        </Card>

        <Card size="small" title="Assessment Information">
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Assessment Date">
              {dayjs(result.createdAt).format("MMMM DD, YYYY HH:mm:ss")}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color="red" icon={<CloseCircleOutlined />}>
                FAILED
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Error Type">
              <Text>
                {rawResponse.message?.includes("Token generation failed")
                  ? "Authentication Error"
                  : "Service Error"}
              </Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    );
  }

  const data = rawResponse?.data;
  if (!data) return null;

  const sanctionResults = data.results || [];

  console.log("sanctionResults", sanctionResults.length);

  return (
    <Space direction="vertical" size="middle" className="w-full">
      {/* Case Overview */}
      <Card size="small" title="Sanction Screening Overview">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <div className="text-center">
              <Text strong>Case Status</Text>
              <div className="mt-1">
                <Tag
                  color={
                    data.case_status === "Failed"
                      ? "error"
                      : data.case_status === "Passed"
                      ? "success"
                      : "warning"
                  }
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  <ExclamationCircleOutlined className="mr-1" />
                  {data.case_status?.toUpperCase()}
                </Tag>
              </div>
            </div>
          </Col>

          <Col span={8}>
            <div className="text-center">
              <Text strong>Match Status</Text>
              <div className="mt-1">
                <Tag
                  color={
                    data.match_status === "Potential Match"
                      ? "warning"
                      : data.match_status === "No Match"
                      ? "success"
                      : "error"
                  }
                  style={{ fontSize: "14px", padding: "4px 12px" }}
                >
                  <FlagOutlined className="mr-1" />
                  {data.match_status?.toUpperCase()}
                </Tag>
              </div>
            </div>
          </Col>

          <Col span={8}>
            <div className="text-center">
              <Text strong>Total Matches</Text>
              <div className="mt-1">
                <Badge
                  count={sanctionResults.length}
                  showZero
                  style={{
                    backgroundColor: sanctionResults.length
                      ? "#f5222d"
                      : "#52c41a",
                    fontSize: "14px",
                    padding: "0px 8px",
                  }}
                />
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Sanction Results */}
      {sanctionResults.length > 0 && (
        <Card
          size="small"
          title={
            <span>
              <WarningOutlined className="mr-2" style={{ color: "#f5222d" }} />
              Sanction Matches Found ({sanctionResults.length})
            </span>
          }
        >
          <Space direction="vertical" size="large" className="w-full">
            {sanctionResults.map((sanctionResult, index) => (
              <Card
                key={sanctionResult.id || index}
                type="inner"
                size="small"
                title={
                  <div className="flex items-center justify-between">
                    <span>
                      <UserOutlined className="mr-2" />
                      {sanctionResult.name}
                    </span>
                    <Space>
                      <Tag
                        color={
                          sanctionResult.risk_level === "High"
                            ? "error"
                            : sanctionResult.risk_level === "Medium"
                            ? "warning"
                            : "success"
                        }
                      >
                        {sanctionResult.risk_level} Risk
                      </Tag>
                      <Tag color="volcano">
                        Score: {sanctionResult.risk_score}
                      </Tag>
                    </Space>
                  </div>
                }
              >
                <Row gutter={[16, 16]}>
                  {/* Basic Information */}
                  <Col span={24}>
                    <Descriptions size="small" column={2} bordered>
                      <Descriptions.Item label="Match Status">
                        <Tag
                          color={
                            sanctionResult.match_status === "Potential Match"
                              ? "warning"
                              : "error"
                          }
                        >
                          {sanctionResult.match_status}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Risk Decision">
                        <Tag
                          color={
                            sanctionResult.risk_decision === "Failed"
                              ? "error"
                              : "success"
                          }
                        >
                          {sanctionResult.risk_decision}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Entity Types">
                        {sanctionResult.entity_types?.length > 0 ? (
                          <Space wrap>
                            {sanctionResult.entity_types.map((type, idx) => (
                              <Tag key={idx} color="blue">
                                {type}
                              </Tag>
                            ))}
                          </Space>
                        ) : (
                          <Text type="secondary">
                            No entity types specified
                          </Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Categories">
                        {sanctionResult.categories?.length > 0 ? (
                          <Space wrap>
                            {sanctionResult.categories.map((category, idx) => (
                              <Tag key={idx} color="red">
                                {category}
                              </Tag>
                            ))}
                          </Space>
                        ) : (
                          <Text type="secondary">No categories specified</Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Countries">
                        {sanctionResult.countries?.length > 0 ? (
                          <Space wrap>
                            {sanctionResult.countries.map((country, idx) => (
                              <Tag key={idx} color="green">
                                {country}
                              </Tag>
                            ))}
                          </Space>
                        ) : (
                          <Text type="secondary">No countries specified</Text>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Created">
                        {sanctionResult.created_at}
                      </Descriptions.Item>
                    </Descriptions>
                  </Col>

                  {/* Matched Names */}
                  {sanctionResult.matched_names?.length > 0 && (
                    <Col span={24}>
                      <Card size="small" title="Name Matches">
                        <List
                          size="small"
                          dataSource={sanctionResult.matched_names}
                          renderItem={(match, idx) => (
                            <List.Item>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  <Text strong>{match.matched_name}</Text>
                                  <br />
                                  <Text type="secondary">
                                    Record ID: {match.record_id}
                                  </Text>
                                </div>
                                <Tag color="orange">
                                  Match Score: {match.score}%
                                </Tag>
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  )}

                  {/* Summary Information */}
                  {sanctionResult.data?.summary && (
                    <Col span={24}>
                      <Card size="small" title="Summary Information">
                        <Descriptions size="small" column={1}>
                          {sanctionResult.data.summary.name?.length > 0 && (
                            <Descriptions.Item label="Names">
                              <Space wrap>
                                {sanctionResult.data.summary.name.map(
                                  (name, idx) => (
                                    <Tag key={idx}>{name}</Tag>
                                  )
                                )}
                              </Space>
                            </Descriptions.Item>
                          )}
                          {sanctionResult.data.summary.address?.length > 0 && (
                            <Descriptions.Item label="Addresses">
                              <Space wrap>
                                {sanctionResult.data.summary.address.map(
                                  (addr, idx) => (
                                    <Tag key={idx} color="cyan">
                                      {addr}
                                    </Tag>
                                  )
                                )}
                              </Space>
                            </Descriptions.Item>
                          )}
                          {sanctionResult.data.summary.entity_type?.length >
                            0 && (
                            <Descriptions.Item label="Entity Type">
                              <Space wrap>
                                {sanctionResult.data.summary.entity_type.map(
                                  (type, idx) => (
                                    <Tag key={idx} color="purple">
                                      {type}
                                    </Tag>
                                  )
                                )}
                              </Space>
                            </Descriptions.Item>
                          )}
                        </Descriptions>
                      </Card>
                    </Col>
                  )}

                  {/* Sanction Details */}
                  {sanctionResult.data?.sanction_details?.length > 0 && (
                    <Col span={24}>
                      <Card size="small" title="Sanction Details">
                        <List
                          size="small"
                          dataSource={sanctionResult.data.sanction_details}
                          renderItem={(sanction, idx) => (
                            <List.Item>
                              <div className="w-full">
                                <Descriptions size="small" column={1}>
                                  {sanction.sanction_list?.length > 0 && (
                                    <Descriptions.Item label="Sanction Lists">
                                      <Space wrap>
                                        {sanction.sanction_list.map(
                                          (list, listIdx) => (
                                            <Tag key={listIdx} color="volcano">
                                              {list}
                                            </Tag>
                                          )
                                        )}
                                      </Space>
                                    </Descriptions.Item>
                                  )}
                                  {sanction.sanctioning_authority?.length >
                                    0 && (
                                    <Descriptions.Item label="Sanctioning Authority">
                                      <Space wrap>
                                        {sanction.sanctioning_authority.map(
                                          (auth, authIdx) => (
                                            <Tag key={authIdx} color="magenta">
                                              {auth}
                                            </Tag>
                                          )
                                        )}
                                      </Space>
                                    </Descriptions.Item>
                                  )}
                                  {sanction.status?.length > 0 && (
                                    <Descriptions.Item label="Status">
                                      <Space wrap>
                                        {sanction.status.map(
                                          (status, statusIdx) => (
                                            <Tag
                                              key={statusIdx}
                                              color={
                                                status === "Denotified"
                                                  ? "green"
                                                  : "red"
                                              }
                                            >
                                              {status}
                                            </Tag>
                                          )
                                        )}
                                      </Space>
                                    </Descriptions.Item>
                                  )}
                                </Descriptions>
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  )}

                  {/* Identification Documents */}
                  {sanctionResult.data?.identification_documents?.length >
                    0 && (
                    <Col span={24}>
                      <Card size="small" title="Identification Documents">
                        <List
                          size="small"
                          dataSource={
                            sanctionResult.data.identification_documents
                          }
                          renderItem={(doc, idx) => (
                            <List.Item>
                              <div className="w-full">
                                {doc.cnic_number?.length > 0 && (
                                  <div>
                                    <Text strong>CNIC Numbers: </Text>
                                    <Space wrap>
                                      {doc.cnic_number.map((cnic, cnicIdx) => (
                                        <Tag key={cnicIdx} color="geekblue">
                                          {cnic}
                                        </Tag>
                                      ))}
                                    </Space>
                                  </div>
                                )}
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  )}

                  {/* Linked Entities */}
                  {sanctionResult.data?.linked_entities?.length > 0 && (
                    <Col span={24}>
                      <Card size="small" title="Linked Entities">
                        <List
                          size="small"
                          dataSource={sanctionResult.data.linked_entities}
                          renderItem={(entity, idx) => (
                            <List.Item>
                              <div className="flex items-center justify-between w-full">
                                <div>
                                  {entity.name?.length > 0 && (
                                    <div>
                                      <Text strong>Names: </Text>
                                      <Space wrap>
                                        {entity.name.map((name, nameIdx) => (
                                          <Tag key={nameIdx}>{name}</Tag>
                                        ))}
                                      </Space>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  {entity.relation?.length > 0 && (
                                    <div>
                                      <Text strong>Relation: </Text>
                                      <Space wrap>
                                        {entity.relation.map((rel, relIdx) => (
                                          <Tag key={relIdx} color="lime">
                                            {rel}
                                          </Tag>
                                        ))}
                                      </Space>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  )}

                  {/* Adverse Media */}
                  {sanctionResult.adverse_media?.length > 0 && (
                    <Col span={24}>
                      <Card size="small" title="Adverse Media">
                        <List
                          size="small"
                          dataSource={sanctionResult.adverse_media}
                          renderItem={(media, idx) => (
                            <List.Item>
                              <Text>{media}</Text>
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  )}

                  {/* Legal Notice */}
                  {sanctionResult.data?.legal_notice && (
                    <Col span={24}>
                      <Alert
                        message="Legal Notice"
                        description={sanctionResult.data.legal_notice}
                        type="info"
                        showIcon
                        style={{ fontSize: "12px" }}
                      />
                    </Col>
                  )}
                </Row>
              </Card>
            ))}
          </Space>
        </Card>
      )}

      {/* No Matches Found */}
      {sanctionResults.length === 0 && (
        <Card size="small">
          <div className="text-center py-8">
            <CheckCircleOutlined
              style={{
                fontSize: "48px",
                color: "#52c41a",
                marginBottom: "16px",
              }}
            />
            <Title level={4} style={{ color: "#52c41a" }}>
              No Sanction Matches Found
            </Title>
            <Text type="secondary">
              This applicant does not match any entries in the sanction
              databases.
            </Text>
          </div>
        </Card>
      )}

      {/* Pagination Info */}
      {data.pagination && (
        <Card size="small" title="Search Summary">
          <Descriptions size="small" column={4}>
            <Descriptions.Item label="Total Records">
              {data.pagination.total_records}
            </Descriptions.Item>
            <Descriptions.Item label="Current Page">
              {data.pagination.current_page}
            </Descriptions.Item>
            <Descriptions.Item label="Total Pages">
              {data.pagination.total_pages}
            </Descriptions.Item>
            <Descriptions.Item label="Records Per Page">
              {data.pagination.records_per_page}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </Space>
  );
};

export default SanctionEvaluationDetails;
