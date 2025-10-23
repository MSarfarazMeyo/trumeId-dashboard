import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { GoDownload } from "react-icons/go";
import { Button } from "antd";
import { brandInfo } from "../constants/brandConfig";

const PDFExportButton = ({ applicant }) => {
  const [isExporting, setIsExporting] = useState(false);

  const { applicant: applicantData, verificationResults } = applicant;

  // Helper function to add new page if needed
  const checkPageBreak = (pdf, yPosition, requiredSpace = 30) => {
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      return 20;
    }
    return yPosition;
  };

  // Helper function to add wrapped text
  const addWrappedText = (pdf, text, x, y, maxWidth, lineHeight = 6) => {
    const lines = pdf.splitTextToSize(text, maxWidth);
    let currentY = y;

    lines.forEach((line) => {
      currentY = checkPageBreak(pdf, currentY);
      pdf.text(line, x, currentY);
      currentY += lineHeight;
    });

    return currentY;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatVerificationStatus = (status) => {
    return status
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : "N/A";
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yPosition = 20;

      // Header - Nobis KYC Logo/Title
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text(`${brandInfo.name} KYC`, pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 10;

      pdf.setFontSize(16);
      pdf.text("Verification Report", pageWidth / 2, yPosition, {
        align: "center",
      });
      yPosition += 15;

      // Report Generation Date
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        `Report Generated: ${formatDate(new Date().toISOString())}`,
        pageWidth - 20,
        yPosition,
        { align: "right" }
      );
      yPosition += 15;

      // Applicant Information Section
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      yPosition = checkPageBreak(pdf, yPosition, 40);
      pdf.text("APPLICANT INFORMATION", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      // Basic applicant details
      const applicantInfo = [
        { label: "Name:", value: applicantData.name || "N/A" },
        { label: "Email:", value: applicantData.email || "N/A" },
        { label: "Phone:", value: applicantData.phone || "N/A" },

        {
          label: "Risk Level:",
          value:
            applicantData.verificationConfig?.riskLevel.toString() || "N/A",
        },
        {
          label: "Sanctions Level:",
          value:
            applicantData.verificationConfig?.sanctionsLevel.toString() ||
            "N/A",
        },
      ];

      applicantInfo.forEach((item) => {
        yPosition = checkPageBreak(pdf, yPosition);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label, 20, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(item.value, 50, yPosition);
        yPosition += 6;
      });

      yPosition += 10;
      yPosition = checkPageBreak(pdf, yPosition);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("CLIENT INFORMATION", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      const clientDetails = [
        {
          label: "Client Name:",
          value:
            (applicantData?.clientId?.firstName || "") +
              " " +
              (applicantData?.clientId?.lastName || "") || "N/A",
        },
        {
          label: "Client Email:",
          value: applicantData?.clientId?.email || "N/A",
        },
        {
          label: "Client Company:",
          value: applicantData?.clientId?.companyName || "N/A",
        },
      ];

      clientDetails.forEach((item) => {
        yPosition = checkPageBreak(pdf, yPosition);
        pdf.setFont("helvetica", "bold");
        pdf.text(item.label, 20, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(item.value, 60, yPosition);
        yPosition += 6;
      });

      // Client Address
      if (applicantData.clientId?.companyAddress) {
        const address = applicantData.clientId.companyAddress;
        yPosition += 5;
        yPosition = checkPageBreak(pdf, yPosition);
        pdf.setFont("helvetica", "bold");
        pdf.text("Address:", 20, yPosition);
        yPosition += 6;
        pdf.setFont("helvetica", "normal");

        const fullAddress = [
          address.street,
          address.city,
          address.state,
          address.country,
          address.zipCode,
        ]
          .filter(Boolean)
          .join(", ");

        yPosition = addWrappedText(
          pdf,
          fullAddress,
          20,
          yPosition,
          pageWidth - 40
        );
      }

      yPosition += 10;

      // Verification Status Overview
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      yPosition = checkPageBreak(pdf, yPosition, 30);
      pdf.text("VERIFICATION STATUS OVERVIEW", 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");

      if (applicantData.requiredVerifications) {
        applicantData.requiredVerifications.forEach((verification) => {
          yPosition = checkPageBreak(pdf, yPosition);
          const status = formatVerificationStatus(verification.status);
          const statusColor =
            verification.status === "verified"
              ? [0, 128, 0]
              : verification.status === "requested"
              ? [255, 165, 0]
              : [255, 0, 0];

          pdf.text(
            `${verification.verificationType.toUpperCase()}:`,
            20,
            yPosition
          );
          pdf.setTextColor(...statusColor);
          pdf.text(status, 80, yPosition);
          pdf.setTextColor(0, 0, 0);
          yPosition += 7;
        });
      }

      yPosition += 10;

      // Detailed Verification Results
      if (verificationResults && verificationResults.length > 0) {
        for (const result of verificationResults) {
          if (result.verificationType === "clientNotes") {
            continue;
          }

          pdf.setFontSize(14);
          pdf.setFont("helvetica", "bold");
          yPosition = checkPageBreak(pdf, yPosition, 40);
          pdf.text(
            `${result.verificationType.toUpperCase()} VERIFICATION`,
            20,
            yPosition
          );
          yPosition += 10;

          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");

          // ID Document Results
          if (
            result.verificationType === "idDocument" &&
            result.rawResponse?.responseCustomerData
          ) {
            const idData =
              result.rawResponse.responseCustomerData.extractedIdData;
            const personalData =
              result.rawResponse.responseCustomerData.extractedPersonalData;

            if (idData) {
              const idInfo = [
                { label: "ID Type:", value: idData.idType || "N/A" },
                { label: "ID Number:", value: idData.idNumber || "N/A" },
                { label: "Country:", value: idData.idCountry || "N/A" },
                { label: "Issue Date:", value: idData.idIssueDate || "N/A" },
                {
                  label: "Expiration Date:",
                  value: idData.idExpirationDate || "N/A",
                },
                {
                  label: "Valid ID Number:",
                  value: idData.validIdNumber === "Y" ? "Yes" : "No",
                },
                {
                  label: "Age Over 18:",
                  value: idData.ageOver18 === "Y" ? "Yes" : "No",
                },
                {
                  label: "Not Expired:",
                  value: idData.idNotExpired === "Y" ? "Yes" : "No",
                },
              ];

              idInfo.forEach((item) => {
                yPosition = checkPageBreak(pdf, yPosition);
                pdf.setFont("helvetica", "bold");
                pdf.text(item.label, 25, yPosition);
                pdf.setFont("helvetica", "normal");
                pdf.text(item.value, 70, yPosition);
                yPosition += 6;
              });
            }

            if (personalData) {
              yPosition += 5;
              const personalInfo = [
                { label: "Name on ID:", value: personalData.name || "N/A" },
                { label: "Date of Birth:", value: personalData.dob || "N/A" },
                { label: "Gender:", value: personalData.gender || "N/A" },
              ];

              personalInfo.forEach((item) => {
                yPosition = checkPageBreak(pdf, yPosition);
                pdf.setFont("helvetica", "bold");
                pdf.text(item.label, 25, yPosition);
                pdf.setFont("helvetica", "normal");
                pdf.text(item.value, 70, yPosition);
                yPosition += 6;
              });
            }
          }

          // Proof of Address Results
          if (
            result.verificationType === "proofOfAddress" &&
            result.rawResponse
          ) {
            const poaData = result.rawResponse;
            const poaInfo = [
              { label: "Status:", value: poaData.Status || "N/A" },
              { label: "Message:", value: poaData.Message || "N/A" },
              {
                label: "Bill Holder:",
                value: poaData["Bill Holder Name"] || "N/A",
              },
              {
                label: "Service Address:",
                value: poaData["Service Address"] || "N/A",
              },
              {
                label: "Bill Issue Date:",
                value: poaData["Bill Issue Date"] || "N/A",
              },
              {
                label: "Validation:",
                value: poaData["DB Validation"] || "N/A",
              },
            ];

            poaInfo.forEach((item) => {
              yPosition = checkPageBreak(pdf, yPosition);
              pdf.setFont("helvetica", "bold");
              pdf.text(item.label, 25, yPosition);
              pdf.setFont("helvetica", "normal");
              const maxWidth = pageWidth - 80;
              yPosition =
                addWrappedText(pdf, item.value, 70, yPosition, maxWidth) - 6;
              yPosition += 6;
            });

            // Add clickable link for proof of address document
            if (poaData.uploadResult?.url) {
              yPosition = checkPageBreak(pdf, yPosition);
              pdf.setFont("helvetica", "bold");
              pdf.text("Document Link:", 25, yPosition);
              pdf.setFont("helvetica", "normal");

              // Use short text and add link (note: not clickable in some PDF viewers)
              const linkText = "View Proof of Address";
              pdf.setTextColor(0, 0, 255); // Make it look like a link
              pdf.textWithLink(linkText, 70, yPosition, {
                url: poaData.uploadResult.url,
              });
              pdf.setTextColor(0, 0, 0); // Reset color
              yPosition += 8;
            }
          }

          // Risk Evaluation Results
          if (
            result.verificationType === "riskEvaluation" &&
            result.rawResponse
          ) {
            const riskData = result.rawResponse;
            const riskInfo = [
              {
                label: "Risk Score:",
                value: riskData.score?.toString() || "N/A",
              },
              { label: "Risk Level:", value: riskData.risk || "N/A" },
              { label: "Outcome:", value: riskData.outcome || "N/A" },
              {
                label: "Flags:",
                value: riskData.flags?.length
                  ? riskData.flags.join(", ")
                  : "None",
              },
            ];

            riskInfo.forEach((item) => {
              yPosition = checkPageBreak(pdf, yPosition);
              pdf.setFont("helvetica", "bold");
              pdf.text(item.label, 25, yPosition);
              pdf.setFont("helvetica", "normal");
              pdf.text(item.value, 70, yPosition);
              yPosition += 6;
            });
          }

          // Sanction Evaluation Results
          if (
            result.verificationType === "sanctionEvaluation" &&
            result.rawResponse?.data
          ) {
            const sanctionData = result.rawResponse.data;
            const sanctionInfo = [
              {
                label: "Case Status:",
                value: sanctionData.case_status || "N/A",
              },
              {
                label: "Match Status:",
                value: sanctionData.match_status || "N/A",
              },
              {
                label: "Total Records:",
                value: sanctionData.total_records?.toString() || "0",
              },
              {
                label: "Searched Name:",
                value: sanctionData.searched_name || "N/A",
              },
            ];

            sanctionInfo.forEach((item) => {
              yPosition = checkPageBreak(pdf, yPosition);
              pdf.setFont("helvetica", "bold");
              pdf.text(item.label, 25, yPosition);
              pdf.setFont("helvetica", "normal");
              pdf.text(item.value, 70, yPosition);
              yPosition += 6;
            });
          }

          // Selfie Results
          if (
            result.verificationType === "selfie" &&
            result.faceMatchValidation
          ) {
            const selfieData = result.faceMatchValidation;
            const selfieInfo = [
              {
                label: "Face Match:",
                value: selfieData.matched ? "Yes" : "No",
              },
              {
                label: "Match Score:",
                value: selfieData.score?.toString() || "N/A",
              },
              { label: "Result:", value: selfieData.result || "N/A" },
              {
                label: "Verification:",
                value: selfieData.verificationResult || "N/A",
              },
              { label: "Message:", value: selfieData.message || "N/A" },
            ];

            selfieInfo.forEach((item) => {
              yPosition = checkPageBreak(pdf, yPosition);
              pdf.setFont("helvetica", "bold");
              pdf.text(item.label, 25, yPosition);
              pdf.setFont("helvetica", "normal");
              pdf.text(item.value, 70, yPosition);
              yPosition += 6;
            });
          }

          // Add verification timestamp
          yPosition += 5;
          yPosition = checkPageBreak(pdf, yPosition);
          pdf.setFont("helvetica", "italic");
          pdf.setFontSize(9);
          pdf.text(
            `Verified on: ${formatDate(result.createdAt)}`,
            25,
            yPosition
          );
          yPosition += 10;

          // Extract base64 images from relevant fields
          const extractedIdData =
            result.processedData?.responseCustomerData?.extractedIdData || {};
          const biometricData =
            result.processedData?.responseCustomerData?.biometricData || {};

          const base64Images = [];

          // Collect available base64 images

          if (extractedIdData.idProcessImageFront)
            base64Images.push(extractedIdData.idProcessImageFront);

          if (extractedIdData.idProcessImageBack)
            base64Images.push(extractedIdData.idProcessImageBack);

          if (extractedIdData.idImageFront)
            base64Images.push(extractedIdData.idImageFront);

          if (extractedIdData.idImageBack)
            base64Images.push(extractedIdData.idImageBack);

          if (extractedIdData.photoOnId)
            base64Images.push(extractedIdData.photoOnId);
          if (biometricData.selfie) base64Images.push(biometricData.selfie);

          if (base64Images.length > 0) {
            yPosition = checkPageBreak(pdf, yPosition, 60);
            pdf.setFontSize(12);
            pdf.setFont("helvetica", "bold");
            pdf.text("Supporting Images:", 20, yPosition);
            yPosition += 10;

            for (const base64Image of base64Images) {
              try {
                yPosition = checkPageBreak(pdf, yPosition, 80);

                // Ensure the string has the correct prefix
                const imageWithPrefix = base64Image.startsWith("data:image")
                  ? base64Image
                  : `data:image/jpeg;base64,${base64Image}`;

                pdf.addImage(imageWithPrefix, "JPEG", 20, yPosition, 80, 60);
                yPosition += 70;
              } catch (error) {
                console.warn("Failed to add image:", error);
                yPosition = checkPageBreak(pdf, yPosition);
                pdf.setFont("helvetica", "italic");
                pdf.setFontSize(9);
                pdf.text("Failed to render image", 25, yPosition);
                yPosition += 10;
              }
            }
          }

          yPosition += 15;
        }
      }

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 20,
          pdf.internal.pageSize.getHeight() - 10,
          { align: "right" }
        );
        pdf.text(
          `${brandInfo.name} KYC Verification Report`,
          20,
          pdf.internal.pageSize.getHeight() - 10
        );
      }

      // Generate filename and save
      const fileName = `${(applicantData.name || "Applicant").replace(
        /\s+/g,
        "_"
      )}_Verification_Report_${new Date().toISOString().split("T")[0]}.pdf`;

      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      icon={<GoDownload />}
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2"
    >
      {isExporting ? "Generating PDF..." : "Export as PDF"}
    </Button>
  );
};

export default PDFExportButton;
