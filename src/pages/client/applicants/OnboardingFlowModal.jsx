import React, { useEffect, useState, useMemo, useContext } from "react";
import {
  Checkbox,
  Divider,
  Switch,
  Tabs,
  Tooltip,
  Modal,
  Button,
  Spin,
  message,
  Select,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiShield,
  FiInfo,
  FiLock,
  FiAlertCircle,
} from "react-icons/fi";
import appContext from "../../../context/appContext";

import { VerificationType } from "../../../types";
import { useCreateFlow } from "../../../hooks/useFlows";
import { useNavigate, useSearchParams } from "react-router";

// Define verification types enum

// All available verification type options
const allVerificationOptions = [
  {
    key: VerificationType.ID,
    label: "Identity Document",
    description: "ID card • Passport • Residence permit • Driver's license",
  },
  {
    key: VerificationType.FACE,
    label: "Selfie",
    description: "Face verification selfie",
  },
  {
    key: VerificationType.EMAIL,
    label: "Email Verification",
    description: "Email address verification",
  },
  {
    key: VerificationType.PHONE,
    label: "Phone Verification",
    description: "Phone number verification",
  },
  {
    key: VerificationType.POA,
    label: "POA Verification",
    description: "Proof of address document",
  },
];

const OnboardingFlowModal = ({ isModalOpen, setIsModalOpen }) => {
  const { user } = useContext(appContext);

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const hasNewApplicant = searchParams.has("newFlow");

  const [selectedVerifications, setSelectedVerifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [riskEnabled, setRiskEnabled] = useState(false);
  const [sanctionsEnabled, setSanctionsEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState(0);
  const [sanctionsLevel, setSanctionsLevel] = useState(0);
  const [flowName, setFlowName] = useState("");
  const [flowDescription, setFlowDescription] = useState("");
  const [flowMaxUses, setFlowMaxUses] = useState();
  const { mutate: createFlow, isLoading, isError, error } = useCreateFlow();

  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const selectedPlan = useMemo(() => {
    if (!selectedPlanId || !user?.subscriptionPlans) {
      return null;
    }
    return user.subscriptionPlans.find((plan) => plan._id === selectedPlanId);
  }, [selectedPlanId, user?.subscriptionPlans]);

  // Get available verification options based on selected subscription plan
  const availableVerificationOptions = useMemo(() => {
    if (!selectedPlan?.intakeModules) {
      return [];
    }

    const intakeModules = selectedPlan.intakeModules;

    // Filter verification options based on intakeModules
    return allVerificationOptions.filter((option) =>
      intakeModules.includes(option.key)
    );
  }, [selectedPlan?.intakeModules]);

  // Check if risk and sanctions are available based on plan defaults
  const isRiskAvailable = useMemo(() => {
    return selectedPlan?.defaults?.riskLevel > 0;
  }, [selectedPlan?.defaults?.riskLevel]);

  const isSanctionsAvailable = useMemo(() => {
    return selectedPlan?.defaults?.sanctionsLevel > 0;
  }, [selectedPlan?.defaults?.sanctionsLevel]);

  // Check if required verifications are selected for risk and sanctions
  const canEnableRisk = useMemo(() => {
    return (
      selectedVerifications.includes(VerificationType.ID) &&
      selectedVerifications.includes(VerificationType.EMAIL)
    );
  }, [selectedVerifications]);

  const canEnableSanctions = useMemo(() => {
    return selectedVerifications.includes(VerificationType.ID);
  }, [selectedVerifications]);

  // Get maximum allowed levels
  const maxRiskLevel = selectedPlan?.defaults?.riskLevel || 0;
  const maxSanctionsLevel = selectedPlan?.defaults?.sanctionsLevel || 0;

  // Initialize with the first available subscription plan or current subscription plan
  useEffect(() => {
    if (user?.subscriptionPlans?.length > 0 && !selectedPlanId) {
      // Try to use the current subscriptionPlan if it exists in the array
      const currentPlan = user.subscriptionPlans.find(
        (plan) => plan._id === user.subscriptionPlan
      );

      if (currentPlan) {
        setSelectedPlanId(currentPlan._id);
      } else {
        // Fallback to the first plan in the array
        setSelectedPlanId(user.subscriptionPlans[0]._id);
      }
    }
  }, [user?.subscriptionPlans, user?.subscriptionPlan, selectedPlanId]);

  // Set default selected verifications based on available options
  useEffect(() => {
    if (availableVerificationOptions.length > 0) {
      const defaultSelections = availableVerificationOptions.map(
        (option) => option.key
      );
      setSelectedVerifications(defaultSelections);
    }

    // Initialize risk and sanctions based on plan defaults
    if (selectedPlan?.defaults) {
      const { riskLevel: defaultRisk, sanctionsLevel: defaultSanctions } =
        selectedPlan.defaults;

      // Only enable if default level is greater than 0
      setRiskEnabled(defaultRisk > 0);
      setSanctionsEnabled(defaultSanctions > 0);

      // Set levels to plan defaults
      setRiskLevel(defaultRisk);
      setSanctionsLevel(defaultSanctions);
    }
  }, [availableVerificationOptions, selectedPlan?.defaults]);

  // Auto-disable risk/sanctions when required verifications are deselected
  useEffect(() => {
    if (!canEnableRisk && riskEnabled) {
      setRiskEnabled(false);
      setRiskLevel(0);
    }
    if (!canEnableSanctions && sanctionsEnabled) {
      setSanctionsEnabled(false);
      setSanctionsLevel(0);
    }
  }, [canEnableRisk, canEnableSanctions, riskEnabled, sanctionsEnabled]);

  const handleVerificationChange = (checkedValues) => {
    setSelectedVerifications(checkedValues);
  };

  const handlePlanChange = (planId) => {
    setSelectedPlanId(planId);
    // Reset verifications and settings when plan changes
    setSelectedVerifications([]);
    setRiskEnabled(false);
    setSanctionsEnabled(false);
    setRiskLevel(0);
    setSanctionsLevel(0);
  };

  const handleRiskToggle = (enabled) => {
    if (!isRiskAvailable || !canEnableRisk) return;

    setRiskEnabled(enabled);
    if (!enabled) {
      setRiskLevel(0);
    } else {
      // Set to plan default when enabling
      setRiskLevel(maxRiskLevel);
    }
  };

  const handleSanctionsToggle = (enabled) => {
    if (!isSanctionsAvailable || !canEnableSanctions) return;

    setSanctionsEnabled(enabled);
    if (!enabled) {
      setSanctionsLevel(0);
    } else {
      // Set to plan default when enabling
      setSanctionsLevel(maxSanctionsLevel);
    }
  };

  const createApplicant = async () => {
    try {
      setLoading(true);

      if (selectedVerifications.length === 0) {
        message.error("Please select at least one verification type");
        return;
      }

      if (!selectedPlanId) {
        message.error("Please select a subscription plan");
        return;
      }

      // Prepare verification data with order
      const requiredVerifications = selectedVerifications.map(
        (verificationType, index) => ({
          verificationType,
          status: "pending", // Default status
        })
      );

      const verificationConfig = {
        riskLevel: riskEnabled ? riskLevel : 0,
        sanctionsLevel: sanctionsEnabled ? sanctionsLevel : 0,
      };

      const applicantData = {
        name: flowName,
        description: flowDescription,
        maxUses: flowMaxUses,
        requiredVerifications,
        verificationConfig,
        subscriptionPlan: selectedPlanId, // Add the selected subscription plan ID
      };

      createFlow(applicantData, {
        onSuccess: (response) => {
          console.log("Flow created successfully:", response);
          setIsModalOpen(false);
        },
        onError: (err) => {
          console.error("Error creating flow:", err);
          // Optional: show error notification
        },
      });
    } catch (error) {
      console.error("Error creating applicant:", error);
      message.error("Failed to create applicant");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    // Reset to defaults when closing
    if (selectedPlan?.defaults) {
      const { riskLevel: defaultRisk, sanctionsLevel: defaultSanctions } =
        selectedPlan.defaults;
      setRiskEnabled(defaultRisk > 0);
      setSanctionsEnabled(defaultSanctions > 0);
      setRiskLevel(defaultRisk);
      setSanctionsLevel(defaultSanctions);
    }

    setIsModalOpen(false);
    hasNewApplicant && navigate(`/client/flows`);
  };

  // Modal content for no subscription plans
  const renderNoSubscriptionPlansContent = () => (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">
        No subscription plans are available for your account.
      </p>
      <p className="text-sm text-gray-500">
        Please contact support to add subscription plans to your account.
      </p>
    </div>
  );

  // Modal content for no verification options
  const renderNoVerificationContent = () => (
    <div className="text-center py-8">
      <p className="text-gray-600 mb-4">
        No verification modules are available in the selected subscription plan.
      </p>
      <p className="text-sm text-gray-500">
        Please select a different plan or contact support to upgrade your plan.
      </p>
    </div>
  );

  // Modal content for creating new applicant

  const renderCreateApplicantContent = () => (
    <div className="max-h-[70vh] overflow-y-auto px-1 ">
      {/* Two Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Flow Details Section */}
          <div>
            <h4 className="font-bold text-sm mb-3">Flow Details</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="border p-2 rounded w-full text-sm"
                maxLength={50}
              />

              <textarea
                placeholder="Description"
                value={flowDescription}
                onChange={(e) => setFlowDescription(e.target.value)}
                className="border p-2 rounded w-full text-sm"
                rows={2}
                maxLength={200}
              />

              <div>
                <input
                  type="number"
                  placeholder="Max Uses for This Flow"
                  value={flowMaxUses}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= user.transactionsRemaining || val) {
                      setFlowMaxUses(val);
                    }
                  }}
                  className="border p-2 rounded w-full text-sm"
                  min={1}
                />
                <small className="text-gray-500 text-xs">
                  You have {user.transactionsRemaining} transactions available.
                </small>
              </div>
            </div>
          </div>

          {/* Additional Options Header */}
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm">Additional Options</h4>
            <Tooltip title="Depends on plan level and selected verifications">
              <FiInfo className="text-gray-400 cursor-help text-xs" />
            </Tooltip>
          </div>

          {/* Risk Analysis Card */}
          <div
            className={`border rounded-lg p-3 transition-all ${
              isRiskAvailable && canEnableRisk
                ? "border-gray-200 bg-white"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FiShield
                  className={`text-sm ${
                    isRiskAvailable && canEnableRisk
                      ? "text-blue-500"
                      : "text-gray-400"
                  }`}
                />
                <span
                  className={`font-semibold text-xs ${
                    isRiskAvailable && canEnableRisk
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  🛡️ Fraud Prevention
                </span>
                {(!isRiskAvailable || !canEnableRisk) && (
                  <Tooltip
                    title={
                      !isRiskAvailable
                        ? "Not available in selected plan"
                        : "Requires ID Document + Email verification"
                    }
                  >
                    <FiLock className="text-gray-400 text-xs cursor-help" />
                  </Tooltip>
                )}
              </div>

              <Switch
                checked={isRiskAvailable && canEnableRisk ? riskEnabled : false}
                onChange={handleRiskToggle}
                disabled={!isRiskAvailable || !canEnableRisk}
                size="small"
              />
            </div>

            {/* Risk Requirements Warning */}
            {isRiskAvailable && !canEnableRisk && (
              <div className="flex items-start gap-2 mb-2 p-2 bg-amber-50 border border-amber-200 rounded">
                <FiAlertCircle className="text-amber-500 mt-0.5 flex-shrink-0 text-xs" />
                <div>
                  <p className="text-xs text-amber-700 font-medium">
                    Missing Requirements
                  </p>
                  <p className="text-xs text-amber-600">
                    Needs <strong>ID Document</strong> + <strong>Email</strong>
                  </p>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">
              {!isRiskAvailable ? (
                "Not available in selected plan"
              ) : !canEnableRisk ? (
                "Enable required verifications first"
              ) : riskEnabled ? (
                <div className="bg-blue-50 p-2 rounded border">
                  <p className="font-medium text-blue-700 mb-1">
                    Level {riskLevel} Features:
                  </p>
                  <ul className="text-blue-600 space-y-0.5 text-xs">
                    <li>• Phone reuse detection</li>
                    <li>• Biometric validation</li>
                    <li>• Location risk assessment</li>
                    <li>• IP/VPN detection</li>
                  </ul>
                </div>
              ) : (
                "Risk analysis disabled"
              )}
            </div>
          </div>

          {/* Sanctions Card */}
          <div
            className={`border rounded-lg p-3 transition-all ${
              isSanctionsAvailable && canEnableSanctions
                ? "border-gray-200 bg-white"
                : "border-gray-100 bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FiSearch
                  className={`text-sm ${
                    isSanctionsAvailable && canEnableSanctions
                      ? "text-green-500"
                      : "text-gray-400"
                  }`}
                />
                <span
                  className={`font-semibold text-xs ${
                    isSanctionsAvailable && canEnableSanctions
                      ? "text-gray-900"
                      : "text-gray-500"
                  }`}
                >
                  🕵️ AML/PEP Screening
                </span>
                {(!isSanctionsAvailable || !canEnableSanctions) && (
                  <Tooltip
                    title={
                      !isSanctionsAvailable
                        ? "Not available in selected plan"
                        : "Requires ID Document verification"
                    }
                  >
                    <FiLock className="text-gray-400 text-xs cursor-help" />
                  </Tooltip>
                )}
              </div>

              <Switch
                checked={
                  isSanctionsAvailable && canEnableSanctions
                    ? sanctionsEnabled
                    : false
                }
                onChange={handleSanctionsToggle}
                disabled={!isSanctionsAvailable || !canEnableSanctions}
                size="small"
              />
            </div>

            {/* Sanctions Requirements Warning */}
            {isSanctionsAvailable && !canEnableSanctions && (
              <div className="flex items-start gap-2 mb-2 p-2 bg-amber-50 border border-amber-200 rounded">
                <FiAlertCircle className="text-amber-500 mt-0.5 flex-shrink-0 text-xs" />
                <div>
                  <p className="text-xs text-amber-700 font-medium">
                    Missing Requirements
                  </p>
                  <p className="text-xs text-amber-600">
                    Needs <strong>ID Document</strong> verification
                  </p>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">
              {!isSanctionsAvailable ? (
                "Not available in selected plan"
              ) : !canEnableSanctions ? (
                "Enable ID Document verification first"
              ) : sanctionsEnabled ? (
                <div className="bg-green-50 p-2 rounded border">
                  <p className="font-medium text-green-700 mb-1">
                    Level {sanctionsLevel} Screening:
                  </p>
                  <ul className="text-green-600 space-y-0.5 text-xs">
                    <li>• Global sanctions lists</li>
                    <li>• PEP database</li>
                    <li>• AML watchlists</li>
                    <li>• Biometric search</li>
                  </ul>
                </div>
              ) : (
                "AML/PEP screening disabled"
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Subscription Plan Selection */}
          <div>
            <h4 className="font-bold text-sm mb-3">Subscription Plan</h4>
            <Select
              value={selectedPlanId}
              onChange={handlePlanChange}
              style={{ width: "100%" }}
              placeholder="Choose a subscription plan"
              size="small"
            >
              {user?.subscriptionPlans?.map((plan) => (
                <Select.Option key={plan._id} value={plan._id}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{plan.name}</span>
                    <span className="text-xs text-gray-500">
                      Risk: {plan.defaults?.riskLevel || 0}, Sanctions:{" "}
                      {plan.defaults?.sanctionsLevel || 0}
                    </span>
                  </div>
                </Select.Option>
              ))}
            </Select>
            {selectedPlan && (
              <p className="text-xs text-gray-500 mt-2">
                Includes: {selectedPlan.intakeModules?.join(", ")}
              </p>
            )}
          </div>

          {/* Plan Information Card */}
          {selectedPlan && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0 text-sm" />
                <div>
                  <p className="text-xs text-blue-700 font-medium mb-1">
                    {selectedPlan.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    Risk Level: {maxRiskLevel} | Sanctions: {maxSanctionsLevel}
                  </p>
                  {!isRiskAvailable && !isSanctionsAvailable && (
                    <span className="text-xs text-blue-500 block mt-1">
                      Upgrade plan for additional features
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div>
            <h4 className="font-bold text-sm mb-2">Verification Types</h4>
            <p className="text-xs text-gray-500 mb-3">
              Available modules for {selectedPlan?.name} plan
            </p>

            <Checkbox.Group
              value={selectedVerifications}
              onChange={handleVerificationChange}
              className="w-full"
            >
              <div className="space-y-2">
                {availableVerificationOptions.map((option) => (
                  <div key={option.key} className="flex items-start gap-2">
                    <Checkbox value={option.key} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <p className="text-xs text-gray-400 leading-tight">
                        {option.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </div>
        </div>
      </div>
    </div>
  );

  // Check if user has subscription plans
  const hasSubscriptionPlans = user?.subscriptionPlans?.length > 0;
  const hasVerificationOptions = availableVerificationOptions.length > 0;

  return (
    <Modal
      title="Create new onboarding flow"
      open={isModalOpen}
      onCancel={closeModal}
      width={1000}
      footer={
        hasSubscriptionPlans && hasVerificationOptions
          ? [
              <Button key="cancel" onClick={closeModal}>
                Cancel
              </Button>,
              <Button
                key="create"
                type="primary"
                disabled={selectedVerifications.length === 0 || !selectedPlanId}
                onClick={createApplicant}
                loading={loading}
              >
                Create New Flow
              </Button>,
            ]
          : [
              <Button key="close" onClick={closeModal}>
                Close
              </Button>,
            ]
      }
    >
      {!hasSubscriptionPlans
        ? renderNoSubscriptionPlansContent()
        : !hasVerificationOptions
        ? renderNoVerificationContent()
        : renderCreateApplicantContent()}
    </Modal>
  );
};

export default OnboardingFlowModal;
