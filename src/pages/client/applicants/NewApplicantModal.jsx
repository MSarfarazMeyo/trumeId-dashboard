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
import { createApplicantService } from "../../../services/applicant";
import appContext from "../../../context/appContext";
import { RiExternalLinkFill } from "react-icons/ri";

import { CopyOutlined, LinkOutlined } from "@ant-design/icons";
import { VerificationType } from "../../../types";
import { useNavigate, useSearchParams } from "react-router";
import { colors } from "../../../constants/brandConfig";

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

const NewApplicantModal = ({ isModalOpen, setIsModalOpen }) => {
  const { user } = useContext(appContext);

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  // Check if "newApplicant" exists
  const hasNewApplicant = searchParams.has("newApplicant");

  const baseURL = import.meta.env.VITE_APP_SDK_URL;

  const [selectedVerifications, setSelectedVerifications] = useState([]);
  const [showLink, setShowLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState();
  const [copied, setCopied] = useState(false);
  const [riskEnabled, setRiskEnabled] = useState(false);
  const [sanctionsEnabled, setSanctionsEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState(0);
  const [sanctionsLevel, setSanctionsLevel] = useState(0);

  // New state for selected subscription plan
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Get the currently selected subscription plan
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

  const handleGenerateLink = (aplicantId) => {
    try {
      const SDKlink = `${baseURL}/verification?id=${aplicantId}`;
      setLink(SDKlink);
      setShowLink(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // reset after 1.5 seconds
  };

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
        requiredVerifications,
        verificationConfig,
        subscriptionPlan: selectedPlanId, // Add the selected subscription plan ID
      };

      const response = await createApplicantService(applicantData);

      handleGenerateLink(response?._id);
      return;
    } catch (error) {
      console.error("Error creating applicant:", error);
      message.error("Failed to create applicant");
    } finally {
      setLoading(false);
    }
  };

  const handleNewApplicantClick = () => {
    setShowLink(false);
    setLink("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowLink(false);
    setLink("");

    // Reset to defaults when closing
    if (selectedPlan?.defaults) {
      const { riskLevel: defaultRisk, sanctionsLevel: defaultSanctions } =
        selectedPlan.defaults;
      setRiskEnabled(defaultRisk > 0);
      setSanctionsEnabled(defaultSanctions > 0);
      setRiskLevel(defaultRisk);
      setSanctionsLevel(defaultSanctions);
    }

    hasNewApplicant && navigate(`/client/flows`);
  };

  const operations = (
    <button
      onClick={handleNewApplicantClick}
      className="flex items-center py-3 px-5 bg-purple-600 text-white gap-2 font-bold text-sm rounded-lg max-md:py-2 max-md:px-3"
    >
      <FiPlus className="text-lg" /> New Applicant
    </button>
  );

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
    <div className="space-y-4">
      {/* Subscription Plan Selection */}
      <div className="mb-4">
        <h4 className="font-bold text-sm mb-3">Select Subscription Plan:</h4>
        <Select
          value={selectedPlanId}
          onChange={handlePlanChange}
          style={{ width: "100%" }}
          placeholder="Choose a subscription plan"
        >
          {user?.subscriptionPlans?.map((plan) => (
            <Select.Option key={plan._id} value={plan._id}>
              <div className="flex justify-between items-center">
                <span className="font-medium">{plan.name}</span>
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
            Selected plan includes: {selectedPlan.intakeModules?.join(", ")}
          </p>
        )}
      </div>

      <Divider className="my-4" />

      <div className="mt-4">
        <h4 className="font-bold text-sm mb-3">Select Verification Types:</h4>
        <p className="text-xs text-gray-500 mb-4">
          Available verification modules based on the selected{" "}
          {selectedPlan?.name} plan
        </p>

        <Checkbox.Group
          value={selectedVerifications}
          onChange={handleVerificationChange}
          className="w-full"
        >
          <div className="space-y-3">
            {availableVerificationOptions.map((option) => (
              <div key={option.key} className="flex items-start gap-3">
                <Checkbox value={option.key} className="mt-1" />
                <div className="flex-1">
                  <div className="font-bold text-sm">{option.label}</div>
                  <p className="text-xs text-gray-400 mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Checkbox.Group>
      </div>

      <Divider className="my-6" />

      {/* Additional Verification Options */}
      <div className="flex items-center gap-2 mb-3">
        <h4 className="font-bold text-sm">Additional Verification Options:</h4>
        <Tooltip title="These options depend on your subscription plan level and selected verification types">
          <FiInfo className="text-gray-400 cursor-help" />
        </Tooltip>
      </div>

      {/* Risk Analysis Section */}
      <div
        className={`border rounded-lg p-4 transition-all ${
          isRiskAvailable && canEnableRisk
            ? "border-gray-200 bg-white"
            : "border-gray-100 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiShield
              className={`${
                isRiskAvailable && canEnableRisk
                  ? "text-blue-500"
                  : "text-gray-400"
              }`}
            />
            <span
              className={`font-semibold text-sm ${
                isRiskAvailable && canEnableRisk
                  ? "text-gray-900"
                  : "text-gray-500"
              }`}
            >
              🛡️ Fraud Prevention & Risk Scoring
            </span>
            {(!isRiskAvailable || !canEnableRisk) && (
              <Tooltip
                title={
                  !isRiskAvailable
                    ? "Risk Analysis is not available in the selected plan. Choose a different plan to access this feature."
                    : "Risk Analysis requires both Identity Document and Email verification to be enabled"
                }
              >
                <FiLock className="text-gray-400 text-xs cursor-help" />
              </Tooltip>
            )}
          </div>

          {isRiskAvailable && canEnableRisk ? (
            <Switch
              checked={riskEnabled}
              onChange={handleRiskToggle}
              size="small"
            />
          ) : (
            <Tooltip
              title={
                !isRiskAvailable
                  ? "Not available in selected plan"
                  : "Requires ID Document + Email verification"
              }
            >
              <Switch checked={false} disabled={true} size="small" />
            </Tooltip>
          )}
        </div>

        {/* Risk Requirements Warning */}
        {isRiskAvailable && !canEnableRisk && (
          <div className="flex items-start gap-2 mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
            <FiAlertCircle className="text-amber-500 mt-0.5 flex-shrink-0 text-sm" />
            <div>
              <p className="text-xs text-amber-700 font-medium">
                Missing Required Verifications
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Risk scoring requires both <strong>Identity Document</strong>{" "}
                and <strong>Email</strong> verification to extract user data for
                analysis.
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          {!isRiskAvailable ? (
            "Risk analysis is not available in the selected plan"
          ) : !canEnableRisk ? (
            "Enable ID Document and Email verification to unlock risk scoring"
          ) : riskEnabled ? (
            <>
              <p className="mb-2">
                Risk analysis level {riskLevel} will be applied
              </p>
              <div className="text-xs bg-blue-50 p-2 rounded border">
                <p className="font-medium text-blue-700 mb-1">
                  Features include:
                </p>
                <ul
                  className=" space-y-0.5"
                  style={{
                    color: colors.primaryDark,
                  }}
                >
                  <li>• 📱 Phone number reuse detection</li>
                  <li>• 🔐 Biometric hash validation</li>
                  <li>• 🌍 Location-based risk assessment</li>
                  <li>• 📧 Email validation & domain analysis</li>
                  <li>• 🕵️ IP risk scoring (VPN/Proxy/Tor detection)</li>
                </ul>
              </div>
            </>
          ) : (
            "Risk analysis is disabled for this applicant"
          )}
        </div>
      </div>

      {/* Sanctions Section */}
      <div
        className={`border rounded-lg p-4 mt-3 transition-all ${
          isSanctionsAvailable && canEnableSanctions
            ? "border-gray-200 bg-white"
            : "border-gray-100 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FiSearch
              className={`${
                isSanctionsAvailable && canEnableSanctions
                  ? "text-green-500"
                  : "text-gray-400"
              }`}
            />
            <span
              className={`font-semibold text-sm ${
                isSanctionsAvailable && canEnableSanctions
                  ? "text-gray-900"
                  : "text-gray-500"
              }`}
            >
              🕵️ AML/PEP/Sanctions Screening
            </span>
            {(!isSanctionsAvailable || !canEnableSanctions) && (
              <Tooltip
                title={
                  !isSanctionsAvailable
                    ? "AML/PEP/Sanctions screening is not available in the selected plan. Choose a different plan to access this feature."
                    : "Sanctions screening requires Identity Document verification to extract personal information"
                }
              >
                <FiLock className="text-gray-400 text-xs cursor-help" />
              </Tooltip>
            )}
          </div>

          {isSanctionsAvailable && canEnableSanctions ? (
            <Switch
              checked={sanctionsEnabled}
              onChange={handleSanctionsToggle}
              size="small"
            />
          ) : (
            <Tooltip
              title={
                !isSanctionsAvailable
                  ? "Not available in selected plan"
                  : "Requires ID Document verification"
              }
            >
              <Switch checked={false} disabled={true} size="small" />
            </Tooltip>
          )}
        </div>

        {/* Sanctions Requirements Warning */}
        {isSanctionsAvailable && !canEnableSanctions && (
          <div className="flex items-start gap-2 mb-3 p-2 bg-amber-50 border border-amber-200 rounded">
            <FiAlertCircle className="text-amber-500 mt-0.5 flex-shrink-0 text-sm" />
            <div>
              <p className="text-xs text-amber-700 font-medium">
                Missing Required Verification
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Sanctions screening requires <strong>Identity Document</strong>{" "}
                verification to extract name, birth date, and unique identifier.
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          {!isSanctionsAvailable ? (
            "AML/PEP/Sanctions screening is not available in the selected plan"
          ) : !canEnableSanctions ? (
            "Enable ID Document verification to unlock sanctions screening"
          ) : sanctionsEnabled ? (
            <>
              <p className="mb-2">
                Sanctions screening level {sanctionsLevel} will be applied
              </p>
              <div className="text-xs bg-green-50 p-2 rounded border">
                <p className="font-medium text-green-700 mb-1">
                  Screening includes:
                </p>
                <ul className="text-green-600 space-y-0.5">
                  <li>• Global sanctions lists monitoring</li>
                  <li>• PEP (Politically Exposed Persons) database</li>
                  <li>• AML (Anti-Money Laundering) watchlists</li>
                  <li>• Biometric search (if selfie provided)</li>
                </ul>
              </div>
            </>
          ) : (
            "AML/PEP/Sanctions screening is disabled for this applicant"
          )}
        </div>
      </div>

      {/* Plan Information */}
      {selectedPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          <div className="flex items-start gap-2">
            <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-700 font-medium mb-1">
                Selected Plan: {selectedPlan.name}
              </p>
              <p
                className="text-xs "
                style={{
                  color: colors.primaryDark,
                }}
              >
                Available Levels - Risk: {maxRiskLevel}, Sanctions:{" "}
                {maxSanctionsLevel}
                {!isRiskAvailable && !isSanctionsAvailable && (
                  <span className="block mt-1 text-blue-500">
                    Select a higher-tier plan to unlock additional verification
                    features.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {showLink && (
        <div className="w-full">
          <div className="p-2 bg-gray-100 rounded border text-sm break-all flex justify-between items-center">
            <span className="mr-2">{link}</span>
            <div className="flex items-center gap-2">
              <Tooltip title="Open in new tab">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer cursor-pointer"
                >
                  <RiExternalLinkFill
                    style={{ color: "black", fontSize: 18 }}
                  />
                </a>
              </Tooltip>
              <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                <CopyOutlined
                  className="cursor-pointer hover:text-amber-300"
                  onClick={handleCopy}
                />
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Check if user has subscription plans
  const hasSubscriptionPlans = user?.subscriptionPlans?.length > 0;
  const hasVerificationOptions = availableVerificationOptions.length > 0;

  return (
    <Modal
      title="Create new applicant"
      open={isModalOpen}
      onCancel={closeModal}
      width={600}
      footer={
        hasSubscriptionPlans && hasVerificationOptions
          ? [
              <Button key="cancel" onClick={closeModal}>
                Close
              </Button>,
              <Button
                key="create"
                type="primary"
                disabled={
                  selectedVerifications.length === 0 ||
                  !selectedPlanId ||
                  showLink
                }
                onClick={createApplicant}
                loading={loading}
              >
                Generate WebSDK applicant link
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

export default NewApplicantModal;
