import { Result, Button } from "antd";
import { useNavigate } from "react-router";

const ActivityComingSoon = () => {
  const navigate = useNavigate();

  return (
    <Result
      status="info"
      title="Activity Page is Coming Soon!"
      subTitle="We're working to get this ready. Please check back later."
      extra={
        <Button type="primary" onClick={() => navigate("/client")}>
          Back to Dashboard
        </Button>
      }
    />
  );
};

export default ActivityComingSoon;
