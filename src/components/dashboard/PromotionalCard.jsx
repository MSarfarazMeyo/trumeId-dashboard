import { Card, Button } from "antd";
import SliderMoon from "../../assets/svg/SliderMoon";

const PromotionalCard = () => {
  return (
    <div className="flex flex-wrap gap-6 mb-8 justify-start">
      <Card
        className="max-w-[548px] flex-1 min-h-[146px] shadow-sm hover:shadow-md transition-shadow"
        style={{
          borderRadius: "16px", // <-- Apply to outer Card
          overflow: "hidden", // <-- Ensure child respects borderRadius
        }}
        bodyStyle={{
          padding: "24px",
          height: "100%",
          background: "#6A36FF",
          borderRadius: "16px", // Optional: also add to body if needed
        }}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Promotion Slider{" "}
            </h3>
          </div>
          <div className="flex-grow flex-1 flex items-center justify-end gap-16">
            <Button
              type="primary"
              className="w-full "
              onClick={() => setIsModalOpen(true)}
              style={{
                background: "#FFA800",
                color: "#fff",
                border: "none",
                height: "48px",
                width: "193px",
                borderRadius: "1rem",
                alignSelf: "end",
              }}
            >
              Upgrade Premium
            </Button>

            <SliderMoon />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PromotionalCard;
