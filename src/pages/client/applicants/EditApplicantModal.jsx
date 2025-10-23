import React, { useEffect, useState, useMemo, useContext } from "react";
import {
  Checkbox,
  Divider,
  Switch,
  Modal,
  Button,
  message,
  Tooltip,
  Select,
  Alert,
} from "antd";
import {
  FiSearch,
  FiShield,
  FiInfo,
  FiLock,
  FiAlertCircle,
} from "react-icons/fi";
import { useUpdateApplicantMutation } from "../../../hooks/useApplicants";
import appContext from "../../../context/appContext";
import { VerificationType } from "../../../types";
import { colors } from "../../../constants/brandConfig";

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

const EditApplicantModal = ({ isModalOpen, setIsModalOpen, applicantData }) => {
  const { user } = useContext(appContext);
  const updateApplicantMutation = useUpdateApplicantMutation();

  const [selectedVerifications, setSelectedVerifications] = useState([]);
  const [riskEnabled, setRiskEnabled] = useState(false);
  const [sanctionsEnabled, setSanctionsEnabled] = useState(false);
  const [riskLevel, setRiskLevel] = useState(0);
  const [sanctionsLevel, setSanctionsLevel] = useState(0);

  // New state for tracking the applicant's subscription plan
  const [applicantPlanId, setApplicantPlanId] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // Store original verification data to preserve statuses
  const [originalVerifications, setOriginalVerifications] = useState([]);

  // Get the applicant's original subscription plan
  const applicantPlan = useMemo(() => {
    if (!applicantPlanId || !user?.subscriptionPlans) {
      return null;
    }
    return user.subscriptionPlans.find((plan) => plan._id === applicantPlanId);
  }, [applicantPlanId, user?.subscriptionPlans]);

  // Get the currently selected subscription plan for editing
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

  // Check if plan has changed
  const planChanged = useMemo(() => {
    return (
      applicantPlanId && selectedPlanId && applicantPlanId !== selectedPlanId
    );
  }, [applicantPlanId, selectedPlanId]);

  // Initialize form with existing applicant data
  useEffect(() => {
    if (applicantData && isModalOpen) {
      // Store original verifications with their statuses
      const existingVerifications = applicantData.requiredVerifications || [];
      setOriginalVerifications(existingVerifications);

      // Set the applicant's original subscription plan
      if (applicantData.subscriptionPlan) {
        setApplicantPlanId(applicantData.subscriptionPlan);
        setSelectedPlanId(applicantData.subscriptionPlan);
      } else {
        // Fallback to user's current subscription plan or first available plan
        const fallbackPlanId =
          user?.subscriptionPlan || user?.subscriptionPlans?.[0]?._id;
        if (fallbackPlanId) {
          setApplicantPlanId(fallbackPlanId);
          setSelectedPlanId(fallbackPlanId);
        }
      }

      // Set selected verifications from existing applicant data
      const existingVerificationTypes =
        existingVerifications.map((v) => v.verificationType) || [];
      setSelectedVerifications(existingVerificationTypes);

      // Set risk and sanctions from existing config
      const config = applicantData.verificationConfig || {};
      setRiskLevel(config.riskLevel || 0);
      setSanctionsLevel(config.sanctionsLevel || 0);
      setRiskEnabled(config.riskLevel > 0);
      setSanctionsEnabled(config.sanctionsLevel > 0);
    }
  }, [
    applicantData,
    isModalOpen,
    user?.subscriptionPlan,
    user?.subscriptionPlans,
  ]);

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

    // When plan changes, filter selected verifications based on new plan's available modules
    const newPlan = user?.subscriptionPlans?.find(
      (plan) => plan._id === planId
    );
    if (newPlan?.intakeModules) {
      // Keep only verifications that are available in the new plan
      const availableInNewPlan = selectedVerifications.filter(
        (verificationType) => newPlan.intakeModules.includes(verificationType)
      );
      setSelectedVerifications(availableInNewPlan);
    } else {
      setSelectedVerifications([]);
    }

    // Reset risk and sanctions settings
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

  // Helper function to build verification data preserving existing statuses
  const buildVerificationData = () => {
    return selectedVerifications.map((verificationType) => {
      // Find existing verification with same type
      const existingVerification = originalVerifications.find(
        (v) => v.verificationType === verificationType
      );

      if (existingVerification) {
        // Preserve existing verification with its current status
        return {
          verificationType,
          status: existingVerification.status,
          // Preserve any other fields that might exist
          ...(existingVerification.completedAt && {
            completedAt: existingVerification.completedAt,
          }),
          ...(existingVerification.verificationData && {
            verificationData: existingVerification.verificationData,
          }),
          ...(existingVerification.notes && {
            notes: existingVerification.notes,
          }),
        };
      } else {
        // New verification - set to pending
        return {
          verificationType,
          status: "pending",
        };
      }
    });
  };

  const updateApplicant = async () => {
    try {
      if (selectedVerifications.length === 0) {
        message.error("Please select at least one verification type");
        return;
      }

      if (!selectedPlanId) {
        message.error("Please select a subscription plan");
        return;
      }

      // Build verification data preserving existing statuses
      const requiredVerifications = buildVerificationData();

      const verificationConfig = {
        riskLevel: riskEnabled ? riskLevel : 0,
        sanctionsLevel: sanctionsEnabled ? sanctionsLevel : 0,
      };

      const updateData = {
        requiredVerifications,
        verificationConfig,
        subscriptionPlan: selectedPlanId, // Include the selected subscription plan ID
      };

      await updateApplicantMutation.mutateAsync({
        applicantId: applicantData._id,
        updateData,
      });

      message.success("Applicant updated successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error updating applicant:", error);
      message.error("Failed to update applicant");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Check if there are any changes to enable/disable save button
  const hasChanges = useMemo(() => {
    if (!applicantData) return false;

    const existingVerifications =
      applicantData.requiredVerifications?.map((v) => v.verificationType) || [];
    const existingConfig = applicantData.verificationConfig || {};
    const existingPlanId = applicantData.subscriptionPlan;

    const verificationsChanged =
      JSON.stringify(existingVerifications.sort()) !==
      JSON.stringify(selectedVerifications.sort());
    const riskChanged =
      (existingConfig.riskLevel || 0) !== (riskEnabled ? riskLevel : 0);
    const sanctionsChanged =
      (existingConfig.sanctionsLevel || 0) !==
      (sanctionsEnabled ? sanctionsLevel : 0);
    const planChanged = existingPlanId !== selectedPlanId;

    return (
      verificationsChanged || riskChanged || sanctionsChanged || planChanged
    );
  }, [
    applicantData,
    selectedVerifications,
    riskEnabled,
    riskLevel,
    sanctionsEnabled,
    sanctionsLevel,
    selectedPlanId,
  ]);

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

  // Get verification status display helper
  const getVerificationStatusDisplay = (verificationType) => {
    const existingVerification = originalVerifications.find(
      (v) => v.verificationType === verificationType
    );

    if (!existingVerification) return null;

    const statusColors = {
      pending: "orange",
      completed: "green",
      verified: "green",
      failed: "red",
      rejected: "red",
    };

    const statusColor = statusColors[existingVerification.status] || "default";

    return (
      <span
        className={`text-xs px-2 py-1 rounded ml-2 bg-${statusColor}-100 text-${statusColor}-600`}
      >
        {existingVerification.status}
      </span>
    );
  };

  // Modal content for editing applicant
  const renderEditApplicantContent = () => (
    <div className="space-y-4">
      {/* Plan Change Warning */}
      {planChanged && (
        <Alert
          message="Plan Change Detected"
          description={`You are changing this applicant from "${applicantPlan?.name}" to "${selectedPlan?.name}" plan. This may affect available verification options and limits.`}
          type="warning"
          showIcon
          className="mb-4"
        />
      )}

      {/* Subscription Plan Selection */}
      <div className="mb-4">
        <h4 className="font-bold text-sm mb-3">Subscription Plan:</h4>
        <Select
          value={selectedPlanId}
          onChange={handlePlanChange}
          style={{ width: "100%" }}
          placeholder="Choose a subscription plan"
        >
          {user?.subscriptionPlans?.map((plan) => (
            <Select.Option key={plan._id} value={plan._id}>
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {plan.name}
                  {plan._id === applicantPlanId && " (Original)"}
                </span>
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
        <h4 className="font-bold text-sm mb-3">Update Verification Types:</h4>
        <p className="text-xs text-gray-500 mb-4">
          Available verification modules based on the selected{" "}
          {selectedPlan?.name} plan. Existing verification statuses will be
          preserved.
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
                  <div className="flex items-center">
                    <div className="font-bold text-sm">{option.label}</div>
                    {getVerificationStatusDisplay(option.key)}
                  </div>
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
                {planChanged && " (Changed)"}
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
    </div>
  );

  // Check if user has subscription plans
  const hasSubscriptionPlans = user?.subscriptionPlans?.length > 0;
  const hasVerificationOptions = availableVerificationOptions.length > 0;

  return (
    <Modal
      title={`Edit Applicant - ${applicantData?.name || "Unnamed"}`}
      open={isModalOpen}
      onCancel={closeModal}
      width={600}
      footer={
        hasSubscriptionPlans && hasVerificationOptions
          ? [
              <Button key="cancel" onClick={closeModal}>
                Cancel
              </Button>,
              <Button
                key="update"
                type="primary"
                disabled={
                  selectedVerifications.length === 0 ||
                  !hasChanges ||
                  !selectedPlanId
                }
                onClick={updateApplicant}
                loading={updateApplicantMutation.isLoading}
              >
                Update Applicant
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
        : renderEditApplicantContent()}
    </Modal>
  );
};

export default EditApplicantModal;
